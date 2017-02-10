// IMPORT LIBRARY
var express = require('express');
var router = express.Router();
var fs = require('fs');
var long = require('long');
var protobuf = require('protobufjs');
var byteBuffer = require('bytebuffer');

// IMPORT MAP CONFIG
var config = require('../configuration');
var mapConfig = config.MapConfig;

// CREATE PROTOCOL BUFFER
protobuf.convertFieldsToCamelCase = false;
var densityStreetsProto;
var streetProto;
var segmentProto;
var latlonProto;
protobuf.load('./protobuf/streets.proto', function(err, root){
	if (err) {
		console.log('Can not load streets.proto');
	}
	densityStreetsProto = root.lookup('DensityStreets.DensityStreets');
	streetProto = root.lookup('DensityStreets.Street');
	segmentProto = root.lookup('DensityStreets.Segment');
	latlonProto = root.lookup('DensityStreets.LatLon');
});

var densityStreetsLightProto;
var pointLightProto;
protobuf.load('./protobuf/streets_light.proto', function(err, root){
	if (err) {
		console.log('Can not load streets_light.proto');
	}
	densityStreetsLightProto = root.lookup('DensityStreetsLight.DensityStreetsLight');
	streetLightProto = root.lookup('DensityStreetsLight.StreetLight');
	pointLightProto = root.lookup('DensityStreetsLight.PointLight');
});

// IMPORT VIEW MODEL
var segmentViewModel = require('../models/SegmentViewModel');

// IMPORT UTILS
var mapUtils = require('../utils/MapUtils');

/**
 * Get /segment/:segment_id  -  get density information of a segment based on segment_id
 * @param  {[segment_id]}                    [description]
 * @return {[Json]}                       	 [success: density information
 *                                            failure: message of error]
 */
router.get('/segment/:segment_id', function(req, res, next){
	var segmentId = req.params.segment_id;

	// Get segment by segment_id
	segment = global.AllSegments[segmentId];

	if (segment){
		var responseData = {
			status: 'success',
			data: {
				density: segment.density
			}
		};
		res.json(responseData);
	}
	else{
		var responseData = {
			status: 'failure',
			message: 'Segment not found: SegmentId = ' + segmentId
		};
		res.json(responseData);
		return next('Err');
	}
});


/**
 * Get /street/street_id  -  get information of a group of segments in a street based on street_id
 * @param  {[Object]}                     [description]
 * @param  {[Object]}                     [description]
 * @param  {[Object]}                     [description]
 * @return {[Json]}                       [description]
 */
