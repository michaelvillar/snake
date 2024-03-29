var apiController = require('apiController');
var hudController = require('hudController');
var boostModel = require('boostModel');
var scoreModel = require('scoreModel');
var playerModel = require('playerModel');
var boardModel = require('boardModel');
var eventEmitter = require('eventEmitter');
var convert = require('convert');

var SPEED = 10;
var CAMERA_OFFSET = {
  x: 0,
  y: -15,
  z: 20
};
var CAMERA_ROTATION = 0.5;
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
// document.body.appendChild( stats.domElement );

var appController = function(options) {
  eventEmitter.call(this);

  this.options = options || {};

  this.inited = false;
  this.initScene();

  this.board = new boardModel(this.scene);
  this.board.attach();

  this.boost = new boostModel();
  this.score = new scoreModel();

  this.hud = new hudController(this.boost, this.score);
  document.body.appendChild(this.hud.el);

  this.players = {};
  this.obstacles = {};

  var locationArgs = document.location.toString().split("#");
  var ip = 'localhost';
  if(locationArgs.length == 2) {
    var queryString = locationArgs[1];
    ip = queryString.replace("#","");
  }
  this.api = new apiController(ip);
  this.api.on('playerDidConnect', this.playerDidConnect.bind(this));
};

appController.prototype = new eventEmitter();

appController.prototype.init = function() {
  if(this.inited)
    return;
  this.inited = true;

  this.lastTickDate = new Date();

  this.api.on('playerPositionDidChange', this.playerPositionDidChange.bind(this));
  this.api.on('playerDidDisconnect', this.playerDidDisconnect.bind(this));
  this.api.on('playerDidCollision', this.playerDidCollision.bind(this));
  this.api.on('playerDidEnterBounds', this.playerDidEnterBounds.bind(this));
  this.api.on('playerDidLeaveBounds', this.playerDidLeaveBounds.bind(this));

  // Tmp to debug
  var tmpBlocks = [];
  this.api.on('test', function(json) {
    for(var i in tmpBlocks) {
      var block = tmpBlocks[i];
      this.scene.remove(block);
    }
    tmpBlocks = [];
    var blocks = json.blocks;
    var material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.5 });
    for(var i in blocks) {
      var jsonBlock = blocks[i];
      var geometry = new THREE.CubeGeometry(jsonBlock.size.x,jsonBlock.size.y,0.1);
      var block = new THREE.Mesh(geometry, material);
      block.position.x = jsonBlock.position.x;
      block.position.y = jsonBlock.position.y;
      block.position.z = 1;
      this.scene.add(block);
      tmpBlocks.push(block);
    }
  }.bind(this));

  this.render();

  this.bindEvents();
};

// API Handler
appController.prototype.playerDidConnect = function(json) {
  this.api.setBounds(1500, 1500);

  this.me = new playerModel(this.scene, json, true);
  this.me.setPosition(json.position.x, json.position.y, json.position.z);
  this.me.appear();
  this.me.attach();

  this.trigger('meDidChange');

  this.init();
};

appController.prototype.playerDidCollision = function(json) {
  var winnersId = json.winners;
  var loosersId = json.loosers;
  if(this.me && loosersId.indexOf(this.me.id) != -1) {
    if(winnersId && winnersId.indexOf(this.me.id) != -1)
      // Collision with myself
      this.score.increment(-15);
    else
      // Someone killed me or got into an obstacle
      this.score.increment(-10);
    this.me.destroy();
    this.me = null;
    // Clear players
    for(var id in this.players) {
      this.players[id].detach();
    }
    this.players = {};
    // Reset Boost
    this.boost.fill();
  }
  else {
    // This player is dead
    for(var i in loosersId) {
      var looserId = loosersId[i];
      this.deletePlayerForId(looserId);
    }

    if(winnersId && winnersId.indexOf(this.me.id) != -1) {
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

appController.prototype.playerDidEnterBounds = function(json) {
  if(!json.path || json.path.length == 0) {
    this.playerPositionDidChange(json);
    return;
  }
  var player = this.getOrCreatePlayerForId(json.id);
  var position = json.position;
  player.setDirection(json.path[json.path.length-1].direction);
  player.setPosition(position.x, position.y, position.z);
  player.setPath(json.path);
};

appController.prototype.playerDidLeaveBounds = function(json) {
  this.deletePlayerForId(json.id, false);
};

// Private Methods
appController.prototype.updateClosePlayers = function() {
  var polygon = convert.screenRectangleTo3DPolygon(this.camera);
  var center = convert.screenPointTo3DPoint(new THREE.Vector3(0.5,0.5,1), this.camera);

  var outPlayers = [];
  for(var id in this.players) {
    var player = this.players[id];
    var intersection = convert.intersectionBetweenPolygonAndLine(polygon, { points: [ center, player.getPosition() ]}, player.getPosition());
    if(intersection) {
       var intersectionInScreen = convert.object3DPositionTo2DScreenPosition(intersection, this.camera);
       var distanceFromPlayer = convert.distanceBetweenPoint(player.getPosition(), this.me.getPosition());
       var distanceBetweenIntersectionAndMe = convert.distanceBetweenPoint(intersection, this.me.getPosition());
       var extraDistance = distanceFromPlayer - distanceBetweenIntersectionAndMe;
       var size = 1 - (Math.min(extraDistance, 100) / 100);
       outPlayers.push({
         player: player,
         intersectionInScreen: intersectionInScreen,
         size: size
       });
    }
  }
  this.hud.setOutOfScreenPlayers(this.me, outPlayers);
};

appController.prototype.getOrCreatePlayerForId = function(id) {
  var player = this.players[id];
  if(!player) {
    player = new playerModel(this.scene, { id: id }, false);
    player.attach();
    this.players[id] = player;
  }
  return player;
};

appController.prototype.deletePlayerForId = function(id, animated) {
  if(animated == undefined)
    animated = true;
  var player = this.players[id];
  if(player) {
    if(animated)
      player.destroy();
    else
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
    else if(e.keyCode == 38 && this.me) // up
      this.me.setDirection({ x:0, y:1, z:0 });
    else if(e.keyCode == 40 && this.me) // down
      this.me.setDirection({ x:0, y:-1, z:0 });
    else if(e.keyCode == 37 && this.me) // left
      this.me.setDirection({ x:-1, y:0, z:0 });
    else if(e.keyCode == 39 && this.me) // right
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
  this.camera.rotation.x = CAMERA_ROTATION;

  // Render
  this.renderer = new THREE.WebGLRenderer({ antialias: false });
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(this.renderer.domElement);
  window.addEventListener('resize', function() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.rotation.x = CAMERA_ROTATION;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }.bind(this));

  // Light
  this.pointLight =  new THREE.PointLight(0xFFFFFF);
  this.scene.add(this.pointLight);

  // Projector
  this.projector = new THREE.Projector();
};

appController.prototype.render = function() {
  requestAnimationFrame(function() {
    this.render();
  }.bind(this));
  if(!this.paused) {
    this.tick();
    TWEEN.update();
    if(!this.options.disableRendering)
      this.renderer.render(this.scene, this.camera);
    this.updateClosePlayers();
  }
};

appController.prototype.tick = function() {
  this.currentTickDate = new Date()
  var ms = this.currentTickDate.getTime() - this.lastTickDate.getTime()

  if(this.me) {
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
  }

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

appController.prototype.pause = function() {
  this.paused = true;
};