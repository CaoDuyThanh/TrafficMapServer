// IMPORT LIBRARY
var express = require('express');
var router = express.Router();

// IMPORT VIEW MODEL
var trafficPoleModel = require('../models/TrafficPoleModel');

// TRAFFIC POLE ---------------------------------------------
/**
 * GET /trafficpole/:trafficpole_id - get a traffic pole data by specific trafficpole_id
 * @param  {[type]} req                  [description]
 * @param  {[type]} res                  [description]
 * @param  {[type]} next 				 [description]
 */
router.get('/trafficpole/:trafficpole_id', function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  	// Get parameter
  	var trafficpole_id = req.params.trafficpole_id;

  	var trafficPole = {};
  	trafficPoleModel.findOne({pole_id: trafficpole_id}, function(err, data){
		if (err){ 
			console.error("Error: Can not load traffic pole by pole_id = " + trafficpole_id + " ! " + err);
			return next(err);
		}

		trafficPole = data;

		res.json(trafficPole);
	});
});

/**
 * GET /trafficpoles/ - get a group of traffic poles data by a group of trafficpoles_id
 * @param  {[type]} req                  [description]
 * @param  {[type]} res                  [description]
 * @param  {[type]} next 				 [description]
 */
router.get('/trafficpoles/', function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  	var trafficPoles = {};
  	var trafficPoleIds = req.query.trafficpole_ids;
  	trafficPoleModel.find({pole_id: {$in: trafficPoleIds}}, function(err, data){
		if (err){ 
			console.error("Error: Can not load traffic pole by pole_id = " + trafficpole_id + " ! " + err);
			return next(err);
		}

		var count = 0;
		data.forEach(function(trafficPole){
			count++;
			trafficPoles[trafficPole.pole_id] = trafficPole;

			if (count == data.length){
				res.json(trafficPoles);
			}
		});
	});
});

/**
 * GET /alltrafficpoles/ - get all traffic poles data
 * @param  {[type]} req                  [description]
 * @param  {[type]} res                  [description]
 * @param  {[type]} next 				 [description]
 */
router.get('/alltrafficpoles/', function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  	var trafficPoles = {};
  	trafficPoleModel.find({}, function(err, data){
		if (err){ 
			console.error("Error: Can not load traffic pole by pole_id = " + trafficpole_id + " ! " + err);
			return next(err);
		}

		var count = 0;
		data.forEach(function(trafficPole){
			count++;
			trafficPoles[trafficPole.pole_id] = trafficPole;
			console.log(count);
			if (count == data.length){
				res.json(trafficPoles);
			}
		});
	});
});


/**
 * POST /trafficpole/ - post a new traffic pole data
 * @param  {[type]} req                  [description]
 * @param  {[type]} res                  [description]
 * @param  {[type]} next 				 [description]
 * @result - json string 'success'
 *         - error if traffic pole exist
 */
router.post('/trafficpole/', function(req, res, next){
	var newTrafficPole = req.body;

	trafficPoleModel.findOne({pole_id: newTrafficPole.pole_id}, function(err, data){
		if (err){
			console.error("Error: occur while checking traffic pole exist ! ");
			console.error("Data = " + JSON.stringify(newTrafficPole));
			console.error(err);
			return next(err);	
		}

		if (!data){
			trafficPoleModel.insertMany([newTrafficPole], function(err){
				if (err){
					console.error("Error: Can not insert traffic pole ! ");
					console.error("Data = " + JSON.stringify(newTrafficPole));
					console.error(err);
					return next(err);	
				}

				res.json('success!')
			});
		}else{
			console.log("Traffic pole exist !");
			console.log("Data = " + JSON.stringify(newTrafficPole));
			next(new Error('Traffic pole exist !'));
		}
	});
});
// TRAFFIC POLE (END) ---------------------------------------


// CAMERA ---------------------------------------------------



// CAMERA (END) ---------------------------------------------


module.exports = router;