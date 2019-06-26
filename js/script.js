var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.setAttribute("width", window.innerWidth - 275);
canvas.setAttribute("height", window.innerHeight - 50);

document.addEventListener("contextmenu", event => event.preventDefault());

var balls = [];
var walls = [];
var frames = [];
var currentFrame = 0;

var friction = true;
var gravity = false;
var ballCollision = true;
var wallCollision = true;
var edgeCollision = true;
var wrapEdges = false;
var paused = false;
var trail = false;
var standardRadiusBalls = 30;

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
	detectCollision();
	resolveCollision();
	drawObjects();

	if(!paused){requestAnimationFrame(frame);}
}

function applyGravity(){
	for(var ball in balls){
		balls[ball].dy += gravityScale;
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
		balls[ball].x += balls[ball].dx;
		balls[ball].y += balls[ball].dy;
	}
}

function detectCollision(){
	for(var ball in balls){
        if(balls[ball].x < balls[ball].radius + canvasPos.x){balls[ball].x = balls[ball].radius + canvasPos.x; balls[ball].dx *= -elasticity;}
        if(balls[ball].x > canvasWidth - balls[ball].radius + canvasPos.x){balls[ball].x = canvasWidth - balls[ball].radius + canvasPos.x; balls[ball].dx *= -elasticity;}
        if(balls[ball].y < balls[ball].radius + canvasPos.y){balls[ball].y = balls[ball].radius + canvasPos.y; balls[ball].dy *= -elasticity;}
        if(balls[ball].y > canvasHeight - balls[ball].radius + canvasPos.y){balls[ball].y = canvasHeight - balls[ball].radius + canvasPos.y; balls[ball].dy *= -elasticity;}
    }
}

function resolveCollision(){

}

function drawObjects(){
	var p1 = ctx.transformedPoint(0,0);
	var p2 = ctx.transformedPoint(canvas.width,canvas.height);

	if(!trail){
	    ctx.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);
	}

	p1 = canvasPos;
	p2 = {x:p1.x+canvasWidth, y:p1.y+canvasHeight};

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
        ctx.stroke();	
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

    ctx.lineWidth = canvasHeight/500;
    ctx.beginPath();
    ctx.moveTo(p1.x,p1.y);
    ctx.lineTo(p1.x,p2.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p1.x,p1.y);
    ctx.lineTo(p2.x,p1.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p1.x,p2.y);
    ctx.lineTo(p2.x,p2.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p2.x,p2.y);
    ctx.lineTo(p2.x,p1.y);
    ctx.stroke();

    if(!trail){
	    if(!dragging){
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
	    }
	    ctx.lineWidth = 1;
	    ctx.stroke(); 
	    ctx.beginPath();
	    ctx.moveTo(held.right.x,held.right.y);
	    ctx.lineTo(mousePos.x,mousePos.y);
	    ctx.lineWidth = 5;
	    ctx.stroke();
	}
}