let totalBalls = 250;
let colors = ['brown', 'seagreen', 'orange', 'cornflowerblue'];
let eyeSize = 4;
let eyeColor = 'black';
let backgroundColor = 'beige';
let engine, world, engineRunner;
let balls = [];

function setup() {
    initP5(true)
    initMatter();
    background(backgroundColor);
    buildImage();
}

async function buildImage() {
    // Add walls
    const wallOptions = { isStatic: true, restitution: 1 };
    Matter.Composite.add(world, [
        Matter.Bodies.rectangle(width / 2, 0, width, 10, wallOptions),
        Matter.Bodies.rectangle(width / 2, height, width, 10, wallOptions),
        Matter.Bodies.rectangle(0, height / 2, 10, height, wallOptions),
        Matter.Bodies.rectangle(width, height / 2, 10, height, wallOptions)
    ]);

    // Create balls
    for (let i = 0; i < totalBalls; i++) {
        const ballX = width * random(.45, .55)
        const ballY = height * random(.5, .5);
        new Ball(ballX, ballY, 10);
        await timeout(30);
    }
}

function draw() {
    background(backgroundColor);
    Matter.Engine.update(engine);

    // stroke(40,20,10,20)
    for (let i = 0; i < balls.length - 1; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            let pos1 = balls[i].body.position
            let pos2 = balls[j].body.position
            let distance = dist(pos1.x, pos1.y, pos2.x, pos2.y);
            if (distance < 100) {
                line(pos1.x, pos1.y, pos2.x, pos2.y);
            }
        }
    }

    fill(0)
    balls.forEach(ball => circle(ball.body.position.x, ball.body.position.y, 3));
}

class Ball {
    constructor(x, y, r) {
        this.body = Matter.Bodies.circle(x, y, r, {
            restitution: 0.98,
            mass: 1
        });
        Matter.Composite.add(world, [this.body]);
        Matter.Body.setVelocity(this.body, {
            x: random(-5, 5),
            y: random(-5, 5)
        });
        balls.push(this);
        this.r = r;
    }
}