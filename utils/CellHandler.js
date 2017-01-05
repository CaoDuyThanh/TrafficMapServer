// LOAD CONFIG
var config = require('../configuration.js');

// LOAD SEGMENTS MODEL
var mongoose = require('mongoose');
var Cells = require('../models/CellModel.js');

// VARIABLES ---------------------------
var isDataLoaded = false;

// FUNCTIONS ---------------------------
// LOAD DENSITY DATA FROM DATABASE
var LoadCells = function(){
	Cells.find(function(err, allCells){
		if (err){ 
			console.error("Error: Can not load cell data from database ! " + err);
			return next(err);
		}

		global.AllCells = {};
		allCells.forEach(function(cell){
			global.AllCells[cell.cell_id] = cell;
		});

		// Console result
		console.log("Load cell data from database successfully !");
		console.log("Number of cells = " + Object.keys(global.AllCells).length);
		isDataLoaded = true;		
	});
}

module.exports.LoadCells = LoadCells;