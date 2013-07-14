var ORIGINAL_WIDTH = 50;
var MAX_WIDTH = 50
var MIN_WIDTH = 25;

var closePlayerHud = function() {
  var xmlns = "http://www.w3.org/2000/svg";
  this.el = document.createElement('div');
  this.el.style.position = 'absolute';
  this.el.style.top = "-25px"
  this.el.style.left = "-25px"
  this.el.style.width = "50px"
  this.el.style.height = "50px"
  this.el.style["-webkit-transform-origin"] = "50% 50%";

  this.svg = document.createElementNS(xmlns, 'svg');
  this.svg.setAttributeNS(null, 'version', "1.1");
  this.svg.style.position = 'absolute';
  this.svg.style.top = '0px';
  this.svg.style.left = '0px';
  this.svg.style.width = '50px';
  this.svg.style.height = '50px';
  this.svg.style["-webkit-transform-origin"] = "50% 50%";

  this.path = document.createElementNS(xmlns, 'path');
  this.path.setAttributeNS(null, 'd', "M 0,26 7.9,33.5 25,16.1 42,33.5 50,26 25,0 z");
  this.path.setAttributeNS(null, 'style', "fill:rgba(255,255,255,.38)");

  this.svg.appendChild(this.path);
  this.el.appendChild(this.svg);

  this.transform = {}
  this.svgTransform = {};
  this.setSize(0);
};

// Between 0 and 1
closePlayerHud.prototype.setSize = function(size) {
  var width = (MAX_WIDTH - MIN_WIDTH) * size + MIN_WIDTH;
  var scale = width / ORIGINAL_WIDTH;
  this.svgTransform.scale = scale;
  this.applyTransform(this.svg, this.svgTransform);
};

closePlayerHud.prototype.setRotation = function(rotation) {
  this.svgTransform.rotate = rotation + "deg";
  this.applyTransform(this.svg, this.svgTransform);
};

closePlayerHud.prototype.setPosition = function(position) {
  this.transform.translateX = Math.round(position.x) + "px";
  this.transform.translateY = Math.round(position.y) + "px";
  this.applyTransform(this.el, this.transform);
};

closePlayerHud.prototype.applyTransform = function(el, transform) {
  var st = "";
  for(key in transform) {
    st += key + "("+transform[key]+") ";
  }
  el.style['-webkit-transform'] = st;
};