
var Block = function(position, size) {
	this.position = position;
	this.size = {
		x: size.x,
		y: size.y,
		z: size.z
	};
};

Block.prototype.containsPoint = function(point) {
	var isInX = (point.x >= (this.position.x - (this.size.x / 2))) && (point.x <= (this.position.x + (this.size.x / 2)));
	var isInY = (point.y >= (this.position.y - (this.size.y / 2))) && (point.y <= (this.position.y + (this.size.y / 2)));
	return isInX && isInY;
};

Block.prototype.incrementSize = function(increment, direction) {
	this.size.x += increment * Math.abs(direction.x);
	this.size.y += increment * Math.abs(direction.y);
	this.position.x += direction.x * increment / 2
	this.position.y += direction.y * increment / 2;
	this.clearCache();
};

Block.prototype.decrementSize = function(decrement, direction) {
	this.size.x -= decrement * Math.abs(direction.x);
	this.size.y -= decrement * Math.abs(direction.y);
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
};

Block.prototype.corners = function() {
	if (!this._corners) {
		this._corners = [ { x: this.position.x - this.size.x / 2, y: this.position.y - this.size.y / 2 },
						  { x: this.position.x - this.size.x / 2, y: this.position.y + this.size.y / 2 },
						  { x: this.position.x + this.size.x / 2, y: this.position.y - this.size.y / 2 },
						  { x: this.position.x + this.size.x / 2, y: this.position.y + this.size.y / 2 } ];
    }
    return this._corners;
};

Block.prototype.clearCache = function() {
	this._corners = null;	
};

Block.prototype.equals = function(block) {
	return this.position.x == block.position.x &&
		   this.position.y == block.position.y &&
		   this.size.x == block.size.x &&
		   this.size.y == block.size.y
};

Block.prototype.horizontalArea = function() {
	return this.size.x * this.size.y;
} ;

Block.prototype.intersectionWithBlockOfSameSize = function(blockB) {
	var blockA = this;
	var cornersA = blockA.corners();
	var cornersB = blockB.corners();

	var inCornersA = [];
	for (var i in cornersA) {
		var corner = cornersA[i];
		if (blockB.containsPoint(corner))
			inCornersA.push(corner);
	}

	//No need to continue
	if (inCornersA.length == 0)
		return null;

	var inCornersB = [];
	for (var i in cornersB) {
		var corner = cornersB[i];
		if (blockA.containsPoint(corner))
			inCornersB.push(corner);
	}

	//Simple intersection
	if (inCornersA.length == 1) {
		var cornerA = inCornersA[0];
		var cornerB = inCornersB[0];
	}

	//4 points intersection
	else if (inCornersA.length == 4) {
		return this;
	}

	//2 points intersection
	else {
		var cornerA = inCornersA[0].x + inCornersA[0].y > inCornersA[1].x + inCornersA[0].y ? inCornersA[0] : inCornersA[1]; 
		var cornerB = inCornersB[0].x + inCornersB[0].y < inCornersB[1].x + inCornersB[0].y ? inCornersB[0] : inCornersB[1]; 
	}

	var center = {
			x: (cornerA.x + cornerB.x) / 2,
			y: (cornerA.y + cornerB.y) / 2,
			z: 0
	};
	var size = {
		x: Math.abs(cornerA.x - cornerB.x),
		y: Math.abs(cornerA.y - cornerB.y),
		z: 1
	};
	return new Block(center, size);
};

module.exports = Block;	