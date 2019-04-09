var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.setAttribute("width", window.innerWidth);
canvas.setAttribute("height", window.innerHeight);

document.addEventListener('contextmenu', event => event.preventDefault());

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
    clicks["scroll"] = {x:".", y:"."};
}

var balls = [];
var walls = [];

var friction = true;
var gravity = false;
var collision = true;
var paused = false;
var trail = false;
var ballMode = true;

var standardRadiusBalls = 30;
var images = ["rgb(" + Math.floor(Math.random() * 250) + ", " + Math.floor(Math.random() * 250) + ", " + Math.floor(Math.random() * 250) + ")"];

function draw(){
    if(trail == false){ctx.clearRect(0, 0, canvas.width, canvas.height);}

    if(gravity){applyGravity();}
    if(friction){applyFriction();}
    moveBalls();
    applyCollision();
    drawobjects();

    if(paused==false){requestAnimationFrame(draw);}
}



function applyGravity() {
    for(var ball in balls){
        balls[ball].dy += 0.5;
    }
}

function applyFriction() {
    for(ball in balls){
        balls[ball].dx *= 0.995;
        balls[ball].dy *= 0.995;
    }
}

function moveBalls() {
    for(ball in balls){
        if(ball !== clicks["move"]){
            balls[ball].x += balls[ball].dx;
            balls[ball].y += balls[ball].dy;
        }
    }
}

function applyCollision() {
    if(collision){
        for(ball1 in balls){
            for (var ball2 in balls) {
                if(ball1 < ball2){
                    if(Math.hypot((balls[ball2].x + balls[ball2].dx) - (balls[ball1].x + balls[ball1].dx), (balls[ball2].y + balls[ball2].dy) - (balls[ball1].y + balls[ball1].dy)) < balls[ball1].radius + balls[ball2].radius){
                        var theta1 = Math.atan2(balls[ball1].dy, balls[ball1].dx);
                        var theta2 = Math.atan2(balls[ball2].dy, balls[ball2].dx);
                        var phi = Math.atan2(balls[ball2].y - balls[ball1].y, balls[ball2].x - balls[ball1].x);
                        var m1 = balls[ball1].radius**3;
                        var m2 = balls[ball2].radius**3;
                        var v1 = Math.sqrt(balls[ball1].dx**2 + balls[ball1].dy**2);
                        var v2 = Math.sqrt(balls[ball2].dx**2 + balls[ball2].dy**2);

                        var dx1F = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.cos(phi) + v1*Math.sin(theta1-phi) * Math.cos(phi+Math.PI/2);
                        var dy1F = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.sin(phi) + v1*Math.sin(theta1-phi) * Math.sin(phi+Math.PI/2);
                        var dx2F = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.cos(phi) + v2*Math.sin(theta2-phi) * Math.cos(phi+Math.PI/2);
                        var dy2F = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.sin(phi) + v2*Math.sin(theta2-phi) * Math.sin(phi+Math.PI/2);

                        balls[ball1].dx = dx1F;
                        balls[ball1].dy = dy1F;
                        balls[ball2].dx = dx2F;
                        balls[ball2].dy = dy2F;
                    }
                    if(Math.hypot(balls[ball1].x - balls[ball2].x,balls[ball1].y - balls[ball2].y) < balls[ball1].radius + balls[ball2].radius){
                        var small; var big;
                        if(balls[ball1].radius < balls[ball2].radius){small = ball1; big = ball2}else{small = ball2; big = ball1;}
                        var theta = Math.atan2((balls[big].y - balls[small].y), (balls[big].x - balls[small].x));
                        var overlap = balls[ball1].radius + balls[ball2].radius - Math.hypot(balls[ball1].x - balls[ball2].x,balls[ball1].y - balls[ball2].y);
                        balls[small].x -= overlap * Math.cos(theta);
                        balls[small].y -= overlap * Math.sin(theta);
                    }
                }
            }
        }
    }

    for(wall1 in walls){
        for (var ball1 in balls) {
            var ball = balls[ball1];
            var wall = walls[wall1];

            var dx=ball.x-wall.x1;
            var dy=ball.y-wall.y1;

            var dxx=wall.x2-wall.x1;
            var dyy=wall.y2-wall.y1;

            var t=(dx*dxx+dy*dyy)/(dxx*dxx+dyy*dyy);

            var x=wall.x1+dxx*t;
            var y=wall.y1+dyy*t;

            if(t<0){x=wall.x1;y=wall.y1;}
            if(t>1){x=wall.x2;y=wall.y2;}

            if(Math.hypot((ball.x + ball.dx) - x, (ball.y + ball.dy) - y) < ball.radius){
                var ballAngle = (-Math.atan2(ball.dy, ball.dx)+Math.PI*2)%(Math.PI*2);
                var wallAngle = ((((-(Math.atan2(y - ball.y, x - ball.x)))+Math.PI*2)%(Math.PI*2))+Math.PI/2)%(Math.PI*2);
                var newAngle = 2*wallAngle-ballAngle;
                balls[ball1].dx = Math.cos(newAngle) * Math.sqrt(balls[ball1].dx**2 + balls[ball1].dy**2);
                balls[ball1].dy = -Math.sin(newAngle) * Math.sqrt(balls[ball1].dx**2 + balls[ball1].dy**2);
            }
            if(Math.hypot(ball.x - x, ball.y - y) < ball.radius){
                var theta = Math.atan2((ball.y - y), (ball.x - x));
                var overlap = ball.radius - Math.hypot(ball.x - x, ball.y - y);
                balls[ball1].x += overlap * Math.cos(theta);
                balls[ball1].y += overlap * Math.sin(theta);
            }
        }
    }

    for(ball in balls){
        if(balls[ball].x < balls[ball].radius){balls[ball].x = balls[ball].radius; balls[ball].dx *= -1;}
        if(balls[ball].x > canvas.width - balls[ball].radius){balls[ball].x = canvas.width - balls[ball].radius; balls[ball].dx *= -1;}
        if(balls[ball].y < balls[ball].radius){balls[ball].y = balls[ball].radius; balls[ball].dy *= -1;}
        if(balls[ball].y > canvas.height - balls[ball].radius){balls[ball].y = canvas.height - balls[ball].radius; balls[ball].dy *= -1;}
    }
}    

