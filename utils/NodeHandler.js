// LOAD CONFIG
var config = require('../configuration.js');

// LOAD SEGMENTS MODEL
var mongoose = require('mongoose');
var Nodes = require('../models/NodeModel.js');

// VARIABLES ---------------------------
var isDataLoaded = false;

// FUNCTIONS ---------------------------
// LOAD DENSITY DATA FROM DATABASE
var LoadNodes = function(){
	// TODO - DO NOTHING
}

module.exports.LoadNodes = LoadNodes;