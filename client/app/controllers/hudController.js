var boostHud = require('boostHud');

var hudController = function(boostModel) {
  this.el = document.createElement('div');
  this.el.classList.add('hud');

  this.boostHud = new boostHud(boostModel);
  this.el.appendChild(this.boostHud.el);
};