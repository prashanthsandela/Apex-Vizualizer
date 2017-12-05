var express = require('express');
var router = express.Router();
var config = require('config');
var http = require("http");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var env = function() {
    var env = config.get("env");
    var default_env = env.default;
    var envs = [];
    envs.push(default_env);
    for( var x in env) {
      if ( x != "default" && x != default_env ) {
        envs.push(x);
      }
    }

    return envs;
};

var get_yarn_url = function(env) {

  if (env == undefined ) {
    env = config.get('env').get(config.get('env').default);
  } else {
    env = config.get('env').get(env);
  }

  if (env.yarn_url.match(/^https:/g)) {
      http = require("https")
  } else {
      http = require("http")
  }

  return env.yarn_url;
};

var err = function(e) {
  console.log("Error: " + e);
  return {"error" : e};
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title : 'Apex Visualizer',
    envs : env()
  });
});

router.get('/app_details', function(req, res) {
    if ( req.method === 'GET' && req.query.app_id != undefined ) {
      var yarn_url = get_yarn_url(req.query.env);
      var url =  yarn_url + "/ws/v1/cluster/apps/" + req.query.app_id;
      http.get(url, function(response) {
        try {
            var buffer = "", data;
                response.on("data", function(chunk) {
                    buffer += chunk;
                });

                response.on("end", function(err) {
                  var data = JSON.parse(buffer);
                  try {
                    res.send( {
                      "user" : data.app['user'],
                      "yarn_url" : yarn_url
                    });
                  } catch(e) {
                    console.log("Unable to fetch data from " + url + "; Error: " + e);
                    res.send({"error" : "Unable to fetch data from " + url + "; Error: " + e});
                  }

                });
        }
        catch (e) {
            console.log("Unable to fetch data from " + url + "; Error: " + e);
            res.send({"error" : "Unable to fetch data from " + url + "; Error: " + e});
        }
    }).on("error", function(error) {
      res.send(err(error));
    });
    }
});

router.get('/app_data', function(req, res) {
  try {
    if ( req.method === 'GET' && req.query.app_id != 'undefined' ) {
      var app_id = req.query.app_id;
      var url = get_yarn_url(req.query.env) + "/proxy/" + app_id + "/ws/v2/stram/physicalPlan";
      var request = http.get(url, function(response) {
          try {
              var buffer = "", data;

                  response.on("data", function(chunk) {
                      buffer += chunk;
                  });

                  response.on("end", function(err) {
                      try {
                          data = JSON.parse(buffer);
                          res.send(data)
                      } catch(e) {
                          console.log("Unable to fetch data from " + url + "; Error: " + e);
                          res.send({"error" : "Unable to fetch data from " + url + "; Error: " + e});
                      }

                  });


          }
          catch (e) {
              console.log("Unable to fetch data from " + url + "; Error: " + e);
              res.send({"error" : "Unable to fetch data from " + url + "; Error: " + e});
          }

      }).on("error", function(error) {
        res.send(err(error));
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
  var url = get_yarn_url(req.query.env) + "/ws/v1/cluster/apps?states=RUNNING&applicationTypes=ApacheApex";
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
    console.log("Invalid response for url : " + url + "; Error: " + e);
    res.send({"error" : "Invalid response for url: " + url});
  });

});

module.exports = router;
