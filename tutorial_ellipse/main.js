async function setup() {
    initP5(true)
    generateLayers()
}


function generateLayers() {
    for (let i = 0; i < 15; i++) new Layer(random(500), i * 10)
    lookPos = V(0, 0)
}

function draw() {
    background(0)

    lookPos = lookPos.lerp(V(mouseX - width / 2, mouseY - height / 2), 0.5)

    translate(width / 2, height / 2)
    rotate(lookPos.heading() + 180)
    const d = lookPos.mag() / (width)
    ratio = d

    layers.forEach(l => l.update())
    layers.forEach(l => l.draw())
}

const layers = []
class Layer {
    constructor(z, r) {
        this.z = z
        this.origZ = z
        this.r = r
        layers.push(this)
    }

    update(){
        if (mouseIsPressed){
            this.z *= 0.6
        } else {
            this.z = lerp(this.z, this.origZ, 0.4)
        }
    }

    draw() {
        noFill()
        stroke(255, 255, 0)
        push()
        translate(-this.z * ratio, 0)
        drawingContext.shadowColor = color(255)
        const blurs = [80, 40, 20, 10, 10, 10]
        blurs.forEach(b => {
            drawingContext.shadowBlur = b
            ellipse(0, 0, this.r * (1 - ratio), this.r)
            arc(0, 0, this.r * (1 - ratio), this.r, lookPos.heading() + 180, lookPos.heading() + 180 + this.r / 20)
            arc(0, 0, this.r * (1 - ratio), this.r, lookPos.heading() + 180, lookPos.heading() + 180 + this.r / 20)
        })
        drawingContext.shadowBlur = 0

        drawingContext.filter = 'blur(10px)'
        fill(255, 20)
        ellipse(0, 0, this.r * (1 - ratio), this.r)
        drawingContext.filter = 'none'


        pop()
    }
}