function drawobjects() {
    for(ball in balls){
        if(balls[ball].color.indexOf("rgb") == 0){
            ctx.beginPath();
            ctx.arc(balls[ball].x, balls[ball].y, balls[ball].radius, 0, 2*Math.PI);
            ctx.closePath();
            ctx.fillStyle = balls[ball].color.slice(0, -1) + ", 0.5)";
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = balls[ball].color;
            ctx.stroke();
        }
        else{
            ctx.beginPath();
            ctx.arc(balls[ball].x, balls[ball].y, balls[ball].radius, 0, 2*Math.PI);
            ctx.closePath();
            ctx.save();
            ctx.clip();
            ctx.drawImage(document.getElementById(balls[ball].color), balls[ball].x - balls[ball].radius, balls[ball].y - balls[ball].radius,balls[ball].radius*2,balls[ball].radius*2);
            ctx.restore();
        }
    }

    for (var wall in walls) {
        ctx.fillStyle = "Black"; 
        ctx.beginPath();
        ctx.moveTo(walls[wall].x1,walls[wall].y1);
        ctx.lineTo(walls[wall].x2,walls[wall].y2);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "Black";
        ctx.stroke();
    }

    if(trail==false){
        ctx.fillStyle = "Black"; 
        ctx.beginPath();
        ctx.moveTo(clicks["leftdown"].x,clicks["leftdown"].y);
        ctx.lineTo(clicks["leftmove"].x,clicks["leftmove"].y);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "Black";
        ctx.stroke();
        var angle = Math.atan2(clicks["leftmove"].y-clicks["leftdown"].y,clicks["leftmove"].x-clicks["leftdown"].x);
        ctx.beginPath();
        ctx.moveTo(clicks["leftmove"].x, clicks["leftmove"].y);
        ctx.lineTo(clicks["leftmove"].x-1*Math.cos(angle-Math.PI/7),clicks["leftmove"].y-1*Math.sin(angle-Math.PI/7));
        ctx.lineTo(clicks["leftmove"].x-1*Math.cos(angle+Math.PI/7),clicks["leftmove"].y-1*Math.sin(angle+Math.PI/7));
        ctx.lineTo(clicks["leftmove"].x, clicks["leftmove"].y);
        ctx.lineTo(clicks["leftmove"].x-1*Math.cos(angle-Math.PI/7),clicks["leftmove"].y-1*Math.sin(angle-Math.PI/7));
        ctx.strokeStyle = "Black";
        ctx.lineWidth = 11;
        ctx.stroke();
        ctx.fillStyle = "Black";
        ctx.fill();
        ctx.beginPath();
        if(isMobile.any()){ctx.arc(clicks["scroll"].x,clicks["scroll"].y,standardRadiusBalls/2,0,Math.PI*2);}else{ctx.arc(clicks["scroll"].x,clicks["scroll"].y,standardRadiusBalls,0,Math.PI*2);}
        ctx.closePath();
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "Black"; 
        ctx.beginPath();
        ctx.moveTo(clicks["rightdown"].x,clicks["rightdown"].y);
        ctx.lineTo(clicks["rightmove"].x,clicks["rightmove"].y);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "Black";
        ctx.stroke();
    }
}


