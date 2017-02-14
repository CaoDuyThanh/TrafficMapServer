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
	// TODO - DO NOTHING
}

module.exports.LoadCells = LoadCells;