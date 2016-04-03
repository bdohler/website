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
	pushLeft : false,
	pushRight : false,
	functionTimes : []
};

brickBreaker(game1, canvas1);
//activateAI(game1);
displayAICanvas(game1, canvas2);
monitorPreformance(game1, canvas3);