var pi = Math.PI;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.setAttribute("width", window.innerWidth);
canvas.setAttribute("height", window.innerHeight);

document.addEventListener('contextmenu', event => event.preventDefault());

var ballArray = [];
var wallArray = [];

var friction = true;
var gravity = false;
var collision = true;
var pause = false;
var clear = true;
var ball = true;
var standardRadiusBalls = 30; 

window.onload = mobile;
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
}

function mobile() {
    if(isMobile.any()){
        document.getElementById("info").style.display = "none";
        document.getElementById("navBar").style.display = "block";
    }
}

function edgeCollision(ball) {
    if (ball.x - ball.radius + ball.dx < 0 ||
        ball.x + ball.radius + ball.dx > canvas.width) {
        ball.dx *= -1;
    }
    if (ball.y - ball.radius + ball.dy < 0 ||
        ball.y + ball.radius + ball.dy > canvas.height) {
        ball.dy *= -1;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
    }
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
    }
    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
    }
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
    }    
}

function wallCollision(ball, wall) {
    var dx=ball.x-wall.x1;
    var dy=ball.y-wall.y1;

    var dxx=wall.x2-wall.x1;
    var dyy=wall.y2-wall.y1;

    var t=(dx*dxx+dy*dyy)/(dxx*dxx+dyy*dyy);

    var x=wall.x1+dxx*t;
    var y=wall.y1+dyy*t;

    if(t<0){x=wall.x1;y=wall.y1;}
    if(t>1){x=wall.x2;y=wall.y2;}

    var collisionDetectionDistance = 2.5;

    if(100 - ball.radius + ball.speed()*2 > 100){
        collisionDetectionDistance = 10;
    }

    if(100 - ball.radius + ball.speed()*2 > 150){
        collisionDetectionDistance = 25;
    }

    if(distanceNextFrame2(ball, x, y) < ball.radius + collisionDetectionDistance){
        var angleBall = ball.angle();
        var angleWall = wall.angle();
        if(distanceNextFrame2(ball, wall.x1, wall.y1) < ball.radius + 2.5){
            angleWall = Math.atan2(ball.y - wall.y1, ball.x - wall.x1) - pi/2;
            if(Math.abs(angleWall + pi/2) > Math.abs(wall.angle() + pi/2)){
                angleWall = wall.angle();
                alert();
            }
        }
        if(distanceNextFrame2(ball, wall.x2, wall.y2) < ball.radius + 2.5){
            angleWall = Math.atan2(ball.y - wall.y2, ball.x - wall.x2) - pi/2;
            if(Math.abs(angleWall + pi/2) < Math.abs(wall.angle() + pi/2)){
                angleWall = wall.angle();
                alert();
            }
        }
        var newAngle = angleWall*2 - angleBall;
        if(newAngle>=2*pi){newAngle-=2*pi;}
        if(newAngle<0){newAngle+=2*pi;}
        ball.dx = Math.cos(newAngle) * ball.speed();
        ball.dy = Math.sin(newAngle) * ball.speed();
    }

    if(distance2(ball.x, ball.y, x, y) < ball.radius + 2.5){
        ball.grav -= 1;
        ball.wallX = Math.abs(wall.x1 - wall.x2);
        if(wall.y1>wall.y2&&wall.x1<wall.x2){ball.wallX *= -1;}
        if(wall.y2>wall.y1&&wall.x2<wall.x1){ball.wallX *= -1;}
        ball.wallY = Math.abs(wall.y1 - wall.y2);
        ball.wallAngle = Math.abs((wall.angle() % pi)/pi);
    }
    else{
        ball.grav += 1;
    }
    if(distance2(ball.x, ball.y, x, y) < ball.radius){
        var theta = Math.atan2((ball.y - y), (ball.x - x));
        var overlap = ball.radius + 5 - distance2(ball.x, ball.y, x, y);
        ball.x += overlap * Math.cos(theta);
        ball.y += overlap * Math.sin(theta);
    }
}

