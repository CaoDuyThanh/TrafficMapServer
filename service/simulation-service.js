// Load config
var config = require('../configuration.js');

// Load mongoose service
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Load models
var trafficPoleModel = require('../models/TrafficPoleModel');
var cameraDensityModel = require('../models/CameraDensityModel');

/**
 * [GetTrafficPole - Get traffic pole by trafficPoleId]
 * @param {[number]}  trafficPoleId [description]
 * @return {[object]} 				[traffic pole]
 */
var GetTrafficPole = function(trafficPoleId, resolve, reject) {
	var promise = trafficPoleModel.findOne({'pole_id': trafficPoleId}).exec();

	// Result
	promise.then(function(data) {
		return resolve(data);
	});

	// Error
	promise.catch(function(err) {
		console.error("Error: Can not get traffic pole from database ! " + err);
		return reject(err);
	});
}

/**
 * [GetTrafficPoles - Get traffic poles by trafficPoleIds]
 * @param {[number]}  		 trafficPoleIds [description]
 * @return {[Array[object]]} 				[array of traffic pole]
 */
var GetTrafficPoles = function(trafficPoleIds, resolve, reject) {
	var promise = trafficPoleModel.find({'pole_id': {$in: trafficPoleIds}}).exec();

	// Result
	promise.then(function(data) {
		return resolve(data);
	});

	// Error
	promise.catch(function(err) {
		console.error("Error: Can not get traffic poles by list of trafficPoleIds from database ! " + err);
		return reject(err);
	});
}

/**
 * [GetTrafficPolesByBage - Get traffic poles by page and number of items per page]
 * @param {[type]} page            [description]
 * @param {[type]} numItemsPerPage [description]
 * @return {[Array[object]]} 				[array of traffic pole]
 */
var GetTrafficPolesByPage = function(page, numItemsPerPage, resolve, reject) {
	trafficPoleModel.paginate({}, {page: page, limit: numItemsPerPage}, function(err, result){
		if (err){ 
			console.error("Error: Can not load traffic pole at page = " + page + " and numItems = " + numItemsPerPage + err);
			return reject(err);
		}  

		return resolve(result.docs);
	});
}

/**
 * [GetTrafficPolesByBage - Get all traffic poles in database]
 * @return {[Array[object]]} 				[array of traffic pole]
 */
var GetAllTrafficPoles = function(resolve, reject) {
	var promise = trafficPoleModel.find({}).exec();

	// Result
	promise.then(function(data) {
		return resolve(data);
	});

	// Error
	promise.catch(function(err) {
		console.error("Error: Can not get all traffic poles from database ! " + err);
		return reject(err);
	});
}

/**
 * [GetNumTrafficPoles - count number of traffic poles from database]
 * @return {[number]} 				[number of traffic poles]
 */
var GetNumTrafficPoles = function(resolve, reject) {
	var promise = trafficPoleModel.count({}).exec();

	// Result
	promise.then(function(numberTrafficPoles) {
		return resolve(numberTrafficPoles);
	});

	// Error
	promise.catch(function(err) {
		console.error("Error: Can not count number of traffic poles from database ! " + err);
		return reject(err);
	});	
}

/**
 * [PostNewTrafficPole - Post a new traffic pole]
 * @param {[type]} newTrafficPole [description]
 */
var PostNewTrafficPole = function(newTrafficPole, resolve, reject) {
	trafficPoleModel.insertMany([newTrafficPole], function(err, result) {
		if (err) {
			console.error("Error: Can not count number of traffic poles from database ! " + err);
			return reject(err);	
		}
		return resolve(result);
	});
}

/**
 * [UpdateTrafficPole - Update an exist traffic pole]
 * @param {[type]} updateTrafficPole [description]
 */
