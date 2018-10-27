function Ball(x, y, dx, dy, radius) {
    this.radius = radius;
    this.dx = dx;
    this.dy = dy;
    this.mass = this.radius * this.radius * this.radius;
    this.x = x;
    this.y = y;
    this.color = randomColor();
    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    };
    this.speed = function() {
        return Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    };
    this.angle = function() {
        return Math.atan2(this.dy, this.dx);
    };
    this.onGround = function() {
        return (this.y + this.radius >= canvas.height)
    }
}

function Wall(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.draw = function() {
        ctx.fillStyle = "Black"; 
        ctx.beginPath();
        ctx.moveTo(this.x1,this.y1);
        ctx.lineTo(this.x2,this.y2);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "Black";
        ctx.stroke();
    };
    this.angle = function() {
        return Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
    };
}

function randomColor() {
    red = Math.floor(Math.random() * 3) * 127;
    green = Math.floor(Math.random() * 3) * 127;
    blue = Math.floor(Math.random() * 3) * 127;
    if(red > 250 && blue > 250 && red > 250){randomColor();}
    rc = "rgb(" + red + ", " + green + ", " + blue + ")";
    return rc;
}

function randomX() {
    x = Math.floor(Math.random() * canvas.width);
    if (x < 30) {
        x = 30;
    } else if (x + 30 > canvas.width) {
        x = canvas.width - 30;
    }
    return x;
}

function randomY() {
    y = Math.floor(Math.random() * canvas.height);
    if (y < 30) {
        y = 30;
    } else if (y + 30 > canvas.height) {
        y = canvas.height - 30;
    }
    return y;
}

function randomRadius() {
    r = Math.floor(Math.random() * (100 -9)) + 10;
    return r;
}

function randomDx() {
    r = Math.floor(Math.random() * (25)) + 1;
    return r;
}

function randomDy() {
    r = Math.floor(Math.random() * (25)) + 1;
    return r;
}

function distanceNextFrame(a, b) {
    return Math.sqrt((a.x + a.dx - b.x - b.dx)**2 + (a.y + a.dy - b.y - b.dy)**2) - a.radius - b.radius;
}

function distanceNextFrame2(a, x1, y1) {
    return Math.sqrt((a.x + a.dx - x1)**2 + (a.y + a.dy - y1)**2);
}

function distance(a, b) {
    return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2);
}

function distance2(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2);
}