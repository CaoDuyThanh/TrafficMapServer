// Import service
var cellService = require('../service/cell-service');

var mathUtils = require('./MathUtils');

var ConvertGPSToCellId = function(lon, lat){
	lon = Math.floor(lon * 100) + 9000;
	lat = Math.floor(lat * 100) + 18000;
	return lon << 16 | lat;
}

var FindCellByGPS = function(gpsLocation){
	
}

var DistanceSegmentAndPos = function(segment, pos){
	var nodeStart = segment.node_start[0];
	var nodeEnd = segment.node_end[0];

	var midPoint = {};
	midPoint.X = (nodeStart.lon + nodeEnd.lon) / 2;
	midPoint.Y = (nodeStart.lat + nodeEnd.lat) / 2;

	var point = {};
	point.X = pos.Lon;
	point.Y = pos.Lat;

	return mathUtils.DistanceBetween2Point(midPoint, point);
}

var FindSegmentByGPS = function(gpsLocation, resolve, reject){
	// Find cell based on GPS
	var cellId = ConvertGPSToCellId(gpsLocation.Lon, gpsLocation.Lat);
	var promiseCell = new Promise((resolve, reject) => cellService.GetCellSegmentsLatlng(cellId, resolve, reject));
	promiseCell.then((data) => {
		if (data.length > 0) {
			var cell = data[0];
			var min = 10000;
			var foundSegment;
			cell.segments.forEach((segment) => {
				var distance = DistanceSegmentAndPos(segment, gpsLocation);
				if (distance < min){
					min = distance;
					foundSegment = segment;
				}
			});
			
			return resolve(foundSegment);
		} else {
			return resolve(null);
		}
	});
	promiseCell.catch((err) => {
		console.error('Can not find cell at GPS location : ' + gpsLocation);
		return reject(err);
	});
}

var CheckSameDirection = function(segment, pointStart, pointEnd){
	var pointA = {};
	pointA.X = segment.node_start[0].lon;
	pointA.Y = segment.node_start[0].lat;
	var pointB = {};
	pointB.X = segment.node_end[0].lon;
	pointB.Y = segment.node_end[0].lat;
	var pointC = {};
	pointC.X = pointStart.lon;
	pointC.Y = pointStart.lat;
	var pointD = {};
	pointD.X = pointEnd.lon;
	pointD.Y = pointEnd.lat;
	
	return mathUtils.CheckSameDirection(pointA, pointB, pointC, pointD);
}


module.exports.ConvertGPSToCellId = ConvertGPSToCellId;
module.exports.FindCellByGPS = FindCellByGPS;
module.exports.FindSegmentByGPS = FindSegmentByGPS;
module.exports.CheckSameDirection = CheckSameDirection;
