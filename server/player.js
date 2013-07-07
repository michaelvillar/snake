EventEmitter = require('events').EventEmitter;
Path = require('./path');
helper = require('./helper');

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

var Player = function(socket) {
	this.socket = socket;
	this.id = nextId();
	this.position = {
		x: 0,
		y: 0,
		z: 0
	};
	this.headThickness = 1;
	this.path = new Path(this.position, this.headThickness / 2);
	this.bounds = null;
	this.direction = null;
}

Player.prototype = new EventEmitter();

Player.prototype.startListening = function() {
	this.socket.on("setPosition", (function(newPosition) {
		this.direction = helper.directionFromPositions(this.position, newPosition);
		if (this.direction.x != 0 || this.direction.y != 0 || this.direction.z != 0)
			this.path.incrementSize(this.direction, helper.incrementFromPositions(this.position, newPosition));

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

	minX = this.position.x - this.bounds.width / 2;
	maxX = this.position.x + this.bounds.width / 2;
	minY = this.position.y - this.bounds.height / 2;
	maxY = this.position.y + this.bounds.height / 2;

	isXInBounds = point.x >= minX && point.x <= maxX;
	isYInBounds = point.y >= minY && point.y <= maxY;

	return isXInBounds && isYInBounds;
};

Player.prototype.headPoints = function() {
	headPoint1 = {
		x: this.position.x + (this.direction.x * this.headThickness / 2) + (this.direction.y * this.headThickness / 2),
		y: this.position.y + (this.direction.y * this.headThickness / 2) + (this.direction.x * this.headThickness / 2),
		z: 0
	}
	headPoint2 = {
		x: this.position.x + (this.direction.x * this.headThickness / 2) - (this.direction.y * this.headThickness / 2),
		y: this.position.y + (this.direction.y * this.headThickness / 2) - (this.direction.x * this.headThickness / 2),
		z: 0
	}
	return [headPoint1, headPoint2];
};

Player.prototype.containsPointInPath = function(point) {
	return this.path.containsPoint(point);
};

Player.prototype.containsPointInHead = function(point) {
	minX = this.position.x - this.headThickness / 2;
	maxX = this.position.x + this.headThickness / 2;
	minY = this.position.y - this.headThickness / 2;
	maxY = this.position.y + this.headThickness / 2;
	isInX = point.x >= minX && point.x <= maxX;
	isInY = point.y >= minY && point.y <= maxY;
	return isInX && isInY;
};

Player.prototype.invincible = function() {
	return this.direction == null || (this.direction.x == 0 && this.direction.y == 0 && this.direction.z == 0);
}

module.exports = Player;