console.log($('body').width());
console.log($('body').height());

var operator_dimensions = {
		"width" : 70,
		"height" : 50,
		"border_radius" : 3
}

var level_gap = 90;

// Don't change any properties bolow this
var canvas_height = function() { return $(window).height(); }
var canvas_width = function() { return $('body').width(); }
var canvas_id = "myCanvas";
var od = operator_dimensions;

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

$(document).ready(function() {
	add_canvas();
});

// Add canvas div tag
function add_canvas() {
	$("body").append("<svg id='" + canvas_id + "' width='" + canvas_width() + "' height='" + canvas_height() + "'></svg>");
	
//	var ctx = document.getElementById(canvas_id).getContext("2d");
	od_rect(canvas_width()/2 -  od.width/2 - od.border_radius/2);
	od_rect(canvas_width()/2 -  od.width/2 - od.border_radius/2, od.height + od.border_radius + level_gap);
}

function od_rect(start_x =20, start_y = 20) {
	document.getElementById(canvas_id).innerHTML += "<rect x='" + start_x + "' y='" + start_y +"' " +
			" rx=" + od.border_radius + " ry=" + od.border_radius +
			" width='" + od.width + "' height='" + od.height + "' />";
//	ctx.beginPath();
//	ctx.moveTo(start_x + od.border_radius, start_y);
//	ctx.lineTo(od.width + start_x + od.border_radius, start_y);
//	ctx.quadraticCurveTo(od.width + start_x + 2 * od.border_radius, start_y, od.width + start_x + 2 * od.border_radius, start_y + od.border_radius);
//	ctx.lineTo(od.width + start_x + 2 * od.border_radius, start_y + od.height + od.border_radius);
//	ctx.quadraticCurveTo(od.width + start_x + 2 * od.border_radius,start_y + 2 * od.border_radius + od.height, start_x + od.width + od.border_radius, start_y + 2 * od.border_radius + od.height);
//	ctx.lineTo(start_x + od.border_radius, start_y + 2 * od.border_radius + od.height);
//	ctx.quadraticCurveTo(start_x, start_y + 2 * od.border_radius + od.height, start_x, start_y + od.border_radius + od.height);
//	ctx.lineTo(start_x, start_y + od.border_radius);
//	ctx.quadraticCurveTo(start_x, start_y, start_x + od.border_radius, start_y);
//	ctx.stroke();
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
			          "operatorId": "6",
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
			      "totalTuplesProcessed": "0",
			      "totalTuplesEmitted": "617022",
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

var stream_levels = [];

stream_levels[0] = {
	"name" : "Start"	
};

tmp_src_operators = []
tmp_sink_operators = []
streams = {};
operators = {};

// Find items in level 1
for(var i = 0; i < data.streams.length; i++) {
	if (tmp_src_operators.indexOf(parseInt(data.streams[i].source.operatorId)) == -1) {
		tmp_src_operators.push(parseInt(data.streams[i].source.operatorId));
	}
	
	if (!(data.streams[i].source.operatorId in streams)) {
		streams[parseInt(data.streams[i].source.operatorId)] = {
				"name" : data.streams[i].logicalName,
				"sinks" : []
		}
	}
	for(var j = 0; j < data.streams[i].sinks.length; j++ ) {
		
		if (tmp_sink_operators.indexOf(parseInt(data.streams[i].sinks[j].operatorId)) == -1) {
			tmp_sink_operators.push(parseInt(data.streams[i].sinks[j].operatorId));
		}
		
		streams[parseInt(data.streams[i].source.operatorId)].sinks.push(parseInt(data.streams[i].sinks[j].operatorId));
	}
}

streams[0] = {
		"name" : "start",
		"sinks" : tmp_src_operators
}
// Format Operators
for(var i = 0; i < data.operators.length; i++) {
	operators[parseInt(data.operators[i].id)] = data.operators[i];
}

//Find main source elements i.e.., operator id's which are not in sinks
for(var i = 0; i < tmp_sink_operators.length; i++) {
	var val = tmp_sink_operators[i];
	var index = tmp_src_operators.indexOf(tmp_sink_operators[i])
	if( index != -1) {
		tmp_src_operators.splice(index,1);
	}
}

// Find parents for sinks
parent_operators = {};
for(var operator in streams) {
	for(var sink in streams[operator].sinks) {
		sink = streams[operator].sinks[sink]
		if( !( sink in parent_operators) ) {
			parent_operators[sink] = [];
		}
		parent_operators[sink].push(operator)
	}
}

stream_levels[1] = {};
levels = {};

//Build stream_levels
function build_downstream_sinks(operatorId, level) {
	for(var j = 0; j < streams[operatorId].sinks.length; j++ ) {
		var child_operator_id = streams[operatorId].sinks[j];
		
		if(!(level in stream_levels)) {
			stream_levels[level] = {};
		}
		
		if(child_operator_id in stream_levels[level] ) {
			continue;
		}
		
		if (child_operator_id in levels) {
			delete stream_levels[levels[child_operator_id]][child_operator_id];
		}
		
		levels[child_operator_id] = level;
		
		if (streams[child_operator_id] == undefined) {
			stream_levels[level][child_operator_id] = {
					"stream_name" : "",
					"operator_details" : operators[child_operator_id],
					"children" : [],
					"parents" : []
			}
		} else {
			stream_levels[level][child_operator_id] = {
					"stream_name" : streams[child_operator_id].name,
					"operator_details" : operators[child_operator_id],
					"children" : streams[child_operator_id].sinks,
					"parents" : parent_operators[child_operator_id]
			}
			
			build_downstream_sinks(child_operator_id, level + 1);
		}
		
	}
}

build_downstream_sinks(0,1);

console.log("Levels");
console.log(stream_levels);

// Clear space
delete tmp_src_operators;
delete tmp_sink_operators;
delete streams;
delete operators;
delete parent_operators;
delete levels;


var diagram = flowchart.parse("the code definition");
diagram.drawSVG('diagram');

// you can also try to pass options:

diagram.drawSVG('diagram', {
                            'x': 0,
                            'y': 0,
                            'line-width': 3,
                            'line-length': 50,
                            'text-margin': 10,
                            'font-size': 14,
                            'font-color': 'black',
                            'line-color': 'black',
                            'element-color': 'black',
                            'fill': 'white',
                            'yes-text': 'yes',
                            'no-text': 'no',
                            'arrow-end': 'block',
                            'scale': 1,
                            // style symbol types
                            'symbols': {
                              'start': {
                                'font-color': 'red',
                                'element-color': 'green',
                                'fill': 'yellow'
                              },
                              'end':{
                                'class': 'end-element'
                              }
                            },
                            // even flowstate support ;-)
                            'flowstate' : {
                              'past' : { 'fill' : '#CCCCCC', 'font-size' : 12},
                              'current' : {'fill' : 'yellow', 'font-color' : 'red', 'font-weight' : 'bold'},
                              'future' : { 'fill' : '#FFFF99'},
                              'request' : { 'fill' : 'blue'},
                              'invalid': {'fill' : '#444444'},
                              'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'APPROVED', 'no-text' : 'n/a' },
                              'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : 'n/a', 'no-text' : 'REJECTED' }
                            }
                          });