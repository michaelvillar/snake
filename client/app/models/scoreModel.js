var eventEmitter = require('eventEmitter');

var scoreModel = function(value) {
  eventEmitter.call(this);
  if(!value)
    value = 0;
  this.value = value;
};

scoreModel.prototype = new eventEmitter();

scoreModel.prototype.increment = function(incr) {
  this.value += incr;
  this.trigger('scoreModelDidChange');
};