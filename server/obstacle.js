var Board = require('./board');
var Block = require('./block');
var board = Board.singleton();

var currentId = 0;
function nextId() {
	return currentId++;
};


var Obstacle = function() {
	this.id = nextId();
	this.blocks = [];
	this.mainBlock = null;
};

Obstacle.prototype.setPosition = function() {

};

Obstacle.randomObstacle = function() {

};

//1 block
Obstacle.obstacle1 = function() {
	var obstacle = new Obstacle();
	var block1 = new Block()
};

//2 blocks in a row
Obstacle.obstacle2 = function() {

};

//3 blocks in a row
Obstacle.obstacle3 = function() {

};

//3 blocks as a L
Obstacle.obstacle4 = function() {

};

//3 blocks as a T
Obstacle.obstacle5 = function() {

};

module.exports = Obstacle;