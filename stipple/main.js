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
    const mousePos = p(mouseX, mouseY)

    const mouseMovement = dist(pmouseX, pmouseY, mouseX, mouseY)
    const sumNewPoints = map(mouseMovement,0,100,10000,0)
    const maxRadius = map(mouseMovement,0,100,blurSize,0)

    for (let i = 0; i < sumNewPoints; i++) {
        const newPointAngle = random(360)
        const rewPointRadius = random()**3 * maxRadius
        const x = mouseX + rewPointRadius * cos(newPointAngle)
        const y = mouseY + rewPointRadius * sin(newPointAngle)
        let pos = p(x, y)

        const distToMouse = mousePos.getDistance(pos)
        if (distToMouse < blurSize) {
            let dir = pos.subtract(mousePos)
            const maxRotation = easeMap(easeInCubic, distToMouse, 0, blurSize, blurStrength, 0)
            dir = dir.rotate(random(-maxRotation, maxRotation))
            pos = mousePos.add(dir)
        }

        const c = grph.get(pos.x, pos.y)
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