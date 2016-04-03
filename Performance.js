function monitorPreformance(game, canvas) {

var ctx = canvas3.getContext("2d");
var spaceFlag = false;
var pixelHeight = 4;
var preformanceArrayHeight = canvas.height/pixelHeight;
var preformanceArrayWidth = canvas.width/pixelHeight;
var preformanceArray = [];




function keyDownHandler(e) {
	if(e.keyCode == 32) {
		spaceFlag = !spaceFlag;
	}
}

function constructInputArray(){
	for(c=0; c<preformanceArrayWidth; c++) {
		preformanceArray[c][r] = { 
			gameFunctionTime: 0, 
			AICanvasFunctionTime: 0
		};
	}
}

function calculatePreformanceArray() {
	for(c=preformanceArray.length; c > 0; c--) {
		preformanceArray[c].gameFunctionTime = preformanceArray[c-1].gameFunctionTime;
		preformanceArray[c].AICanvasFunctionTime = preformanceArray[c-1].AICanvasFunctionTime;
	}
	preformanceArray[0].gameFunctionTime = game.functionTimes[0];
	preformanceArray[0].AICanvasFunctionTime = game.functionTimes[1];
}

function drawPreformanceMonitor() {
	for(c=0; c<preformanceArrayWidth; c++) {
		var height1 = preformanceArray[c].gameFunctionTime;
		var height2 = preformanceArray[c].AICanvasFunctionTime;
		ctx.beginPath();
		ctx.rect(height1*pixelSize, c*pixelSize, pixelSize, pixelSize);
		ctx.fillStyle = "#FFFF00";
		ctx.fill();
		ctx.closePath();

	}	
}

function draw() {


	if(!spaceFlag) {
		calculatePreformanceArray();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawPreformanceMonitor();
	}

}

constructPreformanceArray(); 
setInterval(draw, 20);

}