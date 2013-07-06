var pathModel = require('pathModel');

var DISTANCE_FROM_TURN_TRESHHOLD = 1.2;

var createCube = function(color) {
  var geometry = new THREE.CubeGeometry(1,1,0.6);
  var material = new THREE.MeshLambertMaterial({ color: color });
  var cube = new THREE.Mesh(geometry, material);
  return cube;
}

var playerModel = function(scene, playerJson, isMePlayer) {
  this.scene = scene;
  this.id = playerJson.id;
  this.cube = createCube((isMePlayer ? 0x00ff00 : 0xff0000));
  this.path = new pathModel(this.scene, (isMePlayer ? 0xcfffcd : 0xfebbbe));
  this.direction = { x:0, y:0, z:0 };
  this.position = { x:0, y:0, z:0 };
  this.positionned = false;
  this.distanceFromTurn = 0;
  this.nextDirection = null;
};

playerModel.prototype.attach = function() {
  this.scene.add(this.cube);
};

playerModel.prototype.detach = function() {
  this.scene.remove(this.cube);
  this.path.detach();
};

playerModel.prototype.move = function(x, y, z) {
  this.setPosition(this.cube.position.x + x, this.cube.position.y + y, this.cube.position.z + z);
};

playerModel.prototype.setPosition = function(x, y, z) {
  var yDelta = Math.abs(y - this.position.y);
  var xDelta = Math.abs(x - this.position.x);
  this.path.move((x == this.cube.position.x ? yDelta : xDelta));
  this.position = { x: x, y: y, z: z };
  this.positionned = true;
  this.cube.position.x = x;
  this.cube.position.y = y;
  this.cube.position.z = z;

  this.distanceFromTurn += xDelta + yDelta;
  if(this.distanceFromTurn >= DISTANCE_FROM_TURN_TRESHHOLD && this.nextDirection)
    this.setDirection(this.nextDirection);
};

playerModel.prototype.setDirection = function(direction) {
  if(!this.positionned)
    return;
  // Direction didn't change
  if(this.direction.x == direction.x && this.direction.y == direction.y)
    return;
  // Don't allow to inverse direction
  if(this.direction.x + direction.x == 0 && direction.x != 0)
    return;
  if(this.direction.y + direction.y == 0 && direction.y != 0)
    return;
  // Don't allow change direction if we didn't move enough or if direction is null
  if(!(this.direction.x == 0 && this.direction.y == 0) && this.distanceFromTurn < DISTANCE_FROM_TURN_TRESHHOLD) {
    this.nextDirection = direction;
    return;
  }


  if(direction.x != this.direction.x || direction.y != this.direction.y) {
    var cube = this.path.attachCube(direction);
    cube.position.x = this.cube.position.x - direction.x * this.cube.scale.x / 2;
    cube.position.y = this.cube.position.y - direction.y * this.cube.scale.y / 2;
  }
  this.nextDirection = null;
  this.direction = direction;
  this.distanceFromTurn = 0;
};