var Block = require('./block');

///////////////////////////////////////
// PUBLIC
///////////////////////////////////////

var path = function(headPosition, headOffset) {
	this.headPosition = {
		x: headPosition.x,
		y: headPosition.y,
		z: headPosition.z
	};
	this.headOffset = headOffset;
	this.z = 1;
	this.maxSize = 25;
	this.blocks = [];
	this.blocksDirections = [];
	this.totalSize = 0;
};

path.prototype.incrementSize = function(headPosition, direction, increment) {
	this.headPosition = headPosition;
	var decrement = 0;
	if (this.maxSize - this.totalSize == 0) {
		decrement = increment;
	}
	else if (this.maxSize - (this.totalSize + increment) <= 0) {
		decrement = this.totalSize + increment - this.maxSize;
		this.totalSize = this.maxSize;
	}
	else {
		this.totalSize += increment;
	}

	//Add or increment last block
	if (this.blocks.length == 0) {
		var newBlock = this.createNextBlock(direction, increment);
		this.blocks.push(newBlock);
		this.blocksDirections.push(direction);
	}
	else {
		var lastDirection = this.blocksDirections[this.blocksDirections.length - 1];
		var lastBlock = this.blocks[this.blocks.length - 1];
		if (lastDirection.x == direction.x && lastDirection.y == direction.y) {
			lastBlock.incrementSize(increment, lastDirection);
		}
		else {
			var newBlock = this.createNextBlock(direction, increment);
			this.blocks.push(newBlock);
			this.blocksDirections.push(direction);
		}
	}

	//Decrement first block
	while (this.blocks.length > 0 && decrement > 0) {
		var firstBlock = this.blocks[0];
		var firstDirection = this.blocksDirections[0];
		var firstBlockLength = Math.abs(firstBlock.size.x * firstDirection.x) + Math.abs(firstBlock.size.y * firstDirection.y);
		var toDecrement = firstBlockLength < decrement ? firstBlockLength : decrement;
		firstBlock.decrementSize(toDecrement, firstDirection);
		if (decrement - toDecrement > 0) {
			this.blocks.splice(0, 1);
			this.blocksDirections.splice(0, 1);
		}
		decrement -= toDecrement;
	}
};

path.prototype.containsPoint = function(point) {
	for (var i in this.blocks) {
		var block = this.blocks[i];
		if (block.containsPoint(point)) {
			return true;
		}
	}
	return false;
};

path.prototype.intersectsBlock = function(blockB) {
	for (var i in this.blocks) {
		var blockA = this.blocks[i];
		if (blockA.intersectsBlock(blockB))
			return true;
	}
	return false;
};

path.prototype.createNextBlock = function(direction, increment) {
	if (direction.x == 0) {
		var x = this.z;
		var y = increment;
	}
	else {
		var x = increment;
		var y = this.z;
	}
	var z = this.z;

	var center = {
		x: this.headPosition.x + direction.x * ((x / 2 - this.headOffset)),
		y: this.headPosition.y + direction.y * ((y / 2 - this.headOffset))
	};
	var newBlock = new Block(center, {x: x, y: y, z: z});
	return newBlock;
}

module.exports = path;

