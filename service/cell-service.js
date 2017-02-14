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
var GetCell = function(cellId) {
	var promise = cellModel.find({'cell_id': cellId}).exec();

	// Result
	promise.then(function(data) {
		return data;
	});

	// Error
	promise.catch(function(err) {
		if (err) {
			console.error("Error: Can not load cell data from database ! " + err);
			throw err;
		}
	});
}



var GetCells = function(cellIds, resolve, reject) {
	var promise = cellModel.find({ 'cell_id': { $in: cellIds } }).exec();

	// Result
	promise.then(function(data) {
		return resolve(data);
	});

	// Error
	promise.catch(function(err) {
		if (err) {
			console.error("Error: Can not load cell data from database ! " + err);
			throw err;
		}
	});

}


module.exports.GetCell = GetCell;
module.exports.GetCells = GetCells;
