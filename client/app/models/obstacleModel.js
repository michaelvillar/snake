var textures = require('textures');

var obstacleModel = function(scene, position, size) {
  this.scene = scene;
  this.position = position;
  this.size = size;

  var geometry = new THREE.CubeGeometry(size.x,size.y,size.z);
  this.material = new THREE.MeshLambertMaterial({ map: textures.obstacle, transparent: true, opacity: 0.0 });

  this.mesh = new THREE.Mesh(geometry, this.material);
  this.mesh.position.x = position.x;
  this.mesh.position.y = position.y;
  this.mesh.position.z = - size.z / 2 - 0.3;

  this.appearTween = null;
};

obstacleModel.prototype.attach = function() {
  this.scene.add(this.mesh);
};

obstacleModel.prototype.detach = function() {
  this.scene.remove(this.mesh);
};

obstacleModel.prototype.appear = function() {
  this.attach();

  var opacityTweenArgs = {opacity:this.material.opacity};
  var opacityTween = new TWEEN.Tween(opacityTweenArgs);
  opacityTween.to({opacity:1}, 500);
  opacityTween.easing(TWEEN.Easing.Quadratic.InOut);
  opacityTween.onUpdate(function() {
    this.material.opacity = opacityTweenArgs.opacity;
  }.bind(this));
  opacityTween.start();

  var posTweenArgs = {z:this.mesh.position.z};
  this.appearTween = new TWEEN.Tween(posTweenArgs);
  this.appearTween.to({z:this.position.z}, 3000);
  this.appearTween.easing(TWEEN.Easing.Quadratic.InOut);
  this.appearTween.onUpdate(function() {
    this.mesh.position.z = posTweenArgs.z;
  }.bind(this));
  this.appearTween.onComplete(function() {
    this.appearTween = null;
  }.bind(this));
  this.appearTween.start();
};