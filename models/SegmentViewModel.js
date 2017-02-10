var long = require('long');

var CreateSegment = function(segment, nodeStart, nodeEnd){
	var newNodeStart = {};
	newNodeStart.lon = nodeStart.lon;
	newNodeStart.lat = nodeStart.lat;
	var newNodeEnd = {};
	newNodeEnd.lon = nodeEnd.lon;
	newNodeEnd.lat = nodeEnd.lat;

	var newSegment = {};
	newSegment.segment_id = segment.segment_id;
	newSegment.node_start = newNodeStart;
	newSegment.node_end = newNodeEnd;
	newSegment.density = segment.density;
	newSegment.velocity = segment.velocity;
	newSegment.weather = 'NaN';

	return newSegment;
}

module.exports.CreateSegment = CreateSegment;