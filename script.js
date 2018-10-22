//often used variables
var height = window.innerHeight;
var width = window.innerWidth;
var pi = Math.PI;

//create canvas and refresh
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
canvas.setAttribute("width", width);
canvas.setAttribute("height", height);
var refresh = setInterval(draw, 5);

//prevent right click window
document.addEventListener('contextmenu', event => event.preventDefault());

//variables

//balls
var xPosBalls = [];
var yPosBalls = [];
var velBalls = [];
var angleBalls = [];
var radiusBalls = [];
var standardRadiusBalls = 30
var xMoveBalls = [];
var yMoveBalls = [];
var ballCount = 0;

//walls
var xPosWall1 = []; var xPosWall2 = [];
var yPosWall1 = []; var yPosWall2 = [];
var angleWalls = [];
var wallCount = 0;

//mouseclicks
var xPosLeftMove; var xPosLeftDown; var xPosLeftUp;
var yPosLeftMove; var yPosLeftDown; var yPosLeftUp; var leftHeld = false;
var xPosRightMove; var xPosRightDown; var xPosRightUp;
var yPosRightMove; var yPosRightDown; var yPosRightUp; var rightHeld = false;
var scrollTimer = 0; var xPosScroll; var yPosScroll; //scroll variables to show ball radius

//calculation functions

//returns angle from 0-360 degrees, used to calculate angles of new balls and walls
function calcAngle(x1, y1, x2, y2) {
	var xDiff = x2-x1; var yDiff = y2-y1;
	var angle = Math.atan2(yDiff, xDiff) / pi * -180;
	return angle;
}

//returns velocity, used to calculate angles of new balls
function calcVel(x1, y1, x2, y2){
	var vel = Math.hypot(x2-x1, y2-y1)/100;
	return vel;
}

//calculates x and y movement based on angle and velocity
function angleToMove(angle, velocity, i) {
	angle = fixAngle(angle);
	xMoveBalls[i] = Math.cos(angle/180*pi) * velocity;
	yMoveBalls[i] = -Math.sin(angle/180*pi) * velocity;
}

//return angle between 0 and 360 degrees
function fixAngle(angle){
	if(angle>=360){angle-=360;}
	if(angle<0){angle+=360;}

	return angle;
}


//detect mouseclick
canvas.onmousedown = function(e){
	if(e.button == 0){ //left click to spawn balls
		xPosLeftDown = e.clientX; yPosLeftDown = e.clientY; leftHeld = true;

		//prevent balls spawning off screen
		if(xPosLeftDown < standardRadiusBalls){xPosLeftDown = standardRadiusBalls;}
		if(xPosLeftDown > width - standardRadiusBalls){xPosLeftDown = width - standardRadiusBalls;}
		if(yPosLeftDown < standardRadiusBalls){yPosLeftDown = standardRadiusBalls;}
		if(yPosLeftDown > height - standardRadiusBalls){yPosLeftDown = height - standardRadiusBalls;}
	}
	else if(e.button == 2){ //right click to create walls
		xPosRightDown = e.clientX; yPosRightDown = e.clientY; rightHeld = true;

		xPosWall1[wallCount] = xPosRightDown;
    	yPosWall1[wallCount] = yPosRightDown;
	}
	else if(e.button == 1){ //middle click to reset ball radius
		standardRadiusBalls = 30;

		//detect when mouse stops scrolling to show ball radius
		if (scrollTimer != 0){
        clearTimeout(scrollTimer);
	    }
		scrollTimer = window.setTimeout("scrollStop()", 500);

		xPosScroll = xPosLeftMove; yPosScroll = yPosLeftMove;
	}
};