document.onkeydown = checkKeyDown;

function checkKeyDown(e) {

    e = e || window.event;
    
    if (e.keyCode == '72'){ //h
        if(document.getElementById("overlay").style.display == "none"){document.getElementById("overlay").style.display = "block";}
        else{document.getElementById("overlay").style.display = "none";}
    }
    if (e.keyCode == '78'){ //n
        balls[balls.length] = {
            radius:Math.floor(Math.random() * (100 -9)) + 10,
            dx:Math.floor(Math.random() * (25)) + 1,
            dy:Math.floor(Math.random() * (25)) + 1,
            x:Math.floor(Math.random() * canvas.width),
            y:Math.floor(Math.random() * canvas.width),
            color: "rgb(" + Math.floor(Math.random() * 250) + ", " + Math.floor(Math.random() * 250) + ", " + Math.floor(Math.random() * 250) + ")",
        };
    }
    if (e.keyCode == '82'){ //r
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        balls = [];
        walls = [];
        
    }
    if (e.keyCode == '67'){ //c
        collision = !collision;
        if(collision){document.getElementById("collision").innerHTML = "On";}
        else{document.getElementById("collision").innerHTML = "Off";}
    }
    if (e.keyCode == '70'){ //f
        friction = !friction;
        if(friction){document.getElementById("friction").innerHTML = "On";}
        else{document.getElementById("friction").innerHTML = "Off";}
    }
    if (e.keyCode == '71'){ //g
        gravity = !gravity;
        if(gravity){document.getElementById("gravity").innerHTML = "On";}
        else{document.getElementById("gravity").innerHTML = "Off";}
    }
    if (e.keyCode == '73'){ //i
        info();
    }
    if (e.keyCode == '80'){ //p
        paused = !paused;
    }
    if (e.keyCode == '84'){ //t
        trail = !trail;
        if(trail){document.getElementById("trail").innerHTML = "On";}
        else{document.getElementById("trail").innerHTML = "Off";}
    }
}


var clicks = {leftdown:".",leftup:".",rightdown:".",rightup:".",leftmove:".",rightmove:".",scroll:"."};
var scrollTimer = 0;
var moveTimer = 0;
clicks["move"] = false;

