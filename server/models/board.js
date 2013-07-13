var Block = require('./block');

var Board = function() {
	this.origin = {
		x: 0,
		y: 0
	};

	this.cellSize = {
		x: 2,
		y: 2
	}
	
};

Board.prototype.nearestCellCenterToPosition = function(position) {
	var x = (position.x / this.cellSize.x.toFixed(1)) * this.cellSize.x + this.cellSize.x / 2;
	var y = (position.y / this.cellSize.y.toFixed(1)) * this.cellSize.y + this.cellSize.y / 2;
	var newPosition = {
		x: x > 0 ? Math.floor(x) : Math.ceil(x),
		y: y > 0 ? Math.floor(y) : Math.ceil(y),
		z: position.z
	};
	return newPosition;
};

Board.prototype.occupiedBlocks = function(players) {
	var blocks = [];
	for (var i in players) {
		var player = players[i];
		var block = new Block(player.position, {x: 200, y: 200, z: 1});
		blocks.push(block);
	}

	return blocks;
};

Board.prototype.randomPositionWithBlocks = function(innerBlock, outerBlock) {
	var sign = Math.random() > 0.5 ? 1 : -1;
	var randomX = innerBlock.position.x + sign * (Math.random() * ((outerBlock.size.x - innerBlock.size.x) / 2) + innerBlock.size.x / 2);
	sign = Math.random() > 0.5 ? 1 : -1;
	var randomY = innerBlock.position.y + sign * (Math.random() * ((outerBlock.size.y - innerBlock.size.y) / 2) + innerBlock.size.y / 2);
	var position = this.nearestCellCenterToPosition({x: randomX, y: randomY, z: 0});
	return position;
};

var board = null;

function init() {
	if (!board)
		board = new Board();
	return board;
}

module.exports.singleton = init;


