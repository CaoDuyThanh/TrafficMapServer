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
	Nodes.find(function(err, allNodes){
		if (err){ 
			console.error("Error: Can not load node data from database ! " + err);
			return next(err);
		}

		global.AllNodes = {};
		allNodes.forEach(function(node){
			global.AllNodes[node.node_id] = node;
		});

		// Console result
		console.log("Load node data from database successfully !");
		console.log("Number of nodes = " + Object.keys(global.AllNodes).length);
		isDataLoaded = true;		
	});
}

module.exports.LoadNodes = LoadNodes;