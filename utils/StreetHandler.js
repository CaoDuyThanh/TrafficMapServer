// LOAD CONFIG
var config = require('../configuration.js');

// LOAD SEGMENTS MODEL
var mongoose = require('mongoose');
var Streets = require('../models/StreetModel.js');

// VARIABLES ---------------------------
var isDataLoaded = false;

// FUNCTIONS ---------------------------
// LOAD DENSITY DATA FROM DATABASE
var LoadStreets = function(){
	Streets.find(function(err, allStreets){
		if (err){ 
			console.error("Error: Can not load street data from database ! " + err);
			return next(err);
		}

		global.AllStreets = {};
		allStreets.forEach(function(street){
			global.AllStreets[street.street_id] = street;
		});

		// Console result
		console.log("Load street data from database successfully !");
		console.log("Number of streets = " + Object.keys(global.AllStreets).length);
		isDataLoaded = true;
	});
}

module.exports.LoadStreets = LoadStreets;