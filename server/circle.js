

var Circle = function(center, radius) {
	this.center = center;
	this.radius = radius;
};

Circle.prototype.containsPoint = function(point) {
	var x = point.x - this.center.x;
	var y = point.y - this.center.y;
	return (Math.sqrt(x) + Math.sqrt(y)) <= Math.sqrt(this.radius); 
}

module.exports = Circle;