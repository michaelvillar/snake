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
	var newPosition = {
		x: Math.round(position.x / this.cellSize.x.toFixed(1)) * this.cellSize.x + this.cellSize.x / 2,
		y: Math.round(position.y / this.cellSize.y.toFixed(1)) * this.cellSize.y + this.cellSize.y / 2,
		z: position.z
	};
	return newPosition;
};

Board.prototype.occupiedBlocks = function(players) {
	var blocks = [];
	for (var i in players) {
		var player = players[i];
		var block = new Block(player.position, {x: 30, y: 30, z: 1});
		blocks.push(block);
	}

	return blocks;
};

var board = null;

function init() {
	if (!board)
		board = new Board();
	return board;
}

module.exports.singleton = init;


