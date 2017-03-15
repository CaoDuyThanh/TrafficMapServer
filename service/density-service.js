// Load config
var config = require('../configuration.js');

// Load mongoose service
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

// Load models
var segmentModel = require('../models/SegmentModel');
var streetModel = require('../models/StreetModel');
var segmentDensityModel = require('../models/SegmentDensityModel');
var segmentDensityHistoryModel = require('../models/SegmentDensityHistoryModel');

/**
 * [GetDensityBySegmentId - Get density of segment based on a segment_id]
 * @param  {[Array]} 	segmentIds  [A list of segmentId]
 */
var GetDensityBySegmentId = function(segmentId, resolve, reject) {
	var promise = segmentModel.aggregate([  { '$match': { 'segment_id': segmentId } },
											{ '$lookup': {
														    'localField': 'node_start',
														    'from': 'nodes',
														    'foreignField': 'node_id',
														    'as': 'node_start'
														}
											},
											{ '$lookup': {
														    'localField': 'node_end',
														    'from': 'nodes',
														    'foreignField': 'node_id',
														    'as': 'node_end'
														}
											},
											{ '$lookup': {
														    'localField': 'segment_id',
														    'from': 'segment_densities',
														    'foreignField': 'segment_id',
														    'as': 'segmentDensity'
														}
											},
											{ '$project': {
															'segment_id': 1,
														    'node_start': '$node_start',
														    'node_end': '$node_end',
														    'density': '$segmentDensity.density',
														    'velocity': '$segmentDensity.velocity'
														  } 
											}])
							  .exec();
	// Result
	promise.then((data) => {
		if (data.length > 0){
			return resolve(data[0]);
		} else {
			console.error('Error: Can not load density by segmentId = ' + segmentId + ' !', err);
			return reject(err);
		}
	});
	// Error
	promise.catch((err) => {
		console.error('Error: Can not load density by segmentId = ' + segmentId + ' !', err);
		return reject(err);
	});
}

/**
 * [GetDensityBySegmentIds - Get density based on a list of segmentId]
 * @param  {[Array]} 	segmentIds  [A list of segmentId]
 */
var GetDensityBySegmentIds = function(segmentIds, resolve, reject) {
	var promise = segmentModel.aggregate([  { '$match': { 'segment_id': { $in: segmentIds } } },
											{ '$lookup': {
														    'localField': 'node_start',
														    'from': 'nodes',
														    'foreignField': 'node_id',
														    'as': 'node_start'
														}
											},
											{ '$lookup': {
														    'localField': 'node_end',
														    'from': 'nodes',
														    'foreignField': 'node_id',
														    'as': 'node_end'
														}
											},
											{ '$lookup': {
														    'localField': 'segment_id',
														    'from': 'segment_densities',
														    'foreignField': 'segment_id',
														    'as': 'segmentDensity'
														}
											},
											{ '$project': {
															'segment_id': 1,
														    'node_start': '$node_start',
														    'node_end': '$node_end',
														    'density': '$segmentDensity.density',
														    'velocity': '$segmentDensity.velocity'
														  } 
											}])
							  .exec();
	// Result
	promise.then((data) => {
		return resolve(data);
	});
	// Error
	promise.catch((err) => {
		console.error('Error: Can not load density by segmentIds ! ' + err);
		return reject(err);
	});
}

/**
 * [GetDensityByStreetIds - Get density by list of StreetIds]
 * @param {[type]} streetIds [description]
 */
var GetDensityByStreetIds = function(streetIds, resolve, reject) {
	var promise = streetModel.aggregate([	{ '$match': { 'street_id': { $in: streetIds } } },
											{ '$unwind': '$segments' },
											{ '$lookup': {
														    'localField': 'segments',
														    'from': 'segments',
														    'foreignField': 'segment_id',
														    'as': 'segmentObjects'
														}
											},
											{ '$unwind': {
															'path': '$segmentObjects',
															'preserveNullAndEmptyArrays': true 
														}
											},
											{ '$lookup': {
															'from': 'nodes',
														    'localField': 'segmentObjects.node_start',
														    'foreignField': 'node_id',
														    'as': 'segmentObjects.node_start'
														}
											},
											{ '$lookup': {
														    'from': 'nodes',
														    'localField': 'segmentObjects.node_end',
														    'foreignField': 'node_id',
														    'as': 'segmentObjects.node_end'
														}
											},
											{ '$lookup': {
														    'localField': 'segmentObjects.segment_id',
														    'from': 'segment_densities',
														    'foreignField': 'segment_id',
														    'as': 'segmentDensity'
														}
											},
											{ '$project': {
															'segmentObjects.segment_id': 1,
														    'segmentObjects.node_start.lat': 1,
														    'segmentObjects.node_start.lon': 1,
														    'segmentObjects.node_end.lat': 1,
														    'segmentObjects.node_end.lon': 1,
														    'segmentObjects.density': '$segmentDensity.density',
														    'segmentObjects.velocity': '$segmentDensity.velocity'
														  } 
											},											
											{ '$unwind': '$segmentObjects' },
											{ '$group': {
														    '_id': '$_id',
														    'segments': { '$push': '$segmentObjects' },
														}
											}
											])
							 .exec();

	// Result
	promise.then((data) => {
		console.log(data);
		return resolve(data);
	});
	// Error
	promise.catch((err) => {
		console.error('Error: Can not load density by streetIds ! ' + err);
		return reject(err);		
	});
}

