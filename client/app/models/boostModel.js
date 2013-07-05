var MAXIMUM_SECONDS = 1.0;

var boostModel = function() {
  this.enabled = false;
  this.seconds = 1.0;
  this.fillingPerSecond = 0.1;
  this.speed = 20;
};

boostModel.prototype.enable = function() {
  if(this.seconds <= 0.2 || this.enabled)
    return;
  this.enabled = true;
};

boostModel.prototype.disable = function() {
  this.enabled = false;
};

boostModel.prototype.tick = function(ms) {
  if(this.enabled) {
    this.seconds -= ms / 1000;
    this.seconds = Math.max(this.seconds, 0);
    if(this.seconds <= 0)
      this.disable();
  }
  else if(this.seconds < MAXIMUM_SECONDS) {
    this.seconds = Math.min(this.seconds + this.fillingPerSecond / 1000 * ms, 1)
  }
};