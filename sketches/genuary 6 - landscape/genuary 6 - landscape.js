houses = 30
let backgroundClr = '#f0e1e6'
let waterColor = 'royalblue'
let forestColor = 'forestgreen'
let houseColor = 'crimson'
w = .8
h = .9

function setup() {
    initP5(true)
    initPaper(false)
    noStroke()
    makeImage()
}

function makeImage() {
    background(backgroundClr)

    const river = new Path()
    for (let x = 20; x < width; x += 50) {
        const y = height / 2 + noise(x / 300) * 300
        river.add(new Point(x, y))
    }
    river.smooth()

    riverChunks = []
    for (let i = 0; i < river.length; i += 20) {
        const start = river.getPointAt(i)
        const tang = river.getTangentAt(i)
        const chunk = new Path.Rectangle(p(0, 0), 20, noise(i / 100) * 100)
        chunk.rotate(tang.angle)
        chunk.position = start
        riverChunks.push(chunk)

        doAddElement(chunk, waterColor)
    }

    const outskirts = p(random(width), 200)
    for (let i = 0; i < houses; i++) {
        const r = random(10, 30)
        const house = new Path.Rectangle(p(random(width), random() < .5 ? 0 : height), r, r)
        let target = river.getPointAt(river.length * random(.3, .7))
        if (i % 5 == 0) target = outskirts
        let tries = 0
        while (!checkElement(house) && tries++ < 1000) {
            house.data.lastPosition = house.position
            house.data.lastRotation = house.rotation
            house.position = pointLerp(house.position, target, .1)
            house.rotate(random(-10, 10))
        }
        house.position = house.data.lastPosition
        house.rotation = house.data.lastRotation
        addElement(house, houseColor, r)
    }

    const inLake = (x, y) => noise(x / 300, y / 300, 100) < .3
    const inForest = (x, y) => noise(x / 300, y / 300) > .5

    for (let x = 30; x < width - 30; x += 10) {
        for (let y = 30; y < height - 30; y += 10) {
            if (!inLake(x, y)) continue
            const lakePart = new Path.Rectangle(p(x, y), 10).rotate(random(90))
            doAddElement(lakePart, waterColor)
        }
    }

    for (let x = 30; x < width - 30; x += 30) {
        for (let y = 30; y < height - 30; y += 30) {
            if (inLake(x, y)) continue
            if (inForest(x, y))
                addElement(new Path.Circle(p(x, y), 10), forestColor, 10)
            else
                addElement(new Path.Circle(p(x, y), 5), forestColor, 3)
        }
    }

    elements.filter(e => !e.data.shadow).forEach(e => {
        drawPath(e, e.fillColor.toCSS(), false)
    })

    elements.filter(e => e.data.shadow).forEach(e => {
        for (let i = 0; i < e.data.shadow; i++) {
            translate(.5, 1)
            drawPath(e, 80, false)
        }
        resetMatrix()
    })

    elements.filter(e => e.data.shadow).forEach(e => {
        drawPath(e, e.fillColor.toCSS(), false)
    })

    stroke(backgroundClr + '44')
    for (let i = 0; i < 100000; i++) {
        const x = random(width)
        const y = random(height)
        line(x, y, x, y)
    }
}


const elements = []
const addElement = (path, clr, shadow) => {
    if (checkElement(path)) return
    doAddElement(path, clr, shadow)
}
const doAddElement = (path, clr, shadow) => {
    if (path.position.x < width * (.5 - w / 2) ||
        path.position.x > width * (.5 + w / 2) ||
        path.position.y < height * (.5 - h / 2) ||
        path.position.y > height * (.5 + h / 2)) return

    if (shadow) path.data.shadow = shadow
    path.fillColor = clr
    elements.push(path)
}
const checkElement = (path) => {
    return elements.some(p => p.contains(path.position)) || elements.some(p => p.intersects(path))
}