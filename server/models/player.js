EventEmitter = require('events').EventEmitter;
Path = require('./path');
Helper = require('../helpers/helper');
Block = require('./block');

///////////////////////////////////////
// PRIVATE
///////////////////////////////////////

var currentId = 0;
function nextId() {
	return currentId++;
};

///////////////////////////////////////
// PUBLIC
///////////////////////////////////////

var Player = function(socket, position) {
	this.socket = socket;
	this.id = nextId();
	this.position = position;
	this.z = 1;
	this.path = new Path(this.position, this.z / 2);
	this.bounds = null;
	this.direction = null;
	this.otherPlayersInBounds = [];
}

Player.prototype = new EventEmitter();

Player.prototype.startListening = function() {
	this.socket.on("setPosition", (function(newPosition) {
		this.direction = Helper.directionFromPositions(this.position, newPosition);
		if (this.direction.x != 0 || this.direction.y != 0 || this.direction.z != 0) {
			var increment = Helper.incrementFromPositions(this.position, newPosition);
			this.path.incrementSize(this.position, this.direction, increment);
		}
		this.position = newPosition;
		this.emit("didSetPosition");
	}).bind(this));

	this.socket.on("disconnect", (function() {
		this.emit("didDisconnect");
	}).bind(this));

	this.socket.on("setBounds", (function(json) {
		this.bounds = json;
	}).bind(this));
};

Player.prototype.boundsContainPoint = function(point) {
	if (!this.bounds)
		return false;

	var minX = this.position.x - this.bounds.width / 2;
	var maxX = this.position.x + this.bounds.width / 2;
	var minY = this.position.y - this.bounds.height / 2;
	var maxY = this.position.y + this.bounds.height / 2;

	var isXInBounds = point.x >= minX && point.x <= maxX;
	var isYInBounds = point.y >= minY && point.y <= maxY;

	return isXInBounds && isYInBounds;
};

Player.prototype.headPoints = function() {
	var headPoint1 = {
		x: this.position.x + (this.direction.x * this.z / 2) + (this.direction.y * this.z / 2),
		y: this.position.y + (this.direction.y * this.z / 2) + (this.direction.x * this.z / 2),
		z: 0
	}
	var headPoint2 = {
		x: this.position.x + (this.direction.x * this.z / 2) - (this.direction.y * this.z / 2),
		y: this.position.y + (this.direction.y * this.z / 2) - (this.direction.x * this.z / 2),
		z: 0
	}
	return [headPoint1, headPoint2];
};

Player.prototype.head = function() {
	return new Block(this.position, {x: this.z, y: this.z, z: this.z});
};

Player.prototype.invincible = function() {
	return this.direction == null || (this.direction.x == 0 && this.direction.y == 0 && this.direction.z == 0);
};

module.exports = Player;