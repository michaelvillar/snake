var apiController = require('apiController');
var hudController = require('hudController');
var boostModel = require('boostModel');
var scoreModel = require('scoreModel');
var playerModel = require('playerModel');
var boardModel = require('boardModel');

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

// Stats
var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );

var appController = function() {
  this.initScene();

  this.board = new boardModel(this.scene);
  this.board.attach();

  this.boost = new boostModel();
  this.score = new scoreModel();

  this.hud = new hudController(this.boost, this.score);
  document.body.appendChild(this.hud.el);

  this.players = {};

  this.api = new apiController();
  this.api.setBounds(150, 150);
  this.api.on('playerDidConnect', this.playerDidConnect.bind(this));
  this.api.on('didReceiveError', function() {
    this.playerDidConnect({ id: 1, position: {x:0,y:0,z:0} });
  }.bind(this));
};

appController.prototype.init = function() {
  this.lastTickDate = new Date();

  this.api.on('playerPositionDidChange', this.playerPositionDidChange.bind(this));
  this.api.on('playerDidDisconnect', this.playerDidDisconnect.bind(this));
  this.api.on('playerPositionDidCollision', this.playerPositionDidCollision.bind(this));

  this.render();

  this.bindEvents();
};

// API Handler
appController.prototype.playerDidConnect = function(json) {
  this.me = new playerModel(this.scene, json, true);
  this.me.setPosition(json.position.x, json.position.y, json.position.z);
  this.me.appear();
  this.me.attach();

  this.init();
};

appController.prototype.playerPositionDidCollision = function(json) {
  var winnersId = json.winners;
  var loosersId = json.loosers;
  if(loosersId.indexOf(this.me.id) != -1) {
    alert("You lost!")
    window.location.reload();
  }
  else {
    // This player is dead
    for(var i in loosersId) {
      var looserId = loosersId[i];
      this.deletePlayerForId(looserId);
    }

    if(winnersId.indexOf(this.me.id) != -1) {
      this.score.increment(10);
      // Reset Boost
      this.boost.fill();
    }
  }
};

appController.prototype.playerPositionDidChange = function(json) {
  var player = this.getOrCreatePlayerForId(json.id);
  var position = json.position;
  var direction = null;
  if(position.x != player.getPosition().x) {
    direction = { x: (position.x > player.getPosition().x ? 1 : -1), y: 0, z: 0 };
  }
  else if(position.y != player.getPosition().y) {
    direction = { x: 0, y: (position.y > player.getPosition().y ? 1 : -1), z: 0 };
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
    player = new playerModel(this.scene, { id: id }, false);
    player.attach();
    this.players[id] = player;
  }
  return player;
};

appController.prototype.deletePlayerForId = function(id) {
  var player = this.players[id];
  if(player) {
    player.destroy();
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
    else if(e.keyCode == 39) // right
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
  this.renderer = new THREE.WebGLRenderer({ antialias: false });
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(this.renderer.domElement);
  window.addEventListener('resize', function() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.rotation.x = 0.5;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
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
  TWEEN.update();
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
  this.board.updateCenter(this.me.getPosition());

  this.moveCameraToPosition(this.me.getPosition(), this.camera.position.z == 0);

  this.api.setPosition(this.me.getPosition());

  this.lastTickDate = this.currentTickDate

  stats.update();
};

appController.prototype.moveCameraToPosition = function(position, force) {
  position.z = 0;
  var coords = ["x", "y", "z"];
  for(var i in coords) {
    var coord = coords[i];
    this.camera.position[coord] = position[coord] + CAMERA_OFFSET[coord];
    this.pointLight.position[coord] = position[coord] + LIGHT_OFFSET[coord];
  }
};