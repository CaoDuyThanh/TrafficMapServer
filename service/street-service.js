// Load config
var config = require('../configuration.js');

// Load mongoose service
var mongoose = require('mongoose');

// Load models
var streetModel = require('../models/StreetModel.js');

/**
 * Get Street based on streetId
 * @param {[number]}   streetId   	[street_id]
 * @return {[object]} 				[found street]
 */
var GetStreet = function(streetId, resolve, reject) {
	var promise = streetModel.find({'street_id': streetId}).exec();

	// Result
	promise.then(function(data) {
		return resolve(data);
	});

	// Error
	promise.catch(function(err) {
		console.error("Error: Can not get street by streetId from database ! " + err);
		return reject(err);
	});
}

/**
 * [GetAllStreets - Get all street from database]
 * @return {[Array[object]]} 				[array of street]
 */
var GetAllStreets = function(resolve, reject) {
	var promise = streetModel.find({}).exec();

	// Result
	promise.then(function(data) {
		return resolve(data);
	});

	// Error
	promise.catch(function(err) {
		console.error("Error: Can not get all streets from database ! " + err);
		return reject(err);
	});
}

/**
 * [GetStreetDensity - Get street with all it's segment density]
 * @param {[type]} streetId [description]
 * @param {[type]} resolve  [description]
 * @param {[type]} reject   [description]
 */
var GetStreetDensity = function(streetId, resolve, reject) {
	var promise = streetModel.aggregate([ 	{ "$match": { 'street_id': streetId	} },
										 	{ "$unwind": "$segments" },
											{ "$lookup": {
														    "localField": "segments",
														    "from": "segment_densities",
														    "foreignField": "segment_id",
														    "as": "segmentDensity"
														}
											},
										 	{ "$group": {
												    "_id": { "street_id": "$street_id" },
												    "segments": { "$push": "$segmentDensity" }
												}
											},
											{ "$project": {
													"_id": 0,
												    "street_id": "$_id.street_id",
						 							"segments.segment_id": 1,
						 							"segments.density": 1,
						 							"segments.velocity": 1
												}
											}
										]).exec();
	// Result
	promise.then(function(result) {
		return resolve(result);
	});
	// Error
	promise.catch(function(err) {
		console.error('Service error: Can not get street density streetId = ' + streetId, err);
		return reject(err);
	})


}


module.exports.GetStreet = GetStreet;
module.exports.GetAllStreets = GetAllStreets;
module.exports.GetStreetDensity = GetStreetDensity;
