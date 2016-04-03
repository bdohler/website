

function brickBreaker(game, canvas) {

var d = new Date();

console.log("Inititiating brickBreaker Function");
var ctx = canvas.getContext("2d");

var ballRadius = 5, initialX = canvas.width/2;
var initialY = canvas.height-150;
game.x = initialX;
game.y = initialY;

var initialDx = game.dx;
var initialDy = game.dy;
var dyOld = game.dy;
var dxOld = game.dx;
const velLength = Math.sqrt(game.dx*game.dx+game.dy*game.dy);	

var rightPressed = false;
var leftPressed = false;
var spaceFlag = false;

var paddleRadius = 80;
var paddleHeight = 10;
var paddleWidth = 150;
game.paddleX = canvas.width/2-paddleRadius;
var paddleBuffer = 50; 
var collision = false;
var paddleCentreX = game.paddleX+paddleRadius;
var paddleCentreY = canvas.height+paddleRadius/Math.sqrt(2);
var distance = Math.sqrt((game.x-paddleCentreX)*(game.x-paddleCentreX)+(game.y-paddleCentreY)*(game.y-paddleCentreY));
var ballAngle;
var paddleAngle;
var newAngle;

var brickRowCount = game.rows;
var brickColumnCount = game.columns;
var brickWidth = 40;
var brickHeight = 20;
var brickPadding = 0;
var brickOffsetTop = 40;
var brickOffsetLeft = 40;
var score = 0;
var lives = 3;
var highScore = 0;

for(c=0; c<brickColumnCount; c++) {
	game.bricks[c] = [];
	for(r=0; r<brickRowCount; r++) {
		game.bricks[c][r] = { x: 0, y: 0, status: 1 };
	}
}

console.log("Constructed bricks array");

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
	else if(e.keyCode == 32) {
		spaceFlag = !spaceFlag;
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

function mouseMoveHandler(e) {
	var relativeX = e.clientX - canvas.offsetLeft;
	if(relativeX > 0 && relativeX < canvas.width) {
		game.paddleX = relativeX - paddleRadius;
	}
}

function calculateFitness() {
	game.fitness = game.fitness + score/game.gameTime;
}

function drawScore() {
	calculateFitness();
	ctx.font = "16px Arial";
	ctx.fillStyle = "#000000";
	ctx.fillText("Score: "+score, 8, 20);
	highScore = (score > highScore) ? score : highScore;
	ctx.fillText("High Score: "+highScore, 8, 40);
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
			if(game.bricks[c][r].status == 1) {
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

function toRadians (angle) {
	return angle * (Math.PI / 180);
}

function toDegrees (angle) {
	return angle * (180 / Math.PI);
}

function collisionDetection() {
	for(c=0; c<brickColumnCount; c++) {
		for(r=0; r<brickRowCount; r++) {
			var b = game.bricks[c][r];
			if(b.status == 1) {
				if(game.x >= b.x && game.x <= b.x+brickWidth && game.y >= b.y && game.y <= b.y+brickHeight) {
					//dy = -dy;
					b.status = 0;
					score++;

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
		paddleCollision(game.x,game.y,game.dx,game.dy);
	}
	else if(game.y + game.dy > canvas.height-ballRadius) {
		lives--;
		if(!lives) {
			//alert("Ha Ha. If you're an AI, you're about to be bred out of the gene pool.");
			document.location.reload();
		}
		else {
			game.x = initialX;
			game.y = initialY;
			game.dx = initialDx;
			game.dy = initialDy;
			game.paddleX = canvas.width/2-paddleRadius;
		}	
	}
					
	game.x += game.dx;
	game.y += game.dy;
}

function paddleCollision() {

	
	ballAngle = Math.atan2(-game.dy,game.dx);
	paddleAngle = Math.atan2(-(game.y-paddleCentreY),(game.x-paddleCentreX));			
	newAngle = Math.PI + 2*paddleAngle - ballAngle;
	if(game.dy >= 0)	{
		game.dx = velLength*Math.cos(newAngle);
		game.dy = -velLength*Math.sin(newAngle); 
	}
} 

function draw() {

	var n = d.getTime();
	if(!spaceFlag)
	{
		game.gameTime += 0.02;
		//paddleX = x - paddleRadius;
		paddleCentreX = game.paddleX+paddleRadius;
		paddleCentreY = canvas.height+paddleRadius/Math.sqrt(2);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		collisionDetection();
		handleBall();
		drawBall();
		drawPaddle();
		//collisionDetection();
		drawBricks();
		drawScore();
		drawLives();
		drawVelocity();
		drawVelocityIndicator();
	}
	game.functionTimes[0] = d.getTime() - n;
}

setInterval(draw, 20);

}