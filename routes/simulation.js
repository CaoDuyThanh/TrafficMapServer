// IMPORT LIBRARY
var express = require('express');
var router = express.Router();

// IMPORT VIEW MODEL
var trafficPoleModel = require('../models/TrafficPoleModel');

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
 * GET /numtrafficpoles/ - get total number of traffic poles in database
 * @param  {[type]} req                                               [description]
 * @param  {[type]} res                                               [description]
 * @param  {[type]} next(selector)									  [description]
 * @return {[json]}                                                   [Total number of traffic poles in database]
 */
router.get('/numtrafficpoles/', function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  	trafficPoleModel.count({}, function(err, data){
  		if (err){ 
			console.error("Error: Can not count traffic pole");
			return next(err);
		}
		var totalNumber = data;
		res.json(totalNumber);
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

  	var trafficPoles = [];
  	var trafficPoleIds = req.query.trafficpole_ids;
  	trafficPoleModel.find({pole_id: {$in: trafficPoleIds}}, function(err, data){
		if (err){ 
			console.error("Error: Can not load traffic pole by pole_id = " + trafficpole_id + " ! " + err);
			return next(err);
		}

		var count = 0;
		data.forEach(function(trafficPole){
			count++;
			trafficPoles.push(trafficPole);

			if (count == data.length){
				res.json(trafficPoles);
			}
		});
	});
});

/**
 * GET /trafficpolesbypage?page=?&num_items_per_page=? - get a group of traffic poles data by page and numItems
 * @param  {[type]} req                  [description]
 * @param  {[type]} res                  [description]
 * @param  {[type]} next 				 [description]
 */
router.get('/trafficpolesbypage/', function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  	// Get inputs
  	var page = parseInt(req.query.page);
  	var numItemsPerPage = parseInt(req.query.num_items_per_page);

  	// Execute
  	var trafficPoles = [];
  	trafficPoleModel.paginate({}, {page: page, limit: numItemsPerPage}, function(err, result){
		if (err){ 
			console.error("Error: Can not load traffic pole at page = " + page + " and numItems = " + numItemsPerPage + err);
			return next(err);
		}  

		var data = result.docs;
		var count = 0;
		data.forEach(function(trafficPole){
			count++;
			trafficPoles.push(trafficPole);

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

  	var trafficPoles = [];
  	trafficPoleModel.find({}, function(err, data){
		if (err){ 
			console.error("Error: Can not load traffic pole by pole_id = " + trafficpole_id + " ! " + err);
			return next(err);
		}

		var count = 0;
		data.forEach(function(trafficPole){
			count++;
			trafficPoles.push(trafficPole);
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
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	var newTrafficPole = JSON.parse(req.body.data);
	
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
			//console.log("Traffic pole exist !");
			//console.log("Data = " + JSON.stringify(newTrafficPole));
			//next(new Error('Traffic pole exist !'));
			console.log("Update traffic pole!");
			console.log("Data = " + JSON.stringify(newTrafficPole));
			//next(new Error('Update traffic pole !'));
			trafficPoleModel.findOneAndUpdate({pole_id: newTrafficPole.pole_id}, newTrafficPole, function(err, post){
				if (err){
					console.error("Error: occur while updating traffic pole ! ");
					console.error("Pole_id = " + newTrafficPole.pole_id);
					console.error(err);
					return next(err);
				}

				res.json('update success!');
			});
		}
	});
});

/**
 * PUT /trafficpole/  -  update an exist traffic pole
 * @param  {[type]} req               [description]
 * @param  {[type]} res               [description]
 * @param  {[type]} next){	var       updateTrafficPole [description]
 * @param  {[type]} updateTrafficPole [description]
 * @param  {String} function(err,     post){		if       (err){			console.error("Error: occur while updating traffic pole ! ");			console.error("Pole_id [description]
 * @return {[type]}                   [description]
 */
router.put('/trafficpole/', function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	var updateTrafficPole = JSON.parse(req.body.data);

	trafficPoleModel.findOneAndUpdate({pole_id: updateTrafficPole.pole_id}, updateTrafficPole, function(err, post){
		if (err){
			console.error("Error: occur while updating traffic pole ! ");
			console.error("Pole_id = " + trafficPoleId);
			console.error(err);
			return next(err);
		}

		res.json('success!');
	});
});


/**
 * DELETE /trafficpole/:trafficpole_id  -  delete an exist traffic pole by trafficpole_id
 * @param  {[type]}            [description]
 * @param  {[type]}            [description]
 * @param  {[type]}            [description]
 * @param  {String}            [description]
 * @return {json}              [result of deleting]
 */
router.delete('/trafficpole/:trafficpole_id', function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	var trafficPoleId = req.params.trafficpole_id;

	trafficPoleModel.findOneAndRemove({pole_id: trafficPoleId}, function(err, post){	
		if (err){
			console.error("Error: occur while deleting traffic pole ! ");
			console.error("Pole_id = " + trafficPoleId);
			console.error(err);

			var responseData = {
				status: 'failure',
				message: 'Can not delete traffic pole pole_id = ' + trafficPoleId
			};
			res.json(responseData);

			return next(err);
		}

		var responseData = {
			status: 'success'
		};
		res.json(responseData);
	});
});
// TRAFFIC POLE (END) ---------------------------------------


// CAMERA ---------------------------------------------------



// CAMERA (END) ---------------------------------------------


module.exports = router;
