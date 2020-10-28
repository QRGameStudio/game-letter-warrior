const MESSAGE = 'QRGAMESTUDIO'.split('');
let currentLetter = 0;

let canvas = document.getElementById('canvas') || null;
let canvasWidth;
let canvasHeight;
let ctx = canvas ? canvas.canvas.getContext('2d') : null;
let objects = [];
let objectToAdd = [];
let lastMousePoint = null;
let score = 0;
let scoreEl = null;
let maxScore = null;
let storage = null;
const abs = Math.abs;
const min = Math.min;
const sign = Math.sign;

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
    let objectsFiltered = objects.filter((o, i) => o.draw(i));
    objects = [...objectToAdd, ...objectsFiltered];
    objectToAdd.length = 0;
    window.requestAnimationFrame(draw);
}

function showScore() {
    if (scoreEl === null)
        scoreEl = document.getElementById('score');
    scoreEl.innerText = maxScore !== null ? `${score} (${maxScore})` : `${score}`;
}

function MousePoint(x, y) {
    let alpha = 1;
    this.m = true; // is mouse event
    this.x = x;
    this.y = y;

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

function GameObject(content, x, y, speedX, speedY, bad=false, hitVector=null) {
    let gravity = 0.05;
    let hit = hitVector !== null ? hitVector : [];
    this.m = false; // is NOT mouse event
    this.draw = (i) => {
        const size = objectSize();
        ctx.globalAlpha = 1;
        ctx.font = `${size}px monospace`;
        const sizeX = ctx.measureText(content).width;
        const centerX = (X(x) + sizeX / 2);
        const centerY = (Y(y) - size / 2);
        const sizeHalf = min(size, sizeX) / 2;
        const sizeQuarter = sizeHalf / 2;
        if (!hit.length) {
            const crossIndex = objects.slice(i).findIndex(
                (o) => o.m && abs(centerX - X(o.x)) < sizeQuarter && abs(centerY - Y(o.y)) < sizeQuarter
            );
            if (crossIndex !== -1) {
                new GameObject(content, x, y, -0.3, 0, bad, [true]);
                new GameObject(content, x, y, 0.3, 0, bad, [false]);
                if (bad) {
                    score -= 10;
                } else {
                    score ++;
                    if (score > maxScore) {
                        maxScore = score;
                        storage.set('hs', score);
                    }
                }
                showScore();
                return false;
            }
        }
        ctx.save();
        ctx.fillStyle = bad ? '#f00' : '#fff';
        ctx.fillText(content, X(x), Y(y));
        if (hit.length) {
            ctx.fillStyle = '#000';
            if (hit[0]) {
                ctx.fillRect(centerX, Y(y) - size * 1.5, sizeHalf, size * 2);
            } else {
                ctx.fillRect(X(x), Y(y) - size * 1.5, sizeHalf, size * 2);
            }
        }
        ctx.restore();
        x += speedX;
        y += speedY;
        speedY += gravity;
        return y < 100;
    }
    objectToAdd.push(this);
}

function gameEntryPoint() {
   setCanvasSize();
   if (!ctx) {
       ctx = canvas.getContext('2d');
   }
   canvas.onmousemove = (e) => addMousePoint(e.x, e.y);
   canvas.ontouchmove = (e) => addMousePoint(e.touches[0].clientX, e.touches[0].clientY);
   canvas.onmouseleave = () => lastMousePoint = null;
   canvas.ontouchend = () => lastMousePoint = null;
   // canvas.onclick = () => launchObject();

   launchObject();

   storage = new GStorage('game.uni-warrior');
   storage.get('hs', null).then((hs) => {
       if (hs !== null) maxScore = hs;
   });
   draw();
}

function addMousePoint(x, y) {
    const newMousePoint = new MousePoint(relX(x), relY(y));

    if (lastMousePoint) {
        const sizeQ = relY(objectSize() / 8);
        let mousePoint = newMousePoint;
        while (true) {
            let nx = null;
            let ny = null;
            const dx = mousePoint.x - lastMousePoint.x;
            const dy = mousePoint.y - lastMousePoint.y;

            if (abs(dx) > sizeQ) {
                nx = mousePoint.x - sign(dx) * sizeQ;
            }
            if (abs(dy) > sizeQ) {
                ny = mousePoint.y - sign(dy) * sizeQ;
            }

            if (ny === null || nx === null) {
                break;
            }
            mousePoint = new MousePoint(nx ? nx : mousePoint.x, ny ? ny : mousePoint.y);
        }
    }

    lastMousePoint = newMousePoint;
}

function objectSize() {
    return Y(10);
}

function launchObject() {
    let bad;
    let letter;
    if (random(0, Math.max(40 - (score / 10), 4)) < 1) {
        letter = '@';
        bad = true;
    } else {
        bad = false;
        letter = MESSAGE[currentLetter++];
    }

    new GameObject(letter, 50, 99, random(-0.6, 0.6), random(-1.5, -4), bad);
    if (currentLetter >= MESSAGE.length) currentLetter = 0;

    setTimeout(() => launchObject(), Math.max(200, 500-score));
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
