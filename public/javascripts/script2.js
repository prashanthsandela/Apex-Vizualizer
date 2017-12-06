// Don't change any properties bolow this
var canvas_height = function() { return $(window).height(); }
var canvas_width = function() { return $('body').width(); }
var canvas_id = "myCanvas";
var refresh_secs = 2;
var heartbeats = {};
var app_id = "";
var app_user = "";
var apps = {};
var yarn_url = "";

// Method from http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
function GetURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}

// Method from  https://stackoverflow.com/questions/1090948/change-url-parameters
function replaceQueryParam(param, newval, search) {
    var regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?");
    var query = search.replace(regex, "$1").replace(/&$/, '');

    return (query.length > 2 ? query + "&" : "?") + (newval ? param + "=" + newval : '');
}

// Get arguments
var param_app_id = GetURLParameter('app_id');
var param_env = GetURLParameter('env');

if( param_app_id != undefined && param_app_id != "" && param_app_id != null) {
  $('#search').val(param_app_id);
  if (param_env != undefined && param_env != null && param_env != null) {
    $('#app_env').val(param_env)
  }
  get_app_details(param_app_id);
}

$(window).resize(function(){
 // Add canvas div tag
 $("#" + canvas_id).remove();
 add_canvas();
});

$("body").mousemove(function(event) {
// console.log("Cursor position: " + event.pageX + ", " + event.pageY);
});

function add_canvas() {
// $("body").append("<svg id='" + canvas_id + "' width='" + canvas_width() + "' height='" + canvas_height() + "'></svg>");
 $(".live_map").css('height', canvas_height());
 $(".live_map svg").attr("width", canvas_width());

}

add_canvas();

function parse_data(data) {
 var operators = {};
 for(var i = 0; i < data.operators.length; i++) {
  operators[data.operators[i].id] = data.operators[i];
 }
 var workers = {};
 for(var i = 0; i < data.streams.length; i++) {
  for(var j = 0; j < data.streams[i].sinks.length; j++) {
   var operator = operators[data.streams[i].sinks[j].operatorId]
   var src_operator = operators[data.streams[i].source.operatorId];

   var key = operator.id + '-'  + operator.name;
   if( !( key in workers )) {
    workers[key] = {
     "consumers" : 1,
     "count" : {
         "ttp" : operator.totalTuplesProcessed,
         "tte" : operator.totalTuplesEmitted,
         "ttps" : operator.tuplesProcessedPSMA,
         "ttes" : operator.tuplesEmittedPSMA
     },
     "inputThroughput": src_operator.tuplesEmittedPSMA,
     "inputQueue" : [src_operator.id + '-' + src_operator.name],
     "details" : operator
    };
   } else {
    workers[key].inputQueue.push(src_operator.id + '-' + src_operator.name);
   }
  }
 }

 // Add a start worker
 workers["0-Start"] = {
   "consumers" : 1,
   "count" : {
                "ttp" : 0,
                "tte" : 0,
                "ttps" : 0,
                "ttes" : 0
            },
   "inputThroughput": 0,
 }

 // Add missing nodes
 for ( var operator in operators) {
  var key = operators[operator].id + '-' + operators[operator].name;
  if ( !(key in workers) ) {
   workers[key] = {
    "consumers" : 1,
    "count" : {
                    "ttp" : operators[operator].totalTuplesProcessed,
                    "tte" : operators[operator].totalTuplesEmitted,
                    "ttps" : operators[operator].tuplesProcessedPSMA,
                    "ttes" : operators[operator].tuplesEmittedPSMA
                },
    "inputThroughput": 0,
    "details" : operators[operator],
    "inputQueue" : ["0-Start"]
   }
  }
 }

 return workers;
}

function create_graph(data) {
 var workers = parse_data(data);

   // Set up zoom support
   var svg = d3.select("svg"),
   inner = svg.select("g"),
       render = new dagreD3.render();

   // Left-to-right layout
   var g = new dagreD3.graphlib.Graph();
   g.setGraph({
     nodesep: 70,
     ranksep: 50,
     rankdir: "TD",
     marginx: 100,
     marginy: 20
   });

   function draw(isUpdate) {
     for (var id in workers) {
       var worker = workers[id];
       var className = worker.consumers ? "running" : "stopped";
       if (worker.count > 10000) {
         className += " warn";
       }
       var html = "<div>";
       html += "<span class=status></span>";
       html += "<span class=name>"+id+"</span>";
       html += "<span class=queue><span class=counter>" +
         "<span class='orange' title='Total Tuples Processed'>TP:</span> "+worker.count.ttp+"" +
         "&nbsp;&nbsp;<span class='orange' title='Total Tuples Emitted'>TE: </span>"+worker.count.tte+"" +
      "</span>";
       html += "</div>";
       g.setNode(id, {
         labelType: "html",
         label: html,
         rx: 5,
         ry: 5,
         padding: 0,
         height: 45,
         class: className
       });

       if (worker.inputQueue) {
         worker.inputQueue.forEach( function(s) {
           g.setEdge(s, id, {
             label: worker.inputThroughput + "/s",
                 width: 40
               });
             });
       }
     }

     inner.call(render, g);

   }
   draw();

}

