var squareBot = function(app) {
  this.app = app;
  this.directions = [{x:1,y:0,z:0},{x:0,y:1,z:0},{x:-1,y:0,z:0},{x:0,y:-1,z:0}];
  this.currentDirection = 0;
};

squareBot.prototype.start = function() {
  this.intervalTick();
  setInterval(this.intervalTick.bind(this), 3000);
};

squareBot.prototype.intervalTick = function() {
  if(!this.app.me)
    return;
  this.app.me.setDirection(this.directions[this.currentDirection]);
  this.currentDirection++;
  if(this.currentDirection == 4)
    this.currentDirection = 0;
};