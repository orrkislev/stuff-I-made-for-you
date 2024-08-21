//: FILE main
//.description Define parameters for the network, setup and main draw sequence

colors = ['#555', '#333']
backgroundColor = '#aaa'
networkLength = 20
hexGrid = false
maxGridSize = 8
maxVisits = 0
nodeSize = .66
nodeVariety = .5
ang1 = 0
ang2 = 0
fullChance = .5
holeChance = .5
random_seed = 1

async function setup() {
    initP5(true)
    initPaper(false)

    networkLength = 20
    createNetwork()
    if (hexGrid) adjustHexGrid()
    centerNetwork()
    lockDims = true
    lockCellSize = true

    for (let i = 0; i < 20; i++) {
        randomSeed(random_seed)
        networkLength = i
        createNetwork()
        if (hexGrid) adjustHexGrid()
        centerNetwork()
        await drawStuff()
        await timeout()
    }
}

async function drawStuff() {
    fill(0)
    background(backgroundColor)
    noStroke()

    setNodesSizeAndColor()

    if (network.length > 1) {
        lastNode = network[network.length - 1]
        lastNode.target = p(lastNode.pos.x, lastNode.pos.y)
        prevNode = network[network.length - 2]
        lastNode.pos = p(prevNode.pos.x, prevNode.pos.y)
        for (let i = 0; i < 30; i++) {
            lastNode.pos.x = lerp(lastNode.pos.x, lastNode.target.x, .1)
            lastNode.pos.y = lerp(lastNode.pos.y, lastNode.target.y, .1)
            drawNetwork()
            drawHoles()
            await timeout()
        }
    }

    drawNetwork()
    drawHoles()
}

//: FILE end

//: FILE Node_Network
//.description Functions to create the network of nodes, finding 'legal' neighbors and calculating the network dimensions

function createNetwork() {
    linearNeighbors = [p(1, 0), p(-1, 0), p(0, 1), p(0, -1)]
    hexNeighbors_even = [p(-1, 0), p(0, -1), p(1, -1), p(1, 0), p(1, 1), p(0, 1)]
    hexNeighbors_odd = [p(-1, 0), p(-1, -1), p(0, -1), p(1, 0), p(-1, 1), p(0, 1)]

    network = []
    network.push(p(0, 0))

    let reversed = false
    for (let i = 1; i < networkLength; i++) {
        const last = network[network.length - 1]
        const available = getNeighbors(last)
        if (available.length == 0) {
            if (reversed) break
            reversed = true
            network = network.reverse()
            i--
            continue
        }
        const next = last.add(choose(available))
        network.push(next)
        reversed = false
    }
}
lockDims = false
function updateNetworkDims() {
    if (lockDims) return
    networkDims = {
        top: Math.min(...network.map(p => p.y)),
        bottom: Math.max(...network.map(p => p.y)),
        left: Math.min(...network.map(p => p.x)),
        right: Math.max(...network.map(p => p.x))
    }
    networkDims.width = networkDims.right - networkDims.left
    networkDims.height = networkDims.bottom - networkDims.top
    networkDims.center = p(networkDims.left + networkDims.width / 2, networkDims.top + networkDims.height / 2)
}
function getNeighbors(pos) {
    updateNetworkDims()

    // get all neighbors
    let available = [...linearNeighbors]
    if (hexGrid) {
        if (pos.y % 2 == 0) available = [...hexNeighbors_even]
        else available = [...hexNeighbors_odd]
    }

    // limit to grid size
    if (networkDims.height == maxGridSize - 1) {
        if (pos.y == networkDims.top) available = available.filter(p => p.y != -1)
        if (pos.y == networkDims.bottom) available = available.filter(p => p.y != 1)
    }
    if (networkDims.width == maxGridSize - 1) {
        if (pos.x == networkDims.left) available = available.filter(p => p.x != -1)
        if (pos.x == networkDims.right) available = available.filter(p => p.x != 1)
    }

    // limit to max visits per node
    if (maxVisits > 0) {
        available = available.filter(p => {
            const next = pos.add(p)
            return network.filter(n => n.equals(next)).length < maxVisits
        })
    }

    return available
}

