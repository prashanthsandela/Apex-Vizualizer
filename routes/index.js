var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/app_data', function (req, res) {
	res.send(req.body)
	fs = require('fs');
	fs.writeFile('application_data/text.txt', "This is new data", function (err) {
		  if (err) return console.log(err);
		  console.log('Error writing to file');
		});
})

module.exports = router;
