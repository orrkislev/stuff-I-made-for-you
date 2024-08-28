//: FILE Main
//.description This is where the main code goes

slices = 10
noiseScale = 2000
thresh = .7
mainColor = 220
backgroundColor = 50


function setup() {
    initP5(true)
    initPaper(false)

    initPoints()
    initSections()

    noFill()
    strokeWeight(2)

    maskGraphics = createGraphics(width, height)
    maskGraphics.pixelDensity(1)
    maskGraphics.background(255)
    maskGraphics.drawingContext.filter = 'blur(30px)'
    maskGraphics.fill(0)
    maskGraphics.noStroke()
    maskGraphics.loadPixels()
}

function draw() {
    background(backgroundColor)
    stroke(mainColor)
    sections.forEach(s => drawSection(s.a, s.b, s.radius, s.func))
    grungeLayer()

    if (mouseIsPressed) {
        maskGraphics.circle(mouseX, mouseY, 30)
        maskGraphics.circle(mouseX, mouseY, 30)
        maskGraphics.loadPixels()
    }

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
        let a = i / slices
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
        const v = maskGraphics.pixels[(round(pos.y) * width + round(pos.x)) * 4] / 255
        return v > threshMin * thresh && v < threshMax * thresh
        // const n = noise(pos.x / noiseScale, pos.y / noiseScale, frameCount / 100)
        // return n > threshMin * thresh && n < threshMax * thresh
    })
    _points = _points.filter(pos => pos.x > 0 && pos.x < width && pos.y > 0 && pos.y < height)
    _points.forEach(pos => drawFunc(pos.x, pos.y))
}

//: FILE end

//: FILE Drawing_functions
//.description Functions to draw different types of noise based shapes

const availableFunctions = [point_random, line_noise, line_noise]
function getFunc(radius) {
    return choose(availableFunctions)(radius)
}

function point_random(radius) {
    const r = random(1, radius * .2)
    return (x, y) => {
        for (let i = 0; i < 10; i++) {
            const a = random(360)
            const r2 = random(r)
            point(x + cos(a) * r2, y + sin(a) * r2)
        }
    }
}

function line_noise(radius) {
    const l = random(2, radius * .66)
    const ns = random(30, 250)
    const ns2 = 30
    return (x, y) => {
        const a = noise(x / ns, y / ns, frameCount / ns2) * 360 + frameCount / 10
        lineFromAngle(x, y, a, l)
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