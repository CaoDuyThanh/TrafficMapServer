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
 * GET /streets?street_name=? - get all treet that meet street_name
 * @param  {[type]} req                  [description]
 * @param  {[type]} res                  [description]
 * @param  {[type]} next 				 [description]
 */
router.get('', function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  	// Get inputs
  	var streetName = req.query.street_name;

  	// Execute  	
	var searchResult = global.AllStreetsDict.search(streetName);

	// Create results
	var dataResult = searchResult.map((street) => {
		return {
			street_name: street,
			segments: global.AllStreetsName.segments
		}
	});

  	var responseData = {
		status: 'success',
		data: dataResult
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
  	
  	var responseData = {
		status: 'success',
		data: {
			num_vehicles: Math.floor(Math.random() * 50)
		}
	};
	res.json(responseData);
});


module.exports = router;