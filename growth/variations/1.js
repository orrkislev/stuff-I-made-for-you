//FILE Main

lineLength = 8
lineWidth = 3
lineColor = '#00000055'
backgroundColor = 'pink'

colors = []

function setup() {
    initP5(true)
    initMatter()

    for (let i = 0; i < 5; i++) colors.push(lerpColor(color('red'), color('blue'), i / 5))
    for (let i = 0; i < 5; i++) colors.push(lerpColor(color('blue'), color('yellow'), i / 5))
    for (let i = 0; i < 5; i++) colors.push(lerpColor(color('yellow'), color('red'), i / 5))

    createCircle(width / 2, height / 2)
}

function draw() {
    background(backgroundColor)
    if (frameCount % 3 == 0) grow()

    stroke(0)
    connections.forEach(c => {
        const posA = c.bodyA.position
        const posB = c.bodyB.position
        strokeWeight(c.thickness+10)
        line(posA.x, posA.y, posB.x, posB.y)
    })

    stroke(lineColor)
    connections.forEach(c => {
        const posA = c.bodyA.position
        const posB = c.bodyB.position
        strokeWeight(c.thickness)
        stroke(colors[c.bodyA.numInBranch % colors.length])
        line(posA.x, posA.y, posB.x, posB.y)
    })
}

function mousePressed() {
    createCircle(mouseX, mouseY)
}
function keyPressed() {
    if (key == ' ') {
        if (isLooping()) noLoop()
        else loop()
    }
}

//FILE Objects

const vertices = []
function createCircle(x, y, connectTo) {
    const newCircle = Bodies.circle(x, y, lineLength, {
        friction: 0,
        restitution: 0.1,
        density: 0.1,
        frictionAir: 0.5,
    })
    Composite.add(world, newCircle)
    vertices.push(newCircle)
    circle(x, y, lineLength / 2)

    newCircle.numInBranch = 0
    if (connectTo) newCircle.numInBranch = connectTo.numInBranch + 1
    if (connectTo) makeConnection(connectTo, newCircle)
}

const connections = []
function makeConnection(a, b) {
    const nextThickness = a.connections ? a.connections[0].thickness - .5 : 12
    const constraint = Constraint.create({
        bodyA: a, bodyB: b,
        stiffness: 0.1,
        length: lineLength * 2
    });
    Composite.addConstraint(engine.world, constraint);
    constraint.thickness = nextThickness
    connections.push(constraint)
    a.connections = a.connections || []
    a.connections.push(constraint)
    b.connections = b.connections || []
    b.connections.push(constraint)
}

function grow() {
    if (vertices.length == 0) return

    let nodeToGrow = null;
    const nulls = vertices.filter(c => !c.connections)
    if (nulls.length > 0) nodeToGrow = choose(nulls)
    else {
        shuffle(vertices, true)
        vertices.sort((a, b) => a.numInBranch - b.numInBranch)
        nodeToGrow = vertices.filter(c => c.connections.length < 3)[0]
    }
    if (nodeToGrow.connections && nodeToGrow.connections[0].thickness < 1) return

    const newX = nodeToGrow.position.x + random(-10, 10)
    const newY = nodeToGrow.position.y + random(-10, 10)

    createCircle(newX, newY, nodeToGrow)
}
