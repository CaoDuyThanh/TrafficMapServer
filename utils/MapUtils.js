// Import library
var Promise = require('bluebird');

// Import service
var cellService = require('../service/cell-service');

// Import utils
var mathUtils = require('./MathUtils');

var ConvertGPSToCellId = function(lon, lat){
	lon = Math.floor(lon * 100) + 9000;
	lat = Math.floor(lat * 100) + 18000;
	return lon << 16 | lat;
}

var FindCellByGPS = function(gpsLocation){
	
}

var DistanceSegmentAndPos = function(segment, pos){
	var nodeStart = segment.node_start[0];
	var nodeEnd = segment.node_end[0];

	var midPoint = {};
	midPoint.X = (nodeStart.lon + nodeEnd.lon) / 2;
	midPoint.Y = (nodeStart.lat + nodeEnd.lat) / 2;

	var point = {};
	point.X = pos.Lon;
	point.Y = pos.Lat;

	return mathUtils.DistanceBetween2Point(midPoint, point);
}

var FindSegmentByGPS = function(gpsLocation, resolve, reject){
	// Find cell based on GPS
	var cellId = ConvertGPSToCellId(gpsLocation.Lon, gpsLocation.Lat);
	var promiseCell = new Promise((resolve, reject) => cellService.GetCellSegmentsLatlng(cellId, resolve, reject));
	promiseCell.then((data) => {
		if (data.length > 0) {
			var cell = data[0];
			var min = 10000;
			var foundSegment;
			cell.segments.forEach((segment) => {
				var distance = DistanceSegmentAndPos(segment, gpsLocation);
				if (distance < min){
					min = distance;
					foundSegment = segment;
				}
			});
			
			return resolve(foundSegment);
		} else {
			return resolve(null);
		}
	});
	promiseCell.catch((err) => {
		console.error('Can not find cell at GPS location : ' + gpsLocation);
		return reject(err);
	});
}

var CheckSameDirection = function(segment, pointStart, pointEnd){
	var pointA = {};
	pointA.X = segment.node_start[0].lon;
	pointA.Y = segment.node_start[0].lat;
	var pointB = {};
	pointB.X = segment.node_end[0].lon;
	pointB.Y = segment.node_end[0].lat;
	var pointC = {};
	pointC.X = pointStart.lon;
	pointC.Y = pointStart.lat;
	var pointD = {};
	pointD.X = pointEnd.lon;
	pointD.Y = pointEnd.lat;
	
	return mathUtils.CheckSameDirection(pointA, pointB, pointC, pointD);
}