/**
 * [GetSegmentDensity - Get density segment]
 * @param {[type]} segmentId    [description]
 * @param {[type]} lowTimestamp [description]
 */
var GetSegmentDensity = function(segmentId, lowTimestamp, resolve, reject) {
	var promise = segmentDensityModel.aggregate([ 	{ '$match': { 'segment_id': segmentId } },
												 	{ '$unwind': '$history' },
												 	{ '$match': {
												 					'history.timestamp': { $gte: lowTimestamp } 
												 				}
										 			},
												 	{ '$group': {
														    '_id': { 'segment_id': '$segment_id',
										 							 'density': '$density',
										 							 'velocity': '$velocity'
										 							},
														    'history': { '$push': '$history' }
														}
													},
													{ '$project': {
															'_id': 0,
														    'segment_id': '$_id.segment_id',
								 							'density': '$_id.density',
								 							'velocity': '$_id.velocity',
								 							'history': 1
														}
													}
												]).exec();

	// Result
	promise.then(function(result) {
		return resolve(result);
	});

	// Error
	promise.catch(function(err) {
		console.error('Error: Can not get density segment from database by segment_id = ' + segmentId + ' ! ' + err);
		return reject(err);
	});
}

/**
 * [PostSegmentDensity - Post density information of a segment]
 * @param {[type]} newDensitySegment [description]
 * @param {[type]} resolve           [description]
 * @param {[type]} reject            [description]
 */
var PostSegmentDensity = function(newDensitySegment, resolve, reject) {
	segmentDensityModel.insertMany([newDensitySegment], function(err, result) {
		if (err) {
			console.error('Error: Can not post density segment to database ! ' + err);
			return reject(err);
		}

		return resolve(result);
	});
}

/**
 * [UpdateSegmentDensity - Update density information of a segment]
 * @param {[type]} UpdateSegmentDensity [description]
 */
var UpdateSegmentDensity = function(UpdateSegmentDensity, resolve, reject) {
	var promise = segmentDensityModel.findOneAndUpdate({ 'segment_id': UpdateSegmentDensity.segment_id }, UpdateSegmentDensity, { upsert: true } ).exec();

	// Result
	promise.then(function(result) {
		return resolve(result);
	});

	// Error
	promise.catch(function(err) {
		console.error('Error: Can not update density segment to database ! ' + err);
		return reject(err);
	});	
}

/**
 * [GetAllSegmentsDensity - Get all density segments]
 * @param {[type]} segmentIds [description]
 */
var GetAllSegmentsDensity = function(resolve, reject) {
	var promise = segmentDensityModel.aggregate([ 	{ '$project': {
															'_id': 0,
														    'segment_id': 1,
								 							'density': 1,
								 							'velocity': 1
														}
													}
												]).exec();

	// Result
	promise.then(function(result) {
		return resolve(result);
	});

	// Error
	promise.catch(function(err) {
		console.error('Error: Can not get all density segment from database ! ' + err);
		return reject(err);
	});	
}

/**
 * [RecordSegmentsDensity - Record a list of density segments to database]
 * @param {[type]} densitySegments [description]
 * @param {[type]} resolve         [description]
 * @param {[type]} reject          [description]
 */
var RecordSegmentsDensity = function(segmentsDensity, resolve, reject) {
	var currentDate = new Date();
	var currentHour = currentDate.getHours();
	var currentMinute = currentDate.getMinutes();

	try{
		var bulk = segmentDensityHistoryModel.collection.initializeOrderedBulkOp();
		var counter = 0;

		// Representing a long loop
		segmentsDensity.forEach((segmentDensity) => {
			var model = {};
			model['density.' + currentHour + '.' + currentMinute] = segmentDensity.density;
			model['velocity.' + currentHour + '.' + currentMinute] = segmentDensity.velocity;

			bulk.find({'segment_id':segmentDensity.segment_id}).upsert().updateOne({
				$set:model
			});
	        counter++;

			if (counter % 2000 == 0) {
		        bulk.execute();
		        bulk = segmentDensityHistoryModel.collection.initializeOrderedBulkOp();
		    }        
	    });

	    if ( counter % 2000 != 0 ){
	        bulk.execute(function(err,result) {
	        	if (err != null){
	        		console.error('Error record last patch : ' + err);
	        	}
	        });
	    }

	    return resolve();
	}
	catch (err){
		console.error('Error service: can not record segments density to database ! ');
		return reject(err);
	}
}

module.exports.GetDensityBySegmentId = GetDensityBySegmentId;
module.exports.GetDensityBySegmentIds = GetDensityBySegmentIds;
module.exports.GetDensityByStreetIds = GetDensityByStreetIds;

module.exports.GetSegmentDensity = GetSegmentDensity;
module.exports.PostSegmentDensity = PostSegmentDensity;
module.exports.UpdateSegmentDensity = UpdateSegmentDensity;

module.exports.GetAllSegmentsDensity = GetAllSegmentsDensity;
module.exports.RecordSegmentsDensity = RecordSegmentsDensity;
