//: FILE Main

lineLength = 2
lineWidth = 1
lineColor = '#00000099'
vertexSize = 0
vertexColor = 0
endsSize = 0
endsColor = 'midnightblue'
backgroundColor = 220

colors = []

function setup() {
    initP5(true)
    initMatter()
    createCircle(width/2, height/2)
    center = V(width/2, height/2)
}

function draw() {
    background(backgroundColor)

    vertices.forEach(vrt => {
        dir = V(vrt.position.x, vrt.position.y).sub(center)
        dir.rotate(noise(vrt.position.x/100, vrt.position.y/100) * 3600-1800)
        // strength should be proportional to distance from center, closer = less force
        strength = 1 - dir.mag() / 300
        dir.setMag(strength / 300)
        vrt.force = dir
    })

    if (frameCount % 3 == 0) grow()

    stroke(lineColor)
    strokeWeight(lineWidth)
    connections.forEach(c => {
        posA = c.bodyA.position
        posB = c.bodyB.position
        line(posA.x, posA.y, posB.x, posB.y)
    })

    noStroke()
    fill(vertexColor)
    vertices.forEach(crcl => {
        circle(crcl.position.x, crcl.position.y, vertexSize)
    })

    fill(endsColor)
    noStroke()
    ends = vertices.filter(c => c.connections && c.connections.length == 1)
    ends.forEach(c => {
        circle(c.position.x, c.position.y, endsSize)
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
//: FILE end

//: FILE Objects

vertices = []
function createCircle(x, y, connectTo) {
    newCircle = Bodies.circle(x, y, lineLength, {
        friction: 0,
        restitution: 0.1,
        density: 0.1,
        frictionAir: 0.5,
    })
    Composite.add(world, newCircle)
    vertices.push(newCircle)
    circle(x, y, lineLength / 2)

    if (connectTo) makeConnection(connectTo, newCircle)
}

connections = []
function makeConnection(a, b) {
    constraint = Constraint.create({
        bodyA: a, bodyB: b,
        stiffness: 0.1,
        length: lineLength * 2
    });
    Composite.addConstraint(engine.world, constraint);
    connections.push(constraint)
    a.connections = a.connections || []
    a.connections.push(constraint)
    b.connections = b.connections || []
    b.connections.push(constraint)
}

function grow() {
    if (vertices.length == 0) return

    nodeToGrow = null;
    nulls = vertices.filter(c => !c.connections)
    if (nulls.length > 0) nodeToGrow = choose(nulls)
    else {
        ends = vertices.filter(c => c.connections.length == 1)
        nodeToGrow = random() < .9 ? choose(ends) : choose(vertices)
    }
    angleToCenter = atan2(nodeToGrow.position.y - height/2, nodeToGrow.position.x - width/2)
    newAngle = angleToCenter + 100
    newX = nodeToGrow.position.x + cos(newAngle) * 10
    newY = nodeToGrow.position.y + sin(newAngle) * 10

    createCircle(newX, newY, nodeToGrow)
}
//: FILE end