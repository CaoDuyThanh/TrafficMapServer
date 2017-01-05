
var CreateSegment = function(segment, nodeStart, nodeEnd){
	var newNodeStart = {};
	newNodeStart.lon = nodeStart.node_lon;
	newNodeStart.lat = nodeStart.node_lat;
	var newNodeEnd = {};
	newNodeEnd.lon = nodeEnd.node_lon;
	newNodeEnd.lat = nodeEnd.node_lat;

	var newSegment = {};
	newSegment.node_start = newNodeStart;
	newSegment.node_end = newNodeEnd;
	newSegment.density_ste = segment.density_ste;
	newSegment.velocity_ste = segment.velocity_ste;
	newSegment.density_ets = segment.density_ets;
	newSegment.velocity_ets = segment.velocity_ets;
	newSegment.status = 4;

	return newSegment;
}

module.exports.CreateSegment = CreateSegment;