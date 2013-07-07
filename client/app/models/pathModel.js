var pathCubeModel = require('pathCubeModel');

var pathModel = function(scene, color) {
  this.scene = scene;
  this.cubes = [];
  this.length = 0;
  this.maxLength = 25;
  this.direction = null;
  this.color = color;
};

pathModel.prototype.attach = function() {
};

pathModel.prototype.detach = function() {
  for(var i in this.cubes) {
    this.cubes[i].detach();
  }
};

pathModel.prototype.destroy = function() {
  for(var i in this.cubes) {
    this.cubes[i].destroy();
  }
};

pathModel.prototype.attachCube = function(direction) {
  this.direction = direction;
  var cube = new pathCubeModel(this.scene, this.color, direction);
  cube.scale(Math.abs(direction.y), Math.abs(direction.x), 1);
  cube.attach();
  this.cubes.push(cube);
  return cube.mesh;
};

pathModel.prototype.move = function(length) {
  if(this.cubes.length == 0)
    return;
  var shift;
  if(this.length < this.maxLength) {
    var incr = Math.min(this.maxLength - this.length, length)
    shift = length - incr;

    var cube = this.cubes[this.cubes.length - 1];
    cube.increaseSize(incr);
    this.length += incr;
  }
  else {
    shift = length;
  }

  if(shift > 0) {
    var decreasedSize = 0;
    while(decreasedSize < shift && this.cubes.length > 0) {
      var firstCube = this.cubes[0];
      decreasedSize += Math.abs(firstCube.decreaseSize(shift - decreasedSize));
      if(firstCube.isEmpty()) {
        firstCube.detach();
        this.cubes.splice(0, 1);
      }
    }

    var increasedSize = 0;
    if(this.cubes.length > 0) {
      var lastCube = this.cubes[this.cubes.length - 1];
      lastCube.increaseSize(shift);
    }
  }
};