// Load config
var config = require('../configuration.js');

// Load mongoose service
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Load models
var segmentModel = require('../models/SegmentModel');
var streetModel = require('../models/StreetModel');
var segmentDensityModel = require('../models/SegmentDensityModel');

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
											},											
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

/**
 * [GetDensitySegment - Get density segment]
 * @param {[type]} segmentId    [description]
 * @param {[type]} lowTimestamp [description]
 */
var GetDensitySegment = function(segmentId, lowTimestamp, resolve, reject) {
	var promise = segmentDensityModel.aggregate([ 	{ "$match": { 'segment_id': segmentId } },
												 	{ "$unwind": "$history" },
												 	{ "$match": {
												 					"history.timestamp": { $gte: lowTimestamp } 
												 				}
										 			},
												 	{ "$group": {
														    "_id": { "segment_id": "$segment_id",
										 							 "density": "$density",
										 							 "velocity": "$velocity"
										 							},
														    "history": { "$push": "$history" }
														}
													},
													{ "$project": {
															"_id": 0,
														    "segment_id": "$_id.segment_id",
								 							"density": "$_id.density",
								 							"velocity": "$_id.velocity",
								 							"history": 1
														}
													}
												]).exec();

	// Result
	promise.then(function(result) {
		return resolve(result);
	});

	// Error
	promise.catch(function(err) {
		console.error("Error: Can not get density segment from database by segment_id = " + segmentId + " ! " + err);
		return reject(err);
	});
}

/**
 * [PostDensitySegment - Post density information of a segment]
 * @param {[type]} newDensitySegment [description]
 * @param {[type]} resolve           [description]
 * @param {[type]} reject            [description]
 */
var PostDensitySegment = function(newDensitySegment, resolve, reject) {
	segmentDensityModel.insertMany([newDensitySegment], function(err, result) {
		if (err) {
			console.error("Error: Can not post density segment to database ! " + err);
			return reject(err);
		}

		return resolve(result);
	});
}

/**
 * [UpdateDensitySegment - Update density information of a segment]
 * @param {[type]} updateDensitySegment [description]
 */
var UpdateDensitySegment = function(updateDensitySegment, resolve, reject) {
	var promise = segmentDensityModel.findOneAndUpdate({ 'segment_id': updateDensitySegment.segment_id }, updateDensitySegment).exec();

	// Result
	promise.then(function(result) {
		return resolve(result);
	});

	// Error
	promise.catch(function(err) {
		console.error("Error: Can not update density segment to database ! " + err);
		return reject(err);
	});	
}

module.exports.GetDensityBySegmentIds = GetDensityBySegmentIds;
module.exports.GetDensityByStreetIds = GetDensityByStreetIds;

module.exports.GetDensitySegment = GetDensitySegment;
module.exports.PostDensitySegment = PostDensitySegment;
module.exports.UpdateDensitySegment = UpdateDensitySegment;
