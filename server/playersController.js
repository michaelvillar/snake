var Player = require('./player')

///////////////////////////////////////
// PRIVATE
///////////////////////////////////////

///////////////////////////////////////
// PUBLIC
///////////////////////////////////////

var PlayersController = function() {
	this.players = [];
};

PlayersController.prototype.addPlayer = function(player) {
	this.players.push(player);
	this.sendTo(player, "player", {id: player.id});
	player.startListening();
	this.startListeningPlayer(player);
};

PlayersController.prototype.removePlayer = function(player) {
	var index = this.players.indexOf(player);
	if (index != -1) {
		this.players.splice(index, 1);
		this.stopListeningPlayer(player);
	}
};

PlayersController.prototype.removePlayers = function(players) {
	players.forEach((function(player) {
		this.removePlayer(player);
	}).bind(this));
}

PlayersController.prototype.playersExceptPlayer = function(player) {
	var otherPlayers = this.players.slice(0);
	var index = otherPlayers.indexOf(player);

	if (index != -1)
		otherPlayers.splice(index, 1);
	return otherPlayers;
};

PlayersController.prototype.playersInBoundsOfPlayer = function(player) {
	var otherPlayers = this.playersExceptPlayer(player);
	var otherPlayersInBounds = [];
	otherPlayers.forEach(function(testPlayer) {
		var isInBounds = testPlayer.boundsContainPoint(player.position);
		if (isInBounds)
			otherPlayersInBounds.push(testPlayer);
	})
	return otherPlayersInBounds;
};

PlayersController.prototype.collisionWithPlayer = function(player) {
	if (player.invincible())
		return null;
	var otherPlayers = this.playersInBoundsOfPlayer(player).slice(0);
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
		else {
			var otherPlayersInBounds = this.playersInBoundsOfPlayer(player);
			var json = {
				id: player.id,
				position: player.position
			};
			this.sendTo(otherPlayersInBounds, "player/position", json);
		}
	}).bind(this));
};

PlayersController.prototype.stopListeningPlayer = function(player) {
	player.removeAllListeners();
}

module.exports	 = PlayersController;