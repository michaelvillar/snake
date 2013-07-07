
var block = function(center, length, thickness, direction) {
	this.center = center;
	this.length = length;
	this.thickness = thickness;
	this.direction = direction;
};

block.prototype.containsPoint = function(point) {
	var isInX = (point.x >= (this.center.x - this.getWidth() / 2) && (point.x <= (this.center.x + this.getWidth() / 2)));
	var isInY = (point.y >= (this.center.y - this.getHeight() / 2) && (point.y <= (this.center.y + this.getHeight() / 2)));
	return isInX && isInY;
};

block.prototype.incrementSize = function(increment) {
	this.length += increment;
	this.center.x += this.direction.x * increment / 2
	this.center.y += this.direction.y * increment / 2;
};

block.prototype.decrementSize = function(decrement) {
	this.length -= decrement;
	this.center.x += this.direction.x * decrement / 2
	this.center.y += this.direction.y * decrement / 2;
};

block.prototype.getWidth = function() {
	if (Math.abs(this.direction.x) == 1)
		return this.length;
	return this.thickness;
}

block.prototype.getHeight = function() {
		if (Math.abs(this.direction.x) == 1)
		return this.thickness;
	return this.length;
}

module.exports = block;