if(isMobile.any()){}else{
canvas.onmousedown = function(e){
    if(e.button == 0){
        if(images[images.length-1].indexOf("rgb") == 0){
            images[images.length-1] = "rgb(" + Math.floor(Math.random() * 250) + ", " + Math.floor(Math.random() * 250) + ", " + Math.floor(Math.random() * 250) + ")";
        }
        clicks["leftdown"] = {x:e.clientX, y:e.clientY};
        clicks["leftheld"] = true;

        if(clicks["leftdown"].x < standardRadiusBalls){clicks["leftdown"].x = standardRadiusBalls;}
        if(clicks["leftdown"].x > canvas.width - standardRadiusBalls){clicks["leftdown"].x = canvas.width - standardRadiusBalls;}
        if(clicks["leftdown"].y < standardRadiusBalls){clicks["leftdown"].y = standardRadiusBalls;}
        if(clicks["leftdown"].y > canvas.height - standardRadiusBalls){clicks["leftdown"].y = canvas.height - standardRadiusBalls;}

        for (var ball in balls) {
            if (Math.hypot(balls[ball].x - clicks["leftdown"].x, balls[ball].y - clicks["leftdown"].y) < balls[ball].radius){
                clicks["move"] = ball;
                clicks["moved"] = {x:e.clientX, y:e.clientY};
                balls[ball].x = clicks["leftdown"].x;
                balls[ball].y = clicks["leftdown"].y;
                balls[ball].dx = 0;
                balls[ball].dy = 0;
                clicks["leftdown"] = {x:".", y:"."};
            }
        }
    }
    if(e.button == 2){
        clicks["rightdown"] = {x:e.clientX, y:e.clientY};
        clicks["rightheld"] = true;
    }
    if(e.button == 1){
        standardRadiusBalls = 30;

        clicks["scroll"] = {x:e.clientX, y:e.clientY};
        if(scrollTimer != 0){clearTimeout(scrollTimer);}
        scrollTimer = window.setTimeout("scrollStop()", 500);
    }
};

canvas.onmouseup = function(e){
    if(e.button == 0){
        clicks["leftup"] = {x:e.clientX, y:e.clientY};
        clicks["leftheld"] = false;

        balls[balls.length] = {
            radius:standardRadiusBalls, 
            dx:-(clicks["leftdown"].x-clicks["leftup"].x)/30, 
            dy:-(clicks["leftdown"].y-clicks["leftup"].y)/30,
            x:clicks["leftdown"].x,
            y:clicks["leftdown"].y,
            color: images[images.length-1],
        };

        clicks["leftdown"] = {x:".", y:"."};
        clicks["leftmove"] = {x:".", y:"."};
        clicks["move"] = false;
        clearTimeout(moveTimer);
    }
    if(e.button == 2){
        clicks["rightup"] = {x:e.clientX, y:e.clientY};
        clicks["rightheld"] = false;

        walls[walls.length] = {
            x1:clicks["rightdown"].x, 
            y1:clicks["rightdown"].y,
            x2:clicks["rightup"].x,
            y2:clicks["rightup"].y
        };

        clicks["rightdown"] = {x:".", y:"."};
        clicks["rightmove"] = {x:".", y:"."};
    }
};

window.onmouseout = function(e) {
    if(e.clientY<=0 || e.clientY>=canvas.height){
        if(clicks["leftheld"] == true){
            clicks["leftup"] = {x:e.clientX, y:e.clientY};
            clicks["leftheld"] = false;

            balls[balls.length] = {
                radius:standardRadiusBalls, 
                dx:-(clicks["leftdown"].x-clicks["leftup"].x)/30, 
                dy:-(clicks["leftdown"].y-clicks["leftup"].y)/30,
                x:clicks["leftdown"].x,
                y:clicks["leftdown"].y,
                color: images[images.length-1],
            };

            clicks["leftdown"] = {x:".", y:"."};
            clicks["leftmove"] = {x:".", y:"."};
            clicks["move"] = false;
            clearTimeout(moveTimer);
        }
        if(clicks["rightheld"] == true){
            clicks["rightup"] = {x:e.clientX, y:e.clientY};
            clicks["rightheld"] = false;

            walls[walls.length] = {
                x1:clicks["rightdown"].x, 
                y1:clicks["rightdown"].y,
                x2:clicks["rightup"].x,
                y2:clicks["rightup"].y
            };

            clicks["rightdown"] = {x:".", y:"."};
        }
    }
}

canvas.onmousemove = function(e){
    if(clicks["leftheld"]){
        clicks["leftmove"] = {x:e.clientX, y:e.clientY};
    }

    if(clicks["rightheld"]){
        clicks["rightmove"] = {x:e.clientX, y:e.clientY};
    }

    if(clicks["move"]){
        if(moveTimer != 0){clearTimeout(moveTimer);}
        moveTimer = window.setTimeout("moveStop("+clicks["move"]+")", 1);
        balls[clicks["move"]].x = e.clientX;
        balls[clicks["move"]].y = e.clientY;
        balls[clicks["move"]].dx = e.clientX - clicks["moved"].x;
        balls[clicks["move"]].dy = e.clientY - clicks["moved"].y;

        clicks["moved"] = {x:e.clientX, y:e.clientY};
    }
};

canvas.onwheel = function(e){
    clicks["scroll"] = {x:e.clientX, y:e.clientY};
    if(scrollTimer != 0){clearTimeout(scrollTimer);}
    scrollTimer = window.setTimeout("scrollStop()", 250);

    if(e.deltaY < 0){
        if(standardRadiusBalls < 99){standardRadiusBalls += 2;}
    }
    if(e.deltaY > 0){
        if(standardRadiusBalls > 11){standardRadiusBalls -= 2;}
    }
};
}

