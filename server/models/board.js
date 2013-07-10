
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
		x: Math.round(position.x / this.cellSize.x.toFixed(1)) * this.cellSize.x,
		y: Math.round(position.y / this.cellSize.y.toFixed(1)) * this.cellSize.y,
		z: position.z
	};
	return newPosition;
};

var board = null;

function init() {
	if (!board)
		board = new Board();
	return board;
}

module.exports.singleton = init;


