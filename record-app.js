// LOAD CONFIG
var config = require('./configuration.js');
var dbConfig = config.DbConfig;

// IMPORT SERVICES
var cameraDensityRecord = require('./utils/camera-density-record');
var segmentDensityRecord = require('./utils/segment-density-record');

// CONNECT TO DATABASE ---------------------------
var mongoose = require('mongoose')
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.DbType + "://" + dbConfig.HostName + "/" + dbConfig.DbName)
  .then(() => console.log('connection successful!'))
  .catch((err) => console.error(err))
// CONNECT TO DATABASE (END) ---------------------


// CREATE RECORD SERVICE
if (dbConfig.RecordHistory === true) {
    cameraDensityRecord.StartRecordCamerasDensity();
    segmentDensityRecord.StartRecordSegmentsDensity();
}
