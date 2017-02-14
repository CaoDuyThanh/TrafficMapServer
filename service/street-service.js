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

module.exports.GetStreet = GetStreet;
module.exports.GetAllStreets = GetAllStreets;
