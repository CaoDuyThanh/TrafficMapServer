var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var schemaTypes = mongoose.Schema.Types;

var SegmentHistorySchema = new mongoose.Schema({
  _id: schemaTypes.ObjectId,
  segment_id: schemaTypes.Long,
  density_ste: [schemaTypes.Mixed],
  velocity_ste: [schemaTypes.Mixed],
  density_ets: [schemaTypes.Mixed],
  velocity_ets: [schemaTypes.Mixed]
});

module.exports = mongoose.model('segment_history', SegmentHistorySchema);