var boardTileModel = function(scene, material) {
  this.scene = scene;

  var geometry = new THREE.PlaneGeometry(boardTileModel.TILE_SIZE, boardTileModel.TILE_SIZE, boardTileModel.TILE_SIZE / 4, boardTileModel.TILE_SIZE / 4);
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.position.z = -0.3;
};

boardTileModel.prototype.attach = function() {
  this.scene.add(this.mesh);
};

boardTileModel.prototype.detach = function() {
  this.scene.remove(this.mesh);
};

boardTileModel.prototype.setPosition = function(position) {
  this.position = position;
  this.mesh.position.x = position.x * boardTileModel.TILE_SIZE;
  this.mesh.position.y = position.y * boardTileModel.TILE_SIZE;
};

boardTileModel.prototype.containsPoint = function(point) {
  return (point.x >= this.mesh.position.x - boardTileModel.TILE_SIZE / 2 &&
          point.x <= this.mesh.position.x + boardTileModel.TILE_SIZE / 2 &&
          point.y >= this.mesh.position.y - boardTileModel.TILE_SIZE / 2 &&
          point.y <= this.mesh.position.y + boardTileModel.TILE_SIZE / 2);
};

boardTileModel.TILE_SIZE = 12;