canvas.onmouseup = function(e){
	if(e.button == 0){ //left click to spawn balls
		//prevent spawning in other balls
		var click = true;
		for (var i = 0; i < xPosBalls.length; i++) {
			if(Math.hypot(xPosLeftDown-xPosBalls[i], yPosLeftDown-yPosBalls[i]) < standardRadiusBalls + radiusBalls[i]){
				click = false;
			}
		}
		if(click || ballCount == 0){
 			xPosLeftUp = e.clientX; yPosLeftUp = e.clientY; leftHeld = false;

 			//save ball position and radius
 			xPosBalls.push(xPosLeftDown);
			yPosBalls.push(yPosLeftDown);
			radiusBalls.push(standardRadiusBalls);

			//calculate ball angle, speed and x and y movement
			var tempAngle = calcAngle(xPosLeftDown, yPosLeftDown, xPosLeftUp, yPosLeftUp);
			angleBalls.push(tempAngle);
			var tempVel = calcVel(xPosLeftDown, yPosLeftDown, xPosLeftUp, yPosLeftUp);
			velBalls.push(tempVel);
			angleToMove(tempAngle, tempVel, ballCount);

			//delete left mouse down to remove the arrow
			xPosLeftDown = "."; yPosLeftDown = ".";
			ballCount++;
 		}
 		else{
 			xPosLeftDown = "."; yPosLeftDown = ".";
 		}
	}
	else if(e.button == 2){ //right click to create walls
		xPosRightUp = e.clientX; yPosRightUp = e.clientY; rightHeld = false;

		//save wall position
		xPosWall2[wallCount] = xPosRightUp;
    	yPosWall2[wallCount] = yPosRightUp;

    	//save wall angle
    	angleWalls.push(calcAngle(xPosRightDown, yPosRightDown, xPosRightUp, yPosRightUp));

    	wallCount++;
	}
};

canvas.onmousemove = function(e){
	xPosLeftMove = e.clientX; yPosLeftMove = e.clientY;
    xPosRightMove = e.clientX; yPosRightMove = e.clientY;
    
    if(rightHeld){
	    xPosWall2[wallCount] = xPosRightMove;
	    yPosWall2[wallCount] = yPosRightMove;
	}
};

canvas.onwheel = function(e){
	//detect when mouse stops scrolling to show ball radius
	if (scrollTimer != 0){
        clearTimeout(scrollTimer);
    }
	scrollTimer = window.setTimeout("scrollStop()", 250);

	xPosScroll = xPosLeftMove; yPosScroll = yPosLeftMove;

    if(e.deltaY < 0){ //scroll up
		if(standardRadiusBalls < 100){standardRadiusBalls += 2;}
    }
    if(e.deltaY > 0){ //scroll down
    	if(standardRadiusBalls > 2){standardRadiusBalls -= 2;}
    }
};

//on scroll stop
function scrollStop() {
	xPosScroll = "."; yPosScroll = ".";
}

