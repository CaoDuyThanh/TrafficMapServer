var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var schemaTypes = mongoose.Schema.Types;

var NodeSchema = new mongoose.Schema({
  _id: schemaTypes.ObjectId,
  node_id: Number,
  lon: Number,
  lat: Number
});

module.exports = mongoose.model('node', NodeSchema);