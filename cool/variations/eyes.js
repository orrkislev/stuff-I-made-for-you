//: FILE main

ballSizeRange = [10, 100]
totalBalls = 150
colors = ['brown', 'seagreen', 'orange', 'cornflowerblue']
eyeSize = 4
eyeColor = 'black'
backgroundColor = 'darkgray'

function setup() {
    initP5(true)
    initMatter()
    noStroke()
    background(backgroundColor)
    buildImage()
}

async function buildImage() {
    Matter.Composite.add(world, [
        Matter.Bodies.rectangle(width/2, 0, width, 10, { isStatic: true }),
        Matter.Bodies.rectangle(width/2, height, width, 10, { isStatic: true }),
        Matter.Bodies.rectangle(0, height/2, 10, height, { isStatic: true }),
        Matter.Bodies.rectangle(width, height/2, 10, height, { isStatic: true })
    ])

    for (let i = 0; i < totalBalls; i++) {
        const ballX = random(width * .45, width * .55)
        const ballY = height/2
        const ballSize = random(...ballSizeRange)
        ball = new Ball(ballX, ballY, ballSize)

        const ballForceX = random(-.01, .01)
        const ballForceY = random(-.1, .1)
        ball.force(ballForceX, ballForceY)
        await timeout(10)
    }
}

function draw() {
    Matter.Engine.update(engine, 0.1, .1)
    balls.forEach(ball => ball.show())
}
//: FILE end

//: FILE ball
let balls = []
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
        let pos = this.body.position
        let angle = this.body.angle * 180 / PI

        fill(0,100)
        noStroke()
        circle(pos.x + this.body.circleRadius * .3,pos.y + this.body.circleRadius * .3,this.body.circleRadius * 2)

        strokeWeight(this.body.circleRadius * 2)
        stroke(this.clr)
        line(this.lastPos.x, this.lastPos.y, pos.x, pos.y)

        push()
        translate(pos.x, pos.y)
        rotate(angle)
        rotate(this.eyeRot)

        if (this.blinkCounter-- < 0) {
            strokeWeight(this.body.circleRadius * .25)
            stroke(eyeColor)
            line(-30, 0, 30, 0)
            if (this.blinkCounter < -5) this.blinkCounter = round(random(250))
        } else {
            noStroke()
            fill(eyeColor)
            circle(0,0,this.body.circleRadius)
        }

        strokeWeight(this.body.circleRadius * .1)
        stroke(255)
        noFill()
        arc(0,0,this.body.circleRadius * 1.1,this.body.circleRadius * 1.1, 180, 210)
        arc(0,0,this.body.circleRadius * .9,this.body.circleRadius * .9, 250, 252)
        pop()

        this.lastPos = { x: pos.x, y: pos.y }
    }
}
//: FILE end