function ballCollision() {
    for (var ball1 in ballArray) {
        if(collision){
            for (var ball2 in ballArray) {
                if (ball1 !== ball2 && distanceNextFrame(ballArray[ball1], ballArray[ball2]) <= 0) {
                    var theta1 = ballArray[ball1].angle();
                    var theta2 = ballArray[ball2].angle();
                    var phi = Math.atan2(ballArray[ball2].y - ballArray[ball1].y, ballArray[ball2].x - ballArray[ball1].x);
                    var m1 = ballArray[ball1].mass;
                    var m2 = ballArray[ball2].mass;
                    var v1 = ballArray[ball1].speed();
                    var v2 = ballArray[ball2].speed();

                    var dx1F = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.cos(phi) + v1*Math.sin(theta1-phi) * Math.cos(phi+Math.PI/2);
                    var dy1F = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.sin(phi) + v1*Math.sin(theta1-phi) * Math.sin(phi+Math.PI/2);
                    var dx2F = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.cos(phi) + v2*Math.sin(theta2-phi) * Math.cos(phi+Math.PI/2);
                    var dy2F = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.sin(phi) + v2*Math.sin(theta2-phi) * Math.sin(phi+Math.PI/2);

                    ballArray[ball1].dx = dx1F;
                    ballArray[ball1].dy = dy1F;
                    ballArray[ball2].dx = dx2F;
                    ballArray[ball2].dy = dy2F;

                    if(friction){ballArray[ball1].dx*=0.95; ballArray[ball1].dy*=0.95; ballArray[ball2].dx*=0.95; ballArray[ball2].dy*=0.95;}
                }
                if (ball1 !== ball2 && distance(ballArray[ball1], ballArray[ball2]) < ballArray[ball1].radius + ballArray[ball2].radius) {
                    var theta = Math.atan2((ballArray[ball1].y - ballArray[ball2].y), (ballArray[ball1].x - ballArray[ball2].x));
                    var overlap = ballArray[ball1].radius + ballArray[ball2].radius - distance (ballArray[ball1], ballArray[ball2]);
                    var smallerobject = ballArray[ball1].radius < ballArray[ball2].radius ? ball1 : ball2
                    ballArray[smallerobject].x -= overlap * Math.cos(theta);
                    ballArray[smallerobject].y -= overlap * Math.sin(theta);
                    if(ballArray[ball1].dy < 0){
                        ballArray[ball1].grav = ".";
                    }
                    if(ballArray[ball2].dy < 0){
                        ballArray[ball1].grav = ".";
                    }
                }
            }
        }
        edgeCollision(ballArray[ball1]);
        for (var wall1 in wallArray) {
            wallCollision(ballArray[ball1], wallArray[wall1]);
        }
    }   
}

function applyGravity() {
    for (var ball1 in ballArray) {
        if (ballArray[ball1].onGround() == false) {
            if(ballArray[ball1].grav == wallArray.length){
                ballArray[ball1].dy += 0.29;
            }
            else if(ballArray[ball1].grav == wallArray.length -2){
                ballArray[ball1].dy += 0.29 * (ballArray[ball1].wallY/(Math.abs(ballArray[ball1].wallY) + Math.abs(ballArray[ball1].wallX))) * ballArray[ball1].wallAngle;
                ballArray[ball1].dx += 0.29 * (ballArray[ball1].wallX/(Math.abs(ballArray[ball1].wallY) + Math.abs(ballArray[ball1].wallX))) * ballArray[ball1].wallAngle;
            }
        }
        ballArray[ball1].grav = 0;
    }
}

function applyFriction() {
    for (var ball in ballArray) {
        ballArray[ball].dx *= 0.995;
        ballArray[ball].dy *= 0.995;
    }
}

function moveBalls() {
    for (var ball in ballArray) {
        ballArray[ball].x += ballArray[ball].dx;
        ballArray[ball].y += ballArray[ball].dy;
    }    
}