router.get('/street/:street_id', function(req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
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

function latlonToCellId(lat, lon) {
	lon = Math.floor(lon * 100) + 9000;
	lat = Math.floor(lat * 100) + 18000;
	return lon << 16 | lat;
}

function getListSegmentsByStreetType(latStart, latEnd, lonStart, lonEnd, streetType) {
	var listCellIds = [];
	for (var lat = latStart; lat <= latEnd; lat += 0.01) {
		for (var lon = lonStart; lon <= lonEnd; lon += 0.01) {
			var cellId = latlonToCellId(lat, lon);
			listCellIds.push(cellId);
		}
	}

	var listSegmentIds = [];
	var streetTypeLevel = mapConfig.MapLevelStreetLevel[streetType];
	listCellIds.forEach((cellId) => {
		var cell = global.AllCells[cellId];

		if (cell) {
			cell.segments.forEach((segmentId) => {
				var segment = global.AllSegments[segmentId];
				var streetId = segment.street_id;
				var street = global.AllStreets[streetId];			
				var streetLevel = mapConfig.MapLevelStreetLevel[street.type];

				if (streetLevel <= streetTypeLevel) {
					listSegmentIds.push(segmentId);
				}
			});
		}
	});

	listSegmentIds.sort();
	return listSegmentIds;
}


/**
 * Get /density/streetslightpbf?cell_id=?&street_type=?  -  get density of light streets in cell_id which filtered by street_type
 * @param  {[Object]}                     [description]
 * @param  {[Object]}                     [description]
 * @param  {[Object]}                     [description]
 * @return {[protobuffer]}                [Data will be encode and send back to client by using protocol buffer]
 */
router.get('/streetslightpbf/', function(req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  	// Parameters
	var latStart = +req.query.lat_start;
	var latEnd = +req.query.lat_end;
	var lonStart = +req.query.lon_start;
	var lonEnd = +req.query.lon_end;
	var streetType = req.query.street_type;

	listSegmentIds = getListSegmentsByStreetType(latStart, latEnd, lonStart, lonEnd, streetType);

	var streetsRes = densityStreetsLightProto.create({ 
  														streets: [] 
													});

  	var lastSegment = null;
  	var streetLight = null;
  	var nodeStart;
  	var nodeEnd;
	listSegmentIds.forEach((segmentId) => {
  		var segment = global.AllSegments[segmentId];
		if (!lastSegment || +segmentId != +lastSegment.segment_id + 1) {
			if (streetLight) {
				streetsRes.streets.push(streetLight);
				streetLight = null;
			}

			streetLight = streetLightProto.create({
									  				points: []
									  			});
			nodeStart = global.AllNodes[segment.node_start];
			nodeEnd =  global.AllNodes[segment.node_end];
			streetLight.points.push(pointLightProto.create({
					  					lat : nodeStart.lat,					// lat start
										lon : nodeStart.lon,					// lon start
										dens : segment.density,					// density
										velo : segment.velocity,				// velocity
						  			}));
			streetLight.points.push(pointLightProto.create({
						  				lat : nodeEnd.lat,						// lat start
										lon : nodeEnd.lon,						// lon start
										dens : segment.density,					// density
										velo : segment.velocity,				// velocity
						  			}));
		} else {
			nodeEnd =  global.AllNodes[segment.node_end];
  			streetLight.points.push(pointLightProto.create({
						  				lat : nodeEnd.lat,						// lat start
										lon : nodeEnd.lon,						// lon start
										dens : segment.density,					// density
										velo : segment.velocity,				// velocity
						  			}));
		}
		lastSegment = segment;	
  	});

	if (streetLight) {
		streetsRes.streets.push(streetLight);
	}

  	// Send buffer to client
  	var buffer = densityStreetsLightProto.encode(streetsRes).finish();
	res.send(buffer);
});



/**
 * Get /streetspbf/  -  get information of a group of segments of a group of streets
 * @param  {[Object]}                     [description]
 * @param  {[Object]}                     [description]
 * @param  {[Object]}                     [description]
 * @return {[protobuffer]}                [Data will be encode and send back to client by using protocol buffer]
 */
router.get('/streetspbf/', function(req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  	// Parameters
	var streetIds = req.query.streetIds;

  	var streetsRes = densityStreetsProto.create({
  													streets: []
  												});  	
  	var count1 = 0;
  	for (var idx = 0; idx < streetIds.length; idx++){
  		var streetId = streetIds[idx];
  		var street = global.AllStreets[streetId];
  		if (street){  
  			var streetRes = streetProto.create({
  													streetId: streetId,
  													segments: []
  												});  						
  			var count2 = 0;
			street.segments.forEach(function(segment_id){
				var segment = global.AllSegments[segment_id];
				var nodeStart = global.AllNodes[segment.node_start];
				var nodeEnd = global.AllNodes[segment.node_end];		
				
				var nodeStartRes = latlonProto.create({
														lon: nodeStart.lon,
														lat: nodeStart.lat
													});
				var nodeEndRes = latlonProto.create({
														lon: nodeEnd.lon,
														lat: nodeEnd.lat
													});				
				var segmentRes = segmentProto.create({
														segmentId: segment_id,
														nodeStart: nodeStartRes,
														nodeEnd: nodeEndRes,
														density: segment.density,
														velocity: segment.velocity,
														weather: 'NaN'
													});
				streetRes.segments[count2] = segmentRes;
				count2++;
			});
			streetsRes.streets[count1] = streetRes;
			count1++;  			
		}
	}

  	// Send buffer to client
  	var buffer = densityStreetsProto.encode(streetsRes).finish();
	res.send(buffer);
});


/**
 * Get /streets/  -  get information of a group of segments of a group of streets
 * @param  {[Object]}                     [description]
 * @param  {[Object]}                     [description]
 * @param  {[Object]}                     [description]
 */
router.get('/streets/', function(req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  	
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


/**
 * Get /cell/cell_id  -  get information of a group of segments in a cell based on cell_id
 * @param  {[Object]}                     [description]
 * @param  {[Object]}                     [description]
 * @param  {[Object]}                     [description]
 */
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
		return next('Err');
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
			segment.density = info.Density;
			segment.velocity = info.Velocity;
		}else{
			segment.density = info.Density;
			segment.velocity = info.Velocity;
		}
	}
}

/**
 * POST /density/segments  -  Handle POST request from client - update density of a list of segments
 * @param  {[Object]}                     [description]
 * @param  {[Object]}                     [description]
 * @param  {[Object]}                     [description]
 */
router.post('/segments/', function(req, res, next){
	// Parse json data
	segmentsRec = req.body.segment;
	segmentsRec.forEach(function(segment){
		updateSegment(global.AllSegments, segment);
	});

	res.json('Success!');
});

module.exports = router;