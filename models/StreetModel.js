var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var schemaTypes = mongoose.Schema.Types;

var StreetSchema = new mongoose.Schema({
  _id: schemaTypes.ObjectId,
  numSegment: Number,
  segments: [schemaTypes.Long
  			],
  type: String,
  nextSegment: Number,
  street_id: Number,
  name: String
});

module.exports = mongoose.model('street', StreetSchema);