//: FILE Main
//.description This is where the main code goes

slices = 6
noiseScale = 1000
thresh = .4
mainColor = 'white'
backgroundColor = 'seagreen'


function setup() {
    initP5(true)
    initPaper(false)

    initPoints()
    initSections()

    noFill()
    strokeWeight(2)
}

function draw() {
    background(backgroundColor)
    stroke(mainColor)
    sections.forEach(s => drawSection(s.a, s.b, s.radius, s.func))
    grungeLayer()
}

//: FILE end

//: FILE Sections
//.description This area contains the code for the sections

function initPoints() {
    const poisson = new PoissonDiscSampler(width, height, 5)
    points = poisson.get(50000, p(width / 2, height / 2))
    points = points.map(pos => p(pos.x / 10, pos.y / 10))
}

function initSections() {
    sections = []
    for (let i = 0; i < slices; i++) {
        let a = (i + .3) / slices
        let b = (i + 1) / slices
        const radius = random(10, 30)
        const func = getFunc(radius)
        sections.push({ a, b, radius, func })
    }
}

function drawSection(threshMin, threshMax, radius, drawFunc) {
    _points = [...points]
    _points = _points.map(pos => pos.multiply(radius))
    _points = _points.filter(pos => {
        const toCenter = p(width / 2, height / 2).subtract(pos)
        const n = noise(toCenter.length / noiseScale, frameCount / 100)
        return n > threshMin * thresh && n < threshMax * thresh
    })
    _points = _points.filter(pos => pos.x > 0 && pos.x < width && pos.y > 0 && pos.y < height)
    _points.forEach(pos => drawFunc(pos.x, pos.y))
}

//: FILE end

//: FILE Drawing_functions
//.description Functions to draw different types of noise based shapes

const availableFunctions = [people, tree, wave]
function getFunc(radius) {
    return choose(availableFunctions)(radius)
}

function people(radius) {
    const r = random(1, radius * .2)
    return (x, y) => {
        line(x, y, x, y + r)
        circle(x, y - 5, 2)
    }
}

function tree(radius) {
    const r = radius * .5
    return (x, y) => {
        for (let i = 1; i < r * .7; i++) {
            line(x - i * .7, y + i, x + i * .7, y + i)
        }
        line(x, y, x, y + r)
    }
}

function wave(radius) {
    const r = radius * .5
    return (x, y) => {
        arc(x, y, r, r / 3, 180, 360)
    }
}

function lineFromAngle(x, y, a, l) {
    line(x - l * cos(a) / 2, y - l * sin(a) / 2, x + l * cos(a) / 2, y + l * sin(a) / 2)
}

//: FILE end

//: FILE Other

let grungeLayerGraphics
function grungeLayer() {
    if (!grungeLayerGraphics) {
        print('creating grunge layer')
        grungeLayerGraphics = createGraphics(width, height)
        grungeLayerGraphics.loadPixels()
        c = color(backgroundColor)
        grungeLayerGraphics.loadPixels()
        for (let i = 0; i < 30000; i++) {
            const x = random(width)
            const y = random(height)
            grungeLayerGraphics.set(x, y, c)
        }
        grungeLayerGraphics.updatePixels()
    }
    image(grungeLayerGraphics, 0, 0)
}

//: FILE end

//: FILE 
//.hidden true
prevSlices = slices
prevBackgroundColor = backgroundColor
function updateParams() {
    if (slices != prevSlices) initSections()
    if (backgroundColor != prevBackgroundColor && grungeLayerGraphics) {
        grungeLayerGraphics.remove()
        grungeLayerGraphics = null
    }
}
//: FILE end