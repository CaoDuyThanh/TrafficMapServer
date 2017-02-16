var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var schemaTypes = mongoose.Schema.Types;

var HistorySchema = new mongoose.Schema({
	timestamp: Number,
	density: Number,
	velocity: Number
},{ _id : false });

var SegmentDensitySchema = new mongoose.Schema({
	_id: schemaTypes.ObjectId,
	segment_id: Number,
	density: Number,
	velocity: Number,
	history: [HistorySchema]
});

SegmentDensitySchema.index({ segment_id: 1 }, {unique: true});

module.exports = mongoose.model('segment_density', SegmentDensitySchema);
