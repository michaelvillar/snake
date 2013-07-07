var Helper = require('./helper')
var Circle = require('./circle');
var Obstacle = require('./obstacle');
var Board = require('./board');
var EventEmitter = require('events').EventEmitter;

var board = Board.singleton();

var ObstaclesController = function(players) {
	this.timer = null;
	this.players = players;
	console.log(this.players);
	this.obstacles = [];
};

ObstaclesController.prototype = new EventEmitter();

ObstaclesController.prototype.startSpawningObstacles = function() {
	this.timer = setInterval(this.spawnObstacle.bind(this), 2000);
};

ObstaclesController.prototype.stopSpawningObstacle = function() {
	if (this.timer) {
		clearInterval(this.timer);
		this.timer = null;
	}
};

ObstaclesController.prototype.spawnObstacle = function() {
	var found = false;
	while (!found) {
		var index = Math.round((Math.random() * (this.players.length - 1)));
		if (index == -1)
			return;
		var position = Helper.randomPositionWith(this.players[index].position, 5, 20);
		var position = board.nearestCellCenterToPosition(position);
		circle = new Circle(position, 5);
		players = this.players.slice(0);
		players.splice(index, 1);
		found = !Helper.isAnyPlayerInCircleOrPathAtCenter(this.players, circle);
	}
	var obstacle = new Obstacle(position);
	this.obstacles.push(obstacle);
	this.emit("newObstacle", obstacle);
};

ObstaclesController.prototype.obstaclesForPlayer = function(player) {

}


var obstaclesController = null;

function init(players) {
	if (!obstaclesController)
		obstaclesController = new ObstaclesController(players);
	return obstaclesController;

}

module.exports.singleton = init;
