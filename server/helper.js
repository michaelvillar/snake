
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
