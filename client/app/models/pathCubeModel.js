var createCube = function(color) {
  var geometry = new THREE.CubeGeometry(1,1,0.6);
  var material = new THREE.MeshLambertMaterial({ color: color });
  var cube = new THREE.Mesh(geometry, material);
  return cube;
}

var pathCubeModel = function(scene, color, direction) {
  this.scene = scene;
  this.mesh = createCube(color);
  this.direction = direction;
};

pathCubeModel.prototype.attach = function() {
  this.scene.add(this.mesh);
};

pathCubeModel.prototype.detach = function() {
  this.scene.remove(this.mesh);
};

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