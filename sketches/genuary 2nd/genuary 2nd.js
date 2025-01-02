function setup() {
    initP5(true)
    initPaper(false)
    noStroke()
    makeImage()
}

function makeImage() {
    background(100)


    layers = []
    for (let i = 0; i < 100; i++) {
        const z = random(30)
        const x = random(-200, 200)
        const y = random(-200, 200)
        const r = random(10, 80)
        layers.push({ x, y, z, r, 
            sinOffset: random(100), basez:z,
            sinSpeed: random(2)
        })
    }
    layers.sort((a, b) => a.z - b.z)

    lightDir = p(.5, 1)
}


function draw() {
    background(100)

    layers.forEach(l => {
        l.sinOffset += l.sinSpeed
        l.z = max(l.basez + sin(l.sinOffset) * 30, 0)
    })
    layers.sort((a, b) => a.z - b.z)

    translate(width / 2, height / 2)

    for (const layer of layers) {
        drawLayerShadow(layer, 0)
    }

    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i]
        fill(255)
        circle(layer.x, layer.y, layer.r)
        push()
        beginClip()
        circle(layer.x, layer.y, layer.r+1)
        endClip()
        for (let j = i + 1; j < layers.length; j++) {
            const layer2 = layers[j]
            drawLayerShadow(layer2, layer.z)
        }
        pop()
    }
}

function drawLayerShadow(layer, z) {
    fill(50)
    const x = layer.x + lightDir.x * (layer.z - z)
    const y = layer.y + lightDir.y * (layer.z - z)
    circle(x, y, layer.r)
}