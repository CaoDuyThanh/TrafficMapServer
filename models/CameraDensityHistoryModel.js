var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var schemaTypes = mongoose.Schema.Types;

var CameraDensityHistorySchema = new mongoose.Schema({
	_id: schemaTypes.ObjectId,
	pole_id: Number,
	stream_id: String,
	density: [schemaTypes.Mixed]
});

module.exports = mongoose.model('camera_density', CameraDensityHistorySchema);
