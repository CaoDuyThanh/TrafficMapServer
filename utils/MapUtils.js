var mathUtils = require('./MathUtils');

var ConvertGPSToCellId = function(lon, lat){
	lon = Math.floor(lon * 100) + 9000;
	lat = Math.floor(lat * 100) + 18000;
	return lon << 16 | lat;
}


var FindCellByGPS = function(allCells, gpsLocation){
	var cell_id = ConvertGPSToCellId(gpsLocation.Lon, gpsLocation.Lat);
	return allCells[cell_id];
}

var DistanceSegmentAndPos = function(segment, allNodes, pos){
	var nodeStart = allNodes[segment.node_start];
	var nodeEnd = allNodes[segment.node_end];

	var midPoint = {};
	midPoint.X = (nodeStart.lon + nodeEnd.lon) / 2;
	midPoint.Y = (nodeStart.lat + nodeEnd.lat) / 2;

	var point = {};
	point.X = pos.Lon;
	point.Y = pos.Lat;

	return mathUtils.DistanceBetween2Point(midPoint, point);
}

var FindSegmentByGPS = function(allCells, allSegments, allNodes, gpsLocation){
	var cell = FindCellByGPS(allCells, gpsLocation);

	if (cell){
		var segmentsInCell = cell.segments;
		var min = 10000;
		var id = -1;

		for (var idx = 0; idx < segmentsInCell.length; idx++){
			var segmentId = segmentsInCell[idx];

			var segment = allSegments[segmentId];
			var distance = DistanceSegmentAndPos(segment, allNodes, gpsLocation
				);

			if (distance < min){
				min = distance;
				id = segmentId;
			}
		}
		console.log('Segment_id found: ' + id);
		return allSegments[id];
	}else{
		console.error('Can not find cell at GPS location : ' + gpsLocation);
		return;
	}
}

var CheckSameDirection = function(allNodes, segment, pointStart, pointEnd){
	var pointA = {};
	pointA.X = allNodes[segment.node_start].lon;
	pointA.Y = allNodes[segment.node_start].lat;
	var pointB = {};
	pointB.X = allNodes[segment.node_end].lon;
	pointB.Y = allNodes[segment.node_end].lat;
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
