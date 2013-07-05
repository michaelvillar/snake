var pathModel = require('pathModel');

var createCube = function(color) {
  var geometry = new THREE.CubeGeometry(1,1,0.6);
  var material = new THREE.MeshLambertMaterial({ color: color });
  var cube = new THREE.Mesh(geometry, material);
  cube.position.z = 0.6
  return cube;
}

var playerModel = function(scene, isMePlayer) {
  this.scene = scene;
  this.cube = createCube((isMePlayer ? 0x00ff00 : 0xff0000));
  this.path = new pathModel(this.scene, (isMePlayer ? 0xcfffcd : 0xfebbbe));
  this.direction = { x:0, y:0, z:0 };
  this.position = { x:0, y:0, z:0 };
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
  this.path.move((x == this.cube.position.x ? Math.abs(y - this.position.y) : Math.abs(x - this.position.x)));
  this.position = { x: x, y: y, z: z };
  this.cube.position.x = x;
  this.cube.position.y = y;
  this.cube.position.z = z;
};

playerModel.prototype.setDirection = function(direction) {
  if(direction.x != this.direction.x || direction.y != this.direction.y) {
    var cube = this.path.attachCube(direction);
    cube.position.x = this.cube.position.x - direction.x * this.cube.scale.x / 2;
    cube.position.y = this.cube.position.y - direction.y * this.cube.scale.y / 2;
  }
  this.direction = direction;
};