//: FILE end

//: FILE Network_Drawing
//.description Functions to draw the network of nodes and connections

function adjustHexGrid() {
    network.forEach(p => {
        if (p.y % 2 == 0) p.x += 0.5
    })
}
lockCellSize = false
function centerNetwork() {
    updateNetworkDims()
    if (!lockCellSize) {
        cellSize = min(
            width / (networkDims.width + 4),
            height / (networkDims.height + 4)
        )
    }
    network = network.map(node => node.subtract(networkDims.center).multiply(cellSize).add(p(width / 2, height / 2)))
}


function setNodesSizeAndColor() {
    randomSeed(random_seed)
    nodesData = {}
    network.forEach((node, i) => {
        nodesData[`${node.x},${node.y}`] = {
            pos: node,
            color: choose(colors),
            radius: cellSize * nodeSize * (1 - random(nodeVariety))
        }
    })
    network = network.map((node, i) => nodesData[`${node.x},${node.y}`])
}
function drawNetwork() {
    randomSeed(random_seed)
    network.forEach((node, i) => {
        if (i < network.length - 1) {
            const nextNode = network[i + 1]
            setConnectionColor(node, nextNode)

            if (random() < fullChance) drawFullConnection(node, nextNode)
            else drawFancyConnection(node, nextNode)
        }
    })
}
function drawHoles() {
    randomSeed(random_seed)
    network.forEach(node => {
        if (random() < holeChance) {
            fill(backgroundColor)
            circle(node.pos.x, node.pos.y, node.radius)
        }
    })
}

//: FILE end

//: FILE Drawing_Functions
//.description Functions to draw connections between nodes: 'fancy' and 'full' connections

function setConnectionColor(c1, c2) {
    const grad = drawingContext.createLinearGradient(c1.pos.x, c1.pos.y, c2.pos.x, c2.pos.y);
    grad.addColorStop(0, c1.color);
    grad.addColorStop(1, c2.color);
    drawingContext.fillStyle = grad
}

// CONNECTION
function drawFancyConnection(c1, c2) {
    const rotation = c2.pos.subtract(c1.pos).angle - 45
    let [v1, d1, v2, d2] = getConnectionPoints(c1, ang1 + rotation, 90)
    let [v3, d3, v4, d4] = getConnectionPoints(c2, ang2 + rotation + 180, 90)

    beginShape()
    vertex(v1.x, v1.y)
    bezierVertex(v1.x + d1.x, v1.y + d1.y, v4.x + d4.x, v4.y + d4.y, v4.x, v4.y)
    vertex(v3.x, v3.y)
    bezierVertex(v3.x + d3.x, v3.y + d3.y, v2.x + d2.x, v2.y + d2.y, v2.x, v2.y)
    endShape()

    circle(c1.pos.x, c1.pos.y, c1.radius * 2)
    circle(c2.pos.x, c2.pos.y, c2.radius * 2)
}
function getConnectionPoints(c, s, e) {
    let v1 = pointFromAngle(s, c.radius)
    const d1 = v1.rotate(90 * Math.sign(e))
    let v2 = v1.rotate(e)
    const d2 = v2.rotate(-90 * Math.sign(e))
    v1 = v1.add(c.pos)
    v2 = v2.add(c.pos)
    return [v1, d1, v2, d2]
}

function drawFullConnection(c1, c2) {
    const d = c1.pos.getDistance(c2.pos)
    for (let i = 0; i < d; i++) {
        const x = lerp(c1.pos.x, c2.pos.x, i / d)
        const y = lerp(c1.pos.y, c2.pos.y, i / d)
        const r = lerp(c1.radius, c2.radius, i / d)
        circle(x, y, r * 2)
    }
}


//: FILE end