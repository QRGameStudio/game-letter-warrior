let canvas = document.getElementById('canvas') || null;
let ctx = canvas ? canvas.canvas.getContext('2d') : null;
let objects = [];

function draw() {
    ctx.fillStyle = '#000';
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    objects = objects.filter((o) => o.draw());
    window.requestAnimationFrame(draw);
}

function MousePoint(x, y) {
    let alpha = 1;
    this.draw = () => {
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        alpha -= 0.05;
        return alpha > 0;
    };
    objects.push(this);
}

function gameEntryPoint() {
   setCanvasSize();
   if (!ctx) {
       ctx = canvas.getContext('2d');
   }
   canvas.onmousemove = (e) => new MousePoint(e.x, e.y);
   canvas.ontouchmove = (e) => new MousePoint(e.touches[0].clientX, e.touches[0].clientY);
   draw();
}

function setCanvasSize() {
    if (canvas === null) {
        canvas = document.getElementById('canvas');
    }
    canvas.setAttribute('width', `${canvas.clientWidth}`);
    canvas.setAttribute('height', `${canvas.clientHeight}`);
}

window.onresize = () => setCanvasSize();

window.onload = gameEntryPoint;
