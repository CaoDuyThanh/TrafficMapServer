// Load config
var config = require('../configuration.js');

// Load mongoose service
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Load models
var cellModel = require('../models/CellModel.js');

/**
 * Get Cell based on cellId
 * @param {[type]}   cellId   [number]
 */
var GetCell = function(cellId, resolve, reject) {
	var promise = cellModel.find({'cell_id': cellId}).exec();

	// Result
	promise.then(function(data) {
		return resolve(data);
	});

	// Error
	promise.catch(function(err) {
		console.error("Error: Can not load cell data from database ! " + err);
		return reject(err);
	});
}


/**
 * [GetCells - Get list of cell based on list of CellIds]
 * @param {[Array[Number]]} cellIds [description]
 */
var GetCells = function(cellIds, resolve, reject) {
	var promise = cellModel.find({ 'cell_id': { $in: cellIds } }).exec();

	// Result
	promise.then(function(data) {
		return resolve(data);
	});

	// Error
	promise.catch(function(err) {
		console.error("Error: Can not load cell data from database ! " + err);
		return reject(err);
	});
}


var GetCellSegmentsLatlng = function(cellId, resolve, reject) {
	var promise = cellModel.aggregate([	{ "$match": { "cell_id": cellId } },
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
	promise.then(function(data) {
		return resolve(data);
	});

	// Error
	promise.catch(function(err) {
		console.error("Error: Can not load cell by CellId from database ! " + err);
		return reject(err);
	});	
}

module.exports.GetCell = GetCell;
module.exports.GetCells = GetCells;
module.exports.GetCellSegmentsLatlng = GetCellSegmentsLatlng;
