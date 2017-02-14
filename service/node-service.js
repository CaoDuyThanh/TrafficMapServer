// Load config
var config = require('../configuration.js');

// Load mongoose service
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Load models
var nodeModel = require('../models/NodeModel.js');

/**
 * Get Node based on nodeId
 * @param {[type]}   nodeId   [number]
 */
var GetNode = function(nodeId, resolve, reject) {
	var promise = nodeModel.find({'node_id': nodeId}).exec();

	// Result
	promise.then(function(data) {
		return resolve(data);
	});

	// Error
	promise.catch(function(err) {
		console.error("Error: Can not load node data from database ! " + err);
		return reject(err);
	});
}

var GetNodes = function(nodeIds, isSort, excludeField, resolve, reject) {
	var promise = nodeModel.find({ 'node_id': { $in: nodeIds } })
						   .select(excludeField)
						   .exec();

	// Result
	promise.then(function(data) {
		if (isSort) {
			return resolve(data);
		} else {
			data.sort((a, b) => {
		        // Sort docs by the order of their _id values in ids.
		        return nodeIds.indexOf(a.node_id) - nodeIds.indexOf(b.node_id);
		    });
		    return resolve(data);
		}
	});

	// Error
	promise.catch(function(err) {
		if (err) {
			console.error("Error: Can not load node data from database ! " + err);
			return reject(err);
		}
	});
}


module.exports.GetNode = GetNode;
module.exports.GetNodes = GetNodes;
