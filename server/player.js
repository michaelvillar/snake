EventEmitter = require('events').EventEmitter;
Path = require('./path');

///////////////////////////////////////
// PRIVATE
///////////////////////////////////////

var currentId = 0;
function nextId() {
	return currentId++;
}

function getDirection(position, json) {
	unNormalizedDirection = {
		x: json.x - position.x,
		y: json.y - position.y,
		z: json.z - position.z
	};
	direction = {};
	for (key in unNormalizedDirection) {
		if (unNormalizedDirection[key] > 0)
			direction[key] = 1;
		else if (unNormalizedDirection[key] < 0)
			direction[key] = -1;
		else
			direction[key] = 0;
	}
	return direction;
}

function onSetPosition(json) {
	this.direction = getDirection(this.position, json);
	increment = Math.max(Math.abs(this.position.x - json.x), Math.abs(this.position.y - json.y));
	if (this.direction.x != 0 || this.direction.y != 0 || this.direction.z != 0)
		this.path.incrementSize(this.direction, increment);

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
	this.thickness = 1;
	this.path = new Path(this.position, this.thickness / 2);
	this.bounds = null;
	this.direction = null;
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
	maxY = this.position.y + this.bounds.height / 2;

	isXInBounds = point.x >= minX && point.x <= maxX;
	isYInBounds = point.y >= minY && point.y <= maxY;


	return isXInBounds && isYInBounds;
};

Player.prototype.doesKillPlayer = function(player) {
	if (player.direction.x == 0) {
		collisionPoint1 = {
			x: player.position.x + player.thickness / 2,
			y: player.position.y + player.direction.y * player.thickness / 2,
			z: 0
		}
		collisionPoint2 = {
			x: player.position.x - player.thickness / 2,
			y: player.position.y + player.direction.y * player.thickness / 2,
			z: 0
		}
	}

	else {
		collisionPoint1 = {
			x: player.position.x + player.direction.x * player.thickness / 2,
			y: player.position.y + player.thickness / 2,
			z: 0
		}
		collisionPoint2 = {
			x: player.position.x + player.direction.x * player.thickness / 2,
			y: player.position.y - player.thickness / 2,
			z: 0
		}
	}
	return this.path.containsPoint(collisionPoint1) || this.path.containsPoint(collisionPoint2);
}

module.exports = Player;