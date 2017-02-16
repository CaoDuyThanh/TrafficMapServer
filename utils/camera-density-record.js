// LOAD LIBRARY
var schedule = require('node-schedule');

// LOAD CONFIG
var config = require('../configuration.js');
var dbConfig = config.DbConfig;

// LOAD SEGMENTS MODEL
var simulationService = require('../service/simulation-service');

// AUTO SAVE SEGMENT DATA TO DATABASE - TIME SERIES
// START RECORD SEGMENT MAP
var ruleSchedule = new schedule.RecurrenceRule();
ruleSchedule.minute = new schedule.Range(0, 59, dbConfig.TimerCameraDensityRecord);

var RecordTimeout;
var	StartRecordCamerasDensity = function(){
	console.log("Start record cameras density !");

	RecordTimeout = schedule.scheduleJob(ruleSchedule, function() {
		// Load all density segments from database
		var promise = new Promise((resolve, reject) => simulationService.GetAllCamerasDensity(resolve, reject));
		promise.then((camerasDensity) => {
			var promisePost = new Promise((resolve, reject) => simulationService.RecordCamerasDensity(camerasDensity, resolve, reject));
			promisePost.then((data) => {
				console.log("Insert new record of cameras density to database successfully !");
			});
			promisePost.catch((err) => {
				console.error('Error while record cameras density to database ', err);
			});
		});
		promise.catch((err) => {
			console.error('Error while get all cameras density ', err);
		});
	});
}

// STOP RECORD SEGMENT MAP
var StopRecordCamerasDensity = function(){
	RecordTimeout.cancel();
	console.log("Stop record cameras density !");
}

module.exports.StartRecordCamerasDensity = StartRecordCamerasDensity;
module.exports.StopRecordCamerasDensity = StopRecordCamerasDensity;
