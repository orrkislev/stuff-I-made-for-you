//: FILE main.js
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

        const c = get(pos.x, pos.y)
        set(x, y, c)
    }
    updatePixels()
}

//: FILE end

//: FILE Graphics
//.title Graphics Buffer

function setupGraphics(){
    noStroke()
    colors = ['#8ecae6', '#219ebc', '#023047', '#ffb703', '#fb8500']
    const colorWidth = width / colors.length
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

//: FILE end