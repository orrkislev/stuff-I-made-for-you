//:FILE main
totalBalls = 250;
colors = ['brown', 'seagreen', 'orange', 'cornflowerblue'];
eyeSize = 4;
eyeColor = 'black';
backgroundColor = 'beige';
balls = [];

function setup() {
    initP5(true)
    initMatter();
    background(backgroundColor);
    buildImage();
}

async function buildImage() {
    // Add walls
    wallOptions = { isStatic: true, restitution: 1 };
    Matter.Composite.add(world, [
        Matter.Bodies.rectangle(width / 2, 0, width, 10, wallOptions),
        Matter.Bodies.rectangle(width / 2, height, width, 10, wallOptions),
        Matter.Bodies.rectangle(0, height / 2, 10, height, wallOptions),
        Matter.Bodies.rectangle(width, height / 2, 10, height, wallOptions)
    ]);

    // Create balls
    for (i = 0; i < totalBalls; i++) {
        ballX = width * random(.45, .55)
        ballY = height * random(.5, .5);
        new Ball(ballX, ballY, 10);
        await timeout(30);
    }
}

function draw() {
    background(backgroundColor);
    Matter.Engine.update(engine);

    // stroke(40,20,10,20)
    for (i = 0; i < balls.length - 1; i++) {
        for (j = i + 1; j < balls.length; j++) {
            pos1 = balls[i].body.position
            pos2 = balls[j].body.position
            distance = dist(pos1.x, pos1.y, pos2.x, pos2.y);
            if (distance < 100) {
                line(pos1.x, pos1.y, pos2.x, pos2.y);
            }
        }
    }

    fill(0)
    balls.forEach(ball => circle(ball.body.position.x, ball.body.position.y, 3));
}


//:FILE ball

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

