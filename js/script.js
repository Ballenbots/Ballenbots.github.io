var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.setAttribute("width", window.innerWidth - 275);
canvas.setAttribute("height", window.innerHeight - 50);

document.addEventListener("contextmenu", event => event.preventDefault());

var balls = [];
var walls = [];
var frames = [];
var currentFrame = 0;
var contacts;

var friction = true;
var gravity = false;
var ballCollision = true;
var wallCollision = true;
var edgeCollision = true;
var wrapEdges = true;
var paused = false;
var trail = false;
var standardRadiusBalls = 25;

var basegravityScale = 0.5; var gravityScale = basegravityScale;
var basefrictionScale = 0.005; var frictionScale = basefrictionScale;
var baseelasticity = 1; var elasticity = baseelasticity;

var canvasPos = {x:0, y:0};
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;

window.onload = function() {
	trackTransforms(ctx);
	frame();
}

function frame(){
	frames.length = currentFrame;
	frames.push({balls: JSON.parse(JSON.stringify(balls)), walls: JSON.parse(JSON.stringify(walls))});
	currentFrame++;

	if(gravity){applyGravity();}
	if(friction){applyFriction();}
	moveBalls();
	collision();
	drawObjects();

	if(!paused){requestAnimationFrame(frame);}
}

function applyGravity(){
	for(var ball in balls){
		if(Number(ball) !== dragging){
			balls[ball].dy += gravityScale;
		}
	}
}

function applyFriction(){
	for(var ball in balls){
		balls[ball].dx *= (1-frictionScale);
		balls[ball].dy *= (1-frictionScale);
	}
}

function moveBalls(){
	for(var ball in balls){
		if(Number(ball) !== dragging){
			balls[ball].x += balls[ball].dx;
			balls[ball].y += balls[ball].dy;
		}
	}
}

