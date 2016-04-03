function displayAICanvas(game, canvas ) {
	
var d = new Date();

var ctx = canvas2.getContext("2d");
var bigPixelSize = 20;
var littlePixelSize = 10;
var inputWidth = 480/bigPixelSize;
var inputHeight = 320/bigPixelSize;
var spaceFlag = false;
var ballPreviousX = 0;
var ballPreviousY = 0;
var velocityPreviousX = 0;
var velocityPreviousY = 0;
var paddleRadius = 80;

console.log("inputWidth:"+inputWidth);
console.log("inputHeight:"+inputHeight);

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
	console.log("constructInputArray complete");
}
	

function keyDownHandler(e) {
	if(e.keyCode == 32) {
		spaceFlag = !spaceFlag;
	}
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
		var distance2 =Math.sqrt(
			((c*2+1)*littlePixelSize-paddleCentreX)*
			((c*2+1)*littlePixelSize-paddleCentreX)+
			((14*2+1)*littlePixelSize-paddleCentreY)*
			((14*2+1)*littlePixelSize-paddleCentreY));
		if(distance1 < paddleRadius) {
			game.input[c][15].paddle = true; 	
		}
		else {
			game.input[c][15].paddle = false; 
		}
		if(distance2 < paddleRadius) {
			game.input[c][14].paddle = true; 
		}
		else {
			game.input[c][14].paddle = false; 
		}
	}
}

function setBrick() {
	for(c=0; c<game.columns; c++) {
		for(r=0; r<game.rows; r++) {
			console.log("Changing value in cell:["+(2*c)+"]["+(2*r)+"]");
			game.input[2*c+2][r+2].brick = game.bricks[c][r].status;
			game.input[2*c+3][r+2].brick = game.bricks[c][r].status;
		}  
	} 
}

function setVelocity () {
	var angle = Math.atan2(game.dy,game.dx)
//	angle = angle * (180 / Math.PI);
	game.input[velocityPreviousX][velocityPreviousY].velocity = false;
	velocityPreviousX = Math.floor((55+3*littlePixelSize*Math.cos(angle))/littlePixelSize);
	velocityPreviousY = Math.floor((55+3*littlePixelSize*Math.sin(angle))/littlePixelSize);
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
}

function draw() {

	var n = d.getTime();
	if(!spaceFlag) {
		setInputArray();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawInputArray();
	}
	game.functionTimes[1] = d.getTime() - n;
}

constructInputArray(); 
setInterval(draw, 20);

}