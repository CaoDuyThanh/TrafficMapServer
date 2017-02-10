var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var schemaTypes = mongoose.Schema.Types;

var SegmentSchema = new mongoose.Schema({
    _id: schemaTypes.ObjectId,
    segment_id: schemaTypes.Long,
    node_end: Number,
    node_start: Number,
    street_id: Number,
    num_cell: Number,  
    cells: [Number],
    timestamp: Number,
    density: Number,
    velocity: Number  
});

module.exports = mongoose.model('segment', SegmentSchema);