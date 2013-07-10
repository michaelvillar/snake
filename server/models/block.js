
var Block = function(position, x, y, z) {
	this.position = position;
	this.x = x;
	this.y = y;
	this.z = z;
};

Block.prototype.containsPoint = function(point) {
	var isInX = (point.x >= (this.position.x - (this.x / 2))) && (point.x <= (this.position.x + (this.x / 2)));
	var isInY = (point.y >= (this.position.y - (this.y / 2))) && (point.y <= (this.position.y + (this.y / 2)));
	return isInX && isInY;
};

Block.prototype.incrementSize = function(increment, direction) {
	this.x += increment * Math.abs(direction.x);
	this.y += increment * Math.abs(direction.y);
	this.position.x += direction.x * increment / 2
	this.position.y += direction.y * increment / 2;
	this.clearCache();
};

Block.prototype.decrementSize = function(decrement, direction) {
	this.x -= decrement * Math.abs(direction.x);
	this.y -= decrement * Math.abs(direction.y);
	this.position.x += direction.x * decrement / 2
	this.position.y += direction.y * decrement / 2;
	this.clearCache();
};

Block.prototype.intersectsBlock = function(blockB) {
	var cornersA = this.corners();
	for (var i in cornersA) {
		var corner = cornersA[i];
		if (blockB.containsPoint(corner))
			return true;
	}
	var cornersB = blockB.corners();
	for (var i in cornersB) {
		var corner = cornersB[i];
		if (this.containsPoint(corner))
			return true;
	}
	return false;
}

Block.prototype.corners = function() {
	if (!this._corners) {
		this._corners = [ { x: this.position.x - this.x / 2, y: this.position.y - this.y / 2 },
						  { x: this.position.x - this.x / 2, y: this.position.y + this.y / 2 },
						  { x: this.position.x + this.x / 2, y: this.position.y - this.y / 2 },
						  { x: this.position.x + this.x / 2, y: this.position.y + this.y / 2 } ];
    }
    return this._corners;
}

Block.prototype.clearCache = function() {
	this._corners = null;	
}

module.exports = Block;