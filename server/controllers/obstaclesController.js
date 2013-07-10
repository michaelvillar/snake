var Helper = require('../helpers/helper')
var Obstacle = require('../models/obstacle');
var Board = require('../models/board');
var EventEmitter = require('events').EventEmitter;

var board = Board.singleton();

var ObstaclesController = function(players) {
	this.timer = null;
	this.players = players;
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
		if (this.players.length == 0)
			return;
		var index = Math.round((Math.random() * (this.players.length - 1)));
		var position = Helper.randomPositionWith(this.players[index].position, 6, 20);
		var position = board.nearestCellCenterToPosition(position);
		found = !Helper.isAnyPlayerNearPosition(this.players, position, 5) //&&
			  //  !Helper.doesAnyPathIntersectsBlock(this.players, )
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
