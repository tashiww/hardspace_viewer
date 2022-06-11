/*
 * This function initializes the WebSocket connection to the server. More
 *  specifically, it defines functions to handle WebSocket events.
 */
var salvage_value = 0;
var scrap_value = 0;
var table = document.getElementById('checklist');
var next_seconds = 0; //document.getElementById('nextdrop').value;
var cur_time = 0;
var max_time = 0;
var next_remaining_time_percentage = 0;
var remaining_time_percentage = 0;

function init() {
  // Connect to Web Socket server.
  ws = new WebSocket("ws://127.0.0.1:32325/racers-ledger/");

  // When connection with the WebSocket server is established.
  ws.onopen = function(msg) {
	  document.getElementById('message').value = JSON.stringify(msg) + '\n';
	  document.getElementById('ws_status').style.backgroundColor = '#22cc44';
	  document.getElementById('ws_status').innerHTML = 'Connected';
  };

  // When a message from the WebSocket server is received.
  ws.onmessage = function(e) {
    let msg = JSON.parse(e.data);
	if (msg.type == 'timeTickEvent') {
		cur_time = msg.currentTime.toFixed(0);
		max_time = msg.maxTime;
		document.getElementById('timer').value = secsToMins(cur_time);
		if (isNaN(next_seconds)) {
			document.getElementById('nextdrop').value = 0;
		}
		else {
			document.getElementById('nextdrop').value = next_seconds - cur_time;
		}
		document.getElementById('nextloss').value = 
				Number((0.01 * salvage_value).toFixed(0)).toLocaleString();
		remaining_time_percentage = ((max_time - cur_time) / max_time).toFixed(3);
		var timebonus_index = remaining_times.findIndex(e => e < remaining_time_percentage) - 1;
		if (isNaN(timebonuses[timebonus_index])) {
			document.getElementById('timebonus').value = '0%';
		}
		else {
			document.getElementById('timebonus').value = (timebonuses[timebonus_index]* 100).toFixed(0) + '% (+$'
		+ Number((salvage_value * timebonuses[timebonus_index]).toFixed(0)).toLocaleString() + ')';
		}
		next_seconds = (max_time - (max_time * remaining_times[timebonus_index+1])).toFixed(0);
		// console.log(remaining_time_percentage);
		// console.log(next_remaining_time_percentage);
		// console.log(next_seconds);
		document.getElementById('nextdrop').value = next_seconds - cur_time;
		var salvage_per_second = (salvage_value / cur_time).toFixed(0);
		sparkline.data.datasets[0].data.push({x:cur_time, y:salvage_per_second});
		sparkline.update();

	}
	if (msg.type == 'shiftSalvageLogEntry') {

		timestamp = msg.gameTime;
		if ( msg.destroyed ) {
			scrap_value += msg.value;
			}
		else {
			salvage_value += msg.value;
		}
		updateBar(timestamp, salvage_value, scrap_value)

		table = document.getElementById('checklist');
		for (var i = 2, row; row = table.rows[i]; i++) {
			var item = row.cells[0].firstChild.value
			var target = row.cells[1].firstChild.value
			var cur_val = row.cells[2].firstChild.value

			if (msg.objectName == item) {
				cur_val = parseInt(cur_val) + 1
				row.cells[2].firstChild.value = cur_val;
				if (cur_val >= target) {
					row.cells[3].firstChild.value = secsToMins(timestamp);
				}
			}
		}

	  document.getElementById('message').value += JSON.stringify(msg) + '\n';
	}	
  };

  // When the connection with the WebSocket server is closed.
  ws.onclose = function() {};

  // When an error message is received from the WebSocket server.
  ws.onerror = function(e) {
    console.log(e);
  };
}

function updateBar(timestamp, salvage, scrap) {
	myChart.data.datasets[0].data.push({x:timestamp, y:salvage});
	myChart.data.datasets[1].data.push({x:timestamp, y:scrap});
	myChart.update();
	document.getElementById('salvage').value = Number(salvage.toFixed(0)).toLocaleString();
	document.getElementById('scrap').value = Number(scrap.toFixed(0)).toLocaleString();
	document.getElementById('ratio').value = (salvage / (scrap + salvage)*100).toFixed(1) + '%';
}

function secsToMins(seconds) {
	// converts seconds to minutes:seconds string
	return Math.floor(seconds/60) +':'+ String(Math.floor(seconds) % 60).padStart(2, '0');
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}


function resetData() {
	salvage_value = 0;
	scrap_value = 0;
	next_seconds = 0;
	cur_time = 0;
	max_time = 0;
	table = document.getElementById('checklist');
	next_remaining_time_percentage = 0;
	remaining_time_percentage = 0;
	for (var i = 2, row; row = table.rows[i]; i++) {
		row.cells[2].firstChild.value = 0;
		row.cells[3].firstChild.value = 0;
	}
    myChart.data.labels.pop();
    myChart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    myChart.update();
}

var remaining_times = [1,0.869,0.773,0.66,0.619,0.582,0.55,0.524,0.504,0.486,0.468,0.45,0.432,0.416,0.4,0.382,0.365,0.35,0.336,0.324,0.312,0.3,0.287,0.274,0.261,0.25,0.239,0.229,0.219,0.209,0.2,0.19,0.18,0.17,0.16,0.15,0.14,0.13,0.12,0.11,0.1,0.09,0.08,0.07,0.06,0.05,0.04,0.03,0.02,0.01];

var timebonuses = [0.505,0.499968,0.489992,0.469856,0.459996,0.449823,0.44,0.429698,0.419766,0.409966,0.399876,0.39,0.379692,0.369832,0.36,0.349615,0.339735,0.33,0.319526,0.309799,0.299819,0.29,0.27985,0.269849,0.259469,0.25,0.239669,0.229706,0.219448,0.209133,0.2,0.19,0.18,0.17,0.16,0.15,0.14,0.13,0.12,0.11,0.1,0.09,0.08,0.07,0.06,0.05,0.04,0.03,0.02,0.01];