canvas.ontouchstart = function(e){
    if(ballMode == true){
        if(images[images.length-1].indexOf("rgb") == 0){
            images[images.length-1] = "rgb(" + Math.floor(Math.random() * 250) + ", " + Math.floor(Math.random() * 250) + ", " + Math.floor(Math.random() * 250) + ")";
        }
        clicks["leftdown"] = {x:e.touches[0].clientX, y:e.touches[0].clientY};
        clicks["leftheld"] = true;

        if(clicks["leftdown"].x < standardRadiusBalls/2){clicks["leftdown"].x = standardRadiusBalls/2;}
        if(clicks["leftdown"].x > canvas.width - standardRadiusBalls/2){clicks["leftdown"].x = canvas.width - standardRadiusBalls/2;}
        if(clicks["leftdown"].y < standardRadiusBalls/2){clicks["leftdown"].y = standardRadiusBalls/2;}
        if(clicks["leftdown"].y > canvas.height - standardRadiusBalls/2){clicks["leftdown"].y = canvas.height - standardRadiusBalls/2;}

        for (var ball in balls) {
            if (Math.hypot(balls[ball].x - clicks["leftdown"].x, balls[ball].y - clicks["leftdown"].y) < balls[ball].radius){
                clicks["move"] = ball;
                clicks["moved"] = {x:e.touches[0].clientX, y:e.touches[0].clientY};
                balls[ball].x = clicks["leftdown"].x;
                balls[ball].y = clicks["leftdown"].y;
                balls[ball].dx = 0;
                balls[ball].dy = 0;
                clicks["leftdown"] = {x:".", y:"."};
            }
        }
    }
    else{
        clicks["rightdown"] = {x:e.touches[0].clientX, y:e.touches[0].clientY};
        clicks["rightheld"] = true;
    }
}

