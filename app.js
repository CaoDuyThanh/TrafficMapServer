// LOAD CONFIG
var config = require('./configuration.js');
var dbConfig = config.DbConfig;

// IMPORT LIBRARY
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// UTILITIES
var cellHandler = require('./utils/CellHandler');
var nodeHandler = require('./utils/NodeHandler');
var segmentHandler = require('./utils/SegmentHandler');
var streetHandler = require('./utils/StreetHandler');

// IMPORT ROUTES ----------------------------
var index = require('./routes/index');
var segments = require('./routes/segments');
var density = require('./routes/density');
var simulation = require('./routes/simulation');
var app = express();
// IMPORT ROUTES (END) ----------------------

// VIEW ENGINE SETUP
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// DON'T CHANGE THESE LINES IF YOU DON'T KNOW WHAT IS GOING ON
// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// SETTING ROUTES ------------------------------
app.use('/', index);
app.use('/segments', segments);
app.use('/density', density);
app.use('/simulation', simulation);
// SETTING ROUTES (END) ------------------------

// SPECIAL CASE - ERROR 404 HANDLER
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// ERROR HANDLER
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// CONNECT TO DATABASE ---------------------------
var mongoose = require('mongoose')
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.DbType + "://" + dbConfig.HostName + "/" + dbConfig.DbName)
  .then(() => console.log('connection successful!'))
  .catch((err) => console.error(err))
// CONNECT TO DATABASE (END) ---------------------

// LOAD DATABASE ---------------------------------

// LOAD CELL FROM DATABASE
cellHandler.LoadCells();

// LOAD NODE FROM DATABASE
nodeHandler.LoadNodes();

// LOAD CURRENT SEGMENT FROM DATABASE
segmentHandler.LoadSegment();
if (dbConfig.RecordHistory == true){
  segmentHandler.StartRecordSegment();
}

// LOAD STREET FROM DATABASE
streetHandler.LoadStreets();

// LOAD DATABASE (END) ---------------------------


module.exports = app;