var PathFinder = {
	CellIds: {},
	Graph: {},
	ListNodes: {},
	
	// Dijkstra parameters
	Distance: {},
	Trace: {},
	Check: {},


	loadCell: function(cellId, resolve, reject) {
		if (this.CellIds[cellId]) {
			return resolve();
		} else {
			console.log('call this');
			var promise = new Promise((resolve, reject) => cellService.GetCellSegmentsLatlng(cellId, resolve, reject));
			promise.then((data) => {
				if (data.length > 0) {
					var cell = data[0];
					cell.segments.forEach((segment) => {
						var nodeStart = segment.node_start[0];
						var nodeEnd = segment.node_end[0];
						var nodeStartId = nodeStart.node_id;
						var nodeEndId = nodeEnd.node_id;

						this.ListNodes[nodeStartId] = nodeStart;
						this.ListNodes[nodeEndId] = nodeEnd;
						if (!this.Graph[nodeStartId]) {
							this.Graph[nodeStartId] = [];
						}
						this.Graph[nodeStartId].push(nodeEndId);
					});
					this.CellIds[cellId] = 1;
					return resolve();
				} else {
					console.error('Can not find cell by cellId = ' + cellId + ' ! ');
					return reject();	
				}
			});
			promise.catch((err) => {
				console.error('Can not find cell by cellId = ' + cellId + ' ! ', err);
				return reject(err);
			});
		}
	},

	distance2Nodes: function(nodeA, nodeB) {
		var pointA = {};
		pointA.X = nodeA.lon;
		pointA.Y = nodeA.lat;

		var pointB = {};
		pointB.X = nodeB.lon;
		pointB.Y = nodeB.lat;

		return mathUtils.DistanceBetween2Point(pointA, pointB);
	},

	promiseWhile: Promise.method(function(startNodeId, endNodeId, condition, action, resolve, reject) {
		var data = condition();
		var minNodeId = data.min_node_id;
		if (minNodeId === endNodeId) {
			var result = [];
			var tempNodeId = endNodeId;
			while (tempNodeId !== startNodeId) {
				result.push(this.ListNodes[tempNodeId]);
				tempNodeId = this.Trace[tempNodeId];
			}
			result.push(this.ListNodes[tempNodeId]);

			return resolve(result);
		} else {
			return action(minNodeId).then(this.promiseWhile.bind(this, startNodeId, endNodeId, condition, action, resolve, reject));
		}
	}),

	dijkstraAStar: function(startNodeId, endNodeId, resolve, reject) {
		var startNode = this.ListNodes[startNodeId];
		var endNode = this.ListNodes[endNodeId];
		this.Distance[startNodeId] = this.distance2Nodes(startNode, endNode);

		this.promiseWhile(
			startNodeId,
			endNodeId,
			() => {	// condition fallback
				var min = 10000;
				var minNodeId;
				for (var key in this.Distance) {
					if (this.Distance.hasOwnProperty(key)) {
						if (this.Distance[key] < min && !this.Check[key]) {
							min = this.Distance[key];
							minNodeId = key;
						}
					}
				}
				this.Check[minNodeId] = 1;				

				return {
					min_node_id: minNodeId,
				}
			},
			(minNodeId) => {	// action fallback
				if (this.Graph[minNodeId]){
					var promiseAll = Promise.all(
						this.Graph[minNodeId].map((neighborNodeId) => {						
							this.Distance[neighborNodeId] = this.Distance[minNodeId] + this.distance2Nodes(this.ListNodes[neighborNodeId], this.ListNodes[endNodeId]);
							this.Trace[neighborNodeId] = minNodeId;					

							var cellId = ConvertGPSToCellId(this.ListNodes[neighborNodeId].lon, this.ListNodes[neighborNodeId].lat);
							if (!this.CellIds[cellId]) {	// CellId does not exist
								return new Promise((resolve, reject) => this.loadCell(cellId, resolve, reject));
							} else {
								return new Promise((resolve) => resolve());
							}
						})
					);
					return promiseAll;
				} else {
					return new Promise((resolve) => resolve());
				}
			}

		);
	},

	nearestNodeId: function(location) {
		var min = 10000;
		var minNodeId;
		for (var nodeId in this.ListNodes) {
			if (this.ListNodes.hasOwnProperty(nodeId)) {
				var distance = this.distance2Nodes(location, this.ListNodes[nodeId])
				if (distance < min) {
					min = distance;
					minNodeId = nodeId;
				}
			}
		}
		return minNodeId;
	},

	FindPath: function(startLocation, endLocation, resolve, reject) {
		var startCellId = ConvertGPSToCellId(startLocation.lon, startLocation.lat);
		var endCellId = ConvertGPSToCellId(endLocation.lon, endLocation.lat);

		if (!this.CellIds[startCellId]) {
			var promise = new Promise((resolve, reject) => this.loadCell(startCellId, resolve, reject));
			promise.then((result) => {
				var promise1 = new Promise((resolve, reject) => this.loadCell(endCellId, resolve, reject));
				promise1.then((result) => {
					var startNodeId = this.nearestNodeId(startLocation);
					var endNodeId = this.nearestNodeId(endLocation);

					return this.dijkstraAStar(endNodeId, startNodeId, resolve, reject) ;
				});
				promise1.catch((err) => {
					return reject(err);
				});
			});
			promise.catch((err) => {
				return reject(err);
			});
		}		
	}
}


module.exports.ConvertGPSToCellId = ConvertGPSToCellId;
module.exports.FindCellByGPS = FindCellByGPS;
module.exports.FindSegmentByGPS = FindSegmentByGPS;
module.exports.CheckSameDirection = CheckSameDirection;
module.exports.PathFinder = PathFinder;
