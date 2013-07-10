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
	if (!this.timer)
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
		var obstacle = new Obstacle(position, {x: 1, y: 1, z: 1});
		found = !Helper.isAnyPlayerNearPosition(this.players, position, 5) &&
			  	!Helper.doesAnyPathIntersectsBlock(this.players, obstacle.block)
	}
	this.obstacles.push(obstacle);
	this.emit("newObstacle", obstacle);
};

ObstaclesController.prototype.obstaclesForPlayer = function(player) {

};

ObstaclesController.prototype.collisionWithPlayer = function(player) {
	var head = player.head();
	for (var i in this.obstacles) {
		var obstacle = this.obstacles[i];
		if (head.intersectsBlock(obstacle.block))
			return {obstacle: obstacle};
	}
	return null;
};


var obstaclesController = null;

function init(players) {
	if (!obstaclesController)
		obstaclesController = new ObstaclesController(players);
	return obstaclesController;

}

module.exports.singleton = init;
