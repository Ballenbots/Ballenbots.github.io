var mousePos = {x:".", y:"."};
var held = {"left":".", "right":".", "shiftKey":"."};
var scrolling = 0;
var dragging = false;

canvas.onmousedown = function(e){
    if(held.shiftKey == true){
		if(e.button == 0){
			held.left = {x:mousePos.x, y:mousePos.y};
			dragging = true;
		}
		if(e.button == 1){
			canvasPos = ctx.transformedPoint(0,0);
	    	canvasWidth = ctx.transformedPoint(canvas.width,canvas.height).x - ctx.transformedPoint(0,0).x;
	    	canvasHeight = ctx.transformedPoint(canvas.width,canvas.height).y - ctx.transformedPoint(0,0).y;
		}
		if(e.button == 2){
			held.right = {x:mousePos.x, y:mousePos.y};
		}
    }
    else{
		if(e.button == 0){
			held.left = {x:mousePos.x, y:mousePos.y};
		}
		if(e.button == 1){
			standardRadiusBalls = 30;
			if(scrolling != 0){clearTimeout(scrolling);}
        	scrolling = window.setTimeout(function(){scrolling = 0}, 250);
		}
		if(e.button == 2){
			held.right = {x:mousePos.x, y:mousePos.y};
		}
    }
}

canvas.onmouseup = function(e){
    if(held.shiftKey == true){
		if(e.button == 0){
			held.left = ".";
			dragging = false;
		}
		if(e.button == 2){
			walls[walls.length] = {
	            x1:held.right.x, 
	            y1:held.right.y,
	            x2:mousePos.x,
	            y2:mousePos.y
	        };

			held.right = ".";
		}
    }
    else{
		if(e.button == 0){
			balls[balls.length] = {
                radius:standardRadiusBalls,
                mass:standardRadiusBalls**3,
                dx:-(held.left.x-mousePos.x)/30,
                dy:-(held.left.y-mousePos.y)/30,
                x:held.left.x,
                y:held.left.y,
                color:"rgb(" + Math.floor(Math.random()*250) + ", " + Math.floor(Math.random()*250) + ", " + Math.floor(Math.random()*250) + ")"
            };

			held.left = ".";
		}
		if(e.button == 2){
			walls[walls.length] = {
	            x1:held.right.x, 
	            y1:held.right.y,
	            x2:mousePos.x,
	            y2:mousePos.y
	        };

			held.right = ".";
		}
    }
}

canvas.onmousemove = function(e){
	mousePos = ctx.transformedPoint(e.clientX - document.getElementById("canvas").getBoundingClientRect().left, e.clientY - document.getElementById("canvas").getBoundingClientRect().top);

	if(dragging){
	    ctx.translate(mousePos.x-held.left.x,mousePos.y-held.left.y);
	    drawObjects();
	}
	if(held.shiftKey == true){
		if(Math.hypot(held.right.x - mousePos.x, held.right.y - mousePos.y) >= 5){
			walls[walls.length] = {
		        x1:held.right.x, 
		        y1:held.right.y,
		        x2:mousePos.x,
	            y2:mousePos.y
		    };

		    held.right = mousePos;
		}
	}
}

canvas.onwheel = function(e){
	var delta = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;
	if(held.shiftKey == true){
	    ctx.translate(mousePos.x,mousePos.y);
	    ctx.scale(Math.pow(1.01,delta),Math.pow(1.01,delta));
	    ctx.translate(-mousePos.x,-mousePos.y);
	    drawObjects();
    }
    else{
    	if(standardRadiusBalls + delta>0){
    		if(scrolling != 0){clearTimeout(scrolling);}
        	scrolling = window.setTimeout(function(){scrolling = 0}, 250);

			standardRadiusBalls += delta;
		}
    }
}



document.onkeydown = checkKeyDown;

function checkKeyDown(e) {

    e = e || window.event;
    
    if (e.keyCode == "16"){ //shift
		held.shiftKey = true;
    }
    if (e.keyCode == '37'){ //left arrow
        if(paused){
            //previousFrame();
        }
    }
    if (e.keyCode == '39'){ //right arrow
        if(paused){
            //nextFrame();
        }
    }

    if (e.keyCode == '82'){ //r
    	var p1 = ctx.transformedPoint(0,0);
		var p2 = ctx.transformedPoint(canvas.width,canvas.height);
	    ctx.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);
    	ctx.setTransform(1, 0, 0, 1, 0, 0);
    	canvasPos = ctx.transformedPoint(0,0);
	    canvasWidth = ctx.transformedPoint(canvas.width,canvas.height).x - ctx.transformedPoint(0,0).x;
	    canvasHeight = ctx.transformedPoint(canvas.width,canvas.height).y - ctx.transformedPoint(0,0).y;
        balls = [];
        walls = [];
    }
    if (e.keyCode == '67'){ //c
        toggle("ballCollision");
        toggle("wallCollision");
    }
    if (e.keyCode == '70'){ //f
        toggle("friction");
    }
    if (e.keyCode == '71'){ //g
        toggle("gravity");
    }
    if (e.keyCode == '80'){ //p
        toggle("paused");
    }
    if (e.keyCode == '84'){ //t
        toggle("trail");
    }
}

document.onkeyup = checkKeyUp;

function checkKeyUp(e) {

    e = e || window.event;
    
    if (e.keyCode == "16"){ //shift
        held.shiftKey = ".";
        dragging = false;
    }
}

function toggle(variable){
	window[variable] = !window[variable];
    document.getElementById(variable + "Checkbox").checked = window[variable];

    if(variable == "paused"){if(!paused){frame();}}
}

function percentage(variable){
	window[variable] = window["base" + variable] * Number(document.getElementById(variable).value)/100;
}