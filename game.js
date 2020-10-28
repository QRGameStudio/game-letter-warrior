let canvas = document.getElementById('canvas') || null;
let canvasWidth;
let canvasHeight;
let ctx = canvas ? canvas.canvas.getContext('2d') : null;
let objects = [];

/**
 * All coordinates are relative to the size of the viewport
 * 0 means 0%
 * 100 means 100%
 *
 * to convert, you can use functions:
 * - X() and Y() to make relative numbers absolute
 * - relX() and relY() to make absolute numbers relative
 */

function draw() {
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    objects = objects.filter((o, i) => o.draw(i));
    window.requestAnimationFrame(draw);
}

function MousePoint(x, y) {
    let alpha = 1;
    this.draw = () => {
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(X(x), Y(y), 5, 0, Math.PI * 2);
        ctx.fill();
        alpha -= 0.05;
        return alpha > 0;
    };
    objects.push(this);
}

function GameObject(content, x, y, speedX, speedY) {
    let gravity = 0.05;
    this.draw = () => {
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = `${canvasHeight/10}px monospace`;
        ctx.fillText(content, X(x), Y(y));
        x += speedX;
        y += speedY;
        speedY += gravity;
        return y < canvasHeight;
    }
    objects.push(this);
}

function gameEntryPoint() {
   setCanvasSize();
   if (!ctx) {
       ctx = canvas.getContext('2d');
   }
   canvas.onmousemove = (e) => new MousePoint(relX(e.x), relY(e.y));
   canvas.ontouchmove = (e) => new MousePoint(relX(e.touches[0].clientX), relY(e.touches[0].clientY));
   canvas.onclick = (e) => new GameObject('X', relX(e.clientX), relY(e.clientY), relX(5), relY(-5));
   setInterval(() => {
       new GameObject('@', 50, 99, random(-0.6, 0.6), random(-1.5, -4));
   }, 500)
   draw();
}

function random(from, to) {
    return from + (to - from) * Math.random();
}

function X(x) {
    return x * canvasWidth / 100;
}

function Y(y) {
    return y * canvasHeight / 100;
}

function relX(x) {
    return 100 * x / canvasWidth;
}

function relY(y) {
    return 100 * y / canvasHeight;
}

function setCanvasSize() {
    if (canvas === null) {
        canvas = document.getElementById('canvas');
    }
    canvasWidth = canvas.clientWidth;
    canvasHeight = canvas.clientHeight;
    canvas.setAttribute('width', `${canvasWidth}`);
    canvas.setAttribute('height', `${canvasHeight}`);
}

window.onresize = () => setCanvasSize();

window.onload = gameEntryPoint;
