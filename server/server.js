var app = require('http').createServer(handler);
var io = require('socket.io').listen(app, {log: false});
var Player = require('./player');

app.listen(5000);

function handler (req, res) {
}

///////////////////////////////////////
///////////////////////////////////////

var players = [];

function destroyPlayer(player) {
	index = players.indexOf(player);
	players.splice(index, 1);
}

function getOtherPlayers(player) {
	otherPlayers = players.slice(0);
	index = otherPlayers.indexOf(player);

	if (index != -1)
		otherPlayers.splice(index, 1);
	return otherPlayers;
}

function getOtherPlayersWithPlayerInBounds(player) {
	otherPlayers = getOtherPlayers(player);
	otherPlayersInBounds = [];
	otherPlayers.forEach(function(testPlayer) {
		isInBounds = testPlayer.isPointInBounds(player.position);
		if (isInBounds)
			otherPlayersInBounds.push(testPlayer);
	})
	return otherPlayersInBounds;
}

function sendToPlayers(players, message, json) {
	players.forEach(function(player) {
		player.socket.emit(message, json);
	});
}

function doesPlayerCollide(player) {
	testPlayers = otherPlayersInBounds.slice(0);
	testPlayers.push(player);
	for (var i in testPlayers) {
		testPlayer = testPlayers[i];
		if (testPlayer.doesKillPlayer(player)) {
			return testPlayer;
		}
	}
	return null;
}

///////////////////////////////////////
///////////////////////////////////////

io.sockets.on('connection', function (socket) {
	newPlayer = new Player(socket);
	newPlayer.startListening();
	players.push(newPlayer);

	newPlayer.on("didDisconnect", function() {
		this.removeAllListeners();
		otherPlayers = getOtherPlayers(this);
		destroyPlayer(this);

		json = {
			id: this.id
		};

		sendToPlayers(otherPlayers, "player/disconnect", json);
	});

	newPlayer.on("didSetPosition", function() {
		otherPlayersInBounds = getOtherPlayersWithPlayerInBounds(this);
		json = {
			id: this.id,
			position: this.position
		};
		if (doesPlayerCollide(this)) {
			console.log("die");
		}
		sendToPlayers(otherPlayersInBounds, "player/position", json);
	});
});
