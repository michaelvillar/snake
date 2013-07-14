var Player = require('../models/player');

module.exports.directionFromPositions = function(position1, position2) {
	var unNormalizedDirection = {
		x: position2.x - position1.x,
		y: position2.y - position1.y,
		z: position2.z - position1.z
	};
	var direction = {};
	for (key in unNormalizedDirection) {
		if (unNormalizedDirection[key] > 0)
			direction[key] = 1;
		else if (unNormalizedDirection[key] < 0)
			direction[key] = -1;
		else
			direction[key] = 0;
	}
	return direction;
};

module.exports.incrementFromPositions = function(position1, position2) {
	return Math.max(Math.abs(position2.x - position1.x), Math.abs(position2.y - position1.y));
};

module.exports.randomPositionWith = function(position, radius1, radius2) {
	var randomAngle = Math.random() * Math.PI;
	var randomRadius = radius1 + Math.random() * radius2;
	var randomPosition = {};
	randomPosition.x = position.x + (Math.cos(randomRadius) * randomRadius);
	randomPosition.y = position.y + (Math.sin(randomRadius) * randomRadius);
	randomPosition.z = 0;
	return randomPosition;
};

module.exports.isAnyPlayerNearPosition = function(players, position, distance) {
	for (var i in players) {
		var player = players[i];
		var distanceInBetween = Math.sqrt(Math.pow((position.x - player.x), 2) + Math.pow((position.y - player.y), 2));
		if (distanceInBetween < distance) {
			return true;
		}
	};
	return false;
};

module.exports.isAnyPlayerNearPositions = function(players, positions, distance) {
	for (var i in positions) {
		var position = positions[i];
		if (this.isAnyPlayerNearPosition(players, position, distance))
			return true;
	}
	return false;
};

module.exports.doesAnyPathIntersectsBlock = function(players, block) {
	for (var i in players) {
		var player = players[i];
		if (player.path.intersectsBlock(block)) {
			return true;
		}
	};
	return false;
};

module.exports.doesAnyPathIntersectsBlocks = function(players, blocks) {
	for (var i in blocks) {
		var block = blocks[i];
		if (this.doesAnyPathIntersectsBlock(players, block))
			return true;
	}
	return false;
}
