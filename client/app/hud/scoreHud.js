var scoreHud = function(scoreModel) {
  this.scoreModel = scoreModel;

  this.el = document.createElement('div');
  this.el.classList.add('scoreHud');

  this.score = document.createElement('div');
  this.score.classList.add('score');
  this.el.appendChild(this.score);

  this.label = document.createElement('div');
  this.label.classList.add('label');
  this.label.innerHTML = 'SCORE';
  this.el.appendChild(this.label);

  this.value = 0;
  this.score.innerHTML = this.value;

  this.scoreModel.on('scoreModelDidChange', this.scoreModelDidChange.bind(this));
};

scoreHud.prototype.scoreModelDidChange = function() {
  this.score.innerHTML = this.scoreModel.value;
};