function drawobjects() {
    for (var ball in ballArray) {
        ballArray[ball].draw();
    }
    for (var wall in wallArray) {
        wallArray[wall].draw();
    }

    if(clear){
        ctx.fillStyle = "Black"; 
        ctx.beginPath();
        ctx.moveTo(xPosLeftDown,yPosLeftDown);
        ctx.lineTo(xPosLeftMove,yPosLeftMove);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "Black";
        ctx.stroke();
        var angle = Math.atan2(yPosLeftMove-yPosLeftDown,xPosLeftMove-xPosLeftDown);
        ctx.beginPath();
        ctx.moveTo(xPosLeftMove, yPosLeftMove);
        ctx.lineTo(xPosLeftMove-1*Math.cos(angle-pi/7),yPosLeftMove-1*Math.sin(angle-pi/7));
        ctx.lineTo(xPosLeftMove-1*Math.cos(angle+pi/7),yPosLeftMove-1*Math.sin(angle+pi/7));
        ctx.lineTo(xPosLeftMove, yPosLeftMove);
        ctx.lineTo(xPosLeftMove-1*Math.cos(angle-pi/7),yPosLeftMove-1*Math.sin(angle-pi/7));
        ctx.strokeStyle = "Black";
        ctx.lineWidth = 11;
        ctx.stroke();
        ctx.fillStyle = "Black";
        ctx.fill();
        ctx.beginPath();
        if(isMobile.any()){ctx.arc(xPosScroll,yPosScroll,standardRadiusBalls/2,0,pi*2);}else{ctx.arc(xPosScroll,yPosScroll,standardRadiusBalls,0,pi*2);}
        ctx.closePath();
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "Black"; 
        ctx.beginPath();
        ctx.moveTo(xPosRightDown,yPosRightDown);
        ctx.lineTo(xPosRightMove,yPosRightMove);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "Black";
        ctx.stroke();
    }
}

function draw() {
    if(clear){ctx.clearRect(0, 0, canvas.width, canvas.height);}
    if(pause==false){
    if(gravity){applyGravity();}
    if(friction){applyFriction();}   
    moveBalls();
    ballCollision();
    }
    drawobjects();
    requestAnimationFrame(draw);
}

var xPosLeftMove; var xPosLeftDown; var xPosLeftUp;
var yPosLeftMove; var yPosLeftDown; var yPosLeftUp; var leftHeld = false;
var xPosRightMove; var xPosRightDown; var xPosRightUp;
var yPosRightMove; var yPosRightDown; var yPosRightUp; var rightHeld = false;
var scrollTimer = 0; var xPosScroll; var yPosScroll;


if(isMobile.any()){}else{
canvas.onmousedown = function(e){
    if(e.button == 0){
        xPosLeftDown = e.clientX; yPosLeftDown = e.clientY; leftHeld = true;

        if(xPosLeftDown < standardRadiusBalls){xPosLeftDown = standardRadiusBalls;}
        if(xPosLeftDown > canvas.width - standardRadiusBalls){xPosLeftDown = canvas.width - standardRadiusBalls;}
        if(yPosLeftDown < standardRadiusBalls){yPosLeftDown = standardRadiusBalls;}
        if(yPosLeftDown > canvas.height - standardRadiusBalls){yPosLeftDown = canvas.height - standardRadiusBalls;}
    }
    else if(e.button == 2){
        xPosRightDown = e.clientX; yPosRightDown = e.clientY; rightHeld = true;
    }
    else if(e.button == 1){
        standardRadiusBalls = 30;

        if (scrollTimer != 0){
        clearTimeout(scrollTimer);
        }
        scrollTimer = window.setTimeout("scrollStop()", 500);

        xPosScroll = xPosLeftMove; yPosScroll = yPosLeftMove;
    }
};

canvas.onmouseup = function(e){
    if(e.button == 0){
        var click = true;
        for (var ball1 in ballArray) {
            if (distance2(ballArray[ball1].x, ballArray[ball1].y, xPosLeftDown, yPosLeftDown) < ballArray[ball1].radius){
                click = false;
            }
        }
        if(click){
            xPosLeftUp = e.clientX; yPosLeftUp = e.clientY; leftHeld = false;

            ballArray[ballArray.length] = new Ball(xPosLeftDown, yPosLeftDown, -(xPosLeftDown-xPosLeftUp)/30, -(yPosLeftDown-yPosLeftUp)/30, standardRadiusBalls);

            xPosLeftDown = "."; yPosLeftDown = ".";
        }
        else{
            xPosLeftDown = "."; yPosLeftDown = ".";
        }
    }
    else if(e.button == 2){
        xPosRightUp = e.clientX; yPosRightUp = e.clientY; rightHeld = false;
        xPosRightMove = "."; yPosRightMove = ".";

        wallArray[wallArray.length] = new Wall(xPosRightDown, yPosRightDown, xPosRightUp, yPosRightUp);

        xPosRightDown = "."; yPosRightDown = ".";
    }
};

canvas.onmousemove = function(e){
    xPosLeftMove = e.clientX; yPosLeftMove = e.clientY;
    xPosRightMove = e.clientX; yPosRightMove = e.clientY;

    if(rightHeld){
        xPosRightMove = e.clientX; yPosRightMove = e.clientY;
    }
};

canvas.onwheel = function(e){
    if (scrollTimer != 0){
        clearTimeout(scrollTimer);
    }
    scrollTimer = window.setTimeout("scrollStop()", 250);

    xPosScroll = xPosLeftMove; yPosScroll = yPosLeftMove;

    if(e.deltaY < 0){
        if(standardRadiusBalls < 99){standardRadiusBalls += 2;}
    }
    if(e.deltaY > 0){
        if(standardRadiusBalls > 12){standardRadiusBalls -= 2;}
    }
};
}

