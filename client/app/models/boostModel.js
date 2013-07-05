var eventEmitter = require('eventEmitter');

var MAXIMUM_SECONDS = 1.0;

var boostModel = function() {
  eventEmitter.call(this);

  this.enabled = false;
  this.seconds = 1.0;
  this.fillingPerSecond = 0.1;
  this.speed = 20;
};

boostModel.prototype = new eventEmitter();

boostModel.prototype.canBeTriggered = function() {
  return this.seconds >= 0.2;
};

boostModel.prototype.enable = function() {
  if(!this.canBeTriggered() || this.enabled)
    return;
  this.enabled = true;
  this.trigger('boostModelDidEnable');
};

boostModel.prototype.disable = function() {
  if(!this.enabled)
    return;
  this.enabled = false;
  this.trigger('boostModelDidDisable');
};

boostModel.prototype.tick = function(ms) {
  if(this.enabled) {
    this.seconds -= ms / 1000;
    this.seconds = Math.max(this.seconds, 0);
    this.trigger('boostModelDidChangeSeconds');
    if(this.seconds <= 0)
      this.disable();
  }
  else if(this.seconds < MAXIMUM_SECONDS) {
    this.seconds = Math.min(this.seconds + this.fillingPerSecond / 1000 * ms, 1)
    this.trigger('boostModelDidChangeSeconds');
  }
};