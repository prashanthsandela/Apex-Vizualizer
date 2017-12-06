var express = require('express');
var router = express.Router();
var config = require('config');
var https = require("https");
var axios = require("axios");

var httpsAgentOptions = { rejectUnauthorized: false };

// Extracts environment value either from request or loads default
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

// Gets yarn url based on the environment
var get_yarn_url = function(env) {
 if (!env) {
   env = config.get('env').get(config.get('env').default);
 } else {
   env = config.get('env').get(env);
 }
 return env.yarn_url;
};

// Route
router.get('/', function (req, res) {
 res.render('index', {
   title : 'Apex Visualizer',
   envs : env()
 });
});

// Formats all the error messages.
var error_json = function(error) {
  return { "error" : error }
};

// Gets html data and sends the response.
var send_response = function (url, res, fun) {
  axios.get(url,{
      httpsAgent: new https.Agent(httpsAgentOptions)
  }).then(function (response) {
    res.status(200).send(fun(response));
  }).catch(function (error) {
    console.log("Error: " + error);
    if (error.response) {
      res.status(500).send(error_json(error.response.data));
    } else {
      res.status(500).send(error_json(error));
    }
  });
};

// Get application details like app user and yarn_url
router.get('/app_details', function(req, res, next) {

 if (!req.query.app_id) {
   return res.status(400).send(error_json('Require App Id'));
 }

 var yarn_url = get_yarn_url(req.query.env);
 var url = yarn_url + "/ws/v1/cluster/apps/" + req.query.app_id;
 send_response(url, res, function(response) {
   return {
     "user" : response.data.app['user'],
     "yarn_url" : yarn_url
   };
 });

});

// Get application physical plan
router.get('/app_data', function(req, res) {
 if (!req.query.app_id) {
   return res.status(400).send(error_json('Require App Id'));
 }
 var app_id = req.query.app_id;
 var url = get_yarn_url(req.query.env) + "/proxy/" + app_id + "/ws/v2/stram/physicalPlan";
 send_response(url, res, function(response) {
   return response.data;
 });
});

// Get all running app names
router.get("/all_apps", function(req, res) {
  var yarn_url = get_yarn_url(req.query.env);
 var url = get_yarn_url(req.query.env) + "/ws/v1/cluster/apps?states=RUNNING&applicationTypes=ApacheApex";
 send_response(url, res, function(response) {
   response.data.yarn_url = yarn_url;
   return response.data;
   // var data = response.data.apps.app;
   // var return_data = [];
   //
   // if (data.apps !== null) {
   //   for (var i = 0; i < data.length; i++) {
   //     return_data.push({
   //       'id' : data[i].id,
   //       'name' : data[i].name,
   //       'start_time' : data[i].startedTime
   //     });
   //   }
   //   return return_data;
   // } else {
   //   return {};
   // }
 });
});

module.exports = router;
