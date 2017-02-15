// Load config
var config = require('../configuration.js');

// Load mongoose service
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Load models
var segmentModel = require('../models/SegmentModel');
var streetModel = require('../models/StreetModel');

/**
 * [GetDensityBySegmentIds - Get density based on a list of segmentId]
 * @param  {[Array]} 	segmentIds  [A list of segmentId]
 * @return {[Buffer]} 	      		[Return proto buffer]
 */
var GetDensityBySegmentIds = function(segmentIds, resolve, reject) {
	var promise = segmentModel.aggregate([  { "$match": { "segment_id": { $in: segmentIds } } },
											{ "$lookup": {
														    "localField": "node_start",
														    "from": "nodes",
														    "foreignField": "node_id",
														    "as": "node_start"
														}
											},
											{ "$lookup": {
														    "localField": "node_end",
														    "from": "nodes",
														    "foreignField": "node_id",
														    "as": "node_end"
														}
											},
											{ "$project": {
															"segment_id": 1,
														    "node_start.lat": 1,
														    "node_start.lon": 1,
														    "node_end.lat": 1,
														    "node_end.lon": 1,
														    "density": 1,
														    "velocity": 1
														  } 
											}])
							  .exec();
	// Result
	promise.then((data) => {
		return resolve(data);
	});
	// Error
	promise.catch((err) => {
		console.error("Error: Can not load density by segmentIds ! " + err);
		return reject(err);
	});
}

var GetDensityByStreetIds = function(streetIds, resolve, reject) {
	var promise = streetModel.aggregate([	{ "$match": { "street_id": { $in: streetIds } } },
											{ "$unwind": "$segments" },
											{ "$lookup": {
														    "localField": "segments",
														    "from": "segments",
														    "foreignField": "segment_id",
														    "as": "segmentObjects"
														}
											},
											{ "$unwind": {
															"path": "$segmentObjects",
															"preserveNullAndEmptyArrays": true 
														}
											},
											{ "$lookup": {
															"from": "nodes",
														    "localField": "segmentObjects.node_start",
														    "foreignField": "node_id",
														    "as": "segmentObjects.node_start"
														}
											},
											{ "$lookup": {
														    "from": "nodes",
														    "localField": "segmentObjects.node_end",
														    "foreignField": "node_id",
														    "as": "segmentObjects.node_end"
														}
											},
											{ "$project": {
															"segmentObjects.segment_id": 1,
														    "segmentObjects.node_start.lat": 1,
														    "segmentObjects.node_start.lon": 1,
														    "segmentObjects.node_end.lat": 1,
														    "segmentObjects.node_end.lon": 1,
														    "segmentObjects.density": 1,
														    "segmentObjects.velocity": 1
														  } 
											}
											,											
											{ "$unwind": "$segmentObjects" },
											{ "$group": {
														    "_id": "$_id",
														    "segments": { "$push": "$segmentObjects" },
														}
											}
											])
							 .exec();

	// Result
	promise.then((data) => {
		return resolve(data);
	});
	// Error
	promise.catch((err) => {
		console.error("Error: Can not load density by streetIds ! " + err);
		return reject(err);		
	});
}

module.exports.GetDensityBySegmentIds = GetDensityBySegmentIds;
module.exports.GetDensityByStreetIds = GetDensityByStreetIds;
