var convert = {};
var projector = new THREE.Projector();

convert.object3DPositionTo2DScreenPosition = function(position, camera) {
  var p3D = new THREE.Vector3(position.x, position.y, position.z);
  var p2D = projector.projectVector(p3D, camera);
  p2D.x = (p2D.x + 1)/2 * window.innerWidth;
  p2D.y = - (p2D.y - 1)/2 * window.innerHeight;
  return p2D;
};

convert.rectangleContainsPoint = function(rectangle, point) {
  return (point.x >= rectangle.x && point.x <= rectangle.x + rectangle.width &&
          point.y >= rectangle.y && point.y <= rectangle.y + rectangle.height);
};

convert.insetRectangle = function(rectangle, inset) {
  return {
    x:rectangle.x + inset,
    y:rectangle.y + inset,
    width:rectangle.width - 2 * inset,
    height:rectangle.height - 2 * inset };
};

convert.distanceBetweenPoint = function(pointA, pointB) {
  var x = Math.abs(pointA.x - pointB.x);
  var y = Math.abs(pointA.y - pointB.y);
  return Math.sqrt((x*x) + (y*y));
};

convert.intersectionBetweenRectangleCenterAndPoint = function(rectangle, point) {
  var center = {x:rectangle.x + rectangle.width / 2,y:rectangle.y + rectangle.height / 2};
  var slope = (point.y - center.y) / (point.x - center.x);
  var relativePointToCenter = {x: (point.x - rectangle.width / 2 - rectangle.x),
                               y: (point.y - rectangle.height / 2 - rectangle.y)}

  var angle = Math.atan(relativePointToCenter.y / relativePointToCenter.x);
  if (-rectangle.height / 2 <= slope * rectangle.width / 2 &&
      slope * rectangle.width / 2 <= rectangle.height / 2) {
    if(point.x > center.x) {
      // Right Edge
      var y = rectangle.width / 2 * Math.tan(angle) + rectangle.height / 2;
      return {x: rectangle.x + rectangle.width, y: y};
    }
    else {
      // Left Edge
      var y = - rectangle.width / 2 * Math.tan(angle) + rectangle.height / 2;
      return {x: rectangle.x, y: y};
    }
  }
  else {
    if(point.y > center.y) {
      // Top Edge
      var x = (rectangle.height / 2) / Math.tan(angle) + rectangle.width / 2;
      return {x: x, y: rectangle.y + rectangle.height};
    }
    else {
      // Bottom Edge
      var x = (- rectangle.height / 2) / Math.tan(angle) + rectangle.width / 2;
      return {x: x, y: rectangle.y};
    }
  }
};