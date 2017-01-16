// IMPORT LIBRARY
var express = require('express');
var router = express.Router();

// IMPORT VIEW MODEL
var segmentViewModel = require('../models/SegmentViewModel');

// IMPORT UTILS
var mapUtils = require('../utils/MapUtils');

/* Get /segment/:segment_id  -  get information of a segment based on segment_id */
router.get('/segment/:segment_id', function(req, res, next){
	// Get segment by segment_id
	segment = global.AllSegments[req.params.segment_id];

	if (segment){
		res.json(segment);
	}
	else{
		return next("Err");
	}
});

/* Get /street/street_id  -  get information of a group of segments in a street based on street_id */
router.get('/street/:street_id', function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
	var street = global.AllStreets[req.params.street_id];
	if (street){
		var segments = {};
		var counter = 0;
		street.segments.forEach(function(segment_id){
			var segment = global.AllSegments[segment_id];
			var nodeStart = global.AllNodes[segment.node_start];
			var nodeEnd = global.AllNodes[segment.node_end];		
			var newSegment = segmentViewModel.CreateSegment(segment, nodeStart, nodeEnd);
			segments[segment_id] = newSegment;

			counter++;
			if (counter === street.segments.length){
				res.json(segments);
			}
		});
	}else{
		res.json({});		
	}
});

/* Get /streets/  -  get information of a group of segments of a group of streets */
router.get('/streets/', function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	
  	var streets = {};
  	var streetIds = req.query.streetIds;
  	for (var idx = 0; idx < streetIds.length; idx++){
  		var streetId = streetIds[idx];
  		var street = global.AllStreets[streetId];
  		if (street){
			var segments = {};			
			street.segments.forEach(function(segment_id){
				var segment = global.AllSegments[segment_id];
				var nodeStart = global.AllNodes[segment.node_start];
				var nodeEnd = global.AllNodes[segment.node_end];		
				var newSegment = segmentViewModel.CreateSegment(segment, nodeStart, nodeEnd);
				segments[segment_id] = newSegment;
			});
			streets[streetId] = segments;
		}
  	}
  	res.json(streets);
});


/* Get /cell/cell_id  -  get information of a group of segments in a cell based on cell_id */
router.get('/cell/:cell_id', function(req, res, next){
	// Get cell by cell_id
	var cell = global.AllCells[req.params.cell_id];

	if (cell){
		segments = {};
		counter = 0;
		cell.segments.forEach(function(segment_id){
			var segment = global.AllSegments[segment_id];
			var nodeStart = global.AllNodes[segment.node_start];
			var nodeEnd = global.AllNodes[segment.node_end];		
			var newSegment = segmentViewModel.CreateSegment(segment, nodeStart, nodeEnd);
			segments[segment_id] = newSegment;

			counter++;
			if (counter === cell.segments.length){
				res.json(segments);
			}
		});
	}
	else{
		return next("Err");
	}
});

function updateSegment(allSegments, unknownSegment){
	// Get all information from segment
	var uSeg_GPS_Start = unknownSegment.GPS_Start;
	var uSeg_GPS_End = unknownSegment.GPS_End;
	var uSeg_Info = unknownSegment.Info;
	var uSeg_Time = unknownSegment.Time;
	var uSeg_Weather = unknownSegment.Weather;

	var uSeg_GPS_Mid = {};
	uSeg_GPS_Mid.Lon = (uSeg_GPS_Start.Lon + uSeg_GPS_End.Lon) / 2;
	uSeg_GPS_Mid.Lat = (uSeg_GPS_Start.Lat + uSeg_GPS_End.Lat) / 2;
	var segment = mapUtils.FindSegmentByGPS(global.AllCells, global.AllSegments, global.AllNodes, uSeg_GPS_Mid);

	var isSameDirection = mapUtils.CheckSameDirection(global.AllNodes, segment, uSeg_GPS_Start, uSeg_GPS_End);
	for (var idx = 0; idx < uSeg_Info.length; idx++){
		var info = uSeg_Info[idx];
		if ((info.Direction === 1 && isSameDirection === true) || 
			(info.Direction === 2 && isSameDirection === false)){
			segment.density_ste = info.Density;
			segment.velocity_ste = info.Velocity;
		}else{
			segment.density_ets = info.Density;
			segment.velocity_ets = info.Velocity;
		}
	}
}

/* POST /density/info=json */
router.post('/segments/', function(req, res, next){
	// Parse json data
	segmentsRec = req.body.segment;
	segmentsRec.forEach(function(segment){
		updateSegment(global.AllSegments, segment);
	});

	res.json("Success!");
});

module.exports = router;