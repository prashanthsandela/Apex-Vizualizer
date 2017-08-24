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
		  "streams": [
			    {
			      "logicalName": "recieveFromKafka",
			      "source": {
			        "operatorId": "1",
			        "portName": "outputPort"
			      },
			      "sinks": [
			        {
			          "operatorId": "4",
			          "portName": "<merge#outputPort>(1.outputPort)"
			        }
			      ],
			      "locality": null
			    },
			    {
			      "logicalName": "recieveFromKafka",
			      "source": {
			        "operatorId": "2",
			        "portName": "outputPort"
			      },
			      "sinks": [
			        {
			          "operatorId": "4",
			          "portName": "<merge#outputPort>(1.outputPort)"
			        }
			      ],
			      "locality": null
			    },
			    {
			      "logicalName": "recieveFromKafka",
			      "source": {
			        "operatorId": "4",
			        "portName": "outputPort"
			      },
			      "sinks": [
			        {
			          "operatorId": "3",
			          "portName": "<merge#outputPort>(1.outputPort)"
			        }
			      ],
			      "locality": null
			    },
			    {
			      "logicalName": "uniqueMessage",
			      "source": {
			        "operatorId": "3",
			        "portName": "outputPort"
			      },
			      "sinks": [
			        {
			          "operatorId": "5",
			          "portName": "inputPort"
			        }
			      ],
			      "locality": null
			    },
			    {
			      "logicalName": "processHdfsAttributes",
			      "source": {
			        "operatorId": "5",
			        "portName": "outputPort"
			      },
			      "sinks": [
			        {
			          "operatorId": "6",
			          "portName": "inputPort"
			        }
			      ],
			      "locality": null
			    },
			    {
			      "logicalName": "saveErrorsToFile",
			      "source": {
			        "operatorId": "5",
			        "portName": "errorPort"
			      },
			      "sinks": [
			        {
			          "operatorId": "9",
			          "portName": "input"
			        }
			      ],
			      "locality": null
			    },
			    {
			      "logicalName": "sendToAccessCounter",
			      "source": {
			        "operatorId": "6",
			        "portName": "accessCountPort"
			      },
			      "sinks": [
			        {
			          "operatorId": "7",
			          "portName": "inputPort)"
			        }
			      ],
			      "locality": null
			    },
			    {
			      "logicalName": "sinkToHdfs",
			      "source": {
			        "operatorId": "7",
			        "portName": "outputPort"
			      },
			      "sinks": [
			        {
			          "operatorId": "8",
			          "portName": "input"
			        }
			      ],
			      "locality": null
			    }
			  ],
			  "operators": [
			    {
			      "id": "1",
			      "name": "logToJsonKafkaIn",
			      "className": "com.example.myapexapp.RandomNumberGenerator",
			      "container": "container_1503210674869_0002_01_000002",
			      "host": "quickstart.cloudera:36900",
			      "totalTuplesProcessed": "617022",
			      "totalTuplesEmitted": "0",
			      "tuplesProcessedPSMA": "0",
			      "tuplesEmittedPSMA": "2000",
			      "cpuPercentageMA": "0.08789582765203163",
			      "latencyMA": "0",
			      "status": "ACTIVE",
			      "lastHeartbeat": "1503292357878",
			      "failureCount": "0",
			      "recoveryWindowId": "6456590139547189847",
			      "currentWindowId": "6456590139547189887",
			      "ports": [
			        {
			          "name": "outputPort",
			          "type": "output",
			          "totalTuples": "617022",
			          "tuplesPSMA": "2000",
			          "bufferServerBytesPSMA": "0",
			          "queueSizeMA": "0",
			          "recordingId": null
			        }
			      ],
			      "unifierClass": null,
			      "logicalName": "logToJsonKafkaIn",
			      "recordingId": null,
			      "counters": null,
			      "metrics": {
			        "metrics" : {
			          "stats" : [{
			            "cluster" : "xyzlkjdf",
			            "msgsPerSec" : "0"
			          }]
			        }
			      },
			      "checkpointStartTime": "1503292337509",
			      "checkpointTime": "36",
			      "checkpointTimeMA": "43"
			    },
			    {
			      "id": "2",
			      "name": "logToJsonKafkaIn",
			      "className": "com.datatorrent.lib.io.ConsoleOutputOperator",
			      "container": "container_1503210674869_0002_01_000002",
			      "host": "quickstart.cloudera:36900",
			      "totalTuplesProcessed": "617022",
			      "totalTuplesEmitted": "0",
			      "tuplesProcessedPSMA": "2000",
			      "tuplesEmittedPSMA": "0",
			      "cpuPercentageMA": "0.5325968799999999",
			      "latencyMA": "6",
			      "status": "ACTIVE",
			      "lastHeartbeat": "1503292357878",
			      "failureCount": "0",
			      "recoveryWindowId": "6456590139547189847",
			      "currentWindowId": "6456590139547189887",
			      "ports": [
			        {
			          "name": "input",
			          "type": "input",
			          "totalTuples": "617022",
			          "tuplesPSMA": "2000",
			          "bufferServerBytesPSMA": "0",
			          "queueSizeMA": "1001",
			          "recordingId": null
			        }
			      ],
			      "unifierClass": null,
			      "logicalName": "console",
			      "recordingId": null,
			      "counters": null,
			      "metrics": {},
			      "checkpointStartTime": "0",
			      "checkpointTime": "0",
			      "checkpointTimeMA": "0"
			    },
			    {
			      "id": "4",
			      "name": "logToJsonKafkaIn.outputPort#unifier",
			      "className": "com.datatorrent.lib.io.ConsoleOutputOperator",
			      "container": "container_1503210674869_0002_01_000002",
			      "host": "quickstart.cloudera:36900",
			      "totalTuplesProcessed": "617022",
			      "totalTuplesEmitted": "0",
			      "tuplesProcessedPSMA": "2000",
			      "tuplesEmittedPSMA": "0",
			      "cpuPercentageMA": "0.5325968799999999",
			      "latencyMA": "6",
			      "status": "ACTIVE",
			      "lastHeartbeat": "1503292357878",
			      "failureCount": "0",
			      "recoveryWindowId": "6456590139547189847",
			      "currentWindowId": "6456590139547189887",
			      "ports": [
			        {
			          "name": "input",
			          "type": "input",
			          "totalTuples": "617022",
			          "tuplesPSMA": "2000",
			          "bufferServerBytesPSMA": "0",
			          "queueSizeMA": "1001",
			          "recordingId": null
			        }
			      ],
			      "unifierClass": null,
			      "logicalName": "console",
			      "recordingId": null,
			      "counters": null,
			      "metrics": {},
			      "checkpointStartTime": "0",
			      "checkpointTime": "0",
			      "checkpointTimeMA": "0"
			    },
			    {
			      "id": "3",
			      "name": "dedupOperator",
			      "className": "com.datatorrent.lib.io.ConsoleOutputOperator",
			      "container": "container_1503210674869_0002_01_000002",
			      "host": "quickstart.cloudera:36900",
			      "totalTuplesProcessed": "617022",
			      "totalTuplesEmitted": "0",
			      "tuplesProcessedPSMA": "2000",
			      "tuplesEmittedPSMA": "0",
			      "cpuPercentageMA": "0.5325968799999999",
			      "latencyMA": "6",
			      "status": "ACTIVE",
			      "lastHeartbeat": "1503292357878",
			      "failureCount": "0",
			      "recoveryWindowId": "6456590139547189847",
			      "currentWindowId": "6456590139547189887",
			      "ports": [
			        {
			          "name": "input",
			          "type": "input",
			          "totalTuples": "617022",
			          "tuplesPSMA": "2000",
			          "bufferServerBytesPSMA": "0",
			          "queueSizeMA": "1001",
			          "recordingId": null
			        }
			      ],
			      "unifierClass": null,
			      "logicalName": "console",
			      "recordingId": null,
			      "counters": null,
			      "metrics": {},
			      "checkpointStartTime": "0",
			      "checkpointTime": "0",
			      "checkpointTimeMA": "0"
			    },
			    {
			      "id": "5",
			      "name": "attrProcessorFinder",
			      "className": "com.datatorrent.lib.io.ConsoleOutputOperator",
			      "container": "container_1503210674869_0002_01_000002",
			      "host": "quickstart.cloudera:36900",
			      "totalTuplesProcessed": "617022",
			      "totalTuplesEmitted": "0",
			      "tuplesProcessedPSMA": "2000",
			      "tuplesEmittedPSMA": "0",
			      "cpuPercentageMA": "0.5325968799999999",
			      "latencyMA": "6",
			      "status": "ACTIVE",
			      "lastHeartbeat": "1503292357878",
			      "failureCount": "0",
			      "recoveryWindowId": "6456590139547189847",
			      "currentWindowId": "6456590139547189887",
			      "ports": [
			        {
			          "name": "input",
			          "type": "input",
			          "totalTuples": "617022",
			          "tuplesPSMA": "2000",
			          "bufferServerBytesPSMA": "0",
			          "queueSizeMA": "1001",
			          "recordingId": null
			        }
			      ],
			      "unifierClass": null,
			      "logicalName": "console",
			      "recordingId": null,
			      "counters": null,
			      "metrics": {},
			      "checkpointStartTime": "0",
			      "checkpointTime": "0",
			      "checkpointTimeMA": "0"
			    },
			    {
			      "id": "6",
			      "name": "hdfsAttrProcessor",
			      "className": "com.datatorrent.lib.io.ConsoleOutputOperator",
			      "container": "container_1503210674869_0002_01_000002",
			      "host": "quickstart.cloudera:36900",
			      "totalTuplesProcessed": "617022",
			      "totalTuplesEmitted": "0",
			      "tuplesProcessedPSMA": "2000",
			      "tuplesEmittedPSMA": "0",
			      "cpuPercentageMA": "0.5325968799999999",
			      "latencyMA": "6",
			      "status": "ACTIVE",
			      "lastHeartbeat": "1503292357878",
			      "failureCount": "0",
			      "recoveryWindowId": "6456590139547189847",
			      "currentWindowId": "6456590139547189887",
			      "ports": [
			        {
			          "name": "input",
			          "type": "input",
			          "totalTuples": "617022",
			          "tuplesPSMA": "2000",
			          "bufferServerBytesPSMA": "0",
			          "queueSizeMA": "1001",
			          "recordingId": null
			        }
			      ],
			      "unifierClass": null,
			      "logicalName": "console",
			      "recordingId": null,
			      "counters": null,
			      "metrics": {},
			      "checkpointStartTime": "0",
			      "checkpointTime": "0",
			      "checkpointTimeMA": "0"
			    },
			    {
			      "id": "7",
			      "name": "usageCountCalculator",
			      "className": "com.datatorrent.lib.io.ConsoleOutputOperator",
			      "container": "container_1503210674869_0002_01_000002",
			      "host": "quickstart.cloudera:36900",
			      "totalTuplesProcessed": "617022",
			      "totalTuplesEmitted": "0",
			      "tuplesProcessedPSMA": "2000",
			      "tuplesEmittedPSMA": "0",
			      "cpuPercentageMA": "0.5325968799999999",
			      "latencyMA": "6",
			      "status": "ACTIVE",
			      "lastHeartbeat": "1503292357878",
			      "failureCount": "0",
			      "recoveryWindowId": "6456590139547189847",
			      "currentWindowId": "6456590139547189887",
			      "ports": [
			        {
			          "name": "input",
			          "type": "input",
			          "totalTuples": "617022",
			          "tuplesPSMA": "2000",
			          "bufferServerBytesPSMA": "0",
			          "queueSizeMA": "1001",
			          "recordingId": null
			        }
			      ],
			      "unifierClass": null,
			      "logicalName": "console",
			      "recordingId": null,
			      "counters": null,
			      "metrics": {},
			      "checkpointStartTime": "0",
			      "checkpointTime": "0",
			      "checkpointTimeMA": "0"
			    },
			    {
			      "id": "8",
			      "name": "hdfsSink",
			      "className": "com.datatorrent.lib.io.ConsoleOutputOperator",
			      "container": "container_1503210674869_0002_01_000002",
			      "host": "quickstart.cloudera:36900",
			      "totalTuplesProcessed": "617022",
			      "totalTuplesEmitted": "0",
			      "tuplesProcessedPSMA": "2000",
			      "tuplesEmittedPSMA": "0",
			      "cpuPercentageMA": "0.5325968799999999",
			      "latencyMA": "6",
			      "status": "ACTIVE",
			      "lastHeartbeat": "1503292357878",
			      "failureCount": "0",
			      "recoveryWindowId": "6456590139547189847",
			      "currentWindowId": "6456590139547189887",
			      "ports": [
			        {
			          "name": "input",
			          "type": "input",
			          "totalTuples": "617022",
			          "tuplesPSMA": "2000",
			          "bufferServerBytesPSMA": "0",
			          "queueSizeMA": "1001",
			          "recordingId": null
			        }
			      ],
			      "unifierClass": null,
			      "logicalName": "console",
			      "recordingId": null,
			      "counters": null,
			      "metrics": {},
			      "checkpointStartTime": "0",
			      "checkpointTime": "0",
			      "checkpointTimeMA": "0"
			    },
			    {
			      "id": "9",
			      "name": "errorSink",
			      "className": "com.datatorrent.lib.io.ConsoleOutputOperator",
			      "container": "container_1503210674869_0002_01_000002",
			      "host": "quickstart.cloudera:36900",
			      "totalTuplesProcessed": "617022",
			      "totalTuplesEmitted": "0",
			      "tuplesProcessedPSMA": "2000",
			      "tuplesEmittedPSMA": "0",
			      "cpuPercentageMA": "0.5325968799999999",
			      "latencyMA": "6",
			      "status": "ACTIVE",
			      "lastHeartbeat": "1503292357878",
			      "failureCount": "0",
			      "recoveryWindowId": "6456590139547189847",
			      "currentWindowId": "6456590139547189887",
			      "ports": [
			        {
			          "name": "input",
			          "type": "input",
			          "totalTuples": "617022",
			          "tuplesPSMA": "2000",
			          "bufferServerBytesPSMA": "0",
			          "queueSizeMA": "1001",
			          "recordingId": null
			        }
			      ],
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

