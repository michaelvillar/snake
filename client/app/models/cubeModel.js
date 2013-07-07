var cubeModel = function(scene, color) {
  this.scene = scene;
  var geometry = new THREE.CubeGeometry(1,1,0.6);
  this.material = new THREE.MeshLambertMaterial({ color: color, transparent: true, opacity: 1 });
  this.mesh = new THREE.Mesh(geometry, this.material);
  this.appearTween = null;
};

cubeModel.prototype.attach = function() {
  this.scene.add(this.mesh);
};

cubeModel.prototype.detach = function() {
  this.scene.remove(this.mesh);
};

cubeModel.prototype.destroy = function() {
  var args = {z:this.mesh.scale.z, opacity:this.material.opacity};
  var tween = new TWEEN.Tween(args);
  tween.to({z:0.1,opacity:0}, 300);
  tween.easing(TWEEN.Easing.Quadratic.InOut);
  tween.onUpdate(function() {
    this.mesh.scale.z = args.z;
    this.material.opacity = args.opacity;
  }.bind(this));
  tween.onComplete(function() {
    this.detach();
  }.bind(this));
  tween.start();
};

cubeModel.prototype.appear = function() {
  this.material.opacity = 0.0;
  var opacityTweenArgs = {opacity:this.material.opacity};
  var tween = new TWEEN.Tween(opacityTweenArgs);
  tween.to({opacity:1}, 300);
  tween.easing(TWEEN.Easing.Quadratic.InOut);
  tween.onUpdate(function() {
    this.material.opacity = opacityTweenArgs.opacity;
  }.bind(this));
  tween.start();

  this.mesh.position.z = 5;
  var posTweenArgs = {z:this.mesh.position.z};
  this.appearTween = new TWEEN.Tween(posTweenArgs);
  this.appearTween.to({z:0}, 1000);
  this.appearTween.easing(TWEEN.Easing.Bounce.Out);
  this.appearTween.onUpdate(function() {
    this.mesh.position.z = posTweenArgs.z;
  }.bind(this));
  this.appearTween.onComplete(function() {
    this.appearTween = null;
  }.bind(this));
  this.appearTween.start();
};

cubeModel.prototype.cancelAppearAnimation = function() {
  if(this.appearTween)
    this.appearTween.stop();
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