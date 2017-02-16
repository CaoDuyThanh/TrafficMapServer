var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var schemaTypes = mongoose.Schema.Types;

var SegmentDensityHistorySchema = new mongoose.Schema({
	_id: schemaTypes.ObjectId,
	segment_id: schemaTypes.Long,
	density: [schemaTypes.Mixed],
	velocity: [schemaTypes.Mixed],
});

SegmentDensityHistorySchema.index({ segment_id: 1 }, {unique: true});

module.exports = mongoose.model('segment_density_history', SegmentDensityHistorySchema);