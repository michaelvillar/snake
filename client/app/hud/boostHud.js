var MINIMUM_WIDTH = 28;
var MAXIMUM_WIDTH = 228;

var boostHud = function(boostModel) {
  this.active = false;
  this.boostModel = boostModel;

  this.el = document.createElement('div');
  this.el.classList.add('boostHud');

  this.blueBoost = document.createElement('div');
  this.blueBoost.classList.add('blueBoost');

  this.el.appendChild(this.blueBoost);

  this.boostModel.on('boostModelDidChangeSeconds', this.update.bind(this));
  this.boostModel.on('boostModelDidEnable', function() {
    this.setEnabled(true);
  }.bind(this));
  this.boostModel.on('boostModelDidDisable', function() {
    this.setEnabled(false);
  }.bind(this));

  this.update();
}

boostHud.prototype.update = function() {
  this.setValue(this.boostModel.seconds);
  this.updateTriggerable();
  this.updateFull();
};

boostHud.prototype.updateFull = function() {
  if(this.boostModel.seconds == 1)
    this.el.classList.add('full');
  else
    this.el.classList.remove('full');
};

boostHud.prototype.updateTriggerable = function() {
  if(this.boostModel.canBeTriggered() || this.boostModel.enabled)
    this.el.classList.remove('notTriggerable')
  else
    this.el.classList.add('notTriggerable')
};

boostHud.prototype.setEnabled = function(bool) {
  if(this.active == bool)
    return;
  this.active = bool;
  if(this.active)
    this.el.classList.add('enabled');
  else
    this.el.classList.remove('enabled');
};

boostHud.prototype.setValue = function(value) {
  this.blueBoost.style.width = Math.round(value * (MAXIMUM_WIDTH - MINIMUM_WIDTH) + MINIMUM_WIDTH) + "px";
};