function scrollStop() {
    xPosScroll = "."; yPosScroll = ".";
}

document.onkeydown = checkKeyDown;

function checkKeyDown(e) {

    e = e || window.event;
    
    if (e.keyCode == '78'){ //n
        ballArray[ballArray.length] = new Ball(randomX(), randomY(), randomDx(), randomDy(), randomRadius());
    }
    if (e.keyCode == '82'){ //r
        ballArray = [];
        wallArray = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (e.keyCode == '65'){ //a
        clear = !clear;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (e.keyCode == '67'){ //c
        collision = !collision;
    }
    if (e.keyCode == '70'){ //f
        friction = !friction;
    }
    if (e.keyCode == '71'){ //g
        gravity = !gravity;
    }
    if (e.keyCode == '72'){ //h
        if(document.getElementById("info").style.display == ""){document.getElementById("info").style.display = "none";}
        else if(document.getElementById("info").style.display == "none"){document.getElementById("info").style.display = "";}
    }
    if (e.keyCode == '80'){ //p
        pause = !pause;
    }
}

var touchDownX; var touchDownY;

canvas.ontouchstart = function(e){
    if(e.touches[0].clientY < canvas.height){
        if(ball == true){
            xPosLeftDown = e.touches[0].clientX; yPosLeftDown = e.touches[0].clientY; leftHeld = true;
            xPosLeftMove = e.touches[0].clientX; yPosLeftMove = e.touches[0].clientY;

            if(xPosLeftDown < standardRadiusBalls/2){xPosLeftDown = standardRadiusBalls/2;}
            if(xPosLeftDown > canvas.width - standardRadiusBalls/2){xPosLeftDown = canvas.width - standardRadiusBalls/2;}
            if(yPosLeftDown < standardRadiusBalls/2){yPosLeftDown = standardRadiusBalls/2;}
            if(yPosLeftDown > canvas.height - standardRadiusBalls/2){yPosLeftDown = canvas.height - standardRadiusBalls/2;}
        }
        else{
            xPosRightDown = e.touches[0].clientX; yPosRightDown = e.touches[0].clientY; rightHeld = true;
            xPosRightMove = e.touches[0].clientX; yPosRightMove = e.touches[0].clientY;
        }
    }
    else {
        touchDownX = e.touches[0].clientX; touchDownY = e.touches[0].clientY;
    }
};

canvas.ontouchend = function(e){
    if(ball == true){
        var click = true;
        for (var ball1 in ballArray) {
            if (distance2(ballArray[ball1].x, ballArray[ball1].y, xPosLeftDown, yPosLeftDown) < ballArray[ball1].radius){
                click = false;
            }
        }
        if(click){
            xPosLeftUp = event.changedTouches[event.changedTouches.length-1].pageX; yPosLeftUp = event.changedTouches[event.changedTouches.length-1].pageY; leftHeld = false;

            ballArray[ballArray.length] = new Ball(xPosLeftDown, yPosLeftDown, -(xPosLeftDown-xPosLeftUp)/30, -(yPosLeftDown-yPosLeftUp)/30, standardRadiusBalls/2);

            xPosLeftDown = "."; yPosLeftDown = ".";
        }
        else{
            xPosLeftDown = "."; yPosLeftDown = ".";
        }
    }
    else{
        xPosRightUp = event.changedTouches[event.changedTouches.length-1].pageX; yPosRightUp = event.changedTouches[event.changedTouches.length-1].pageY; rightHeld = false;
        xPosRightMove = "."; yPosRightMove = ".";

        wallArray[wallArray.length] = new Wall(xPosRightDown, yPosRightDown, xPosRightUp, yPosRightUp);

        xPosRightDown = "."; yPosRightDown = ".";
    }
};

canvas.ontouchmove = function(e){
    xPosLeftMove = e.touches[0].clientX; yPosLeftMove = e.touches[0].clientY;
    xPosRightMove = e.touches[0].clientX; yPosRightMove = e.touches[0].clientY;

    if(rightHeld){
        xPosRightMove = e.touches[0].clientX; yPosRightMove = e.touches[0].clientY;
    }
};

window.addEventListener("orientationchange", function() {
    location.reload();
}, false);

var navCheck = false;
var navCheck2 = false;

function navBarOpenHorizontal() {
    navCheck = !navCheck;
    if(navCheck){
        document.getElementById("navBar").style.width = "250px";
        if(ball){document.getElementById("icon21").style.display = "block";}else{document.getElementById("icon22").style.display = "block";}
        document.getElementById("icon3").style.display = "block";
        if(pause){document.getElementById("icon42").style.display = "block";}else{document.getElementById("icon41").style.display = "block";}
        if(navCheck2 == false){document.getElementById("icon51").style.display = "block";}else{document.getElementById("icon52").style.display = "block"; document.getElementById("navBar").style.height = "80px"; document.getElementById("checkboxes1").style.display = "block"; document.getElementById("checkboxes2").style.display = "block";}
        document.getElementById("myRange").style.display = "block";
    }
    else{
        document.getElementById("navBar").style.width = "25px";
        document.getElementById("navBar").style.height = "25px";
        document.getElementById("icon21").style.display = "none";
        document.getElementById("icon22").style.display = "none";
        document.getElementById("icon3").style.display = "none";
        document.getElementById("icon41").style.display = "none";
        document.getElementById("icon42").style.display = "none";
        document.getElementById("icon51").style.display = "none";
        document.getElementById("icon52").style.display = "none";
        document.getElementById("myRange").style.display = "none";
        document.getElementById("checkboxes1").style.display = "none";
        document.getElementById("checkboxes2").style.display = "none";
    }
}

function line() {
    document.getElementById("icon22").style.display = "block";
    document.getElementById("icon21").style.display = "none";
    ball = false;
}

function circle() {
    document.getElementById("icon21").style.display = "block";
    document.getElementById("icon22").style.display = "none";
    ball = true;
}

function reset() {
    ballArray = [];
    wallArray = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function pause1() {
    document.getElementById("icon42").style.display = "block";
    document.getElementById("icon41").style.display = "none";
    pause = !pause;
}

function play1() {
    document.getElementById("icon41").style.display = "block";
    document.getElementById("icon42").style.display = "none";
    pause = !pause;
}

function navBarOpenVertical() {
    navCheck2 = true;
    document.getElementById("icon52").style.display = "block";
    document.getElementById("icon51").style.display = "none";
    document.getElementById("navBar").style.height = "80px";
    document.getElementById("checkboxes1").style.display = "block";
    document.getElementById("checkboxes2").style.display = "block";
}

function navBarCloseVertical() {
    navCheck2 = false;
    document.getElementById("icon51").style.display = "block";
    document.getElementById("icon52").style.display = "none";
    document.getElementById("navBar").style.height = "25px";
    document.getElementById("checkboxes1").style.display = "none";
    document.getElementById("checkboxes2").style.display = "none";
}

var slider = document.getElementById("myRange");

slider.oninput = function() {
    if (scrollTimer != 0){
        clearTimeout(scrollTimer);
    }
    scrollTimer = window.setTimeout("scrollStop()", 250);

    xPosScroll = canvas.width/2; yPosScroll = canvas.height/2;

    standardRadiusBalls = slider.value;
}

function Gravity() {
    if(document.getElementById("Gravity").checked == true){gravity = true;}
    else{gravity = false;}
}

function Collision() {
    if(document.getElementById("Collision").checked == true){collision = true;}
    else{collision = false;}
}

function Friction() {
    if(document.getElementById("Friction").checked == true){friction = true;}
    else{friction = false;}
}

function Art() {
    if(document.getElementById("Art").checked == true){clear = false;}
    else{clear = true;}
}

draw();