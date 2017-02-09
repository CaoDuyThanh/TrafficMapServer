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
 * GET /quicksearch/street?street_name=?&num_items=? - get num_items items which street's name start by street_name
 * @param  {[type]} req                  [description]
 * @param  {[type]} res                  [description]
 * @param  {[type]} next 				 [description]
 */
router.get('/street', function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  	// Get inputs
  	var streetName = req.query.street_name;
  	var numItems = parseInt(req.query.num_items);

  	// Execute
  	var searchResult = global.AllStreetsDict.search(streetName);
	var firstNElement = searchResult.slice(0, numItems);  

  	var responseData = {
		status: 'success',
		data: {
			suggest: firstNElement
		}
	};
	res.json(responseData);
});

/**
 * GET /quicksearch/getlocation?street_name=? - get location that contain street_name
 * @param  {[type]} req       [description]
 * @param  {[type]} res       [description]
 * @param  {[type]} next      [description]
 * @return {[type]}           [description]
 */
router.get('/getlocation', function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  	// Get inputs
  	var streetName = req.query.street_name;

  	// Execute
  	var searchResult = global.AllStreetsDict.search(streetName);
	var firstNElement = searchResult.slice(0, 1);	// Get the first result
	var fullStreetName = firstNElement[0];
	var allSegmentIds = global.AllStreetsName[fullStreetName].segments;
	var randomSegmentId = allSegmentIds[Math.floor(Math.random() * allSegmentIds.length)];
	var segment = global.AllSegments[randomSegmentId];
	var lat = global.AllNodes[segment.node_start].lat;
	var lon = global.AllNodes[segment.node_start].lon;

  	var responseData = {
		status: 'success',
		data: {
			street_name: fullStreetName,
			lat: lat,
			lon: lon
		}
	};
	res.json(responseData);
});


module.exports = router;