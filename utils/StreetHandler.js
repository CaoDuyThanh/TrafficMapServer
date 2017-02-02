// LOAD LIBRARY
var autoComplete = require('autocomplete');

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

		// Create streets
		global.AllStreets = {};
		allStreets.forEach(function(street){
			global.AllStreets[street.street_id] = street;
		});

		// Console result
		console.log("Load street data from database successfully !");
		console.log("Number of streets = " + Object.keys(global.AllStreets).length);

		// Create street name mapping
		global.AllStreetsName = {};
		allStreets.forEach(function (street){
			var streetName = street.name;
			if (streetName != ""){
				if (!global.AllStreetsName[streetName]){
					global.AllStreetsName[streetName] = {};
					global.AllStreetsName[streetName].segments = [];
				}

				global.AllStreetsName[streetName].segments.push(street.segments);
			}			
		});

		// Console result
		console.log("Create street name from all streets data !");
		console.log("Number of streets has name = " + Object.keys(global.AllStreetsName).length);

		// Create street dictionary for suggestion
		global.AllStreetsDict = autoComplete.connectAutocomplete();
		global.AllStreetsDict.initialize(function(onReady) { onReady([]); });	// Create blank dictionary
		Object.keys(global.AllStreetsName).forEach(function(key) {
			global.AllStreetsDict.addElement(key);
		});
		// Console result
		console.log("Create street dictionary from all streets name !");

		isDataLoaded = true;
	});
}



module.exports.LoadStreets = LoadStreets;