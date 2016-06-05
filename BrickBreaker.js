var brickBreaker = (function (game, canvas, onInit) {

console.log("Inititiating brickBreaker Function");

var ctx = canvas.getContext("2d");

var rightPressed;
var leftPressed;
var collision;

const paddleRadius = 80;
var paddleCentreX = game.paddleX+paddleRadius;
const paddleCentreY = canvas.height+paddleRadius/Math.sqrt(2);
var distance = Math.sqrt((game.x-paddleCentreX)*(game.x-paddleCentreX)+(game.y-paddleCentreY)*(game.y-paddleCentreY));
var ballAngle;
var paddleAngle;
var newAngle;
var score;
var lives;
var dx;
var paddleDamperTimer = 0;

const ballRadius = 5;
const initialX = canvas.width/2;
const initialY = canvas.height-150;
const initialDx = -3.0;
const initialDy = 3.0;
const velLength = Math.sqrt(game.dx*game.dx+game.dy*game.dy); 
const paddleHeight = 10;
const paddleWidth = 150;
const paddleBuffer = 50; 
const brickRowCount = game.rows;
const brickColumnCount = game.columns;
const brickWidth = 40;
const brickHeight = 20;
const brickPadding = 0;
const brickOffsetTop = 40;
const brickOffsetLeft = 40;
const ddx = 1;
const dxLimit = 7; 

function restartGame() {

	//console.log("Executing Restart in BrickBreaker.js");	
	for(c=0; c<brickColumnCount; c++) {
		game.bricks[c] = []; 
		for(r=0; r<brickRowCount; r++) {
			game.bricks[c][r] = { x: 0, y: 0, status: true };
		}
	}
	score = 0;
	lives = 1;
	collision = false;
	rightPressed = false;
	leftPressed = false;

	game.x = initialX;
	game.y = initialY;
	game.dx = initialDx;
	game.dy = initialDy;
	dx = 0;
	game.paddleX = canvas.width/2-paddleRadius;
	game.gameTime = 0;

}

//console.log("Constructed bricks array");

document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
	if(e.keyCode == 39) {
		rightPressed = true;
	}
	else if(e.keyCode == 37) {
		leftPressed = true;
	}
}

function keyUpHandler(e) {
	if(e.keyCode == 39) {
		rightPressed = false;
	}
	else if(e.keyCode == 37) {
    	leftPressed = false;
	}
}

//This function allows the padde to be controlled by the mouse as well as the arrowkeys if uncommented. 
function mouseMoveHandler(e) { ;
// 	var relativeX = e.clientX - canvas.offsetLeft;
// 	if(relativeX > 0 && relativeX < canvas.width) {
// 		game.paddleX = relativeX - paddleRadius;
// 	}
}

function calculateFitness() {	
	game.fitness = score - game.gameTime;
}

function drawScore() {
	calculateFitness();
	ctx.font = "16px Arial";
	ctx.fillStyle = "#000000";
	ctx.fillText("Score: "+score, 8, 20);
	ctx.fillText("Fitness: "+game.fitness.toFixed(2),8,60);
}

function drawVelocity() {
	ctx.font = "16px Arial";
	ctx.fillStyle = "#000000";
	ctx.fillText("Time: "+game.gameTime.toFixed(2), 100, 20);		
}

function drawLives() {
	ctx.font = "16px Arial";
	ctx.fillStyle = "#000000";
	ctx.fillText("Lives: "+lives, canvas.width-65, 20);
}

function drawBall() {
	ctx.beginPath();
	ctx.arc(game.x, game.y, ballRadius, 0, Math.PI*2);
	ctx.fillStyle = "#00FF00";
	ctx.fill();
	ctx.closePath();
}

function drawVelocityIndicator() {
	ctx.beginPath();
	ctx.arc(50, 300, 10, 0, Math.PI*2);
	ctx.fillStyle = "#000000";
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.arc(50+5*game.dx/Math.sqrt(3), 300+5*game.dy/Math.sqrt(3), 5, 0, Math.PI*2);
	ctx.fillStyle = "#FF0000";
	ctx.fill();		
}

function drawPaddle() {
	ctx.beginPath();
	ctx.arc(paddleCentreX, paddleCentreY, paddleRadius, 0, Math.PI*2);		
	ctx.fillStyle = "#FFFF00";
	ctx.fill();
	ctx.closePath();
}

function drawBricks() {
	for(c=0; c<brickColumnCount; c++) {
		for(r=0; r<brickRowCount; r++) {
			if(game.bricks[c][r].status == true) {
				var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
				var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
				game.bricks[c][r].x = brickX;
				game.bricks[c][r].y = brickY;
				ctx.beginPath();
				ctx.rect(brickX, brickY, brickWidth, brickHeight);
				ctx.fillStyle = "#0095DD";
				ctx.fill();
				ctx.closePath();
				ctx.beginPath();7
				ctx.rect(brickX+2, brickY+2, brickWidth-4, brickHeight-4);
				ctx.fillStyle = "#0075BD";
				ctx.fill();
				ctx.closePath();
			}
		}
	}
}

function toRadians (angle) { return angle * (Math.PI / 180);
}

function toDegrees (angle) { return angle * (180 / Math.PI);
}

function collisionDetection() {
	for(c=0; c<brickColumnCount; c++) {
		for(r=0; r<brickRowCount; r++) {
			var b = game.bricks[c][r];
			if(b.status == true) {
				if(game.x >= b.x && game.x <= b.x+brickWidth && game.y >= b.y && game.y <= b.y+brickHeight) {
					//dy = -dy;
					b.status = false;
					score += 3;

					if(score == brickRowCount*brickColumnCount) {
						alert("Congrats, your time is "+game.gameTime.toFixed(2)+"s!");
						document.location.reload();
					}
				}
				if(game.x >= b.x && game.x <= b.x+brickWidth && game.y-game.dy < b.y && game.y >= b.y) {
					game.dy = -game.dy;
				}
				if(game.x >= b.x && game.x <= b.x+brickWidth && game.y-game.dy > b.y+brickHeight && game.y <= b.y+brickHeight) {
					game.dy = -game.dy;
				}
				if(game.y >= b.y && game.y <= b.y+brickHeight && game.x-game.dx < b.x && game.x >= b.x) {
					game.dx = -game.dx;
				}
				if(game.y >= b.y && game.y <= b.y+brickHeight && game.x-game.dx > b.x+brickWidth && game.x <= b.x+brickWidth) {
					game.dx = -game.dx;
				}
			}
		}
	}
}

function handleBall() {
	if(game.x + game.dx > canvas.width-ballRadius || game.x + game.dx < ballRadius) {
		game.dx = -game.dx;
	}
	if(game.y + game.dy < ballRadius) {
		game.dy = -game.dy;
	} 
	distance = Math.sqrt((game.x-paddleCentreX)*(game.x-paddleCentreX)+(game.y-paddleCentreY)*(game.y-paddleCentreY));
	if(distance < (ballRadius + paddleRadius)) {
		paddleCollision();
	}
	else if(game.y + game.dy > canvas.height-ballRadius) {
		lives--;
		if(!lives) {
			if(game.flags.humanPlayer) {
				alert("Ha Ha. If you're were an AI, you'd be about to be bred out of the gene pool.");
			}
			else if(!game.flags.humanPlayer) {
				game.flags.gameLostByAI = true;
			}
			lives = 1;
		}
		restartGame();
	}
					
	game.x += game.dx;
	game.y += game.dy;
}

function paddleCollision() {

	
	ballAngle = Math.atan2(-game.dy,game.dx);
	paddleAngle = Math.atan2(-(game.y-paddleCentreY),(game.x-paddleCentreX));			
	newAngle = Math.PI + 2*paddleAngle - ballAngle;
	if(newAngle < toRadians(20) && newAngle > 0 ) { newAngle = toRadians(20); console.log("Abjusted Angle: "+toDegrees(newAngle)); }
	if(newAngle > toRadians(160) && newAngle < Math.PI) { newAngle = toRadians(160); console.log("Abjusted Angle: "+toDegrees(newAngle)); }
	if(game.dy >= 0)	{
		game.dx = velLength*Math.cos(newAngle);
		game.dy = -velLength*Math.sin(newAngle); 
	}
} 

function handlePaddle() {

	if(leftPressed && game.flags.humanPlayer) {
		game.flags.leftFlag = true;
	}
	else if(rightPressed && game.flags.humanPlayer) {
		game.flags.rightFlag = true;
	}
	else if(game.flags.humanPlayer){
		game.flags.leftFlag = false;
		game.flags.rightFlag = false;
	}

	paddleCentreX = game.paddleX+paddleRadius;
	paddleDamperTimer++;

	if(paddleCentreX  < 0 || paddleCentreX  > canvas.width) {
		dx = -dx;
	}
	game.paddleX += dx;
	if(game.flags.rightFlag && !game.flags.leftFlag && dx < dxLimit) {
		dx += ddx;
	}
	else if(game.flags.leftFlag && !game.flags.rightFlag && dx > -dxLimit) {
		dx -= ddx;
	}
	if(paddleDamperTimer >= 5 && dx !==0) {
		if(dx > 0) {dx--;} else {dx++; }
		paddleDamperTimer = 0;
	}
}


return {
	draw: function (game, canvas, onInit) {

		if(onInit) {
			restartGame();
		}	
		//console.log("Executing Draw in BrickBreaker.js");		
		var d = new Date();

		game.gameTime += 0.02;
		if(!game.flags.humanPlayer) {
			game.flags.leftFlag = game.output[0]; //Output is generated externally in NEAT.js by evaluateCurrent();
			game.flags.rightFlag = game.output[1]; //Output is generated externally in NEAT.js by evaluateCurrent();
		}
		handlePaddle();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		collisionDetection();
		handleBall();
		drawBall();
		drawPaddle();
		drawBricks();
		drawScore();
		drawLives();
		drawVelocity();
		drawVelocityIndicator();
		
		var n = new Date();
		game.functionTimes[0] = n - d;
	}
};


});