function stats_table(data) {
    data = data;
    $("#stats_table").find(".apps").remove();
    for(x in data['operators']) {
        x = data['operators'][x];
        var d = new Date(0);
        var heartbeats_mc = 0;
        d.setUTCMilliseconds(x['lastHeartbeat']);
        var heartbeats_id = x['id'] + "-" + x['container'];

        if( heartbeats[heartbeats_id] == undefined ) {
            heartbeat_mc = x['lastHeartbeat'] - x['container'];
            heartbeats[heartbeats_id] = {
                    "ms" : x['lastHeartbeat'],
                    "factor" : 0
                };
        } else if ( heartbeats[heartbeats_id] == x['lastHeartbeat']) {
            heartbeats[heartbeats_id]["factor"] += refresh_secs;
            heartbeats_mc = heartbeats[heartbeats_id]["factor"];
        } else {
            heartbeats_mc = x['lastHeartbeat'] - heartbeats[heartbeats_id]["ms"];
            heartbeats[heartbeats_id] =  {
                    "ms" : x['lastHeartbeat'],
                    "factor" : 0
                };
        }

        var warning_class = "";

        if ( x['latencyMA'] >= 15000
                || heartbeats_mc >= 15000
                || x['cpuPercentageMA'] > 90) {
            warning_class = "table-danger"
        } else if ( x['latencyMA'] >= 7000
                || heartbeats_mc >= 10000
                || x['cpuPercentageMA'] > 80) {
            warning_class = "table-warning"
        }

        $("#stats_table").append(function() {
            $(this).css("display", "block");
            return "<tr class='apps " + warning_class +"'>" +
                    "<td>" + x['id'] + "-" + x['name'] +"</td>" +
                    "<td>" + x['totalTuplesProcessed'] +"</td>" +
                    "<td>" + x['totalTuplesEmitted'] +"</td>" +
                    "<td>" + x['tuplesProcessedPSMA'] +"</td>" +
                    "<td>" + x['tuplesEmittedPSMA'] +"</td>" +
                    "<td>" +
                        parseFloat(Math.round(x['cpuPercentageMA'] * 100) / 100).toFixed(2) + "%" +
                    "</td>" +
                    "<td>" + x['latencyMA'] +"</td>" +
                    "<td>" + x['status'] +"</td>" +
                    "<td>" + format_date(d)  +"</td>" +
                    "<td>" + heartbeats_mc/1000 + "</td>" +
                    "<td><a href='http://" + x['host'].replace(/:.*/,"") + ":8042/node/containerlogs/" + x['container'] + "/" + app_user + "' " +
                    " target='_blank'> Logs </a></td>" +
                    "</tr>";
                    ;
        });
    }

}

function format_date(d) {
    return ((d.getMonth()+1) <= 9 ? "0" + (d.getMonth()+1) : (d.getMonth()+1)) +'-'+
            (d.getDate() <= 9 ? "0" + d.getDate() : d.getDate()) +'-'+
            d.getFullYear()+' '+
            (d.getHours() <= 9 ? "0" + d.getHours() : d.getHours()) +'-'+
            (d.getMinutes() <= 9 ? "0" + d.getMinutes() : d.getMinutes()) +'-'+
            (d.getSeconds() <= 9 ? "0" + d.getSeconds() : d.getSeconds());
}

var app_data_name = {};
var app_data_id = {};
var refreshGraph;
var app_physical_plan = [];


