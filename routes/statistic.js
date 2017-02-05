// IMPORT LIBRARY
var express = require('express');
var router = express.Router();

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



module.exports = router;