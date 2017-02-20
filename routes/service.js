// IMPORT LIBRARY
var express = require('express');
var router = express.Router();

// IMPORT UTILS
var mapUtils = require('../utils/MapUtils');

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

/**
 * Get /service/findpath?node_start_lon=?&node_start_lat=?&
 * 						 node_end_lon=?&node_end_lat=?  -  get path from start node to end node
 * @return {[JSON]}                [return a list of nodes]
 */
router.get('/findpath/', function(req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  	// Parameters
  	var nodeStart = {};
	nodeStart.lon = +req.query.node_start_lon;
	nodeStart.lat = +req.query.node_start_lat;
	var nodeEnd = {};
	nodeEnd.lon = +req.query.node_end_lon;
	nodeEnd.lat = +req.query.node_end_lat;

	var pathFinderObj = new mapUtils.PathFinder();
	var promise = new Promise((resolve, reject) => pathFinderObj.FindPath(nodeStart, nodeEnd, resolve, reject));
	promise.then((data) => {
		var responseData = {
			status: 'success',
			data: {
				path: data.reverse()
			}
		};
		res.json(responseData);
	});
	promise.catch((err) => {
		console.error('Can not find path from start to end ', err);

		var responseData = {
			status: 'failure',
			message: 'Can not find path from start to end !'
		};
		res.json(responseData);

		next(err);
	});
});

module.exports = router;