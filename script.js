builtInDiv = document.querySelector("#builtIn");
startBtn = document.querySelector("#startBtn");
stopBtn = document.querySelector("#stopBtn");
resetBtn = document.querySelector("#resetBtn");
automatonField = document.querySelector("#automatonField");
canvas = document.querySelector('#plot');
ctx = canvas.getContext('2d');

let size = 90;
let automaton = new Array(size);
let running = 0;
let stopped = 0;
let steps = 0; let stepsX = ['0'];
let colorCounts = {
	red: 0,
	green: 0,
	blue: 0
};
let redY = [];
let greenY = [];
let blueY = [];

function drawChart(steps, red, green, blue){
	var config = {
		type: 'line',
		data: {
			labels: steps,
			datasets: [{
				label: '0',
				backgroundColor: 'red',
				borderColor: 'red',
				data: red,
				fill: false,
			}, {
				label: '1',
				fill: false,
				backgroundColor: 'lime',
				borderColor: 'lime',
				data: green,
			}, {
				label: '2',
				fill: false,
				backgroundColor: 'deepskyblue',
				borderColor: 'deepskyblue',
				data: blue,
			}]
		},
		options: {
			animation: false,
			title: {
				display: true,
				text: 'Cell count distribution'
			},
			scales: {
				xAxes: [{
					display: true,
					scaleLabel: {
						display: true,
						labelString: 'Step'
					}
				}],
				yAxes: [{
					ticks: {
						min: 0,
						max: 100,
						callback: function(value){
							return value + "%"
						}
					},
					display: true,
					scaleLabel: {
						display: true,
						labelString: 'Cell count'
					}
				}]
			}
		}
	};
	window.myLine = new Chart(ctx, config);
}


// all combinations to consider
let combinations = ["000", "001", "002", "010", "011", "012", "020", "021", "022",
					"100", "101", "102", "110", "111", "112", "120", "121", "122",
					"200", "201", "202", "210", "211", "212", "220", "221", "222"];

let rules = new Array(27);

// read rules and save to array
function setRules(){
	for (i = 0; i < 27; i++){
		if(document.querySelector("#radio" + combinations[i] + "_0").checked){
			rules[i] = 0;
		}
		else if (document.querySelector("#radio" + combinations[i] + "_1").checked){
			rules[i] = 1;
		}
		else if (document.querySelector("#radio" + combinations[i] + "_2").checked){
			rules[i] = 2;
		}
		else{
			alert("None of the rules must be empty.");
			break;
		}
	}
	startBtn.disabled = "";
	console.log("Rules: " + rules.toString());
}

function pushToColorArrays(colorCounts, redY, greenY, blueY){
	let den = colorCounts.red + colorCounts.green + colorCounts.blue;
	let redN = colorCounts.red / den * 100;
	let greenN = colorCounts.green / den * 100;
	let blueN = colorCounts.blue / den * 100;
	redY.push(redN);
	greenY.push(greenN);
	blueY.push(blueN);
}

function drawCell(cell, colorCounts){
	if(cell === 0){
		colorCounts.red++;
    	return '<span class="red">⬤</span>';
	}
    else if (cell === 1){
		colorCounts.green++;
    	return '<span class="green">⬤</span>'
	}
   	else if (cell === 2){
		colorCounts.blue++;
    	return '<span class="blue">⬤</span>'
	}
}

async function startAutomaton(){
	startBtn.disabled = "disabled";
	stopBtn.disabled = "";
	stopped = 0;
	
	// initialize random values
	if (!running){
		let line = "";
		for (i = 0; i < size; i++){
			automaton[i] = Math.floor(Math.random()*3);
			line += drawCell(automaton[i], colorCounts);
		}
		pushToColorArrays(colorCounts, redY, greenY, blueY);
		drawChart(stepsX, redY, greenY, blueY);
		console.log("Drawn: " + automaton.toString());
		running = 1;
		automatonField.innerHTML = line;
	}
	while(true){
		colorCounts.red = 0; colorCounts.green = 0; colorCounts.blue = 0;
		if (running && !stopped){
			await new Promise(step => setTimeout(step, 350));
			let line = automatonField.innerHTML;
			line += "<br/>";
			// copy previous state
			let previousState = [...automaton];
			let cell;
			//start the automaton
			for (i = 0; i < size; i++){
				// edges
				if (i == 0){
					cell = '' + previousState[size-1].toString() + previousState[i].toString() + previousState[i+1].toString();
				}
				else if (i == (size-1)){
					cell = '' + previousState[i-1].toString() + previousState[i].toString() + previousState[0].toString();					
				}
				// inside
				else{
					cell = '' + previousState[i-1].toString() + previousState[i].toString() + previousState[i+1].toString();					
				}
				//apply rules
				let ruleIndex = combinations.findIndex(el => el === cell);
				automaton[i] = rules[ruleIndex];
				// draw according to rules
				line += drawCell(automaton[i], colorCounts);
			}
			steps++;
			stepsX.push(steps.toString());
			pushToColorArrays(colorCounts, redY, greenY, blueY);			
			if(steps > 10){
				line = line.substring(line.indexOf("<br>") + 4);
			}
			if(running){
				automatonField.innerHTML = line;
				console.log("Drawn: " + automaton.toString());
				drawChart(stepsX, redY, greenY, blueY);
			}
		}
		else break;
	}
}

function stopAutomaton(){
	stopBtn.disabled = "disabled";
	startBtn.disabled = "";
	stopped = 1;
}

function resetAutomaton(){
	running = 0;
	steps = 0; stepsX = ['0'];
	stopped = 1;
	colorCounts.red = 0; colorCounts.green = 0; colorCounts.blue = 0;
	redY = []; greenY = []; blueY = [];
	stopBtn.disabled = "disabled";
	startBtn.disabled = "";
	automatonField.innerHTML = "";
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	window.location.reload();
}