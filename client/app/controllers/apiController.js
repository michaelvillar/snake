var eventEmitter = require('eventEmitter');

var apiController = function() {
  eventEmitter.call(this);

  this.socket = io.connect('http://192.168.0.8:5000');
  this.socket.on("player/position", this.onPlayerPosition.bind(this));
  this.socket.on("player/disconnect", this.onPlayerDisconnect.bind(this));
};

apiController.prototype = new eventEmitter();

// Send API Requests
apiController.prototype.setPosition = function(position) {
  this.socket.emit("setPosition", {
    x: position.x,
    y: position.y,
    z: position.z
  })
};

// Inbound API Request Handlers
apiController.prototype.onPlayerPosition = function(json) {
  this.trigger('playerPositionDidChange',json);
};

apiController.prototype.onPlayerDisconnect = function(json) {
  this.trigger('playerDidDisconnect',json);
};

apiController.prototype.onPlayers = function(json) {
  var jsonPlayers = json.players;
  var newPlayers = {}
  for(var i in jsonPlayers) {
    var jsonPlayer = jsonPlayers[i]
    var player = this.players[jsonPlayer.id];
    if(!player) {
      player = createPlayer(false);
      scene.add(player.cube);
    }

    var direction = null;
    if(jsonPlayer.x != player.position.x) {
      direction = { x: (jsonPlayer.x > player.position.x ? 1 : -1), y: 0, z: 0 };
    }
    else if(jsonPlayer.y != player.position.y) {
      direction = { x: 0, y: (jsonPlayer.y > player.position.y ? 1 : -1), z: 0 };
    }
    if(direction)
      player.setDirection(direction);
    player.setPosition(jsonPlayer.x, jsonPlayer.y, jsonPlayer.z);

    newPlayers[jsonPlayer.id] = player;
  }
  for(var id in this.players) {
    if(!newPlayers[id]) {
      var player = players[id]
      player.destroy();
    }
  }
  this.players = newPlayers;
};