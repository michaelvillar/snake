var eventEmitter = require('eventEmitter');

var apiController = function() {
  eventEmitter.call(this);

  this.socket = io.connect('http://localhost:5000');
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

apiController.prototype.setBounds = function(width, height) {
  this.socket.emit("setBounds", {
    width: width,
    height: height
  });
}

// Inbound API Request Handlers
apiController.prototype.onPlayerPosition = function(json) {
  this.trigger('playerPositionDidChange',json);
};

apiController.prototype.onPlayerDisconnect = function(json) {
  this.trigger('playerDidDisconnect',json);
};