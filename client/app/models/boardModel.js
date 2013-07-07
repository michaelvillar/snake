var boardTileModel = require('boardTileModel');

var TEXTURE_PATH = "/assets/images/grid3.png";

var boardModel = function(scene) {
  this.scene = scene;
  this.tiles = {};
  this.queuedTiles = [];
  this.attached = false;
  this.size = { width: 0, height: 0 };

  var texture = THREE.ImageUtils.loadTexture(TEXTURE_PATH, new THREE.UVMapping());
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat = new THREE.Vector2(boardTileModel.TILE_SIZE / 2, boardTileModel.TILE_SIZE / 2);
  this.material = new THREE.MeshLambertMaterial({ map: texture });
};

boardModel.prototype.attach = function() {
  this.attached = true;
  for(var i in this.tiles) {
    this.tiles[i].attach();
  }
};

boardModel.prototype.detach = function() {
  this.attached = false;
  for(var i in this.tiles) {
    this.tiles[i].detach();
  }
};

boardModel.prototype.setScreenSize = function(size) {

};

boardModel.prototype.tick = function() {

};

boardModel.prototype.shouldHaveTilesAtPositions = function(center, size) {
  var closestTilePositionFromPosition = function(position) {
    return { x: Math.round(position.x / boardTileModel.TILE_SIZE),
             y: Math.round(position.y / boardTileModel.TILE_SIZE) };
  };
  var tilePositionToString = function(tilePosition) {
    return tilePosition.x + "," + tilePosition.y;
  };
  var paddingSize = 100;
  var padding = Math.ceil(paddingSize / boardTileModel.TILE_SIZE);
  var tiles = [];
  var centerTile = closestTilePositionFromPosition(center);

  for(var x = centerTile.x - padding; x <= centerTile.x + padding; x++) {
    for(var y = centerTile.y - padding; y <= centerTile.y + padding; y++) {
      tiles.push(tilePositionToString({x:x,y:y}));
    }
  }

  return tiles;
}

boardModel.prototype.updateCenter = function(position) {
  var tilePositions = this.shouldHaveTilesAtPositions(position, { width: 100, height: 100});
  var currentTilesKeys = Object.keys(this.tiles);

  for(var i in tilePositions) {
    var tilePosition = tilePositions[i];

    var j = currentTilesKeys.indexOf(tilePosition);
    if(j != -1)
      currentTilesKeys.splice(j, 1);

    var tile = this.tiles[tilePosition];
    if(!tile) {
      tile = this.queuedTiles.pop();
      if(!tile) {
        tile = new boardTileModel(this.scene, this.material);
      }
      var args = tilePosition.split(",");
      tile.setPosition({ x: args[0], y: args[1] });
      this.tiles[tilePosition] = tile;
      if(this.attached)
        tile.attach();
    }
  }

  for(var i in currentTilesKeys) {
    var key = currentTilesKeys[i];
    var tile = this.tiles[key];
    tile.detach();
    this.queuedTiles.push(tile);
    delete this.tiles[key];
  }
};