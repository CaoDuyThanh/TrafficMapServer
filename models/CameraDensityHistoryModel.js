var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var schemaTypes = mongoose.Schema.Types;

var CameraDensityHistorySchema = new mongoose.Schema({
	_id: schemaTypes.ObjectId,
	pole_id: Number,
	stream_id: String,
	density: [schemaTypes.Mixed]
});

CameraDensityHistorySchema.index({ pole_id: 1, stream_id: 1}, {unique: true});

module.exports = mongoose.model('camera_density_history', CameraDensityHistorySchema);
