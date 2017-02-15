var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var schemaTypes = mongoose.Schema.Types;

var HistorySchema = new mongoose.Schema({
	timestamp: Number,
	density: Number
},{ _id : false });


var CameraDensitySchema = new mongoose.Schema({
	_id: schemaTypes.ObjectId,
	pole_id: Number,
	stream_id: String,
	density: Number,
	history: [HistorySchema]
});

module.exports = mongoose.model('camera_density', CameraDensitySchema);
