var displayAICanvas = (function (game, canvas, onInit) {

var ctx = canvas.getContext("2d");
var bigPixelSize = 20;
var littlePixelSize = 10;
var inputWidth = 480/bigPixelSize;
var inputHeight = 320/bigPixelSize;
var ballPreviousX = 0;
var ballPreviousY = 0;
var velocityPreviousX = 0;
var velocityPreviousY = 0;
var paddleRadius = 80;

function constructInputArray(){
	for(c=0; c<inputWidth; c++) {
		game.input[c] = [];
		for(r=0; r<inputHeight; r++) {
			game.input[c][r] = { 
				ball: false, 
				paddle: false, 
				brick: false,
				velocity: false };
		}
	}
	//console.log("constructInputArray complete");
}
	
function setInputArray() {
	setBall();
	setPaddle();
	setBrick();
	setVelocity();
}

function setBall() {
	game.input[ballPreviousX][ballPreviousY].ball = false;
	ballPreviousY = Math.floor(game.y/bigPixelSize);
	ballPreviousX = Math.floor(game.x/bigPixelSize);
	game.input[ballPreviousX][ballPreviousY].ball = true; 
	if(game.input[8][12].ball == true) { console.log("You've crossed 8,12"); }
}

function setPaddle() {

	paddleCentreX = game.paddleX+paddleRadius;
	paddleCentreY = canvas.height*2+paddleRadius/Math.sqrt(2);
	for(c=0; c<inputWidth; c++) {
		var distance1 =Math.sqrt(
			((c*2+1)*littlePixelSize-paddleCentreX)*
			((c*2+1)*littlePixelSize-paddleCentreX)+
			((15*2+1)*littlePixelSize-paddleCentreY)*
			((15*2+1)*littlePixelSize-paddleCentreY));
		if(distance1 < paddleRadius) {
			game.input[c][15].paddle = true; 	
		}
		else {
			game.input[c][15].paddle = false; 
		}
	}
}

function setBrick() {
	for(c=0; c<game.columns; c++) {
		for(r=0; r<game.rows; r++) {
			game.input[2*c+2][r+2].brick = game.bricks[c][r].status;
			game.input[2*c+3][r+2].brick = game.bricks[c][r].status;
		} 
	} 
}

function setVelocity () {
	var angle = Math.atan2(game.dy,game.dx);
	game.input[velocityPreviousX][velocityPreviousY].velocity = false;
	velocityPreviousX = Math.floor((50+4*littlePixelSize*Math.cos(angle))/littlePixelSize);
	velocityPreviousY = Math.floor((50+4*littlePixelSize*Math.sin(angle))/littlePixelSize);
	game.input[velocityPreviousX][velocityPreviousY].velocity = true; 	
}

function drawInputArray() {
	for(c=0; c<inputWidth; c++) {
		for(r=0; r<inputHeight; r++) {
			if(game.input[c][r].ball) {
				ctx.beginPath();
				ctx.rect(c*littlePixelSize, r*littlePixelSize, littlePixelSize, littlePixelSize);
				ctx.fillStyle = "#00FF00";
				ctx.fill();
				ctx.closePath();
				ctx.beginPath();
				ctx.rect(c*littlePixelSize+1, r*littlePixelSize+1, littlePixelSize-2, littlePixelSize-2);
				ctx.fillStyle = "#00DD00";
				ctx.fill();
				ctx.closePath();
			}
			else if(game.input[c][r].velocity) {
				ctx.beginPath();
				ctx.rect(c*littlePixelSize, r*littlePixelSize, littlePixelSize, littlePixelSize);
				ctx.fillStyle = "#FF0000";
				ctx.fill();
				ctx.closePath();
				ctx.beginPath();
				ctx.rect(c*littlePixelSize+1, r*littlePixelSize+1, littlePixelSize-2, littlePixelSize-2);
				ctx.fillStyle = "#DD0000";
				ctx.fill();
				ctx.closePath();
			}
			else if(game.input[c][r].brick) {
				ctx.beginPath();
				ctx.rect(c*littlePixelSize, r*littlePixelSize, littlePixelSize, littlePixelSize);
				ctx.fillStyle = "#0075BD";
				ctx.fill();
				ctx.closePath();
				ctx.beginPath();
				ctx.rect(c*littlePixelSize+1, r*littlePixelSize+1, littlePixelSize-2, littlePixelSize-2);
				ctx.fillStyle = "#00559D";
				ctx.fill();
				ctx.closePath();
			}
			else if(game.input[c][r].paddle) {
				ctx.beginPath();
				ctx.rect(c*littlePixelSize, r*littlePixelSize, littlePixelSize, littlePixelSize);
				ctx.fillStyle = "#FFFF00";
				ctx.fill();
				ctx.closePath();
				ctx.beginPath();
				ctx.rect(c*littlePixelSize+1, r*littlePixelSize+1, littlePixelSize-2, littlePixelSize-2);
				ctx.fillStyle = "#DDDD00";
				ctx.fill();
				ctx.closePath();
			}

		}
	}
	ctx.beginPath();
	ctx.rect(55, 55, 1, 1);
	ctx.fillStyle = "#FFFFFF";
	ctx.fill();
}

return {
	draw: function (game, canvas, onInit) {

		if(onInit) {
			constructInputArray(); 
		}

		var d = new Date();
		setInputArray();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawInputArray();
		var n = new Date();
		game.functionTimes[1] = n - d;
	}
};

});