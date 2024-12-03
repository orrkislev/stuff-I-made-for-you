//:FILE Setup
//.description Initialize the p5 and paper.js environments, and set up the noodle drawing
//.notes Adjust the light intensity, color, and noodle properties for different effects

radiusRange = [.1, .15]
coverRange = [0, .5]
range = [.2, .8]
backgroundColor = '#4f9a4f'
stepOver = 1
roundess = 1

async function setup() {
    initP5(true)
    initPaper(false)

    noodle = new Noodle(1)
    prepareNoodleColors()
    prepareNoodleCurve()

    await actuallyDrawSomething()
}

function prepareNoodleColors() {
    colorMode(HSB)
    const saturation = random(30, 100)
    noodle.startColor = color(random(360), saturation, 50)
    noodle.endColor = color(random(360), saturation, 80)
    colorMode(RGB)
}

function prepareNoodleCurve() {
    crv = new Path()
    for (let a = 0; a < 360 * 20; a += 10) {
        const r = map(a, 0, 360 * 10, 0, height/2)
        crv.add(pointFromAngle(a,r))
    }
    crv.smooth()
    crv.translate(width/2, height / 2)
    noodle.crv = crv
}

async function actuallyDrawSomething() {
    noStroke()
    background(backgroundColor)
    await noodle.draw()
}



//:FILE Noodle
//.description Define the Noodle class and its methods for drawing the noodle and its light effects
//.notes Experiment with different colors, radii, and light properties

let grp
class Noodle {
    constructor(r) {
        this.startColor = color('blue')
        this.endColor = color('green')
        this.startR = height * radiusRange[0]
        this.endR = height * radiusRange[1]
        this.crv = null
    }

    getColor(t) {
        return lerpColor(this.startColor, this.endColor, t)
    }
    getRadius(t) {
        return lerp(this.startR, this.endR, t)
    }

    async draw() {
        for (let i = 0; i < this.crv.length; i++) {
            const pnt = this.crv.getPointAt(i)
            this.drawPoint(pnt, i / this.crv.length)
            if (i % 10 == 0) await timeout()
        }
    }
    drawPoint(pnt, t) {
        const r = this.getRadius(t)
        let gradient = drawingContext.createLinearGradient(pnt.x - r, pnt.y - r, pnt.x + r, pnt.y + r)
        gradient.addColorStop(0, 'black')
        gradient.addColorStop(.5, this.getColor(t).toString())
        gradient.addColorStop(1, 'pink')
        drawingContext.fillStyle = gradient
        circle(pnt.x, pnt.y, r)

        const clr = '00ff00'
        gradient = drawingContext.createLinearGradient(pnt.x + r / 4, pnt.y - r / 4, pnt.x + r / 2, pnt.y - r / 2)
        gradient.addColorStop(0, `#${clr}00`)
        gradient.addColorStop(1, `#${clr}`)
        drawingContext.fillStyle = gradient
        circle(pnt.x, pnt.y, r)

        gradient = drawingContext.createLinearGradient(pnt.x - r / 4, pnt.y + r / 4, pnt.x - r / 2, pnt.y + r / 2)
        gradient.addColorStop(0, '#ffff0000')
        gradient.addColorStop(1, '#0000ff')
        drawingContext.fillStyle = gradient
        circle(pnt.x, pnt.y, r)
    }
}
