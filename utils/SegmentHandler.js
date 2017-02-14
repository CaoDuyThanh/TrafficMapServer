// LOAD CONFIG
var config = require('../configuration.js');
var dbConfig = config.DbConfig;

// LOAD SEGMENTS MODEL
var mongoose = require('mongoose');
var schedule = require('node-schedule');
var Segments = require('../models/SegmentModel.js');
var SegmentsHistory = require('../models/SegmentHistoryModel.js');

// VARIABLES ---------------------------
var isDataLoaded = false;

// FUNCTIONS ---------------------------
// LOAD SEGMENT DATA FROM DATABASE
var LoadSegment = function(){
	// TODO - DO NOTHING
}


// AUTO LOAD PIECES OF SEGMENT DATA FROM DATABASE
// TODO


// AUTO SAVE SEGMENT DATA TO DATABASE - TIME SERIES
// START RECORD SEGMENT MAP
// var ruleSchedule = new schedule.RecurrenceRule();
// ruleSchedule.minute = new schedule.Range(0, 59, dbConfig.TimerRecord);

// var RecordTimeout;
// var	StartRecordSegment = function(){
// 	// console.log("Start record segment history !");
// 	// RecordTimeout = schedule.scheduleJob(ruleSchedule, function(){
// 	// 	if (isDataLoaded == true){
// 	// 		var currentDate = new Date();
// 	// 		var currentHour = currentDate.getHours();
// 	// 		var currentMinute = currentDate.getMinutes();

// 	// 		var bulkUpdateCallback = function(err, r){
// 	// 			console.log(r.matchedCount);
// 	// 		    console.log(r.modifiedCount);	    
// 	// 		}
				
// 	// 		try{
// 	// 			var bulk = SegmentsHistory.collection.initializeOrderedBulkOp();
// 	// 			var counter = 0;

// 	// 			// Representing a long loop
// 	// 			Object.keys(global.AllSegments).forEach(function(key){
// 	// 				var segment = global.AllSegments[key];
// 	// 				var model = {};
// 	// 				model["density." + currentHour + "." + currentMinute] = segment.density;
// 	// 				model["velocity." + currentHour + "." + currentMinute] = segment.velocity;

// 	// 				bulk.find({"_id":segment._id}).upsert().updateOne({
// 	// 					$set:model
// 	// 				});
// 	// 		        counter++;

// 	// 				if (counter % 2000 == 0) {
// 	// 			        bulk.execute();
// 	// 			        bulk = SegmentsHistory.collection.initializeOrderedBulkOp();
// 	// 			    }        
// 	// 		    });

// 	// 		    if ( counter % 2000 != 0 ){
// 	// 		        bulk.execute(function(err,result) {
// 	// 		        	if (err != null){
// 	// 		        		console.error("Error record last patch : " + err);
// 	// 		        	}
// 	// 		        });
// 	// 		    }
// 	// 		}
// 	// 		catch (e){
// 	// 			if (e !== BreakException) throw e;
// 	// 		}
// 	// 		console.log("Insert new record of segment data to database successfully !");
// 	// 	}
// 	// });
// }

// // STOP RECORD SEGMENT MAP
// var StopRecordSegment = function(){
// 	// RecordTimeout.cancel();
// 	// console.log("Stop record segment history !");
// }

module.exports.LoadSegment = LoadSegment;
// module.exports.StartRecordSegment = StartRecordSegment;
// module.exports.StopRecordSegment = StopRecordSegment;
