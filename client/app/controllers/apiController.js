var eventEmitter = require('eventEmitter');

var apiController = function(ip) {
  eventEmitter.call(this);

  this.socket = io.connect('http://'+ip+':5000');

  // Routes
  //// Players
  this.socket.on("player", this.onPlayer.bind(this));
  this.socket.on("player/position", this.onPlayerPosition.bind(this));
  this.socket.on("player/disconnect", this.onPlayerDisconnect.bind(this));
  this.socket.on("player/collision", this.onPlayerCollision.bind(this));
  this.socket.on("player/enterBounds", this.onPlayerDidEnterBounds.bind(this));
  this.socket.on("player/leaveBounds", this.onPlayerDidLeaveBounds.bind(this));

  // Tmp to debug
  this.socket.on('test', function(json) {
    this.trigger('test', json);
  }.bind(this));

  // Socket.io Events
  this.socket.on("error", this.didReceiveError.bind(this));
  this.socket.on("connect_failed", this.didFailToConnect.bind(this));
};

apiController.prototype = new eventEmitter();

// Socket.io Events
apiController.prototype.didReceiveError = function() {
  this.trigger("didReceiveError");
};

apiController.prototype.didFailToConnect = function() {
  this.trigger("didFailToConnect");
};

// Send API Requests
apiController.prototype.setPosition = function(position) {
  this.socket.emit("setPosition", {
    x: position.x,
    y: position.y,
    z: position.z
  })
};

apiController.prototype.setBounds = function(width, height) {
  this.socket.emit("setBounds", {
    width: width,
    height: height
  });
}

// Inbound API Request Handlers
apiController.prototype.onPlayer = function(json) {
  this.trigger('playerDidConnect',json);
};

apiController.prototype.onPlayerCollision = function(json) {
  this.trigger('playerDidCollision',json);
};

apiController.prototype.onPlayerPosition = function(json) {
  this.trigger('playerPositionDidChange',json);
};

apiController.prototype.onPlayerDisconnect = function(json) {
  this.trigger('playerDidDisconnect',json);
};

apiController.prototype.onPlayerDidEnterBounds = function(json) {
  this.trigger('playerDidEnterBounds', json);
};

apiController.prototype.onPlayerDidLeaveBounds = function(json) {
  this.trigger('playerDidLeaveBounds', json);
};
