// Genuary 5 - Isometric

function setup() {
    initP5(true)
    initPaper(false)
    stroke(0)
    fill(0)
    strokeWeight(4)
    strokeCap(ROUND)
    strokeJoin(ROUND)
    makeImage()
}

function makeImage() {
    background(255)

    for (let x=100;x<width-100;x+=20) {
        rect(x, 100, 10, height-200)
    }

    const x = width * .43, y = height / 2
    const paths = Array(5).fill(0).map(_ => new Path.Rectangle(
        x + random(-30, 30), y - random(100),
        100, random(50, 100)
    ))
    paths.forEach(p => p.rotate(random(-10, 10)))

    path = new Path()
    paths.forEach(p => path = path.unite(p))
    thicken(path.clone(), thickenParams[0])
    thicken(path.clone(), thickenParams[1])
    thicken(path.clone(), thickenParams[2])
    thicken(path.clone(), thickenParams[3])
}

thickenParams = [
    { skew: [0, 15], translate: [1, -1] },
    { skew: [0, -15], translate: [-1, -1] },
    { skew: [15, 0], translate: [-1, 1] },
    { skew: [-15, 0], translate: [1, 1]},
]

function thicken(path, params) {
    if (path.children) return path.children.forEach(p => thicken(p, thickness))
    path.translate(
        (path.bounds.width / 2 + 20) * params.translate[0], 
        (path.bounds.height / 2 + 20) * params.translate[1])
    path.skew(params.skew[0], params.skew[1])

    const topSegment = path.segments.reduce((a, b) => a.point.y < b.point.y ? a : b)
    let tries = 0
    while (path.segments[0] != topSegment && tries++ < 1000) path.segments.push(path.segments.shift())

    const backPath = path.clone().translate(
        50 * params.translate[0],
        50 * params.translate[1])
        drawPath(backPath, 255, 0)
    if (params.flow == -1) path.segments.reverse()
    for (let i = path.segments.length - 1; i > 0; i--) {
        const seg1 = path.segments[i]
        const seg2 = path.segments[i - 1]
        const seg3 = backPath.segments[i - 1]
        const seg4 = backPath.segments[i]
        const connectionPath = new Path([
            seg1.point, seg2.point, seg3.point, seg4.point
        ])
        connectionPath.closed = true
        drawPath(connectionPath, 255, 0)
    }
    drawPath(path, 255, 0)
}