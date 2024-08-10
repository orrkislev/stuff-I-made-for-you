//: FILE main.js
blurSize = 80
blurStrength = 80
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

    mouseMovement = dist(pmouseX, pmouseY, mouseX, mouseY)
    sumNewPoints = map(mouseMovement,0,100,10000,0)
    maxRadius = map(mouseMovement,0,100,blurSize,0)

    for (i = 0; i < sumNewPoints; i++) {
        newPointAngle = random(360)
        rewPointRadius = random()**3 * maxRadius
        x = mouseX + rewPointRadius * cos(newPointAngle)
        y = mouseY + rewPointRadius * sin(newPointAngle)
        pos = p(x, y)

        distToMouse = mousePos.getDistance(pos)
        if (distToMouse < blurSize) {
            dir = pos.subtract(mousePos)
            maxRotation = easeMap(easeInCubic, distToMouse, 0, blurSize, blurStrength, 0)
            dir = dir.rotate(random(-maxRotation, maxRotation))
            pos = mousePos.add(dir)
        }

        c = grph.get(pos.x, pos.y)
        set(x, y, c)
    }
    updatePixels()
}

//: FILE end

//: FILE Graphics
//.title Graphics Buffer

function setupGraphics(){
    grph = createGraphics(width, height)
    grph.pixelDensity(1)
    grph.noStroke()
    grph.textSize(600)
    grph.textAlign(CENTER, CENTER)
    key = '&'
    keyPressed()
}

function keyPressed(){
    grph.fill(textColor)
    grph.background(backgroundColor)
    grph.text(key, width / 2, height / 2)
}

//: FILE end