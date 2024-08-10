//: FILE main

ballSizeRange = [20, 40]
totalBalls = 100
colors = ['pink', 'salmon', 'orange', 'crimson']
eyeSize = 2
eyeColor = 'black'
backgroundColor = 30

function setup() {
    createCanvas(windowWidth, windowHeight)
    angleMode(DEGREES)
    initMatter()
    noStroke()
    background(backgroundColor)
    buildImage()
}

async function buildImage() {
    for (i = 0; i < totalBalls; i++) {
        createBall()
        await timeout(10)
    }
}

function createBall(){
ballX = random(width * .45, width * .55)
        ballY = height/2
        ballSize = random(...ballSizeRange)
        ball = new Ball(ballX, ballY, ballSize)

        ballForceX = random(-.01, .01)
        ballForceY = random(-.1, .1)
        ball.force(ballForceX, ballForceY)
}

function draw() {
    background(backgroundColor)
    Matter.Engine.update(engine, 0.1, .1)
    balls.forEach(ball => ball.show())
    explosions.forEach(ex=>ex.update())


    balls.forEach(ball => {
        if (dist(ball.body.position.x,ball.body.position.y,mouseX,mouseY) < ball.body.circleRadius){
            new Explosion(ball.body.position.x,ball.body.position.y, ball.clr, ball.body.circleRadius)
            ball.shouldRemove = true
            Matter.Composite.remove(world, ball.body)
            createBall()
        }
    })

    balls = balls.filter(b=>!b.shouldRemove)
    explosions = explosions.filter(b=>!b.shouldRemove)
}
//: FILE end

//: FILE ball

explosions = []
class Explosion{
    constructor(x,y,color,size){
        this.pos = {x,y}
        this.color = color
        this.age = 20
        explosions.push(this)
    }

    update(){
        fill(255)
        circle(this.pos.x,this.pos.y,this.age)
        this.age--
        if (this.age < 0){
            this.shouldRemove = true
        }
    }
}
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

        strokeWeight(this.body.circleRadius * 1.8)
        stroke(255,100)
        point(pos.x, pos.y)

        noFill()
        stroke(255)
        strokeWeight(this.body.circleRadius / 10)
        arc(pos.x,pos.y,this.body.circleRadius * 1.5, this.body.circleRadius * 1.5, 180, 210)
        arc(pos.x,pos.y,this.body.circleRadius * 1.5, this.body.circleRadius * 1.5, 220, 224)

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
//: FILE end