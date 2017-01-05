var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var schemaTypes = mongoose.Schema.Types;

var CellSchema = new mongoose.Schema({
  _id: schemaTypes.ObjectId,
  numSegment: Number,
  segments: [ schemaTypes.Long
  			],
  cell_id: Number
});

module.exports = mongoose.model('cell', CellSchema);