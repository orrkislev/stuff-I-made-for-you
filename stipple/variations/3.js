//:FILE main.js
blurSize = 280
blurStrength = 45
backgroundColor = '#282828'
textColor = '#CCC'

function setup() {
    initP5(true)
    pixelDensity(1)
    initPaper(false)
    setupGraphics()
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

        c = get(pos.x, pos.y)
        set(x, y, c)
    }
    updatePixels()
}

//:FILE end

//:FILE Graphics
//.title Graphics Buffer

function setupGraphics(){
    noStroke()
    colors = ['#8ecae6', '#219ebc', '#023047', '#ffb703', '#fb8500']
    colorWidth = width / colors.length
    colors.forEach(c=>{
        fill(c)
        rect(colors.indexOf(c) * colorWidth, 0, colorWidth, height)
    })
}

function keyPressed(){
    textSize(600)
    fill(0)
    textAlign(CENTER, CENTER)
    text(key, width / 2, height / 2)
}

//:FILE end