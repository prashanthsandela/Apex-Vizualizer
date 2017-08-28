var express = require('express');
var router = express.Router();
var config = require('config');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title : 'Express'
	});
});

router.get('/app_data', function(req, res) {
	try {
		if ( req.method === 'GET' && req.query.app_id != 'undefined' ) {
			var app_id = req.query.app_id;
			var http = require("http");
			var url = config.get("yarn_url")
					+ "/proxy/" + app_id + "/ws/v2/stram/physicalPlan";
			var request = http.get(url, function(response) {
				var buffer = "", data;

				response.on("data", function(chunk) {
					buffer += chunk;
				});

				response.on("end", function(err) {
					data = JSON.parse(buffer);
					res.send(data)
				});
			});
		} else {
			console.log({"error" : "Invalid request type " + req.method})
			res.send({"error" : "Invalid request type " + req.method})
		}
	}
	catch (e) {
		console.log("Unable to fetch data from " + url + "; Error: " + e);
		res.send({"error" : "Unable to fetch data from " + url + "; Error: " + e});
	}
	
});

// Get all running app names
router.get("/all_apps", function(req, res) {
	var http = require("http");
	var url = config.get("yarn_url") + "/ws/v1/cluster/apps?states=RUNNING";
	var request = http.get(url, function(response) {
		var buffer = "", data;

		response.on("data", function(chunk) {
			buffer += chunk;
		});

		response.on("end", function(err) {
			try {
				data = JSON.parse(buffer);
				var return_data = [];
		
				if (data.apps !== null) {
					for (var i = 0; i < data.apps.app.length; i++) {
						return_data.push({
							'id' : data.apps.app[i].id,
							'name' : data.apps.app[i].name });
					}
					res.send(return_data);
				} else {
					res.send({});
				}
			} catch (e) {
				console.log("Unable to fetch data from " + url + "; Error: " + e);
				res.send({"error" : "Unable to fetch data from " + url + "; Error: " + e});
			}

		});
	}).on("error", function(e) {
		console.log("Invalid response for url : " + url);
		res.send({"error" : "Invalid response for url: " + url});
	});

});

module.exports = router;