function collision(){
	if(ballCollision){
		for(var ball1 in balls){
			for (var ball2 in balls) {
				if(ball1 < ball2 && (Number(ball1) !== dragging && Number(ball2) !== dragging)){
					if(Math.hypot(balls[ball2].x - balls[ball1].x, balls[ball2].y - balls[ball1].y) <= balls[ball1].radius + balls[ball2].radius){
						var theta = Math.atan2(balls[ball2].y - balls[ball1].y, balls[ball2].x - balls[ball1].x);
						var overlap = balls[ball1].radius + balls[ball2].radius - Math.hypot(balls[ball1].x - balls[ball2].x, balls[ball1].y - balls[ball2].y);
						balls[ball1].x -= overlap * Math.cos(theta)/((balls[ball1].mass/balls[ball2].mass)+1);
						balls[ball1].y -= overlap * Math.sin(theta)/((balls[ball1].mass/balls[ball2].mass)+1);
						balls[ball2].x += overlap * Math.cos(theta)/((balls[ball2].mass/balls[ball1].mass)+1);
						balls[ball2].y += overlap * Math.sin(theta)/((balls[ball2].mass/balls[ball1].mass)+1);

						var phi = Math.atan2(balls[ball2].y - balls[ball1].y, balls[ball2].x - balls[ball1].x);
						var theta1 = Math.atan2(balls[ball1].dy, balls[ball1].dx);
						var theta2 = Math.atan2(balls[ball2].dy, balls[ball2].dx);
						var m1 = balls[ball1].mass;
						var m2 = balls[ball2].mass;
						var v1 = Math.sqrt(balls[ball1].dx**2 + balls[ball1].dy**2);
						var v2 = Math.sqrt(balls[ball2].dx**2 + balls[ball2].dy**2);

						balls[ball1].dx = (elasticity*m2*(v2*Math.cos(theta2-phi)-v1*Math.cos(theta1-phi)) + m1*v1*Math.cos(theta1-phi) + m2*v2*Math.cos(theta2-phi)) / (m1+m2)*Math.cos(phi) + v1*Math.sin(theta1-phi)*Math.cos(phi+Math.PI/2);
						balls[ball1].dy = (elasticity*m2*(v2*Math.cos(theta2-phi)-v1*Math.cos(theta1-phi)) + m1*v1*Math.cos(theta1-phi) + m2*v2*Math.cos(theta2-phi)) / (m1+m2)*Math.sin(phi) + v1*Math.sin(theta1-phi)*Math.sin(phi+Math.PI/2);
						balls[ball2].dx = (elasticity*m1*(v1*Math.cos(theta1-phi)-v2*Math.cos(theta2-phi)) + m2*v2*Math.cos(theta2-phi) + m1*v1*Math.cos(theta1-phi)) / (m1+m2)*Math.cos(phi) + v2*Math.sin(theta2-phi)*Math.cos(phi+Math.PI/2);
						balls[ball2].dy = (elasticity*m1*(v1*Math.cos(theta1-phi)-v2*Math.cos(theta2-phi)) + m2*v2*Math.cos(theta2-phi) + m1*v1*Math.cos(theta1-phi)) / (m1+m2)*Math.sin(phi) + v2*Math.sin(theta2-phi)*Math.sin(phi+Math.PI/2);
					}
				}
			}
		}
	}

	if(wallCollision){
		for(var ball in balls){
			for (var wall in walls){
				if(Number(ball) !== dragging){
					var wallPos = ClosestPointOnWall(balls[ball].x, balls[ball].y, walls[wall]);
					if(Math.hypot(balls[ball].x - wallPos.x, balls[ball].y - wallPos.y) < balls[ball].radius){
						var theta = Math.atan2(balls[ball].dy, balls[ball].dx);
						var phi = Math.atan2(wallPos.y - balls[ball].y, wallPos.x - balls[ball].x);
						var v = Math.sqrt(balls[ball].dx**2 + balls[ball].dy**2);

						balls[ball].dx = (elasticity*(-v*Math.cos(theta-phi))) * Math.cos(phi) + v*Math.sin(theta-phi)*Math.cos(phi+Math.PI/2);
						balls[ball].dy = (elasticity*(-v*Math.cos(theta-phi))) * Math.sin(phi) + v*Math.sin(theta-phi)*Math.sin(phi+Math.PI/2);
					}

					if(Math.hypot(balls[ball].x - wallPos.x, balls[ball].y - wallPos.y) < balls[ball].radius){
						var theta = Math.atan2((balls[ball].y - wallPos.y), (balls[ball].x - wallPos.x));
						var overlap = balls[ball].radius - Math.hypot(balls[ball].x - wallPos.x, balls[ball].y - wallPos.y);
						balls[ball].x += overlap * Math.cos(theta);
						balls[ball].y += overlap * Math.sin(theta);
					}
				}
			}
		}
	}

	for(var ball in balls){
		if(Number(ball) !== dragging){
			if(edgeCollision){
				if(balls[ball].x < balls[ball].radius + canvasPos.x){balls[ball].x = balls[ball].radius + canvasPos.x; balls[ball].dx *= -elasticity;}
				if(balls[ball].x > canvasWidth - balls[ball].radius + canvasPos.x){balls[ball].x = canvasWidth - balls[ball].radius + canvasPos.x; balls[ball].dx *= -elasticity;}
				if(balls[ball].y < balls[ball].radius + canvasPos.y){balls[ball].y = balls[ball].radius + canvasPos.y; balls[ball].dy *= -elasticity;}
				if(balls[ball].y > canvasHeight - balls[ball].radius + canvasPos.y){balls[ball].y = canvasHeight - balls[ball].radius + canvasPos.y; balls[ball].dy *= -elasticity;}
			}
			else if(wrapEdges){
				if(balls[ball].x < -balls[ball].radius + canvasPos.x){balls[ball].x = canvasWidth + balls[ball].radius + canvasPos.x;}
				if(balls[ball].x > canvasWidth + balls[ball].radius + canvasPos.x){balls[ball].x = -balls[ball].radius + canvasPos.x;}
				if(balls[ball].y < -balls[ball].radius + canvasPos.y){balls[ball].y = canvasHeight + balls[ball].radius + canvasPos.y;}
				if(balls[ball].y > canvasHeight + balls[ball].radius + canvasPos.y){balls[ball].y = -balls[ball].radius + canvasPos.y;}
			}
			else{
				if(balls[ball].x < -balls[ball].radius + canvasPos.x){balls.splice(ball,1); continue;}
				if(balls[ball].x > canvasWidth + balls[ball].radius + canvasPos.x){balls.splice(ball,1); continue;}
				if(balls[ball].y < -balls[ball].radius + canvasPos.y){balls.splice(ball,1); continue;}
				if(balls[ball].y > canvasHeight + balls[ball].radius + canvasPos.y){balls.splice(ball,1); continue;}
			}
		}
	}
}

