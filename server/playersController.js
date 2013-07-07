var Player = require('./player');
var Circle = require('./circle');

///////////////////////////////////////
// PRIVATE
///////////////////////////////////////

///////////////////////////////////////
// PUBLIC
///////////////////////////////////////

var PlayersController = function() {
	this.players = [];
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
			var randomAngle = Math.random() * Math.PI;
			var randomRadius = 5 + Math.random() * 5;
			position.x = otherPlayer.position.x + (Math.cos(randomRadius) * randomRadius);
			position.y = otherPlayer.position.y + (Math.sin(randomRadius) * randomRadius);

			var newPlayerCircle = new Circle(position, 4);

			foundPosition = true;
			this.players.forEach(function(player) {
				if (player.id != otherPlayer.id && (newPlayerCircle.containsPoint(player.position) || player.containsPointInPath(position))) {
					foundPosition = false;
					return;
				}
			});
		}
	}

	////////////////////
	var player = new Player(socket, position);
	this.players.push(player);
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
	otherPlayers.push(player);
	var headPoints = player.headPoints();
	for (var i in otherPlayers) {
		var otherPlayer = otherPlayers[i];
		if (otherPlayer.invincible())
			continue;

		// Both players die because they hit on the head
		if (otherPlayer.id != player.id && (otherPlayer.containsPointInHead(headPoints[0]) || otherPlayer.containsPointInHead(headPoints[1]))) 
			return { 'winners' : [],
					 'loosers' : [player, otherPlayer] };
		// Player hit someone's path or his own path
		if (otherPlayer.containsPointInPath(headPoints[0]) || otherPlayer.containsPointInPath(headPoints[1]))
			return { 'winners' : [otherPlayer],
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
	}).bind(this));

	player.on("didSetPosition", (function() {
		//Notify players of collision
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
			this.removePlayers(collision.loosers);
		}
		//Notify otherPlayers of position and if player enter/leave their bounds
		else {
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
					player.path.blocks.forEach(function(block) {
						var blockData = {
							position: block.center,
							size: {
								width: block.getWidth(),
								height: block.getHeight()
							},
							direction: block.direction
						}
						path.push(blockData);
					});
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
		}
	}).bind(this));
};

PlayersController.prototype.stopListeningPlayer = function(player) {
	player.removeAllListeners();
}

module.exports	 = PlayersController;