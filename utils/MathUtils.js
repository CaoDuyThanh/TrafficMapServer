
// Calculate distance between line and point
var DistanceBetweenLineAndPoint = function(line, point){
	var pointA = line.PointA;
	var pointB = line.PointB;

	var x1 = pointA.X;
	var x2 = pointB.X;
	var y1 = pointA.Y;
	var y2 = pointB.Y;
	var x0 = point.X;
	var y0 = point.Y;

	var temp1 = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1);
	var temp2 = Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1));

	return temp1 / temp2;
}

var Dot = function(v1, v2){
	return v1.X * v2.X + v1.Y * v2.Y;
}


var DistanceBetween2Point = function(pointA, pointB){
	return Math.sqrt((pointA.X - pointB.X) * (pointA.X - pointB.X) +
					 (pointA.Y - pointB.Y) * (pointA.Y - pointB.Y));
}

var CheckSameDirection = function(pointA, pointB, pointC, pointD){
	var v1 = {};
	v1.X = pointB.X - pointA.X;
	v1.Y = pointB.Y - pointA.Y;
	var v2 = {};
	v2.X = pointD.X - pointC.X;
	v2.Y = pointD.Y - pointC.Y;
	if (Dot(v1, v2) > 0)
		return true;
	else return false;
}


module.exports.DistanceBetweenLineAndPoint = DistanceBetweenLineAndPoint;
module.exports.CheckSameDirection = CheckSameDirection;
module.exports.DistanceBetween2Point = DistanceBetween2Point;