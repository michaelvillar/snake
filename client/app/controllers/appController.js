var apiController = require('apiController');
var hudController = require('hudController');
var boostModel = require('boostModel');
var playerModel = require('playerModel');

var SPEED = 10;
var CAMERA_OFFSET = {
  x: 0,
  y: -15,
  z: 20
};
var LIGHT_OFFSET = {
  x: 0,
  y: -5,
  z: 10
};

var appController = function() {
  this.initScene();
  this.boost = new boostModel();

  this.hud = new hudController(this.boost);
  document.body.appendChild(this.hud.el);

  this.players = {};
  this.me = new playerModel(this.scene, true);
  this.me.attach();

  this.lastTickDate = new Date();

  this.api = new apiController();
  this.api.setBounds(150, 150);
  this.api.on('playerPositionDidChange', this.playerPositionDidChange.bind(this));
  this.api.on('playerDidDisconnect', this.playerDidDisconnect.bind(this));

  this.render();

  this.bindEvents();
};

// API Handler
appController.prototype.playerPositionDidChange = function(json) {
  var player = this.getOrCreatePlayerForId(json.id);
  var position = json.position;
  var direction = null;
  if(position.x != player.position.x) {
    direction = { x: (position.x > player.position.x ? 1 : -1), y: 0, z: 0 };
  }
  else if(position.y != player.position.y) {
    direction = { x: 0, y: (position.y > player.position.y ? 1 : -1), z: 0 };
  }
  if(direction)
    player.setDirection(direction);
  player.setPosition(position.x, position.y, position.z);
};

appController.prototype.playerDidDisconnect = function(json) {
  this.deletePlayerForId(json.id);
};

// Private Methods
appController.prototype.getOrCreatePlayerForId = function(id) {
  var player = this.players[id];
  if(!player) {
    player = new playerModel(this.scene, false);
    player.attach();
    this.players[id] = player;
  }
  return player;
};

appController.prototype.deletePlayerForId = function(id) {
  var player = this.players[id];
  if(player) {
    player.detach();
    delete this.players[id];
  }
};

appController.prototype.bindEvents = function() {
  document.body.addEventListener("keydown", function(e) {
    if(e.keyCode == 65) // a
      this.camera.position.z -= 0.5
    else if(e.keyCode == 90) // z
      this.camera.position.z += 0.5
    else if(e.keyCode == 38) // up
      this.me.setDirection({ x:0, y:1, z:0 });
    else if(e.keyCode == 40) // down
      this.me.setDirection({ x:0, y:-1, z:0 });
    else if(e.keyCode == 37) // left
      this.me.setDirection({ x:-1, y:0, z:0 });
    else if(e.keyCode == 39) // left
      this.me.setDirection({ x:1, y:0, z:0 });
    else if(e.keyCode == 32) // space
      this.boost.enable();
  }.bind(this));

  document.body.addEventListener("keyup", function(e) {
    if(e.keyCode == 32) // space
      this.boost.disable();
  }.bind(this));
};

appController.prototype.initScene = function() {
  // Scene
  this.scene = new THREE.Scene();

  // Camera
  this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  this.camera.rotation.x = 0.5;

  // Render
  this.renderer = new THREE.WebGLRenderer({ antialias: true });
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(this.renderer.domElement);

  // Board
  var boardPlaneGeometry = new THREE.PlaneGeometry(200, 200, 50, 50)
  var texture = THREE.ImageUtils.loadTexture("/assets/images/grid3.png", new THREE.UVMapping(), function() {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat = new THREE.Vector2(100, 100);
    var boardMaterial = new THREE.MeshLambertMaterial({ map: texture });
    var boardMesh = new THREE.Mesh(boardPlaneGeometry, boardMaterial);
    boardMesh.position.z = -0.3;
    this.scene.add(boardMesh)
  }.bind(this));

  // Light
  this.pointLight =  new THREE.PointLight(0xFFFFFF);
  this.scene.add(this.pointLight);
};

appController.prototype.render = function() {
  requestAnimationFrame(function() {
    this.render();
  }.bind(this));
  this.tick();
  this.renderer.render(this.scene, this.camera);
};

appController.prototype.tick = function() {
  this.currentTickDate = new Date()
  var ms = this.currentTickDate.getTime() - this.lastTickDate.getTime()

  var currentSpeed = SPEED;
  if(this.boost.enabled)
    currentSpeed = this.boost.speed;
  distanceToMove = currentSpeed / 1000 * ms;

  this.boost.tick(ms);

  this.me.move(this.me.direction.x * distanceToMove,
               this.me.direction.y * distanceToMove,
               this.me.direction.z * distanceToMove)

  this.moveCameraToPosition(this.me.position, this.camera.position.z == 0);

  this.api.setPosition(this.me.cube.position);

  this.lastTickDate = this.currentTickDate
};

appController.prototype.moveCameraToPosition = function(position, force) {
  var coords = ["x", "y", "z"];
  for(var i in coords) {
    var coord = coords[i];
    this.camera.position[coord] = position[coord] + CAMERA_OFFSET[coord];
    this.pointLight.position[coord] = position[coord] + LIGHT_OFFSET[coord];
  }
};