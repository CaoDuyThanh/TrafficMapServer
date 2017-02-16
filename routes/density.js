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
var dbConfig = config.DbConfig;

// IMPORT VIEW MODEL
var segmentViewModel = require('../models/SegmentViewModel');

// IMPORT UTILS
var mapUtils = require('../utils/MapUtils');

// IMPORT SERVICE
var cellService = require('../service/cell-service');
var streetService = require('../service/street-service');
var nodeService = require('../service/node-service');
var segmentService = require('../service/segment-service');
var densityService = require('../service/density-service');
var simulationService = require('../service/simulation-service');

// GET DENSITY OF STREET | GROUP OF STREETS BASED ON STREET_ID ------------------------------
// Create protobuffer
protobuf.convertFieldsToCamelCase = false;
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
function latlonToCellId(lat, lon) {
	lon = Math.floor(lon * 100) + 9000;
	lat = Math.floor(lat * 100) + 18000;
	return lon << 16 | lat;
}
function getListSegmentsByStreetType(latStart, latEnd, lonStart, lonEnd, streetType, resolve) {
	var listCellIds = [];
	for (var lat = latStart; lat <= latEnd; lat += 0.01) {
		for (var lon = lonStart; lon <= lonEnd; lon += 0.01) {
			var cellId = latlonToCellId(lat, lon);
			listCellIds.push(cellId);
		}
	}

	var streetTypeLevel = mapConfig.MapLevelStreetLevel[streetType];
	var listCellsCall = new Promise((resolve, reject) => cellService.GetCells(listCellIds, resolve, reject));
	listCellsCall.then((listCells) => {
		var listSegmentIds = [];
		listCells.forEach((cell) => {
			for (var streetType in cell.street_type) {
	  			if (cell.street_type.hasOwnProperty(streetType)) {
		    		var streetLevel = mapConfig.MapLevelStreetLevel[streetType];
		    		if (streetLevel <= streetTypeLevel) {
						listSegmentIds = listSegmentIds.concat(cell.street_type[streetType]);
					}
		  		}
			}
		});
		return resolve(listSegmentIds);
	});

	listCellsCall.catch(function(err) {
		if (err) {
			console.log('Error while get list of cells based on listCellIds');
			reject(err);
		}
	});
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

	var promise = new Promise((resolve, reject) => getListSegmentsByStreetType(latStart, latEnd, lonStart, lonEnd, streetType, resolve, reject));
	promise.then((listSegmentIds) => {
		segmentsPromise = new Promise((resolve, reject) => densityService.GetDensityBySegmentIds(listSegmentIds, resolve, reject));
		segmentsPromise.then((segments) => {
			var streetsRes = densityStreetsLightProto.create({ streets: [] });
			var lastSegment = null;
		  	var streetLight = null;
		  	var nodeStart;
		  	var nodeEnd;
			segments.forEach((segment) => {
				var segmentId = segment.segment_id;
				if (!lastSegment || +segmentId != +lastSegment.segment_id + 1) {
					if (streetLight) {
						streetsRes.streets.push(streetLight);
						streetLight = null;
					}
					streetLight = streetLightProto.create({
											  				points: []
											  			});
					streetLight.points.push(pointLightProto.create({
													  					lat : segment.node_start[0].lat,			// lat start
																		lon : segment.node_start[0].lon,			// lon start
																		dens : (segment.density.length === 0) ? 
																						0 : segment.density[0],		// density
																		velo : (segment.velocity.length === 0) ? 
																						0 : segment.velocity[0]		// velocity
														  			}));
					streetLight.points.push(pointLightProto.create({
														  				lat : segment.node_end[0].lat,				// lat end
																		lon : segment.node_end[0].lon,				// lon end
																		dens : (segment.density.length === 0) ? 
																						0 : segment.density[0],		// density
																		velo : (segment.velocity.length === 0) ? 
																						0 : segment.velocity[0]		// velocity
														  			}));
				} else {
		  			streetLight.points.push(pointLightProto.create({
														  				lat : segment.node_end[0].lat,				// lat end
																		lon : segment.node_end[0].lon,				// lon end
																		dens : (segment.density.length === 0) ? 
																						0 : segment.density[0],		// density
																		velo : (segment.velocity.length === 0) ? 
																						0 : segment.velocity[0]		// velocity
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
		segmentsPromise.catch((err) => {
			var streetsRes = densityStreetsLightProto.create({ streets: [] });
			var buffer = densityStreetsLightProto.encode(streetsRes).finish();
			res.send(buffer);

			console.log('Segment promise error: ', err);
			next(err);
		});	
	});
	promise.catch((err) => {
		var streetsRes = densityStreetsLightProto.create({ streets: [] });
		var buffer = densityStreetsLightProto.encode(streetsRes).finish();
		res.send(buffer);

		console.log('Promise error: ', err);
		next(err);
	});
});

/**
 * Get /streets/  -  get information of a group of segments of a group of streets
 * @param  {[Array[number]]}                   [Array of number represent street_id]
 * @param  {[JSON]}                     	   [A json file where each street was a group of segments]
 */
router.get('/streets/', function(req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  	
  	// Get parameters
  	var streetIds = req.query.streetIds;
  	streetIds = streetIds.map((streetId) => {return +streetId});

	// Execute
	// Get all streets by list of streetIds
	var promise = new Promise((resolve, reject) => densityService.GetDensityByStreetIds(streetIds, resolve, reject));
	promise.then((streets) => {
		res.json(streets);
	});
	promise.catch((err) => {
		console.log('Promise error: ', err);
		next(err);
	});
});

// GET DENSITY OF STREET | GROUP OF STREETS BASED ON STREET_ID (END) ------------------------


// POST DENSITY OF A GROUP OF SEGMENT (FOUND BY SEGMENTID) ----------------------------------
function updateSegmentDensity(unknownSegment, resolve, reject){
	// Get all information from segment
	var uSeg_GPS_Start = unknownSegment.GPS_Start;
	var uSeg_GPS_End = unknownSegment.GPS_End;
	var uSeg_Info = unknownSegment.Info;
	var uSeg_Time = unknownSegment.Time;
	var uSeg_Weather = unknownSegment.Weather;

	var uSeg_GPS_Mid = {};
	uSeg_GPS_Mid.Lon = (uSeg_GPS_Start.Lon + uSeg_GPS_End.Lon) / 2;
	uSeg_GPS_Mid.Lat = (uSeg_GPS_Start.Lat + uSeg_GPS_End.Lat) / 2;

	var promiseSeg = new Promise((resolve, reject) => mapUtils.FindSegmentByGPS(uSeg_GPS_Mid, resolve, reject));
	promiseSeg.then((segment) => {
		if (segment === null) {
			return resolve();
		}

		var isSameDirection = mapUtils.CheckSameDirection(segment, uSeg_GPS_Start, uSeg_GPS_End);
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

		var currentTimestamp = Date.now();
		var lowTimestampe = currentTimestamp - dbConfig.TimerSegmentDensityUpdate * 60 * 1000;
		var promiseGet = new Promise((resolve, reject) => densityService.GetSegmentDensity(segment.segment_id, lowTimestampe, resolve, reject));
		promiseGet.then((data) => {
			var segmentDensity;
			if (data.length === 0) {
				// New camera density
				segmentDensity = {};
				segmentDensity.segment_id = segment.segment_id;
				segmentDensity.history = [];
				segmentDensity.history.push({
					timestamp: currentTimestamp,
					density: segment.density,
					velocity: segment.velocity
				});
			} else {
				segmentDensity = data[0];
				segmentDensity.history.push({
					timestamp: currentTimestamp,
					density: segment.density,
					velocity: segment.velocity
				});
			}
			var history = segmentDensity.history;
			var averDensity = 0;
			var averVelocity = 0;
			history.forEach((his) => {
				averDensity += his.density;
				averVelocity += his.velocity;
			});
			averDensity /= history.length;
			averVelocity /= history.length;
			segmentDensity.density = averDensity;
			segmentDensity.velocity = averVelocity;

			var promiseUpdate = new Promise((resolve, reject) => densityService.UpdateSegmentDensity(segmentDensity, resolve, reject));
			promiseUpdate.then((data) => {
				return resolve();
			});
			promiseUpdate.catch((err) => {
				return reject(err);
			});
		});
		promiseGet.catch((err) => {
			return reject(err);
		});
	});
	promiseSeg.catch((err) => {
		console.error('Error while get segment by GPS ! ', err);
		return reject(err);
	});	
}
/**
 * POST /density/segments  -  Handle POST request from client - update density of a list of segments
 * @param  {[Object]}                     [description]
 * @param  {[Object]}                     [description]
 * @param  {[Object]}                     [description]
 */
router.post('/segments/', function(req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

	// Get parameters
	segments = req.body.segments;

	var promiseAll = Promise.all(segments.map((segment) => {
    	return new Promise((resolve, reject) => updateSegmentDensity(segment, resolve, reject));
    }));
    promiseAll.then((data) => {
		var responseData = {
			status: 'success',
			message: 'Update density information successfully !'
		};
		res.json(responseData);    	
    });
    promiseAll.catch((err) => {
    	console.error('Error: occur while updating density at some locations ! ', err);

		var responseData = {
			status: 'failure',
			message: 'Can not update density information ! Database error !'
		};
		res.json(responseData);

		return next(err);
    });
});
// POST DENSITY OF A GROUP OF SEGMENT (FOUND BY SEGMENTID) (END) ----------------------------


// POST DENSITY OF A GROUP OF CAMERA (FOUND BY POLE_ID AND STREAM_ID) ----------------------------------
function updateCameraDensity(camera, resolve, reject) {
	var currentTimestamp = Date.now();
	var lowTimestampe = currentTimestamp - dbConfig.TimerCameraDensityUpdate * 60 * 1000;
	var promiseGet = new Promise((resolve, reject) => simulationService.GetCameraDensity(camera.pole_id, camera.stream_id, lowTimestampe, resolve, reject));
	promiseGet.then((data) => {
		var cameraDensity;
		if (data.length === 0) {
			// New camera density
			cameraDensity = {};
			cameraDensity.pole_id = camera.pole_id;
			cameraDensity.stream_id = camera.stream_id;
			cameraDensity.history = [];
			cameraDensity.history.push({
				timestamp: currentTimestamp,
				density: camera.density
			});
		} else {
			cameraDensity = data[0];
			cameraDensity.history.push({
				timestamp: currentTimestamp,
				density: camera.density
			});
		}
		var history = cameraDensity.history;
		var averDensity = 0;
		history.forEach((his) => {
			averDensity += his.density;
		});
		averDensity /= history.length;
		cameraDensity.density = averDensity;

		var promiseUpdate = new Promise((resolve, reject) => simulationService.UpdateCameraDensity(cameraDensity, resolve, reject));
		promiseUpdate.then((data) => {
			return resolve();
		});
		promiseUpdate.catch((err) => {
			return reject(err);
		});
	});
	promiseGet.catch((err) => {
		return reject(err);
	});
}
router.post('/cameras/', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  	// Get parameters
  	var cameras = req.body.cameras;

    var promiseAll = Promise.all(cameras.map((camera) => {
    	return new Promise((resolve, reject) => updateCameraDensity(camera, resolve, reject));
    }));
    promiseAll.then((data) => {
		var responseData = {
			status: 'success',
			message: 'Update density information successfully !'
		};
		res.json(responseData);    	
    });
    promiseAll.catch((err) => {
    	console.error('Error: occur while updating camera density ! ');

		var responseData = {
			status: 'failure',
			message: 'Can not update density information ! Database error !'
		};
		res.json(responseData);

		return next(err);
    });
})
// POST DENSITY OF A GROUP OF CAMERA (FOUND BY POLE_ID AND STREAM_ID) (END) ----------------------------



module.exports = router;