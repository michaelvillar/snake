var boostHud = require('boostHud');
var scoreHud = require('scoreHud');

var hudController = function(boostModel, scoreModel) {
  this.el = document.createElement('div');
  this.el.classList.add('hud');

  this.boostHud = new boostHud(boostModel);
  this.el.appendChild(this.boostHud.el);

  this.scoreHud = new scoreHud(scoreModel);
  this.el.appendChild(this.scoreHud.el);
};