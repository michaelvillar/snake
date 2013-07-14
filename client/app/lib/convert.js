var convert = {};

var plane = new THREE.Plane();
plane.setFromCoplanarPoints(
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(1, 1, 0),
  new THREE.Vector3(0, 1, 0)
);

convert.object3DPositionTo2DScreenPosition = function(position, camera) {
  var projector = new THREE.Projector();
  var p3D = new THREE.Vector3(position.x, position.y, position.z);
  var p2D = projector.projectVector(p3D, camera);
  p2D.x = (p2D.x + 1)/2 * window.innerWidth;
  p2D.y = - (p2D.y - 1)/2 * window.innerHeight;
  return p2D;
};

convert.intersectionBetweenPolygonAndLine = function(polygon, line, externalPoint) {
  var intersections = [];
  for(var i in polygon.points) {
    var previousPoint;
    if(i == 0)
      previousPoint = polygon.points[polygon.points.length - 1];
    else
      previousPoint = polygon.points[i - 1];
    var point = polygon.points[i];
    var lineA = { points: [ previousPoint, point ] };
    var intersection = convert.intersectionBetweenLineAndLine(lineA, line);
    if(intersection)
      intersections.push(intersection);
  }
  if(intersections.length == 0)
    return null;
  if(intersections.length == 1)
    return intersections[0];
  // Find the nearest intersection
  var nearest = null;
  var distance = null;
  for(var i in intersections) {
    var intersection = intersections[i];
    var d = convert.distanceBetweenPoint(intersection, externalPoint);
    if(distance == null || d < distance) {
      distance = d;
      nearest = intersection;
    }
  }
  return nearest;
};

convert.intersectionBetweenLineAndLine = function(lineA, lineB) {
  var denA = (lineA.points[0].x - lineA.points[1].x);
  var denB = (lineB.points[0].x - lineB.points[1].x);
  var slopeA = (lineA.points[0].y - lineA.points[1].y) / denA;
  var slopeB = (lineB.points[0].y - lineB.points[1].y) / denB;

  if(denA == 0 && denB == 0)
    return null;

  var x, y;
  if(denA == 0) {
    x = lineA.points[0].x;
    y = ((x - lineB.points[1].x) * slopeB) + lineB.points[1].y;
  }
  else if(denB == 0) {
    x = lineB.points[0].x;
    y = ((x - lineA.points[1].x) * slopeA) + lineA.points[1].y;
  }
  else {
    x = - (lineB.points[1].x * slopeB) + lineB.points[1].y + (lineA.points[1].x * slopeA) - lineA.points[1].y;
    x = x / (slopeA - slopeB);
    y = ((x - lineA.points[1].x) * slopeA) + lineA.points[1].y;
  }
  var p = { x: x, y: y };

  // Check if p is in the two segment!
  var lines = [lineA, lineB];
  for(var i in lines) {
    var line = lines[i];
    var minX = Math.min(line.points[0].x, line.points[1].x);
    var maxX = Math.max(line.points[0].x, line.points[1].x);
    var minY = Math.min(line.points[0].y, line.points[1].y);
    var maxY = Math.max(line.points[0].y, line.points[1].y);
    if(!(p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY))
      return null;
  }
  return p;
};

convert.screenPointTo3DPoint = function(vector, camera) {
  var projector = new THREE.Projector();
  projector.unprojectVector(vector, camera);
  var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
  return raycaster.ray.intersectPlane(plane);
};

convert.screenRectangleTo3DPolygon = function(camera) {
  var vectors = [
    new THREE.Vector3(-1, -1, 1),
    new THREE.Vector3(1, -1, 1),
    new THREE.Vector3(1, 1, 1),
    new THREE.Vector3(-1, 1, 1)
  ];
  var polygon = {
    type: 'polygon',
    points: []
  };
  for(i in vectors) {
    var vector = vectors[i];
    var point = convert.screenPointTo3DPoint(vector, camera);
    polygon.points.push(point);
  }
  return polygon;
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