var UpdateTrafficPole = function(updateTrafficPole, resolve, reject) {
	var promise = trafficPoleModel.findOneAndUpdate({'pole_id': updateTrafficPole.pole_id}, updateTrafficPole).exec();

	// Result
	promise.then(function(result) {
		return resolve(result);
	});

	// Error
	promise.catch(function(err) {
		console.error("Error: Can not count number of traffic poles from database ! " + err);
		return reject(err);
	});
}

/**
 * [DeleteTrafficPole - Delete an exist traffic pole]
 * @param {[type]} trafficPoleId [description]
 */
var DeleteTrafficPole = function(trafficPoleId, resolve, reject) {
	var promise = trafficPoleModel.findOneAndRemove({'pole_id': trafficPoleId}).exec();

	// Result
	promise.then(function(result) {
		return resolve(result);
	});

	// Error
	promise.catch(function(err) {
		console.error("Error: Can not count number of traffic poles from database ! " + err);
		return reject(err);
	});
}

/**
 * [GetDensityCamera - Get density camera]
 * @param {[type]} pole_id   [description]
 * @param {[type]} stream_id [description]
 */
var GetDensityCamera = function(pole_id, stream_id, lowTimestamp, resolve, reject) {
	var promise = cameraDensityModel.aggregate([ 	{ "$match": { 'pole_id': pole_id,
															   	  'stream_id': stream_id 
																} 
												 	},
												 	{ "$unwind": "$history" },
												 	{ "$project": { 
												 					"pole_id": 1,
												 					"stream_id": 1,
														    		"density": 1,
												 					"history.density": 1,
														            "history.timestamp": 1,
														            "history.timestampp": { $gte: [ "$history.timestamp", lowTimestamp ] }
												          		  }
												 	},
												 	{ "$group": {
														    "_id": { "pole_id": "$pole_id",
										 							 "stream_id": "$stream_id",
										 							 "density": "$density",
										 							},
														    "history": { "$push": "$history" }
														}
													},
													{ "$project": {
															"_id": 0,
														    "pole_id": "$_id.pole_id",
								 							"stream_id": "$_id.stream_id",
								 							"density": "$_id.density",
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
		console.error("Error: Can not get density camera from database by pole_id = " + pole_id + " and stream_id = " + stream_id + " ! " + err);
		return reject(err);
	});
}

/**
 * [PostDensityCamera - Post density information of a camera]
 * @param {[type]} newDensityCamera [description]
 */
var PostDensityCamera = function(newDensityCamera, resolve, reject) {
	cameraDensityModel.insertMany([newDensityCamera], function(err, result) {
		if (err) {
			console.error("Error: Can not post density camera to database ! " + err);
			return reject(err);
		}

		return resolve(result);
	});
}

/**
 * [UpdateDensityCamera - Update density information of a camera]
 * @param {[type]} updateDensityCamera [description]
 */
var UpdateDensityCamera = function(updateDensityCamera, resolve, reject) {
	var promise = cameraDensityModel.findOneAndUpdate({ 'pole_id': updateDensityCamera.pole_id,
														'stream_id': updateDensityCamera.stream_id }, updateDensityCamera).exec();

	// Result
	promise.then(function(result) {
		return resolve(result);
	});

	// Error
	promise.catch(function(err) {
		console.error("Error: Can not update density camera to database ! " + err);
		return reject(err);
	});	
}

module.exports.GetTrafficPole = GetTrafficPole;
module.exports.GetTrafficPoles = GetTrafficPoles;
module.exports.GetTrafficPolesByPage = GetTrafficPolesByPage;
module.exports.GetAllTrafficPoles = GetAllTrafficPoles;
module.exports.GetNumTrafficPoles = GetNumTrafficPoles;

module.exports.PostNewTrafficPole = PostNewTrafficPole;
module.exports.UpdateTrafficPole = UpdateTrafficPole;
module.exports.DeleteTrafficPole = DeleteTrafficPole;

module.exports.GetDensityCamera = GetDensityCamera;
module.exports.PostDensityCamera = PostDensityCamera;
module.exports.UpdateDensityCamera = UpdateDensityCamera;
