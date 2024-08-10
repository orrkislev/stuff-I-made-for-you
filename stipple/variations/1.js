//: FILE main.js
blurSize = 100
blurStrength = 200
backgroundColor = '#282828'
textColor = '#CCC'

function setup() {
    initP5(true)
    pixelDensity(1)
    initPaper(false)
    setupGraphics()
    image(grph, 0, 0)
}

function draw() {
    loadPixels()
    mousePos = p(mouseX, mouseY)
    for (i = 0; i < 30000; i++) {
        x = random(width / 2 - area[0], width / 2 + area[0])
        y = random(height / 2 - area[1], height / 2 + area[1])
        doTheThing(x, y)
    }
    updatePixels()
}

function doTheThing(x, y) {
    pos = p(x, y)
    distToMouse = mousePos.getDistance(pos)
    if (distToMouse < blurSize) {
        dir = pos.subtract(mousePos)
        maxRotation = easeMap(easeInCubic, distToMouse, 0, blurSize, blurStrength, 0)
        dir = dir.rotate(random(-maxRotation, maxRotation))
        pos = mousePos.add(dir)
    }

    set(x, y, grph.get(pos.x, pos.y))
}

//: FILE end

//: FILE Graphics
//.title Graphics Buffer

function setupGraphics() {
    grph = createGraphics(width, height)
    grph.pixelDensity(1)
    grph.noStroke()
    grph.textSize(600)
    textSize(600)
    grph.textAlign(CENTER, CENTER)
    putText(':-)')
}

function keyPressed() {
    putText(key)
}
function putText(letter) {
    grph.fill(textColor)
    grph.background(40)
    grph.text(letter, width / 2, height / 2)
    area = [textWidth(letter) / 2 + 20, 320]
}

//: FILE end