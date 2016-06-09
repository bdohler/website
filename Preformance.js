
var monitorPreformance = (function (game, canvas, onInit) {

var ctx = canvas3.getContext("2d");
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
		preformanceArray[c] = { gameFunctionTime: 0, AICanvasFunctionTime: 0, NEATFunctionTime:0 };
	}
}

function calculatePreformanceArray() {
	for(c=preformanceArray.length-1; c > 0; c--) {
		preformanceArray[c].gameFunctionTime = preformanceArray[c-1].gameFunctionTime;
		preformanceArray[c].AICanvasFunctionTime = preformanceArray[c-1].AICanvasFunctionTime;
		preformanceArray[c].NEATFunctionTime = preformanceArray[c-1].NEATFunctionTime;
	}
	preformanceArray[0].gameFunctionTime = game.functionTimes[0];
	preformanceArray[0].AICanvasFunctionTime = game.functionTimes[1];
	preformanceArray[0].AICanvasFunctionTime = game.functionTimes[2];
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
		var height3 = preformanceArray[c].NEATFunctionTime;

		ctx.beginPath();
		ctx.rect(c*pixelSize, canvas.height - (height2+1)*pixelSize, pixelSize, pixelSize);
		if(height2 > 10) {
			ctx.fillStyle = "#FF0000";
		}
		else {
			ctx.fillStyle = "#990000";
		}
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
		ctx.rect(c*pixelSize, canvas.height - (height1+1)*pixelSize, pixelSize, pixelSize);
		if(height1 > 10) {
			ctx.fillStyle = "#00FF00";
		}
		else {
			ctx.fillStyle = "#009900";
		}
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
		ctx.rect(c*pixelSize, canvas.height - (height3+1)*pixelSize, pixelSize, pixelSize);
		if(height3 > 10) {
			ctx.fillStyle = "#0000FF";
		}
		else {
			ctx.fillStyle = "#000099";
		}
		ctx.fill();
		ctx.closePath();


	}	
}

return {
	draw: function (game, canvas, onInit) {

	if(onInit){
		constructPreformanceArray();
	}
	calculatePreformanceArray();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawPreformanceMonitor();
	
	}
};

});