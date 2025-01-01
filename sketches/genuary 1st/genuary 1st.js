step = 6
size = 3
blr = 30
cosVal = random(10)
sinVal = random(10)

function setup() {
    initP5(true)
    makeImage()
}

function makeImage() {
    background(10, 20, 40)

    drawingContext.shadowColor = 'rgba(255, 245, 220, 1)'
    drawingContext.shadowBlur = blr

    stroke(255, 245, 220, 10)
    strokeWeight(size)

    offsets = [
        [.5, .9], [.3, .7], [.2, .5], [.1, .4], [.05, .35], [.05, .35]
    ]

    for (let y = 100; y < height - 100; y += step) {
        let w = cos(y * cosVal) * sin(y * sinVal) ** 2 * 150 + 20
        w = abs(w)

        line(width / 2 - w, y, width / 2 + w, y)
        offsets.forEach(offset => {
            const x1 = width / 2 - w * offset[0]
            const x2 = width / 2 + w * offset[1]
            line(x1, y, x2, y)
            line(x1, y, x2, y)
            line(x1, y, x2, y)
        })
    }
    drawingContext.shadowColor = 'none'
    drawingContext.shadowBlur = 0

    // strokeWeight(1)
    // stroke(255, 245, 220, 50)
    for (let x = 100; x < width - 100; x += 10) {
        pairs = []
        inShape = false
        start = null
        end = null
        for (let y = 100; y < height - 100; y += step) {
            let w = cos(y * cosVal) * sin(y * sinVal) ** 2 * 150 + 20
            if (abs(width / 2 - x) > abs(w)) {
                if (!inShape) {
                    start = y
                    inShape = true
                }
            } else {
                if (inShape) {
                    end = y
                    pairs.push([start, end])
                    inShape = false
                }
            }
        }

        for (let i = 0; i < 3; i++) {
            const gradX = x + random(-10, 10)
            const gradY = random(height)
            const grad = drawingContext.createRadialGradient(gradX, gradY, 0, gradX, gradY, random(500))
            grad.addColorStop(0, 'rgba(255, 245, 220, .2)')
            grad.addColorStop(1, 'rgba(255, 245, 220, 0)')
            drawingContext.strokeStyle = grad
            pairs.forEach(pair => {
                line(x, pair[0], x, pair[1])
            })
        }
    }
}