//draw everything
function draw (){
	//clear canvas
	context.clearRect(0, 0, canvas.width, canvas.height);

	//detect collision
	for (var i = 0; i < xPosBalls.length; i++) {
		//edge collision
		if(xPosBalls[i] < radiusBalls[i]){angleBalls[i] = 180 - angleBalls[i];}
		else if(xPosBalls[i] > width - radiusBalls[i]){angleBalls[i] = 180 - angleBalls[i];}
		else if(yPosBalls[i] < radiusBalls[i]){angleBalls[i] *= -1;}
		else if(yPosBalls[i] > height - radiusBalls[i]){angleBalls[i] *= -1;}
		angleToMove(angleBalls[i], velBalls[i], i);

		//wall collision
		for (var z = 0; z < xPosWall1.length; z++) {

		    var dx=xPosBalls[i]-xPosWall1[z];
		    var dy=yPosBalls[i]-yPosWall1[z];

		    var dxx=xPosWall2[z]-xPosWall1[z];
		    var dyy=yPosWall2[z]-yPosWall1[z];

		    var t=(dx*dxx+dy*dyy)/(dxx*dxx+dyy*dyy);

		    var x=xPosWall1[z]+dxx*t;
		    var y=yPosWall1[z]+dyy*t;

		    if(t<0){x=xPosWall1[z];y=yPosWall1[z];}
		    if(t>1){x=xPosWall2[z];y=yPosWall2[z];}

			if(Math.hypot(x-xPosBalls[i], y-yPosBalls[i]) < radiusBalls[i]){
				angleBalls[i] = 2*angleWalls[z] - angleBalls[i];
				angleToMove(angleBalls[i], velBalls[i], i);
			}
		}

		//ball collision
		for (var z = 0; z < xPosBalls.length; z++) {
			if(z > i){
				if(Math.hypot(xPosBalls[z]-xPosBalls[i], yPosBalls[z]-yPosBalls[i]) < radiusBalls[i] + radiusBalls[z]){
					//angle of the normal through both ball's center
					var collAngle = calcAngle(xPosBalls[i], yPosBalls[i], xPosBalls[z], yPosBalls[z]);
					if(collAngle<90){collAngle+=90;}
					else if(collAngle<270){collAngle-=90;}
					else{collAngle-=270;}

					//calculation of angle
					var theta1 = angleBalls[i]/180*pi;
	                var theta2 = angleBalls[z]/180*pi;
	                var phi = collAngle/180*pi;
	                var m1 = radiusBalls[i];
	                var m2 = radiusBalls[z];
	                var v1 = velBalls[i];
	                var v2 = velBalls[z];

	                var x1 = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.cos(phi) + v1*Math.sin(theta1-phi) * Math.sin(phi);
	                var y1 = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.sin(phi) + v1*Math.sin(theta1-phi) * Math.cos(phi);
	                var x2 = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.cos(phi) + v2*Math.sin(theta2-phi) * Math.sin(phi);
	                var y2 = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.sin(phi) + v2*Math.sin(theta2-phi) * Math.cos(phi);

	                angleBalls[i] = calcAngle(0,0,x1,y1);
	                angleBalls[z] = calcAngle(0,0,x2,y2);

	                angleToMove(angleBalls[i], velBalls[i], i);
	                angleToMove(angleBalls[z], velBalls[z], z);
				}
			}
		}
	}

	//move balls
	for (var i = 0; i < xPosBalls.length; i++) {
		xPosBalls[i] += xMoveBalls[i];
		yPosBalls[i] += yMoveBalls[i];
	}

	//draw arrow on left click held
	context.fillStyle = "Black"; 
	context.beginPath();
	context.moveTo(xPosLeftDown,yPosLeftDown);
	context.lineTo(xPosLeftMove,yPosLeftMove);
	context.lineWidth = 3;
	context.strokeStyle = "Black";
	context.stroke();
	var angle = Math.atan2(yPosLeftMove-yPosLeftDown,xPosLeftMove-xPosLeftDown);
    context.beginPath();
    context.moveTo(xPosLeftMove, yPosLeftMove);
    context.lineTo(xPosLeftMove-1*Math.cos(angle-pi/7),yPosLeftMove-1*Math.sin(angle-pi/7));
    context.lineTo(xPosLeftMove-1*Math.cos(angle+pi/7),yPosLeftMove-1*Math.sin(angle+pi/7));
    context.lineTo(xPosLeftMove, yPosLeftMove);
    context.lineTo(xPosLeftMove-1*Math.cos(angle-pi/7),yPosLeftMove-1*Math.sin(angle-pi/7));
    context.strokeStyle = "Black";
    context.lineWidth = 11;
    context.stroke();
    context.fillStyle = "Black";
    context.fill();

    //draw ball radius on scroll
    context.beginPath();
	context.arc(xPosScroll,yPosScroll,standardRadiusBalls,0,pi*2);
	context.closePath();
	context.lineWidth = 1;
	context.stroke();

	//draw walls
    for (var i = 0; i < xPosWall1.length; i++) {
	    context.fillStyle = "Black"; 
		context.beginPath();
		context.moveTo(xPosWall1[i],yPosWall1[i]);
		context.lineTo(xPosWall2[i],yPosWall2[i]);
		context.lineWidth = 5;
		context.strokeStyle = "Black";
		context.stroke();
	}

	//draw balls
	for (var i = 0; i < xPosBalls.length; i++) {
		if(i % 8 == 0){context.fillStyle = "Blue";}
		if(i % 8 == 1){context.fillStyle = "Red";}
		if(i % 8 == 2){context.fillStyle = "Purple";}
		if(i % 8 == 3){context.fillStyle = "Green";}
		if(i % 8 == 4){context.fillStyle = "Yellow";}
		if(i % 8 == 5){context.fillStyle = "Pink";}
		if(i % 8 == 6){context.fillStyle = "Orange";}
		if(i % 8 == 7){context.fillStyle = "Lightgreen";}

		context.beginPath();
		context.arc(xPosBalls[i],yPosBalls[i],radiusBalls[i],0,pi*2);
		context.closePath();
		context.fill();
	}
}