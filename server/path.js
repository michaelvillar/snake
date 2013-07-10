var Block = require('./block');

///////////////////////////////////////
// PUBLIC
///////////////////////////////////////

var path = function(headStartPosition, headOffset) {
	this.headStartPosition = headStartPosition;
	this.headOffset = headOffset;
	this.z = 1;
	this.maxSize = 25;
	this.blocks = [];
	this.blocksDirections = [];
	this.totalSize = 0;
};

path.prototype.incrementSize = function(direction, increment) {
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
	// while (this.blocks.length > 0 && decrement > 0) {
	// 	var firstBlock = this.blocks[0];
	// 	var firstDirection = this.blocksDirections[0];
	// 	var firstBlockLength = Math.abs(firstBlock.x * firstDirection.x) + Math.abs(firstBlock.y * firstDirection.y);
	// 	var toDecrement = firstBlockLength < decrement ? firstBlockLength : decrement;
	// 	firstBlock.decrementSize(toDecrement, firstDirection);
	// 	if (decrement - toDecrement > 0) {
	// 		this.blocks.splice(0, 1);
	// 		this.blocksDirections.splice(0, 1);
	// 	}
	// 	decrement -= toDecrement;
	// }
};

path.prototype.containsPoint = function(point) {
	for (var i in this.blocks) {
		var block = this.blocks[i];
		if (block.containsPoint(point)) {
			console.log("block ", block , " contains " , point)
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

	if (this.blocks.length == 0) {
		var center = {
			x: this.headStartPosition.x + direction.x * ((x - this.z) / 2),
			y: this.headStartPosition.y + direction.y * ((y - this.z) / 2)
		};
	}
	else {
		var lastBlock = this.blocks[this.blocks.length - 1];
		var lastDirection = this.blocksDirections[this.blocksDirections.length - 1];
		var center = {
			x: lastBlock.center.x + lastDirection.x * ((lastBlock.x + x) / 2) + (direction.x * (x - lastBlock.x / 2)),
			y: lastBlock.center.y + lastDirection.y * ((lastBlock.y + y) / 2) + (direction.y * (y - lastBlock.y / 2))
		};
	}
	var newBlock = new Block(center, x, y, z);
	return newBlock;
}

module.exports = path;

