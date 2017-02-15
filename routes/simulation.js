// IMPORT LIBRARY
var express = require('express');
var router = express.Router();

// LOAD CONFIG
var config = require('../configuration');
var dbConfig = config.DbConfig;

// IMPORT SERVICE
var simulationService = require('../service/simulation-service');

// LOAD MODELS
var trafficPoleModel = require('../models/TrafficPoleModel');

router.use(function(req, res, next) {
	if (req.method === 'OPTIONS'){
	  	res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
		res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
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
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  	// Get parameter
  	var trafficPoleId = req.params.trafficpole_id;

  	var promise = new Promise((resolve, reject) => simulationService.GetTrafficPole(trafficPoleId, resolve, reject));
  	promise.then((data) => {
		res.json(data);
  	});
  	promise.catch((err) => {
		console.error('Error: Can not load traffic pole by pole_id = ' + trafficpole_id + ' ! ' + err);

		var responseData = {
			status: 'failure',
			message: 'Error: Can not load traffic pole by pole_id = ' + trafficpole_id + ' ! '
		};
		res.json(responseData);		

		return next(err);
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
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

	var promise = new Promise((resolve, reject) => simulationService.GetNumTrafficPoles(resolve, reject));  	
	promise.then((data) => {
		var responseData = {
			status: 'success',
			data: {
				num_traffic_poles: data
			}
		};
		res.json(responseData);
	});
	promise.catch((err) => {
		console.error('Error: Can not count traffic pole');

		var responseData = {
			status: 'failure',
			message: 'Can not get number of traffic poles !'
		};
		res.json(responseData);

		return next(err);
	});
});

/**
 * GET /trafficpoles/ - get a group of traffic poles data by a group of trafficpoles_id
 * @param  {[type]} req                  [description]
 * @param  {[type]} res                  [description]
 * @param  {[type]} next 				 [description]
 */
router.get('/trafficpoles/', function(req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  	// Get parameters
	var trafficPoleIds = req.query.trafficpole_ids;

  	var promise = new Promise((resolve, reject) => simulationService.GetTrafficPoles(trafficPoleIds, resolve, reject));
  	promise.then((data) => {
  		var trafficPoles = [];
		data.forEach(function(trafficPole){
			trafficPoles.push(trafficPole);
		});
		res.json(trafficPoles);
  	});
  	promise.catch((err) => {
		console.error('Error: Can not load traffic pole by pole_id = ' + trafficpole_id + ' ! ' + err);

		var responseData = {
			status: 'failure',
			message: 'Can not get number of traffic poles !'
		};
		res.json(responseData);

		return next(err);
  	});
});

/**
 * GET /trafficpolesbypage?page=?&num_items_per_page=? - get a group of traffic poles data by page and numItems
 * @param  {[type]} req                  [description]
 * @param  {[type]} res                  [description]
 * @param  {[type]} next 				 [description]
 */
router.get('/trafficpolesbypage/', function(req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  	// Get parameters
  	var page = parseInt(req.query.page);
  	var numItemsPerPage = parseInt(req.query.num_items_per_page);

	var promise = new Promise((resolve, reject) => simulationService.GetTrafficPolesByPage(page, numItemsPerPage, resolve, reject));
  	promise.then((data) => {
  		var trafficPoles = [];
		data.forEach(function(trafficPole){
			trafficPoles.push(trafficPole);
		});
		res.json(trafficPoles);
  	});
  	promise.catch((err) => {
		console.error('Error: Can not load traffic pole at page = ' + page + ' and numItems = ' + numItemsPerPage + err);

		var responseData = {
			status: 'failure',
			message: 'Error: Can not load traffic pole at page = ' + page + ' and numItems = ' + numItemsPerPage + ' !'
		};
		res.json(responseData);

		return next(err);
  	});
});

/**
 * GET /alltrafficpoles/ - get all traffic poles data
 * @param  {[type]} req                  [description]
 * @param  {[type]} res                  [description]
 * @param  {[type]} next 				 [description]
 */
router.get('/alltrafficpoles/', function(req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

	var promise = new Promise((resolve, reject) => simulationService.GetAllTrafficPoles(resolve, reject));
  	promise.then((data) => {
  		var trafficPoles = [];
		data.forEach(function(trafficPole){
			trafficPoles.push(trafficPole);
		});
		res.json(trafficPoles);
  	});
  	promise.catch((err) => {
		console.error('Error: Can not load all traffic poles ! ' + err);

		var responseData = {
			status: 'failure',
			message: 'Error: Can not load all traffic poles ! '
		};
		res.json(responseData);

		return next(err);
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
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  	// Get parameters
	var newTrafficPole = JSON.parse(req.body.data);
	var trafficPoleId = newTrafficPole.pole_id;

	var promise = new Promise((resolve, reject) => simulationService.GetTrafficPole(trafficPoleId, resolve, reject));
	promise.then((data) => {
		if (data) {
			var responseData = {
				status: 'failure',
				message: 'There is already a traffic pole with the same pole_id !'
			};
			res.json(responseData);
		} else {
			var promiseInsert = new Promise((resolve, reject) => simulationService.PostNewTrafficPole(newTrafficPole, resolve, reject));
			promiseInsert.then((data) => {
				var responseData = {
					status: 'success',
					message: 'Create new traffic pole !'
				};
				res.json(responseData);
			});
			promiseInsert.catch((err) => {
				console.error('Error: Can not insert traffic pole ! ');
				console.error('Data = ' + JSON.stringify(newTrafficPole));
				console.error(err);

				var responseData = {
					status: 'failure',
					message: 'Can not insert new traffic pole ! Database error !'
				};
				res.json(responseData);

				return next(err);	
			});
		}
	});
	promise.catch((err) => {
		console.error('Error: occur while checking traffic pole exist ! ');
		console.error('Data = ' + JSON.stringify(newTrafficPole));
		console.error(err);

		var responseData = {
			status: 'failure',
			message: 'Can not insert new traffic pole ! Database error !'
		};
		res.json(responseData);

		return next(err);
	});
});

/**
 * PUT /trafficpole/  -  update an exist traffic pole
 * @param  {[type]} req               [description]
 * @param  {[type]} res               [description]
 * @param  {[type]} next){	var       updateTrafficPole [description]
 * @param  {[type]} updateTrafficPole [description]
 * @param  {String} function(err,     post){		if       (err){			console.error('Error: occur while updating traffic pole ! ');			console.error('Pole_id [description]
 * @return {[type]}                   [description]
 */
router.put('/trafficpole/', function(req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  	// Get parameters
	var updateTrafficPole = JSON.parse(req.body.data);

	var promise = new Promise((resolve, reject) => simulationService.UpdateTrafficPole(updateTrafficPole, resolve, reject));
	promise.then((data) => {
		var responseData = {
			status: 'success',
			message: 'Update traffic pole !'
		};
		res.json(responseData);
	});
	promise.catch((err) => {
		console.error('Error: occur while updating traffic pole ! ');
		console.error('Pole_id = ' + trafficPoleId);
		console.error(err);

		var responseData = {
			status: 'failure',
			message: 'Can not update traffic pole ! Database error !'
		};
		res.json(responseData);

		return next(err);
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
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  	// Get parameters
	var trafficPoleId = req.params.trafficpole_id;

	var promise = new Promise((resolve, reject) => simulationService.DeleteTrafficPole(trafficPoleId, resolve, reject));
	promise.then((data) => {
		var responseData = {
			status: 'success'
		};
		res.json(responseData);
	});
	promise.catch((err) => {
		console.error('Error: occur while deleting traffic pole ! ');
		console.error('Pole_id = ' + trafficPoleId);
		console.error(err);

		var responseData = {
			status: 'failure',
			message: 'Can not delete traffic pole pole_id = ' + trafficPoleId
		};
		res.json(responseData);

		return next(err);
	});
});
// TRAFFIC POLE (END) ---------------------------------------


// CAMERA ---------------------------------------------------
// CAMERA (END) ---------------------------------------------


module.exports = router;