// Get chosen app details
function refresh_app_data(curr_app_id) {
    $("#loading_img").css("display", "block");
    var tmp_app_id =  "";

    if ( curr_app_id != undefined ) {
      tmp_app_id = curr_app_id;
    } else {
      tmp_app_id = app_data_name[$('#search').val()];
    }


    // New application
    if ( app_id != tmp_app_id || app_user == "") {
      extract_app_details(tmp_app_id);
      app_id = tmp_app_id;
      $('.app_name').html($('#search').val());
      $('.app_physical_plan a').prop("href", "app_data?app_id=" + tmp_app_id);
    }

    $.get('app_data?app_id=' + tmp_app_id + "&env=" + $("#app_env").val(), function(data) {
        stats_table(data);
        create_graph(data);
        $('.all_running_apps').css('display', 'none');
        $('.app_details').css('display', 'block');
        $("#loading_img").css("display", "none");
    }).fail(function() {

    });
}

// Extract application details like user, yarn_url. This is helpful in viewing container logs.
function extract_app_details(app_id) {
 $.get('app_details?app_id=' + app_id + "&env=" + $("#app_env").val(), function(data) {
  app_user = data['user'];
  yarn_url = data['yarn_url'];
  $('.app_stram a').prop("href", yarn_url + "/cluster/app/" + app_id);
 });
}

function get_app_details(curr_app_id) {

  if(curr_app_id == undefined) {
    $('#search').val(app_data_name[$('#search').val()]);
  }

  if( $('#search').val() == '' ) {
    alert("Invalid application name");
    clearTimeout(refreshGraph);
    return false;
  }

  refresh_app_data(curr_app_id);
  clearTimeout(refreshGraph);
  refreshGraph = setTimeout(function() {
  get_app_details(curr_app_id);
  }, refresh_secs * 1000);

  return false;
}

function fill_running_apps(data) {
  var yarn_url = data.yarn_url;
  var data = data.apps.app;
  var html = "<span>All running apps in env: " + $("#app_env").val() + "</span>"
  html += "<table class='table table-bordered table-sm display_tables' id='running_apps_table'>";
  html += "<thead class='thead-default'>";
  html += "<tr>";
  html += "<th>Application id</th>";
  html += "<th>Application name</th>";
  html += "<th>Start time</th>";
  html += "<th>Elapsed time</th>";
  html += "<th>Allocated MB</th>";
  html += "<th>AllocatedVCores</th>";
  html += "<th>Running containers</th>";
  html += "<th>Stram</th>";
  html += "</tr>";
  html += "</thead>";

  for(var i = 0; i < data.length; i++) {
    html += "<tr>";
    html += "<td><a href='?app_id=" + data[i].id + "&env=" + $("#app_env").val() + "'>" + data[i].id + "</a></td>";
    html += "<td>" + data[i].name + "</td>";
    html += "<td>" + format_date(new Date(data[i].startedTime)) + "</td>";
    html += "<td>" + data[i].elapsedTime + "</td>";
    html += "<td>" + data[i].allocatedMB + "</td>";
    html += "<td>" + data[i].allocatedVCores + "</td>";
    html += "<td>" + data[i].runningContainers + "</td>";
    html += "<td><a href='" + yarn_url + "/cluster/app/" + data[i].id + "' target='_blank'>Stram</a></td>";
    html += "</tr>";
  }

  html += "</table>"

  html += "</table>";
  $(".all_running_apps").html(html);
}
// Get app names
var get_all_apps = function() {

  $.get("all_apps" + "?env=" + $("#app_env").val(), function(data, status) {
    fill_running_apps(data);

   $('#search').typeahead({
     hint: true,
     highlight: true,
     minLength: 1
   },
   {
     name: 'data',
     source: substringMatcher(data)
   });
    app_data_name = [];
    app_data_id = [];
   $.each(data.apps.app, function (i, str) {
    app_data_name[str.name] = str.id;
    app_data_id[str.id] = str.name;
   });

   // Add app name
   if ( $('#search').val() != "") {
      $('.app_name').html(app_data_id[$('#search').val()]);
      $('#search').val(app_data_id[$('#search').val()]);
   }

  });
}

get_all_apps();

$("#app_env").on("change", function() {
  get_all_apps();
});

var substringMatcher = function(strs) {
   return function findMatches(q, cb) {
     var matches, substringRegex;

     // an array that will be populated with substring matches
     matches = [];

     // regex used to determine if a string contains the substring `q`
     substrRegex = new RegExp(q, 'i');

     // iterate through the pool of strings and for any string that
     // contains the substring `q`, add it to the `matches` array
     $.each(strs.apps.app, function(i, str) {
       if (substrRegex.test(str.name)) {
         matches.push(str.name);
       }
     });

     cb(matches);
   };
 };
