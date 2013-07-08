
var block = function(center, length, thickness, direction) {
	this.center = center;
	this.length = length;
	this.thickness = thickness;
	this.direction = direction;
	this.clearCache();
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
	this.clearCache();
};

block.prototype.decrementSize = function(decrement) {
	this.length -= decrement;
	this.center.x += this.direction.x * decrement / 2
	this.center.y += this.direction.y * decrement / 2;
	this.clearCache();
};

block.prototype.getWidth = function() {
	if (!this._width) {
		if (Math.abs(this.direction.x) == 1)
			this._width = this.length;
		else
			this._width = this.thickness;
	}
	return this._width;
}

block.prototype.getHeight = function() {
	if (!this._height) {
		if (Math.abs(this.direction.x) == 1)
			this._height = this.thickness;
		else
			this._height = this.length
	}
	return this._height;
}

block.prototype.intersectsBlock = function(blockB) {
	var cornersA = this.corners();
	for(var i in cornersA) {
		var corner = cornersA[i];
		if(blockB.containsPoint(corner))
			return true;
	}
	var cornersB = blockB.corners();
	for(var i in cornersB) {
		var corner = cornersB[i];
		if(this.containsPoint(corner))
			return true;
	}
	return false;
}

block.prototype.corners = function() {
	if(!this._corners) {
		this._corners = [ { x: this.center.x - this.getWidth() / 2, y: this.center.y - this.getHeight() / 2 },
						  { x: this.center.x - this.getWidth() / 2, y: this.center.y + this.getHeight() / 2 },
						  { x: this.center.x + this.getWidth() / 2, y: this.center.y - this.getHeight() / 2 },
						  { x: this.center.x + this.getWidth() / 2, y: this.center.y + this.getHeight() / 2 } ];
    }
    return this._corners;
}

block.prototype.clearCache = function() {
	this._corners = null;	
	this._width = null;
	this._height = null;
}

module.exports = block;