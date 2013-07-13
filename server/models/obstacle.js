var Board = require('./board');
var Block = require('./block');
var board = Board.singleton();

var currentId = 0;
function nextId() {
	return currentId++;
};

var Obstacle = function(position, size) {
	this.id = nextId();
	this.block = new Block(position, size);
	this.creationTime = null;
	this.deletionTime = null;
};

module.exports = Obstacle;