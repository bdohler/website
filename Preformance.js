function monitorPreformance(game, canvas) {

var ctx = canvas3.getContext("2d");
var spaceFlag = false;
var pixelSize = 4;
var preformanceArrayHeight = canvas.height/pixelSize;
var preformanceArrayWidth = canvas.width/pixelSize;
var preformanceArray = [];

function keyDownHandler(e) {
	if(e.keyCode == 32) {
		spaceFlag = !spaceFlag;
	}
}

function constructPreformanceArray(){
	for(c=0; c<preformanceArrayWidth; c++) {
		preformanceArray[c] = { gameFunctionTime: 0, AICanvasFunctionTime: 0 };
	}
}

function calculatePreformanceArray() {
	for(c=preformanceArray.length-1; c > 0; c--) {
		preformanceArray[c].gameFunctionTime = preformanceArray[c-1].gameFunctionTime;
		preformanceArray[c].AICanvasFunctionTime = preformanceArray[c-1].AICanvasFunctionTime;
	}
	preformanceArray[0].gameFunctionTime = game.functionTimes[0];
	preformanceArray[0].AICanvasFunctionTime = game.functionTimes[1];
}

function drawPreformanceMonitor() {

	ctx.beginPath();
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#000000";
	ctx.fill();
	ctx.closePath();

	for(c=0; c<preformanceArrayWidth; c++) {
		var height1 = preformanceArray[c].gameFunctionTime;
		var height2 = preformanceArray[c].AICanvasFunctionTime;



		ctx.beginPath();
		ctx.rect(c*pixelSize, canvas.height - (height1+1)*pixelSize, pixelSize, pixelSize);
		ctx.fillStyle = "#009900";
		ctx.fill();
		ctx.closePath();

	}	
}

function draw() {


	if(!spaceFlag) {
		calculatePreformanceArray();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawPreformanceMonitor();
		console.log(preformanceArray.gameFunctionTime);
		console.log(game.functionTimes[0]);
	}
}

constructPreformanceArray(); 
setInterval(draw, 20);

}