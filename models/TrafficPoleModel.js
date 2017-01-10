var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var schemaTypes = mongoose.Schema.Types;

var LatLon = mongoose.Schema({
	lat: Number,
	lon: Number
},{ _id : false });

var Camera = mongoose.Schema({
	area: Number,
	one_way: Boolean,
    active: Boolean,
	width: Number,
	angle_x: Number,
	angle_z: Number,
	fov: Number,
	stream_id: String,
	road: [LatLon]
},{ _id : false });



var TrafficPoleSchema = new mongoose.Schema({
	_id: schemaTypes.ObjectId,
	pole_id: Number,
	lat: Number,
	lon: Number,
	height: Number,
	pole_angle: Number,
	name: String,
	width: Number,
	type: Boolean,
	cameras: [Camera]
});

module.exports = mongoose.model('traffic_pole', TrafficPoleSchema);