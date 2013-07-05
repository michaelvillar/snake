var createCube = function(color) {
  var geometry = new THREE.CubeGeometry(1,1,0.6);
  var material = new THREE.MeshLambertMaterial({ color: color });
  var cube = new THREE.Mesh(geometry, material);
  return cube;
}

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
    this.scene.remove(this.cubes[i].mesh);
  }
};

pathModel.prototype.attachCube = function(direction) {
  this.direction = direction;
  var cube = {
    mesh: createCube(this.color),
    direction: direction
  };
  cube.decreaseSize = function(decr) {
    return this.increaseSize(-decr);
  }.bind(cube);
  cube.increaseSize = function(incr) {
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
  }.bind(cube);
  cube.isEmpty = function() {
    return (this.mesh.scale.x == 0 || this.mesh.scale.y == 0);
  }.bind(cube);

  cube.mesh.scale = new THREE.Vector3(Math.abs(direction.y), Math.abs(direction.x), 1);
  this.scene.add(cube.mesh);
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
        this.scene.remove(firstCube.mesh);
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