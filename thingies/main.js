//:FILE main.js

ballSizeRange = [10, 60]
totalBalls = 100
colors = ['pink', 'seagreen', 'salmon', 'azure']
eyeSize = 4
eyeColor = 'black'
backgroundColor = 'darkgray'

function setup() {
    initP5(true)
    initMatter()
    background(backgroundColor)
    buildImage()
}

async function buildImage() {
    for (i = 0; i < totalBalls; i++) {
        ballX = random(width * .45, width * .55)
        ballY = height / 2
        createBall(ballX, ballY)
        await timeout(10)
    }
}

function mousePressed() {
    createBall(mouseX, mouseY)
}
function mouseDragged() {
    createBall(mouseX, mouseY)
}

function draw() {
    Matter.Engine.update(engine, 0.1, .1)
    balls.forEach(ball => ball.show())
}
//:FILE end

//:FILE ball.js

balls = []
class Ball {
    constructor(x, y, r) {
        this.body = Matter.Bodies.circle(x, y, r)
        Matter.Composite.add(world, [this.body])
        this.body.frictionAir = .1
        this.body.restitution = 1.2
        this.body.mass = 1
        balls.push(this)
        this.clr = color(choose(colors))
        this.eyeOffsets = [random(r * .1, r * .4), random(r * .1, r * .4)]
        this.eyeRot = random(-30, 30)
        this.blinkCounter = round(random(2500))
        this.lastPos = this.body.position
    }
    force(x, y) {
        Matter.Body.applyForce(this.body, this.body.position, { x, y: -y })
    }
    show() {
        var pos = this.body.position
        var angle = this.body.angle * 180 / PI

        strokeWeight(this.body.circleRadius * 2)
        stroke(this.clr)
        line(this.lastPos.x, this.lastPos.y, pos.x, pos.y)

        push()
        translate(pos.x, pos.y)
        rotate(angle)
        rotate(this.eyeRot)
        if (this.blinkCounter-- < 0) {
            if (this.blinkCounter < -5) this.blinkCounter = round(random(250))
        } else {
            strokeWeight(eyeSize)
            stroke(eyeColor)
            point(-this.body.circleRadius / 2 + this.eyeOffsets[0], -this.body.circleRadius / 2)
            point(this.body.circleRadius / 2 - this.eyeOffsets[1], -this.body.circleRadius / 2)
        }
        pop()

        this.lastPos = { x: pos.x, y: pos.y }
    }
}

function createBall(x, y) {
    ballSize = random(...ballSizeRange)
    ball = new Ball(x, y, ballSize)

    ballForceX = random(-.01, .01)
    ballForceY = random(-.1, .1)
    ball.force(ballForceX, ballForceY)
}
//:FILE end