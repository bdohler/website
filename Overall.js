console.log("Initiating Overall.js");


var canvas1 = document.getElementById("gameCanvas");
var canvas2 = document.getElementById("AICanvas");
var canvas3 = document.getElementById("preformanceCanvas");

var game1 = {  
	fitness : 0,
	gameTime : 0,
	x : 0,
	y : 0,
	dx : -3.0,
	dy : 3.0,
	paddleX : 0,
	columns : 10,
	rows : 8,
	bricks : [],
	input : [],
	output : [],
	pushLeft : false,
	pushRight : false,
	functionTimes : [],
	flags : false,
	lastAIfitness : 0
};

game1.flags = {
	leftFlag: false, 
	rightFlag: false, 
	humanPlayer: false,
	gameLostByAI: false
};

var importButton = document.getElementById('i');
importButton.addEventListener('click', function() { readBlob(); parseSaveFile(); });

var exportButton = document.getElementById('e');
exportButton.addEventListener('click', exportToCSV);

var humanPlayerCheckBox = document.getElementById('humanPlayer');
humanPlayerCheckBox.addEventListener('click', function() {game1.flags.humanPlayer = humanPlayerCheckBox.checked; console.log(game1.flags.humanPlayer);} );

document.addEventListener("keydown", keyDownHandler, false);
//document.addEventListener("keyup", keyUpHandler, false);
var paused = false;
function keyDownHandler(e) {
	if(e.keyCode == 32) {
		paused = !paused;
	}
}


var onInit = true;
var loopRate = 10;
var bb = brickBreaker(game1, canvas1, onInit);
var dac = displayAICanvas(game1, canvas2, onInit);
var mp = monitorPreformance(game1, canvas3, onInit);
var ai = NEAT(game1, canvas2);

function loop() {

	//console.log("Executing Loop in Overall.js");

	if(!paused) {

		if(onInit) {
			bb.restartGame();
		}
		bb.draw(game1, canvas1);
		dac.draw(game1, canvas2, onInit);
		mp.draw(game1, canvas3, onInit);	
		if(!game1.flags.humanPlayer) {
			if(onInit) {
				clearTimeout(intervalID);
			}
			ai.execute(game1, canvas2);
			if(onInit) {
				intervalID = setTimeout(timeoutLoop, loopRate);
			}
		}
		
		onInit = false;		
	}

}

var timeoutLoop = function() {
	var start = (new Date()).getTime();
	loop();
	var timeLeft = loopRate - ((new Date()).getTime() - start);
	if(timeLeft < 0) {
		timeLeft = 0;
	}
	intervalID = setTimeout(timeoutLoop, timeLeft);
}

var intervalID = setTimeout(timeoutLoop, loopRate);

// wait for load file or start new   
// loop                                					  		   CHECK
// 	if not paused                                 				   CHECK
// 		if not fast mode, wait for time to pass		
// 		if network not generated
// 			machine pause
// 			run NEAT generate network
// 		get current time 		
// 		run brickBreaker                         				   CHECK
// 		run displayAICanvas                      		           CHECK
// 		run NEAT apply solution
// 		run monitorPreformance on all three                        CHECK 
// end loop                             						   CHECK
	
// event save
// 	save as per lua script using buildSaveFile

// event load 
// 	load from file as per lua script