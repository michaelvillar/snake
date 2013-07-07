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
	index = this.players.indexOf(player);
	if (index != -1) {
		this.players.splice(index, 1);
		this.stopListeningPlayer(player);
	}
};

PlayersController.prototype.playersExceptPlayer = function(player) {
	otherPlayers = this.players.slice(0);
	index = otherPlayers.indexOf(player);

	if (index != -1)
		otherPlayers.splice(index, 1);
	return otherPlayers;
};

PlayersController.prototype.playersInBoundsOfPlayer = function(player) {
	otherPlayers = this.playersExceptPlayer(player);
	otherPlayersInBounds = [];
	otherPlayers.forEach(function(testPlayer) {
		isInBounds = testPlayer.boundsContainPoint(player.position);
		if (isInBounds)
			otherPlayersInBounds.push(testPlayer);
	})
	return otherPlayersInBounds;
};

PlayersController.prototype.deadPlayersBecauseOfPlayer = function(player) {
	if (player.invincible())
		return null;

	testPlayers = this.playersInBoundsOfPlayer(player).slice(0);
	testPlayers.push(player);
	for (var i in testPlayers) {
		testPlayer = testPlayers[i];
		if (testPlayer.invincible())
			continue;
		collisionPoints = player.collisionPoints();
		if (testPlayer.containsPointInPath(collisionPoints[0]) || testPlayer.containsPointInPath(collisionPoints[1])) {
			return testPlayer;
		}
	}
	return null;
};

PlayersController.prototype.sendTo = function(players, message, json) {
	if (players instanceof Player) {
		player = players;
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
		otherPlayers = this.playersExceptPlayer(player);
		json = {
			id: player.id
		};
		this.sendTo(otherPlayers, "player/disconnect", json);
		this.removePlayer(player);
	}).bind(this));

	player.on("didSetPosition", (function() {
		winner = this.deadPlayersBecauseOfPlayer(player);
		looser = player;
		if (winner) {
			json = {
				winner: winner.id,
				looser: looser.id
			};
			this.sendTo(this.players, "player/collision", json);
			this.removePlayer(looser);
		}
		else {
			otherPlayersInBounds = this.playersInBoundsOfPlayer(player);
			json = {
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