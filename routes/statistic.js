// IMPORT LIBRARY
var express = require('express');
var router = express.Router();

// IMPORT MAP CONFIG
var config = require('../configuration');
var dbConfig = config.DbConfig;

// IMPORT SERVICE
var simulationService = require('../service/simulation-service');
var streetService = require('../service/street-service');


router.use(function(req, res, next) {
	if (req.method === 'OPTIONS'){
	  	res.header("Access-Control-Allow-Origin", "*");
		res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		res.status(200);
		res.end();
	}
	else{
		next();
	}
});


/**
 * GET /statistic/density/segment/:segment_id - get density of a segment
 * @param  {[type]} req                  [description]
 * @param  {[type]} res                  [description]
 * @param  {[type]} next 				 [description]
 */
router.get('/density/segment/:segment_id', function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  	// Get inputs
  	var segmentId = req.params.segment_id;

  	// Execute  	
  	var responseData = {
		status: 'success',
		data: {
			num_vehicles: 10
		}
	};
	res.json(responseData);
});

// GET NUMBER OF VEHICLES -------------------------------------------------
/**
 * GET /statistic/vehicles/street?street_name=? - get total vehicles in a street
 * @param  {[type]} req                  [description]
 * @param  {[type]} res                  [description]
 * @param  {[type]} next 				 [description]
 */
router.get('/vehicles/street', function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  	// Get inputs
  	var streetName = req.query.street_name;

  	// Execute
  	var date = new Date();
    var UTCTime = Date.UTC(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(), 
        date.getSeconds()
    );
  	var responseData = {
		status: 'success',
		data: {
			num_vehicles: Math.floor(Math.random() * 50),
			utc_time: UTCTime
		}
	};
	res.json(responseData);
});

/**
 * GET /statistic/vehicles/camera - get total vehicles in a camera
 * @param  {[type]} req                  [description]
 * @param  {[type]} res                  [description]
 * @param  {[type]} next 				 [description]
 */
router.get('/vehicles/camera', function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

	// Get parameters
	var poleId = +req.query.pole_id;
	var streamId = req.query.stream_id;

  	// Execute
  	var date = new Date();
    var UTCTime = Date.UTC(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(), 
        date.getSeconds()
    );
  	var responseData = {
		status: 'success',
		data: {
			num_vehicles: Math.floor(Math.random() * 50),
			utc_time: UTCTime
		}
	};
	res.json(responseData);
});
// GET NUMBER OF VEHICLES (END) -------------------------------------------

// GET DENSITY ------------------------------------------------------------
/**
 * GET /density/street?street_name - get density of a street
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @param  {[type]} next) {	res.header("Access-Control-Allow-Origin", "*");  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  	  	var streetName [description]
 * @return {[type]}       [description]
 */
router.get('/density/street', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  	// Get inputs
  	var streetName = req.query.street_name;
  	var streetId = global.AllStreetsName[streetName].street_id;

  	// Execute
  	var currentTimestamp = Date.now();
  	var promise = new Promise((resolve, reject) => streetService.GetStreetDensity(streetId, resolve, reject));
  	promise.then((data) => {
		var date = new Date();
	    var UTCTime = Date.UTC(
	        date.getFullYear(),
	        date.getMonth() + 1,
	        date.getDate(),
	        date.getHours(),
	        date.getMinutes(), 
	        date.getSeconds()
	    );
  		var density_min = 10000;
  		var density_max = 0;
  		var density_ave = 0;
  		var velocity_min = 10000;
  		var velocity_max = 0;
  		var velocity_ave = 0;
  		var counter = 0;

  		if (data.length > 0) {
  			var street = data[0];
  			street.segments.forEach((segment) => {
  				var density = segment.density.length > 0 ? segment.density[0] : 0;
  				var velocity = segment.velocity.length > 0 ? segment.velocity[0] : 0;

  				density_min = density < density_min ? density : density_min;
  				density_max = density > density_max ? density : density_max;
  				density_ave += density;

  				velocity_min = velocity < velocity_min ? velocity : velocity_min;
  				velocity_max = velocity > velocity_max ? velocity : velocity_max;
  				velocity_ave += velocity;
  			});
  		}
  		density_ave = density_ave === 0 ? 0 : density_ave / counter;
  		velocity_ave = velocity_ave === 0 ? 0 : velocity_ave / counter;

  	  	var responseData = {
			status: 'success',
			data: {
				density_min: density_min,
				density_max: density_max,
				density_ave: Math.floor(Math.random() * 50), //density_ave,
				velocity_min: velocity_min,
				velocity_max: velocity_max,
				velocity_ave: velocity_ave,
				utc_time: UTCTime
			}
		};
		res.json(responseData);
  	});
  	promise.catch((err) => {
  		var responseData = {
			status: 'failure',
			message: 'Can not get street density !'
		};
		res.json(responseData);	
		next(err);
  	});
});

/**
 * GET /density/camera?pole_id=?&stream_id=? - get density of a camera
 * @param  {[type]}   req   [description]
 * @param  {[type]}   res   [description]
 * @param  {Function} next) {	res.header("Access-Control-Allow-Origin", "*");  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");	  	  	var poleId [description]
 * @return {[type]}         [description]
 */
router.get('/density/camera', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");	

  	// Get inputs
  	var poleId = +req.query.pole_id;
	var streamId = req.query.stream_id;

	// Execute
  	var currentTimestamp = Date.now();
  	var promise = new Promise((resolve, reject) => simulationService.GetCameraDensity(poleId, streamId, currentTimestamp, resolve, reject));
  	promise.then((data) => {
  		var date = new Date();
	    var UTCTime = Date.UTC(
	        date.getFullYear(),
	        date.getMonth() + 1,
	        date.getDate(),
	        date.getHours(),
	        date.getMinutes(), 
	        date.getSeconds()
	    );

	    var cameraDensity;
		if (data.length === 0) {
			// New camera density
			cameraDensity = {};
			cameraDensity.density = 0;
		} else {
			cameraDensity = data[0];
		}

	  	var responseData = {
			status: 'success',
			data: {
				density: Math.floor(Math.random() * 50), // cameraDensity.density,
				utc_time: UTCTime
			}
		};
		res.json(responseData);
  	});
  	promise.catch((err) => {
  		var responseData = {
			status: 'failure',
			message: 'Can not get density of camera !'
		};
		res.json(responseData);	
		next(err);
  	})
});

router
// GET DENSITY (END) ------------------------------------------------------


module.exports = router;