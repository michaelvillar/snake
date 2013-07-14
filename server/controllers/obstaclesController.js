var Helper = require('../helpers/helper')
var Obstacle = require('../models/obstacle');
var Board = require('../models/board');
var EventEmitter = require('events').EventEmitter;

var board = Board.singleton();

var ObstaclesController = function(players) {
	this.timer = null;
	this.spawnPeriod = 500; // in ms
	this.areaTimer = null;
	this.areaPeriod = 3000;
	this.players = players;
	this.obstacles = [];
	this.occupiedBlocks = [];
	this.occupiedArea = 0;
	this.obstaclesInArea = [];
	this.obstaclesObject = {};
	this.obstaclesArray = [];
	this.obstaclesToAreaRatio = 0;
};

ObstaclesController.prototype = new EventEmitter();

ObstaclesController.prototype.startSpawningObstacles = function() {
	if (!this.timer) {
		this.refreshObstaclesData();
		this.timer = setInterval(this.spawnObstacles.bind(this), this.spawnPeriod);
		this.areaTimer = setInterval(this.refreshObstaclesData.bind(this), this.areaPeriod);
	}
};

ObstaclesController.prototype.stopSpawningObstacles = function() {
	if (this.timer) {
		clearInterval(this.timer);
		clearInterval(this.areaTimer);
		this.timer = null;
		this.areaTimer = null;
	}
};

ObstaclesController.prototype.refreshObstaclesData = function() {
	this.occupiedBlocks = board.occupiedBlocks(this.players);

	//Compute the occupiedArea (minus intersections)
	var compareBlocks = this.occupiedBlocks.slice(1);
	var occupiedArea = 0;
	for (var i in this.occupiedBlocks) {
		var block = this.occupiedBlocks[i];
		occupiedArea += block.horizontalArea();
		for (var j in compareBlocks) {
			var compareBlock = compareBlocks[j];
			var intersectionBlock = block.intersectionWithBlockOfSameSize(compareBlock);
			if (intersectionBlock)
				occupiedArea -= intersectionBlock.horizontalArea();
		}
		compareBlocks.splice(0, 1);
	}
	this.occupiedArea = occupiedArea;

	//Filter out obstacles that are not in the area
	this.obstaclesInArea = [];
	for (var i in this.obstaclesArray) {
		var obstacle = this.obstaclesArray[i];
		for (var j in this.occupiedBlocks) {
			var block = this.occupiedBlocks[j];
			if (block.containsPoint(obstacle.block.position)) {
				this.obstaclesInArea.push(obstacle);
				break;
			}
		}
	}
};

ObstaclesController.prototype.removeObstacle = function(obstacle) {
	this.obstaclesObject[obstacle.block.position.x + "," + obstacle.block.position.y] = null;
	var index = this.obstaclesArray.indexOf(obstacle);
	if (index != -1)
		this.obstaclesArray.splice(index, 1);
	index = this.obstaclesInArea.indexOf(obstacle);
	if (index != -1)
		this.obstaclesInArea.splice(index, 1);
};

ObstaclesController.prototype.spawnObstacles = function() {
	this.occupiedBlocks = board.occupiedBlocks(this.players);
	this.obstaclesToAreaRatio = this.obstaclesInArea.length.toFixed(4) * 4 / this.occupiedArea.toFixed(4);
	//console.log(this.obstaclesToAreaRatio);
	if (this.obstaclesToAreaRatio >= 0.05)
		return;

	var numberOfObstaclesToAdd = Math.round((0.05 * this.occupiedArea / 4) - (this.obstaclesInArea.length));
	var randomNumberOfObstacles = Math.round(Math.random() * numberOfObstaclesToAdd); 

	for (var i = 0; i < randomNumberOfObstacles; i++){
		var obstacle = this.newObstacle();
		this.obstaclesInArea.push(obstacle);
		this.obstaclesArray.push(obstacle);
		this.obstaclesObject[obstacle.block.position.x + "," + obstacle.block.position.y] = obstacle;

		//Plan deletion
		var randomTime = Math.round(Math.random() * 5000 + 5000);
		obstacle.creationTime = new Date().getTime()
		obstacle.deletionTime = obstacle.creationTime + randomTime;
		setTimeout(this.removeObstacle.bind(this, obstacle), randomTime);
		this.emit("newObstacle", obstacle);
	}
};

ObstaclesController.prototype.newObstacle = function() {
	if (this.occupiedBlocks.length == 0)
		return;
	var found = false;
	while (!found) {
		var index = Math.round((Math.random() * (this.occupiedBlocks.length - 1)));
		var outerBlock = this.occupiedBlocks[index];
		var innerBlock = new Block(outerBlock.position, {x: 10, y: 10, z: 1});
		var position = board.randomPositionWithBlocks(innerBlock, outerBlock);
		var height = Math.round(Math.random() * 4 + 1);
		var obstacle = new Obstacle(position, {x: 2, y: 2, z: height});
		found = !Helper.isAnyPlayerNearPosition(this.players, position, 5) &&
			  	!Helper.doesAnyPathIntersectsBlock(this.players, obstacle.block) &&
			  	!this.obstaclesObject[obstacle.block.position.x + "," + obstacle.block.position.y];

	}
	return obstacle;
};

ObstaclesController.prototype.obstaclesForPlayer = function(player) {

};

ObstaclesController.prototype.collisionWithPlayer = function(player) {
	var head = player.head();
	for (var i in this.obstaclesArray) {
		var obstacle = this.obstaclesArray[i];
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
