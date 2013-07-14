var textures = require('textures');
var eventEmitter = require('eventEmitter');
var ANIMATION_DURATION = 3000;

var obstacleModel = function(scene, id, position, size, createdSince, timeToLive) {
  eventEmitter.call(this);

  this.id = id;
  this.scene = scene;
  this.position = position;
  this.size = size;
  this.createdSince = createdSince;
  this.timeToLive = timeToLive;

  var geometry = new THREE.CubeGeometry(size.x,size.y,size.z);
  this.material = new THREE.MeshLambertMaterial({ map: textures.obstacle, transparent: true, opacity: 0.0 });

  this.mesh = new THREE.Mesh(geometry, this.material);
  this.mesh.position.x = position.x;
  this.mesh.position.y = position.y;
  this.mesh.position.z = - size.z / 2 - 0.3;

  this.appearTween = null;
  this.opacityTween = null;
  this.appear();

  setTimeout(this.disappear.bind(this), this.timeToLive - ANIMATION_DURATION);
};

obstacleModel.prototype = new eventEmitter();

obstacleModel.prototype.attach = function() {
  this.scene.add(this.mesh);
};

obstacleModel.prototype.detach = function() {
  this.scene.remove(this.mesh);
};

obstacleModel.prototype.disappear = function() {
  if(this.opacityTween)
    this.opacityTween.stop();
  if(this.appearTween)
    this.appearTween.stop();

  var posTweenArgs = {z:this.mesh.position.z};
  this.disappearTween = new TWEEN.Tween(posTweenArgs);
  this.disappearTween.to({z:- this.size.z / 2 - 0.3}, ANIMATION_DURATION);
  this.disappearTween.easing(TWEEN.Easing.Quadratic.InOut);
  this.disappearTween.onUpdate(function() {
    this.mesh.position.z = posTweenArgs.z;
  }.bind(this));
  this.disappearTween.onComplete(function() {
    this.disappearTween = null;
    this.detach();
    this.trigger('obstacleDidDisappear', this);
  }.bind(this));
  this.disappearTween.start();
};

obstacleModel.prototype.appear = function() {
  this.attach();

  var opacityTweenArgs = {opacity:this.material.opacity};
  this.opacityTween = new TWEEN.Tween(opacityTweenArgs);
  this.opacityTween.to({opacity:1}, ANIMATION_DURATION / 6);
  this.opacityTween.easing(TWEEN.Easing.Quadratic.InOut);
  this.opacityTween.onUpdate(function() {
    this.material.opacity = opacityTweenArgs.opacity;
  }.bind(this));
  this.opacityTween.start();

  var posTweenArgs = {z:this.mesh.position.z};
  this.appearTween = new TWEEN.Tween(posTweenArgs);
  this.appearTween.to({z:this.position.z}, ANIMATION_DURATION);
  this.appearTween.easing(TWEEN.Easing.Quadratic.InOut);
  this.appearTween.onUpdate(function() {
    this.mesh.position.z = posTweenArgs.z;
  }.bind(this));
  this.appearTween.onComplete(function() {
    this.appearTween = null;
  }.bind(this));
  this.appearTween.start();
};