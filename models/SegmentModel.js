var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var schemaTypes = mongoose.Schema.Types;

var SegmentSchema = new mongoose.Schema({
  _id: schemaTypes.ObjectId,
  cells: [Number],
  node_end: Number,
  node_start: Number,
  density_ste: Number,
  numCell: Number,
  segment_id: schemaTypes.Long,
  timestamp: Number,
  velocity_ste: Number,
  density_ets: Number,
  velocity_ets: Number
});

module.exports = mongoose.model('segment', SegmentSchema);