var express = require('express');
var router = express.Router();

/* GET /segments/ */
router.get('/', function(req, res, next){
	Segments.find(function(err, allSegments){
		if (err) return next(err);
		console.log(Segments);
		res.json(allSegments);
	});
});

/* GET  /segments/id */
router.get('/:id', function(req, res, next){
	console.log(req.params.id);
  Segments.find(req.params.id, function(err, post){
  	if (err) return next(err);
  	res.json(post);
  });
});
 
module.exports = router;