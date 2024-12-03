//:FILE Setup

async function setup() {
    initP5(true)
    initPaper(false)
    colorMode(HSB)
    noStroke()
    r = height * .2

    x = width / 2
    y = height / 2

    background(220)
}

function mousePressed(){
    drawPoint(mouseX, mouseY)
}
function mouseDragged(){
    const d = dist(mouseX, mouseY, pmouseX, pmouseY)
    for (let i=0; i<d; i++){
        const x = lerp(pmouseX, mouseX, i/d)
        const y = lerp(pmouseY, mouseY, i/d)
        drawPoint(x, y)
    }
}

function drawPoint(x, y) {
    const hue = map(x, 0, width, 0, 360) + map(y, 0, height, 0, 360)
    const saturation = map(x, 0, width, 0, 100)
    const brightness = map(y, 0, height, 0, 100)

    let gradient = drawingContext.createLinearGradient(x - r, y - r, x + r, y + r)
    gradient.addColorStop(0, 'rgba(0,0,0,1)')
    gradient.addColorStop(.5, `hsl(${hue}, ${saturation}%, ${brightness}%)`)
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    drawingContext.fillStyle = gradient
    circle(x, y, r)

    const clr = 'ffffff'
    gradient = drawingContext.createLinearGradient(x + r / 4, y - r / 4, x + r / 2, y - r / 2)
    gradient.addColorStop(0, `#${clr}00`)
    gradient.addColorStop(1, `#${clr}`)
    drawingContext.fillStyle = gradient
    circle(x, y, r)

    gradient = drawingContext.createLinearGradient(x - r / 4, y + r / 4, x - r / 2, y + r / 2)
    gradient.addColorStop(0, '#ffff0000')
    gradient.addColorStop(1, '#ffff7755')
    drawingContext.fillStyle = gradient
    circle(x, y, r)
}

//:FILE end