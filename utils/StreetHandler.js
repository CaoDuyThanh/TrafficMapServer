// LOAD LIBRARY
var autoComplete = require('autocomplete');

// LOAD CONFIG
var config = require('../configuration.js');

// LOAD SERVICE
var streetService = require('../service/street-service');

// FUNCTIONS ---------------------------
// LOAD DENSITY DATA FROM DATABASE
var LoadStreets = function(){
	var promise = new Promise((resolve, reject) => streetService.GetAllStreets(resolve, reject));
	promise.then((data) => {
		// Create street name mapping
		global.AllStreetsName = {};
		data.forEach(function (street){
			var streetName = street.name;
			if (streetName != ""){
				if (!global.AllStreetsName[streetName]){
					global.AllStreetsName[streetName] = {};
					global.AllStreetsName[streetName].segments = [];
				}

				global.AllStreetsName[streetName].segments = global.AllStreetsName[streetName].segments.concat(street.segments);
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

	});
	promise.catch((err) => {
		console.error("Error: Can not load all streets from database ! " + err);
	});
}



module.exports.LoadStreets = LoadStreets;