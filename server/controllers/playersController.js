var Player = require('../models/player');
var Helper = require('../helpers/helper');
var Obstacle = require('../models/obstacle');
var ObstaclesController = require('./obstaclesController');
var Board = require('../models/board');

///////////////////////////////////////
// PRIVATE
///////////////////////////////////////

var board = Board.singleton();

///////////////////////////////////////
// PUBLIC
///////////////////////////////////////

var PlayersController = function() {
	this.players = [];
	this.obstaclesController = ObstaclesController.singleton(this.players);
	this.obstaclesController.on("newObstacle", this.onNewObstacle.bind(this));
};

PlayersController.prototype.addPlayerWithSocket = function(socket) {
	//Find a position near a player
	var position = {
		x: 0,
		y: 0,
		z: 0,
	};

	if (this.players.length >= 1) {
		var foundPosition = false;
		while (!foundPosition) {
			var index = Math.round(Math.random() * (this.players.length - 1));
			var otherPlayer = this.players[index];
			var innerBlock = new Block(otherPlayer.position, {x: 20, y: 20, z: 1});
			var outerBlock = new Block(otherPlayer.position, {x: 40, y: 40, z: 1});
			position = board.randomPositionWithBlocks(innerBlock, outerBlock);

			foundPosition = !Helper.isAnyPlayerNearPosition(this.playersExceptPlayer(player), position, 10) &&
							!this.obstaclesController.obstaclesObject[position.x + "," + position.y];
		}
	}

	////////////////////
	var player = new Player(socket, position);
	this.players.push(player);
	if (this.players.length == 1) {
		this.obstaclesController.startSpawningObstacles();
	}
	this.sendTo(player, "player", {id: player.id, position: player.position});
	player.startListening();
	this.startListeningPlayer(player);
};

PlayersController.prototype.removePlayer = function(player) {
	var index = this.players.indexOf(player);
	if (index != -1) {
		this.players.splice(index, 1);
		this.stopListeningPlayer(player);
	}
	for (var i in this.players) {
		otherPlayer = this.players[i];
		index = otherPlayer.otherPlayersInBounds[player];
		if (index != -1)
			otherPlayer.otherPlayersInBounds.splice(index, 1);
	}
};

PlayersController.prototype.removePlayers = function(players) {
	for (var i in players) {
		this.removePlayer(players[i]);
	}
}

PlayersController.prototype.playersExceptPlayer = function(player) {
	var otherPlayers = this.players.slice(0);
	var index = otherPlayers.indexOf(player);

	if (index != -1)
		otherPlayers.splice(index, 1);
	return otherPlayers;
};

PlayersController.prototype.collisionWithPlayer = function(player) {
	if (player.invincible())
		return null;
	var otherPlayers = player.otherPlayersInBounds.slice(0);
	var head = player.head();
	for (var i in otherPlayers) {
		var otherPlayer = otherPlayers[i];
		if (otherPlayer.invincible())
			continue;

		// Both players die because they hit on the head
		if (otherPlayer.head().intersectsBlock(head))
			return { 'winners' : [],
					 'loosers' : [player, otherPlayer] };
		// Player hit someone's path
		if (otherPlayer.path.intersectsBlock(head))
			return { 'winners' : [otherPlayer],
					 'loosers' : [player] };
	}
	//Player hit their own path
	var headPoints = player.headPoints();
	if (player.path.containsPoint(headPoints[0]) || player.path.containsPoint(headPoints[1])) {
		return { 'winners' : [player],
				 'loosers' : [player] };
	}
	return null;
};

PlayersController.prototype.sendTo = function(players, message, json) {
	if (players instanceof Player) {
		var player = players;
		player.socket.emit(message, json);
	}
	else if (players instanceof Array) {
		players.forEach(function(player) {
			player.socket.emit(message, json);
		});
	}
};

PlayersController.prototype.startListeningPlayer = function(player) {
	player.on("didDisconnect", (function() {
		var otherPlayers = this.playersExceptPlayer(player);
		var json = {
			id: player.id
		};
		this.sendTo(otherPlayers, "player/disconnect", json);
		this.removePlayer(player);
		if (this.players.length == 0)
			this.obstaclesController.stopSpawningObstacles();
	}).bind(this));

	player.on("didSetPosition", (function() {
		//this.sendTo(player, "test", {"blocks" : player.path.blocks })

		//Notify players of collision with obstacle
		var collision = this.obstaclesController.collisionWithPlayer(player);
		if (collision) {
			var json = {
				loosers: [player.id]
			};
			this.sendTo(this.players, "player/collision", json);
			this.resetPlayer(player);
			return;
		}

		//Notify players of collision with player
		var collision = this.collisionWithPlayer(player);
		if (collision) {
			var winners = [];
			var loosers = [];
			collision.winners.forEach(function(player) {
				winners.push(player.id);
			});
			collision.loosers.forEach(function(player) {
				loosers.push(player.id);
			});

			var json = {
				winners: winners,
				loosers: loosers
			};

			this.sendTo(this.players, "player/collision", json);
			this.resetPlayers(collision.loosers);
			return;
		}

		//Notify otherPlayers of position and if player enter/leave their bounds
		otherPlayers = this.playersExceptPlayer(player);
		for (var i in otherPlayers) {
			var otherPlayer = otherPlayers[i];
			//player previously in otherPlayer's bounds ?
			var index = otherPlayer.otherPlayersInBounds.indexOf(player);

			//player currently in otherPlayer's bounds ?
			var playerInBounds = otherPlayer.boundsContainPoint(player.position);

			//player not previously but currently in bounds
			if (playerInBounds && index == - 1) {
				otherPlayer.otherPlayersInBounds.push(player);
				//collect path
				var path = [];
				for (var i in player.path.blocks) {
					var block = player.path.blocks[i];
					var blockDirection = player.path.blocksDirections[i];
					var blockData = {
						position: block.center,
						size: {
							width: block.x,
							height: block.y
						},
						direction: blockDirection
					};
					path.push(blockData);
				}
				this.sendTo(otherPlayer, "player/enterBounds", {id: player.id, position: player.position, path: path});
			}
			//player previously but not currently in bounds
			else if (!playerInBounds && index != -1) {
				otherPlayer.otherPlayersInBounds.splice(index, 1);
				this.sendTo(otherPlayer, "player/leaveBounds", {id: player.id});
			}
			else if(playerInBounds && index != -1)
				this.sendTo(otherPlayer, "player/position", {id: player.id, position: player.position});
		}
	}).bind(this));
};

PlayersController.prototype.stopListeningPlayer = function(player) {
	player.removeAllListeners();
};

PlayersController.prototype.resetPlayer = function(player) {
	this.removePlayer(player);
	this.addPlayerWithSocket(player.socket);
};

PlayersController.prototype.resetPlayers = function(players) {
	for (var i in players) {
		this.resetPlayer(players[i]);
	}
};

PlayersController.prototype.onNewObstacle = function(obstacle) {
	var json = {
		id: obstacle.id,
		position: obstacle.block.position,
		size: obstacle.block.size
	}
	for (var i in this.players) {
		var player = this.players[i];
		this.sendTo(player, "obstacle", json);
	}
};

var playersController = null;

function init() {
	if (!playersController)
		playersController = new PlayersController();
	return playersController;
}

module.exports.singleton = init;