//: FILE Setup
//.description Initialize the p5 and paper.js environments, and set up the noodle drawing
//.notes Adjust the light intensity, color, and noodle properties for different effects

radiusRange = [.1, .15]
coverRange = [0, .5]
range = [.2, .8]
backgroundColor = 'beige'
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
    let yDir = 1
    crv = new Path()
    const stepSize = noodle.startR * .5 * stepOver
    for (let x = width * range[0]; x < width * range[1]; x += stepSize) {
        const y = map(x, width * range[0], width * range[1], coverRange[0], coverRange[1]) * height * .5 * yDir
        crv.add(p(x, y))
        yDir *= -1
    }
    crv.smooth()
    crv.translate(0, height / 2)
    crv.segments.forEach(seg => {
        seg.handleIn = seg.handleIn.normalize(random(noodle.startR, noodle.endR) * stepOver * roundess)
        seg.handleOut = seg.handleIn.multiply(-1)
    })
    noodle.crv = crv
}

async function actuallyDrawSomething() {
    noStroke()
    background(backgroundColor)
    await noodle.draw()
    await noodle.drawLight()
}

//: FILE end

//: FILE Noodle
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
        gradient.addColorStop(0, 'rgba(0,0,0,1)')
        gradient.addColorStop(.5, this.getColor(t).toString())
        gradient.addColorStop(1, 'rgba(255,255,255,0)')
        drawingContext.fillStyle = gradient
        circle(pnt.x, pnt.y, r)

        const clr = 'ffffff'
        gradient = drawingContext.createLinearGradient(pnt.x + r / 4, pnt.y - r / 4, pnt.x + r / 2, pnt.y - r / 2)
        gradient.addColorStop(0, `#${clr}00`)
        gradient.addColorStop(1, `#${clr}`)
        drawingContext.fillStyle = gradient
        circle(pnt.x, pnt.y, r)

        gradient = drawingContext.createLinearGradient(pnt.x - r / 4, pnt.y + r / 4, pnt.x - r / 2, pnt.y + r / 2)
        gradient.addColorStop(0, '#ffff0000')
        gradient.addColorStop(1, '#ffff7755')
        drawingContext.fillStyle = gradient
        circle(pnt.x, pnt.y, r)
    }
    async drawLight() {
        grp = get()
        for (let i = 0; i < this.crv.length; i++) {
            const loc = this.crv.getLocationAt(i)
            this.drawLightPoint(loc, i / this.crv.length)
            if (i % 10 == 0) await timeout()
        }
    }
    drawLightPoint(loc, t) {
        const n = loc.normal
        const pnt = loc.point

        const r = this.getRadius(t)
        const d = n.dot(p(-1, 0))
        if (d < 0) {
            drawingContext.fillStyle = '#ffffff55'
            circle(pnt.x + cos(-45) * r / 3, pnt.y + sin(-45) * r / 3, noise(t * 10) ** 2 * 10)
        } else {
            push()
            beginClip()
            circle(pnt.x, pnt.y, r)
            endClip()
            image(grp, 0, 0)
            pop()
        }
    }
}
//: FILE end