// Load config
var config = require('../configuration.js');

// Load mongoose service
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Load models
var segmentModel = require('../models/SegmentModel.js');

/**
 * Get Segment based on segmentId
 * @param {[type]}   segmentId [number]
 */
var GetSegment = function(segmentId, resolve, reject) {
	var promise = segmentModel.find({'segment_id': segmentId}).exec();

	// Result
	promise.then((data) => {
		return resolve(data);
	});

	// Error
	promise.catch((err) => {
		if (err) {
			console.error("Error: Can not load segment by segmentId ! " + err);
			reject(err);
		}
	});
}

/**
 * Get Segment based on segmentId
 * @param {[type]}   segmentId [number]
 * @return 					   [data return contain lat/lon of node_start and node_end]
 */
var GetSegmentWithLocation = function(segmentId, resolve, reject) {
	var promise = segmentModel.aggregate([  { "$match": { "segment_id": segmentId } },
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
			console.error("Error: Can not load segment by segmentId ! " + err);
			reject(err);
		}
	});
}

var GetSegments = function(segmentIds, excludeField, resolve, reject) {
	var promise = segmentModel.find({ 'segment_id': { $in: segmentIds } })
							  .select(excludeField)
							  .exec();

	// Result
	promise.then((data) => {
		return resolve(data);
	});

	// Error
	promise.catch((err) => {
		if (err) {
			console.error("Error: Can not load segments by segmentIds ! " + err);
			reject(err);
		}
	});
}

module.exports.GetSegment = GetSegment;
module.exports.GetSegments = GetSegments;
