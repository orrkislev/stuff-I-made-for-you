//:FILE Main

//.title Main draw loop and interaction
//.description update all elements and draw them

lineLength = 6
lineWidth = 3
lineColor = 'white'
endsSize = 8
endsColor = 'yellow'
backgroundColor = 'black'

function setup() {
    initP5(true)
    initMatter()
    engine.timing.timeScale = 0.01;
}

function draw() {
    background(backgroundColor)
    if (frameCount % 50 == 0) grow()

    stroke(lineColor)
    strokeWeight(lineWidth)
    connections.forEach(c => {
        posA = c.bodyA.position
        posB = c.bodyB.position
        line(posA.x, posA.y, posB.x, posB.y)
    })

    noStroke()
    ends = vertices.filter(c => c.connections && c.connections.length == 1)
    ends.forEach(c => {
        if (c.isNew) fill('red')
        else fill(255)
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






//:FILE Objects
//.title Vertices and Connections
//.description create and connect vertices
function grow() {
    if (vertices.length == 0) return
    vertices.forEach(v => v.isNew = false)
    
    nodeToGrow = pickNodeToGrow()
    newPosition = getPositionNearby(nodeToGrow)
    newCircle = createCircle(newPosition.x, newPosition.y)
    makeConnection(nodeToGrow, newCircle)
}

function pickNodeToGrow(){
     nodeToGrow = null;
     nulls = vertices.filter(c => !c.connections)
    if (nulls.length > 0) nodeToGrow = choose(nulls)
    else {
         ends = vertices.filter(c => c.connections.length == 1)
        nodeToGrow = random() < .5 ? choose(ends) : choose(vertices)
    }
    return nodeToGrow
}

function getPositionNearby(node){
    return {
        x: node.position.x + random(-.1, .1),
        y: node.position.y + random(-.1, .1)
    }
}

 vertices = []
function createCircle(x, y) {
     newCircle = Bodies.circle(x, y, lineLength, {
        friction: 0,
        restitution: 0.1,
        density: 0.1,
        frictionAir: 0.5,
    })
    newCircle.isNew = true
    Composite.add(world, newCircle)
    vertices.push(newCircle)
    circle(x, y, lineLength / 2)
    return newCircle
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
    a.connections.push(b)
    b.connections = b.connections || []
    b.connections.push(a)
}
