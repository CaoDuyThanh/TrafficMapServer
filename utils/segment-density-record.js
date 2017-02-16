// LOAD LIBRARY
var schedule = require('node-schedule');

// LOAD CONFIG
var config = require('../configuration.js');
var dbConfig = config.DbConfig;

// LOAD SEGMENTS MODEL
var densityService = require('../service/density-service');

// AUTO SAVE SEGMENT DATA TO DATABASE - TIME SERIES
// START RECORD SEGMENT MAP
var ruleSchedule = new schedule.RecurrenceRule();
ruleSchedule.minute = new schedule.Range(0, 59, dbConfig.TimerSegmentDensityRecord);

var RecordTimeout;
var	StartRecordSegmentsDensity = function(){
	console.log("Start record segments density !");

	RecordTimeout = schedule.scheduleJob(ruleSchedule, function() {
		// Load all density segments from database
		var promise = new Promise((resolve, reject) => densityService.GetAllSegmentsDensity(resolve, reject));
		promise.then((segmentsDensity) => {
			var promisePost = new Promise((resolve, reject) => densityService.RecordSegmentsDensity(segmentsDensity, resolve, reject));
			promisePost.then((data) => {
				console.log("Insert new record of segments density to database successfully !");
			});
			promisePost.catch((err) => {
				console.error('Error while record segments density to database ', err);
			});
		});
		promise.catch((err) => {
			console.error('Error while get all segments density ', err);
		});	
	});
}

// STOP RECORD SEGMENT MAP
var StopRecordSegmentsDensity = function(){
	RecordTimeout.cancel();
	console.log("Stop record segments density !");
}

module.exports.StartRecordSegmentsDensity = StartRecordSegmentsDensity;
module.exports.StopRecordSegmentsDensity = StopRecordSegmentsDensity;
