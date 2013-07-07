var app = require('http').createServer(handler);
var io = require('socket.io').listen(app, {log: false});
var PlayersController = require('./playersController');

app.listen(5000);

function handler (req, res) {
}

///////////////////////////////////////
///////////////////////////////////////

var playersController = new PlayersController();

///////////////////////////////////////
///////////////////////////////////////

io.sockets.on('connection', function (socket) {
	playersController.addPlayerWithSocket(socket);
});
