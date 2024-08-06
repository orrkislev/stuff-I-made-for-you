//: FILE main.js
blurSize = 100
blurStrength = 200
backgroundColor = '#282828'
textColor = '#CCC'

function setup() {
    initP5(true)
    pixelDensity(1)
    initPaper(false)
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

function draw() {
    if (!mouseIsPressed) return
    loadPixels()
    const mousePos = p(mouseX, mouseY)
    for (let i = 0; i < 10000; i++) {

        // const x = random(width)
        // const y = random(height)
        const a = random(360)
        const r = random()**3 * blurSize
        const x = mouseX + r * cos(a)
        const y = mouseY + r * sin(a)
        let pos = p(x, y)

        const d = mousePos.getDistance(pos)
        if (d < blurSize) {
            let dir = pos.subtract(mousePos)
            const maxRotation = easeInCubic(1 - d / blurSize) * blurStrength
            dir = dir.rotate(random(-maxRotation, maxRotation))
            pos = mousePos.add(dir)
        }
        const c = grph.get(pos.x, pos.y)
        set(x, y, c)
    }
    updatePixels()
}

//: FILE end