function drawObjects(){
	var fullCanvasP1 = ctx.transformedPoint(0,0);
	var fullCanvasP2 = ctx.transformedPoint(canvas.width,canvas.height);

	if(!trail){
		ctx.clearRect(fullCanvasP1.x,fullCanvasP1.y,fullCanvasP2.x-fullCanvasP1.x,fullCanvasP2.y-fullCanvasP1.y);
	}

	var canvasP1 = canvasPos;
	var canvasP2 = {x:canvasP1.x+canvasWidth, y:canvasP1.y+canvasHeight};

	for(var ball in balls){
		ctx.globalAlpha = 0.5;
		ctx.beginPath();
		ctx.arc(balls[ball].x, balls[ball].y, balls[ball].radius, 0, 2*Math.PI);
		ctx.closePath();
		ctx.fillStyle = balls[ball].color;
		ctx.fill();
		ctx.globalAlpha = 1;
		ctx.lineWidth = 1;
		ctx.strokeStyle = balls[ball].color;
		if(Number(ball)!==dragging){ctx.stroke();}
	}

	ctx.strokeStyle = "black";
	ctx.fillStyle = "black";

	for (var wall in walls) { 
		ctx.beginPath();
		ctx.moveTo(walls[wall].x1,walls[wall].y1);
		ctx.lineTo(walls[wall].x2,walls[wall].y2);
		ctx.lineWidth = 5;
		ctx.stroke();
	}

	if(!trail){
		if(dragging === false){
			ctx.beginPath();
			ctx.moveTo(held.left.x,held.left.y);
			ctx.lineTo(mousePos.x,mousePos.y);
			ctx.lineWidth = 3;
			ctx.stroke();
			var angle = Math.atan2(mousePos.y-held.left.y,mousePos.x-held.left.x);
			ctx.beginPath();
			ctx.moveTo(mousePos.x, mousePos.y);
			ctx.lineTo(mousePos.x-1*Math.cos(angle-Math.PI/7),mousePos.y-1*Math.sin(angle-Math.PI/7));
			ctx.lineTo(mousePos.x-1*Math.cos(angle+Math.PI/7),mousePos.y-1*Math.sin(angle+Math.PI/7));
			ctx.lineTo(mousePos.x, mousePos.y);
			ctx.lineTo(mousePos.x-1*Math.cos(angle-Math.PI/7),mousePos.y-1*Math.sin(angle-Math.PI/7));
			ctx.lineWidth = 11;
			ctx.stroke();
			ctx.fill();
		}
		if(scrolling>0){
			ctx.beginPath();
			ctx.arc(mousePos.x,mousePos.y,standardRadiusBalls,0,Math.PI*2);
			ctx.closePath();
			ctx.lineWidth = 1;
			ctx.stroke();
		}
		ctx.beginPath();
		ctx.moveTo(held.right.x,held.right.y);
		ctx.lineTo(mousePos.x,mousePos.y);
		ctx.lineWidth = 5;
		ctx.stroke();
	}

	ctx.clearRect(fullCanvasP1.x,fullCanvasP1.y,canvasP1.x-fullCanvasP1.x,fullCanvasP2.y-fullCanvasP1.y);
	ctx.clearRect(fullCanvasP1.x,fullCanvasP1.y,fullCanvasP2.x-fullCanvasP1.x,canvasP1.y-fullCanvasP1.y);
	ctx.clearRect(fullCanvasP2.x,fullCanvasP2.y,-(fullCanvasP2.x-canvasP2.x),-(fullCanvasP2.y-fullCanvasP1.y));
	ctx.clearRect(fullCanvasP2.x,fullCanvasP2.y,-(fullCanvasP2.x-fullCanvasP1.x),-(fullCanvasP2.y-canvasP2.y));

	ctx.beginPath();
	ctx.rect(canvasP1.x,canvasP1.y,canvasP2.x-canvasP1.x,canvasP2.y-canvasP1.y);
	ctx.lineWidth = canvasHeight/500;
	ctx.stroke();
}