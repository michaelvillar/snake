var cubeModel = function(scene, color) {
  this.scene = scene;
  var geometry = new THREE.CubeGeometry(1,1,0.6);
  var material = new THREE.MeshLambertMaterial({ color: color });
  this.mesh = new THREE.Mesh(geometry, material);
};

cubeModel.prototype.attach = function() {
  this.scene.add(this.mesh);
};

cubeModel.prototype.detach = function() {
  this.scene.remove(this.mesh);
};

cubeModel.prototype.scale = function() {
  return this.mesh.scale;
};

cubeModel.prototype.getPosition = function() {
  return this.mesh.position;
};

cubeModel.prototype.setPosition = function(position) {
  this.mesh.position = position;
};

cubeModel.prototype.destroy = function() {

};