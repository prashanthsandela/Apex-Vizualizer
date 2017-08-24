// Don't change any properties bolow this
var canvas_height = function() { return $(window).height(); }
var canvas_width = function() { return $('body').width(); }
var canvas_id = "myCanvas";

console.log(" Window has been resized to : " + $(window).width() + " X " + $(window).height());
$(window).resize(function(){
	console.log(" Window has been resized to : " + $(window).width() + " X " + $(window).height());

//	// Calculate new canvas boundaries
//	canvas_height = $('body').height();
//	canvas_width = $('body').width();
	
	// Add canvas div tag
	$("#" + canvas_id).remove();
	add_canvas();
});

$("body").mousemove(function(event) {
//	console.log("Cursor position: " + event.pageX + ", " + event.pageY);
});

function add_canvas() {
//	$("body").append("<svg id='" + canvas_id + "' width='" + canvas_width() + "' height='" + canvas_height() + "'></svg>");
	$(".live_map").css('height', canvas_height());
	$(".live_map svg").attr("width", canvas_width());
	
}

add_canvas();

function parse_data() {
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
					"count" : operator.totalTuplesProcessed,
					"inputThroughput": 50,
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
			"count" : 0,
			"inputThroughput": 50,
	}
	
	// Add missing nodes
	for ( var operator in operators) {
		var key = operators[operator].id + '-' + operators[operator].name;
		if ( !(key in workers) ) {
			workers[key] = {
				"consumers" : 1,
				"count" : operators[operator].totalTuplesProcessed,
				"inputThroughput": 50,
				"details" : operators[operator],
				"inputQueue" : ["0-Start"]
			}
		}
	}
	
	return workers;
}

function process() {
	var workers = parse_data();

	  // Set up zoom support
	  var svg = d3.select("svg"),
	  inner = svg.select("g"),
	      render = new dagreD3.render();
	
	  // Left-to-right layout
	  var g = new dagreD3.graphlib.Graph();
	  g.setGraph({
	    nodesep: 7,
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
	  html += "<span class=queue><span class=counter>"+worker.count+"</span></span>";
	  html += "</div>";
	  g.setNode(id, {
	    labelType: "html",
	    label: html,
	    rx: 5,
	    ry: 5,
	    padding: 0,
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

			  // Do some mock queue status updates
//			  setInterval(function() {
//			    var stoppedWorker1Count = workers["elasticsearch-writer"].count;
//			    var stoppedWorker2Count = workers["meta-enricher"].count;
//			    for (var id in workers) {
//			      workers[id].count = Math.ceil(Math.random() * 3);
//			      if (workers[id].inputThroughput) workers[id].inputThroughput = Math.ceil(Math.random() * 250);
//			    }
//			    workers["elasticsearch-writer"].count = stoppedWorker1Count + Math.ceil(Math.random() * 100);
//			    workers["meta-enricher"].count = stoppedWorker2Count + Math.ceil(Math.random() * 100);
//			    draw(true);
//			  }, 1000);
//
//			  // Do a mock change of worker configuration
//			  setInterval(function() {
//			    workers["elasticsearch-monitor"] = {
//			      "consumers": 0,
//			      "count": 0,
//			      "inputQueue": ["elasticsearch-writer"],
//			      "inputThroughput": 50
//			    }
//			  }, 5000);

			  draw();
}

var data =  {
		  "streams": [{
			    "logicalName": "randomData",
			    "source": {
			      "operatorId": "1",
			      "portName": "out"
			    },
			    "sinks": [{
			      "operatorId": "2",
			      "portName": "input"
			    }],
			    "locality": "CONTAINER_LOCAL"
			  }],
			  "operators": [
			    {
			      "id": "1",
			      "name": "randomGenerator",
			      "className": "com.example.myapexapp.RandomNumberGenerator",
			      "container": "container_1503559012660_0001_01_000002",
			      "host": "quickstart.cloudera:53884",
			      "totalTuplesProcessed": "0",
			      "totalTuplesEmitted": "4032025",
			      "tuplesProcessedPSMA": "0",
			      "tuplesEmittedPSMA": "1998",
			      "cpuPercentageMA": "0.15172656609051854",
			      "latencyMA": "0",
			      "status": "ACTIVE",
			      "lastHeartbeat": "1503566336429",
			      "failureCount": "0",
			      "recoveryWindowId": "6457759530292875187",
			      "currentWindowId": "6457759530292875225",
			      "ports": [{
			        "name": "out",
			        "type": "output",
			        "totalTuples": "4032025",
			        "tuplesPSMA": "1998",
			        "bufferServerBytesPSMA": "0",
			        "queueSizeMA": "0",
			        "recordingId": null
			      }],
			      "unifierClass": null,
			      "logicalName": "randomGenerator",
			      "recordingId": null,
			      "counters": null,
			      "metrics": {},
			      "checkpointStartTime": "1503566317397",
			      "checkpointTime": "16",
			      "checkpointTimeMA": "17"
			    },
			    {
			      "id": "2",
			      "name": "console",
			      "className": "com.datatorrent.lib.io.ConsoleOutputOperator",
			      "container": "container_1503559012660_0001_01_000002",
			      "host": "quickstart.cloudera:53884",
			      "totalTuplesProcessed": "4032025",
			      "totalTuplesEmitted": "0",
			      "tuplesProcessedPSMA": "1996",
			      "tuplesEmittedPSMA": "0",
			      "cpuPercentageMA": "0.6623600119784387",
			      "latencyMA": "4",
			      "status": "ACTIVE",
			      "lastHeartbeat": "1503566336429",
			      "failureCount": "0",
			      "recoveryWindowId": "6457759530292875187",
			      "currentWindowId": "6457759530292875225",
			      "ports": [{
			        "name": "input",
			        "type": "input",
			        "totalTuples": "4032025",
			        "tuplesPSMA": "1996",
			        "bufferServerBytesPSMA": "0",
			        "queueSizeMA": "1001",
			        "recordingId": null
			      }],
			      "unifierClass": null,
			      "logicalName": "console",
			      "recordingId": null,
			      "counters": null,
			      "metrics": {},
			      "checkpointStartTime": "0",
			      "checkpointTime": "0",
			      "checkpointTimeMA": "0"
			    }
			  ]
			};
process();

