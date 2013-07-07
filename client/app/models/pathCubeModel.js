var cubeModel = require('cubeModel');

var pathCubeModel = function(scene, color, direction) {
  cubeModel.apply(this, [scene, color]);
  this.direction = direction;
};

pathCubeModel.prototype = new cubeModel();

pathCubeModel.prototype.decreaseSize = function(decr) {
  return this.increaseSize(-decr);
};

pathCubeModel.prototype.increaseSize = function(incr) {
  var scale = this.mesh.scale;
  var newScale;
  var translateDirection = ((incr > 0) ? 1 : -1);
  var sizeToIncrease = incr;
  if(this.direction.x != 0) {
    if(scale.x + incr < 0)
      sizeToIncrease = - scale.x;
    newScale = new THREE.Vector3(scale.x + sizeToIncrease, 1, 1);
    this.mesh.translateX(this.direction.x * sizeToIncrease / 2 * translateDirection);
  }
  else {
    if(scale.y + incr < 0)
      sizeToIncrease = - scale.y;
    newScale = new THREE.Vector3(1, scale.y + sizeToIncrease, 1);
    this.mesh.translateY(this.direction.y * sizeToIncrease / 2 * translateDirection);
  }
  this.mesh.scale = newScale;
  return sizeToIncrease;
};

pathCubeModel.prototype.isEmpty = function() {
  return (this.mesh.scale.x == 0 || this.mesh.scale.y == 0);
};

pathCubeModel.prototype.scale = function(x,y,z) {
  this.mesh.scale = new THREE.Vector3();
};