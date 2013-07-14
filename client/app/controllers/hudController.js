var boostHud = require('boostHud');
var scoreHud = require('scoreHud');
var closePlayerHud = require('closePlayerHud');
var convert = require('convert')

var hudController = function(boostModel, scoreModel) {
  this.el = document.createElement('div');
  this.el.classList.add('hud');

  this.boostHud = new boostHud(boostModel);
  this.el.appendChild(this.boostHud.el);

  this.scoreHud = new scoreHud(scoreModel);
  this.el.appendChild(this.scoreHud.el);

  this.closePlayerHuds = {};
};

hudController.prototype.setOutOfScreenPlayers = function(me, outPlayers) {
  var center = {x:window.innerWidth / 2, y:window.innerHeight / 2}
  var rectangle = convert.insetRectangle({x:0,y:0,width:window.innerWidth,height:window.innerHeight}, 35);
  rectangle.height -= 72;
  var rectanglePolygon = {
    points: [ {
      x: rectangle.x,
      y: rectangle.y
    }, {
      x: rectangle.x + rectangle.width,
      y: rectangle.y
    }, {
      x: rectangle.x + rectangle.width,
      y: rectangle.y + rectangle.height
    }, {
      x: rectangle.x,
      y: rectangle.y + rectangle.height
    } ]
  };
  var playersIds = [];
  for(var i in outPlayers) {
    var outPlayer = outPlayers[i];
    var player = outPlayer.player;
    playersIds.push(""+player.id);
    var hud = this.closePlayerHuds[player.id];
    if(!hud) {
      hud = new closePlayerHud();
      this.closePlayerHuds[player.id] = hud;
      this.el.appendChild(hud.el);
    }

    var line = {
      points: [ outPlayer.intersectionInScreen, center ]
    };
    var intersection = convert.intersectionBetweenPolygonAndLine(rectanglePolygon, line, outPlayer.intersectionInScreen);
    if(intersection)
      hud.setPosition(intersection);

    var relativePointToCenter = {x: (intersection.x - rectangle.width / 2 - rectangle.x),
                                 y: (intersection.y - rectangle.height / 2 - rectangle.y)}
    var angle = Math.atan(relativePointToCenter.y / relativePointToCenter.x);
    var rotation = angle * 180 / Math.PI;
    if(relativePointToCenter.x >= 0)
      rotation += 90;
    else
      rotation -= 90;
    hud.setRotation(rotation);
    hud.setSize(outPlayer.size);
  }
  for(var playerId in this.closePlayerHuds) {
    if(playersIds.indexOf(""+playerId) == -1) {
      var hud = this.closePlayerHuds[playerId];
      this.el.removeChild(hud.el);
      delete this.closePlayerHuds[playerId];
    }
  }
};