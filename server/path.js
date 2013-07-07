var Block = require('./block');

///////////////////////////////////////
// PUBLIC
///////////////////////////////////////

var path = function(headStartPosition, headOffset) {
	this.headStartPosition = headStartPosition;
	this.headOffset = headOffset;
	this.thickness = 1;
	this.maxSize = 25;
	this.blocks = [];
	this.totalSize = 0;
	this.currentDirection = null;
};

path.prototype.incrementSize = function(direction, increment) {
	decrement = 0;
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
		newBlock = this.createNextBlock(direction, increment);
		this.blocks.push(newBlock);
	}
	else {
		lastBlock = this.blocks[this.blocks.length - 1];
		if (this.currentDirection.x == direction.x && this.currentDirection.y == direction.y) {
			lastBlock.incrementSize(increment);
		}
		else {
			newBlock = this.createNextBlock(direction, increment);
			this.blocks.push(newBlock);
		}
	}

	//Decrement first block
	while (this.blocks.length > 0 && decrement > 0) {
		firstBlock = this.blocks[0];
		toDecrement = firstBlock.length < decrement ? firstBlock.length : decrement;
		firstBlock.decrementSize(toDecrement);
		if (firstBlock.length <= 0)
			this.blocks.splice(0, 1);
		decrement -= toDecrement;
	}
	this.currentDirection = direction;
};

path.prototype.containsPoint = function(point) {
	for (var i in this.blocks) {
		block = this.blocks[i];
		if (block.containsPoint(point))
			return true;
	}
	return false;
};

path.prototype.createNextBlock = function(direction, increment) {
	if (direction.x == 0) {
		width = this.thickness;
		height = increment;
	}
	else {
		width = increment;
		height = this.thickness;
	}

	if (this.blocks.length == 0) {
		center = {
			x: this.headStartPosition.x + direction.x * ((width - this.thickness) / 2),
			y: this.headStartPosition.y + direction.y * ((height - this.thickness) / 2)
		};
	}
	else {
		center = {
			x: lastBlock.center.x + this.currentDirection.x * ((lastBlock.getWidth() + width) / 2) + (direction.x * ((width - lastBlock.getWidth()) / 2)),
			y: lastBlock.center.y + this.currentDirection.y * ((lastBlock.getHeight() + height) / 2) + (direction.y * ((height - lastBlock.getHeight()) / 2))
		};
	}
	newBlock = new Block(center, increment, this.thickness, direction);
	return newBlock;
}

module.exports = path;

