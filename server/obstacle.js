var Board = require('./board');
var board = Board.singleton();

var currentId = 0;
function nextId() {
	return currentId++;
};

var Obstacle = function(position) {
	this.id = nextId();
	this.position = position;
	this.size = {
		x: board.cellSize.x,
		y: board.cellSize.y,
		z: 4
	}
};

module.exports = Obstacle;