var Player = require('./player');
var Circle = require('./circle');

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

module.exports.isAnyPlayerInCircleOrPathAtCenter = function(players, circle) {
	for (var i in players) {
		var player = players[i];
		if (circle.containsPoint(player.position) || player.containsPointInPath(circle.center)) {
			return true;
		}
	};
	return false;
};