canvas.ontouchend = function(e){
    if(ballMode == true){
        clicks["leftup"] = {x:event.changedTouches[event.changedTouches.length-1].pageX, y:event.changedTouches[event.changedTouches.length-1].pageY};
        clicks["leftheld"] = false;

        balls[balls.length] = {
            radius:standardRadiusBalls/2, 
            dx:-(clicks["leftdown"].x-clicks["leftup"].x)/30, 
            dy:-(clicks["leftdown"].y-clicks["leftup"].y)/30,
            x:clicks["leftdown"].x,
            y:clicks["leftdown"].y,
            color: images[images.length-1],
        };

        clicks["leftdown"] = {x:".", y:"."};
        clicks["leftmove"] = {x:".", y:"."};
        clicks["move"] = false;
        clearTimeout(moveTimer);
    }
    else{
        clicks["rightup"] = {x:event.changedTouches[event.changedTouches.length-1].pageX, y:event.changedTouches[event.changedTouches.length-1].pageY};
        clicks["rightheld"] = false;

        walls[walls.length] = {
            x1:clicks["rightdown"].x, 
            y1:clicks["rightdown"].y,
            x2:clicks["rightup"].x,
            y2:clicks["rightup"].y
        };

        clicks["rightdown"] = {x:".", y:"."};
        clicks["rightmove"] = {x:".", y:"."};
    }
}

canvas.ontouchmove = function(e){
    if(clicks["leftheld"]){
        clicks["leftmove"] = {x:e.touches[0].clientX, y:e.touches[0].clientY};
    }

    if(clicks["rightheld"]){
        clicks["rightmove"] = {x:e.touches[0].clientX, y:e.touches[0].clientY};
    }

    if(clicks["move"]){
        if(moveTimer != 0){clearTimeout(moveTimer);}
        moveTimer = window.setTimeout("moveStop("+clicks["move"]+")", 1);
        balls[clicks["move"]].x = e.touches[0].clientX;
        balls[clicks["move"]].y = e.touches[0].clientY;
        balls[clicks["move"]].dx = e.touches[0].clientX - clicks["moved"].x;
        balls[clicks["move"]].dy = e.touches[0].clientY - clicks["moved"].y;

        clicks["moved"] = {x:e.touches[0].clientX, y:e.touches[0].clientY};
    }
}

function moveStop(ball){
    balls[ball].dx = 0;
    balls[ball].dy = 0;
}

function scrollStop(){
    clicks["scroll"] = {x:".", y:"."};
}

function info() {
    if(document.getElementById("infoTxt").style.display == "block"){document.getElementById("infoTxt").style.display = "none";}
    else{document.getElementById("infoTxt").style.display = "block";}
}


function previewFile(){
    var file = document.querySelector('input[type=file]').files[0];
    var reader = new FileReader();

    if(file){
        reader.readAsDataURL(file);
    }
    else{
        images.push("rgb(" + Math.floor(Math.random() * 250) + ", " + Math.floor(Math.random() * 250) + ", " + Math.floor(Math.random() * 250) + ")");
    }

    reader.onloadend = function () {
        document.getElementById("images").innerHTML += "<img src='" + reader.result + "' id='img" + images.length+ "' style='display:none;'/>";
        images.push("img" + images.length);
    }
}


var navCheck1 = false;
var navCheck2 = false;

function navBarOpenHorizontal() {
    navCheck1 = !navCheck1;
    if(navCheck1){
        document.getElementById("navBar").style.width = "250px";
        if(ballMode){document.getElementById("icon21").style.display = "block";}else{document.getElementById("icon22").style.display = "block";}
        document.getElementById("icon3").style.display = "block";
        if(paused){document.getElementById("icon42").style.display = "block";}else{document.getElementById("icon41").style.display = "block";}
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
    ballMode = false;
}

function circle() {
    document.getElementById("icon21").style.display = "block";
    document.getElementById("icon22").style.display = "none";
    ballMode = true;
}

function reset() {
    balls = [];
    walls = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function paused() {
    document.getElementById("icon42").style.display = "block";
    document.getElementById("icon41").style.display = "none";
    paused = !paused;
}

function play() {
    document.getElementById("icon41").style.display = "block";
    document.getElementById("icon42").style.display = "none";
    paused = !paused;
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

    clicks["scroll"].x = canvas.width/2; clicks["scroll"].y = canvas.height/2;

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

function Trail() {
    if(document.getElementById("Trail").checked == true){trail = true;}
    else{trail = false;}
}


draw();