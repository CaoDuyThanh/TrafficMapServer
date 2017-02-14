// Load config
var config = require('../configuration.js');

// Load mongoose service
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Load models
var segmentModel = require('../models/SegmentModel.js');

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
		if (err) {
			console.error("Error: Can not load density by segmentIds ! " + err);
			reject(err);
		}
	});
}

module.exports.GetDensityBySegmentIds = GetDensityBySegmentIds;
