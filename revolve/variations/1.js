//: FILE Main

stepSize = 11
thickness = 9
thresh = .4
backgroundColor = 'black'
colors = ["pink", "seagreen", "salmon", "azure"]
roundCap = true
globalSpeed = 1

async function setup() {
    initP5(true)
    initPaper(false)

    thresh = .65
    createSphere(280).setColor('white').setSpeed(.3)
    thresh = .45
    createSphere(240).setColor('green').setSpeed(.3)
    thresh = .35
    createSphere(239).setColor('blue').setSpeed(.3)
    
    calcAllSections()
}

currBody = null
lastRow = 0
currColorIndex = -1
function mousePressed() {
    currBody = new Body()
    lastRow = mouseY
    currColorIndex = (currColorIndex + 1) % colors.length
    currBody.setColor(colors[currColorIndex])
}

function mouseDragged() {
    if (abs(mouseY - lastRow) < stepSize) return
    const y = mouseY > lastRow ? lastRow + stepSize : lastRow - stepSize
    createRing(currBody, y-height/2, abs(mouseX - width / 2))
    lastRow = y
    calcAllSections()
}

//: FILE end


//: FILE
//.title Element Creation

function createCone(h = 200, r1 = 60, r2 = 60) {
    return createBody(h, y => lerp(r1, r2, abs(y)))
}

function createSphere(r = 60) {
    return createBody(r, y => {
        const t = y * 2 - 1
        const tr = t * r
        return sqrt(r ** 2 - tr ** 2)
    })
}

function createBody(h = 200, rfunc) {
    const body = new Body()
    h = floor(h / stepSize) * stepSize
    noiseSeed(floor(random(1000)))
    for (let y = -h; y <= h; y += stepSize) {
        const r = rfunc((y + h) / (2 * h))
        const thresh = abs(y / h) ** 1.5
        createRing(body, y, r, thresh)
    }
    return body
}

function createRing(body, y, r) {
    const layer = new Layer()
    let newSection = []
    const circum = 2 * PI * r
    const dots = circum / 3
    const startDeg = random(360)
    for (let a = 0; a < 360; a += 360 / dots) {
        const x = r * cos(a - startDeg)
        const z = r * sin(a - startDeg)
        if (noise(x / 100 + 1000, y / 100 + 1000, z / 100 + 1000) < thresh) {
            if (newSection.length > 1) layer.sections.push(newSection)
            newSection = []
            continue
        }
        const newNode = Node.fromXYZ(x, y + height / 2, z)
        newSection.push(newNode)
    }
    if (newSection.length > 1) layer.sections.push(newSection)
    if (layer.sections.length > 0) body.layers.push(layer)
}


//: FILE end

//: FILE 
//.title Main Animation Loop

allSections = []
function calcAllSections() {
    allSections = []
    for (const body of bodies) {
        for (const layer of body.layers) {
            for (const section of layer.sections) {
                for (let i = 0; i < section.length - 1; i++) {
                    let clr = color(body.color)
                    colorMode(HSB)
                    const clr2 = color(hue(clr), saturation(clr) * .8, brightness(clr) * .2)
                    const darkColor = lerpColor(clr, clr2, .5)
                    colorMode(RGB)
                    allSections.push({ a: section[i], b: section[i + 1], color: clr, darkColor: darkColor })
                }
            }
        }
    }
}


function draw() {
    strokeWeight(thickness)

    if (roundCap) strokeCap(ROUND)
    else strokeCap(SQUARE)

    background(backgroundColor)

    bodies.forEach(b => b.rotate())

    allSections.sort((a, b) => a.a.z - b.a.z)
    allSections.forEach(s => {
        let clr = s.color
        if (s.a.z < 0 || s.b.z < 0) clr = s.darkColor
        stroke(clr)
        line(s.a.x, s.a.y, s.b.x, s.b.y)
    })
}

//: FILE end


//: FILE Classes

bodies = []
class Body {
    constructor(layers = []) {
        this.layers = layers
        this.color = 0
        this.speed = .6
        bodies.push(this)
    }
    setColor(c) {
        this.color = c
        return this
    }
    setSpeed(s) {
        this.speed = s
        return this
    }

    translate(x, y) {
        y = floor(y / stepSize) * stepSize
        this.layers.forEach(layer => layer.sections.forEach(section => section.forEach(node => {
            node.x += x
            node.y += y
            node.baseY += y
        })))
        return this
    }

    rotate(speed = this.speed) {
        this.layers.forEach(layer => layer.rotate(speed * globalSpeed))
    }

    drawFront() {
        stroke(this.color)
        this.layers.forEach(layer => layer.drawFront())
    }
    drawBack() {
        stroke(this.color)
        this.layers.forEach(layer => layer.drawBack())
    }

    clone() {
        const newBody = new Body(this.layers.map(layer => new Layer(layer.sections.map(section => section.map(node => new Node(node.y, node.r, node.angle))))))
        newBody.color = this.color
        return newBody
    }
}

class Layer {
    constructor(sections = []) {
        this.sections = sections
    }

    rotate(speed = .3) {
        this.sections.forEach(section => section.forEach(node => node.rotate(speed)))
    }

    drawFront() {
        this.sections.forEach(section => {
            for (let i = 0; i < section.length - 1; i++) {
                const n1 = section[i]
                const n2 = section[i + 1]
                if (n1.z < 0 && n2.z < 0) continue
                line(n1.x, n1.y, n2.x, n2.y)
            }
        })
    }
    drawBack() {
        this.sections.forEach(section => {
            for (let i = 0; i < section.length - 1; i++) {
                const n1 = section[i]
                const n2 = section[i + 1]
                if (n1.z > 0 && n2.z > 0) continue
                line(n1.x, n1.y, n2.x, n2.y)
            }
        })
    }
}

const rad = Math.PI / 180
class Node {
    constructor(y = random(30, height - 30), r = random(width / 3), angle = random(360)) {
        this.y = y; this.r = r; this.angle = angle;
        this.baseY = y
        this.rotate()
    }
    rotate(speed = 0) {
        const n = (noise(this.r / 100, this.y / 100, frameCount / 130) - .5) * 0
        this.angle = (this.angle + speed + n) % 360
        const rr = this.r + easedSin(this.baseY + frameCount) * 10
        this.x = width / 2 + rr * Math.sin(this.angle * rad)
        this.z = rr * Math.cos(this.angle * rad)

        // this.y = this.baseY + ((sin(frameCount / 3) + 1) / 2) ** 5 * this.z / 2
        // this.y = this.baseY + this.z / 5
    }
    static fromXYZ(x, y, z) {
        const v = createVector(x, z)
        const angle = v.heading()
        const r = v.mag()
        return new Node(y, r, angle)
    }
}

function easedSin(t) {
    const s = sin(t)
    return sign(s) * easeInOutQuint(abs(s))
}
const easeInOutCubic = t => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
const easeInOutQuint = t => t < .5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2
const sign = x => x > 0 ? 1 : x < 0 ? -1 : 0

//: FILE end