EventEmitter = require('events').EventEmitter;

///////////////////////////////////////
// PRIVATE
///////////////////////////////////////

var currentId = 0;
function nextId() {
	return currentId++;
}

function onSetPosition(json) {
	this.position.x = json.x;
	this.position.y = json.y;
	this.position.z = json.z;
	this.emit("didSetPosition");
}

function onDisconnect(json) {
	this.emit("didDisconnect");
}

function onSetBounds(json) {
	this.bounds = json;
}

///////////////////////////////////////
// PUBLIC
///////////////////////////////////////

var Player = function(socket) {
	this.socket = socket;
	this.id = nextId();
	this.position = {
		x: 0,
		y: 0,
		z: 0
	};

	this.bounds = null;
}

Player.prototype = new EventEmitter();

Player.prototype.startListening = function() {
	this.socket.on("setPosition", onSetPosition.bind(this));
	this.socket.on("disconnect", onDisconnect.bind(this));
	this.socket.on("setBounds", onSetBounds.bind(this));
};

Player.prototype.isPointInBounds = function(point) {
	if (!this.bounds)
		return false;

	minX = this.position.x - this.bounds.width / 2;
	maxX = this.position.x + this.bounds.width / 2;
	minY = this.position.y - this.bounds.height / 2;
	maxY = this.positoin.y + this.bounds.height / 2;

	isXInBounds = point.x >= minX && point.x <= maxX;
	isYInBounds = point.y >= minY && point.y <= maxY;

	return isYInBounds && isYInBounds;
};

module.exports = Player;