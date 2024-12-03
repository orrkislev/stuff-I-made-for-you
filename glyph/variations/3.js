//:FILE main
//.description Define parameters for the network, setup and main draw sequence

colors = ['#555', '#333']
backgroundColor = 'midnightblue'
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

function setup() {
    initP5(true)
    initPaper(false)
    drawStuff()
}

function drawStuff() {
    fill(0)
    background(backgroundColor)
    noStroke()
    randomSeed(random_seed)

    createNetwork()
    if (hexGrid) adjustHexGrid()
    centerNetwork()


    setNodesSizeAndColor()
    drawNetwork()
}

//:FILE end

//:FILE Node_Network
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
function updateNetworkDims() {
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

//:FILE end

//:FILE Network_Drawing
//.description Functions to draw the network of nodes and connections

function adjustHexGrid() {
    network.forEach(p => {
        if (p.y % 2 == 0) p.x += 0.5
    })
}
function centerNetwork() {
    updateNetworkDims()
    cellSize = min(
        width / (networkDims.width + 4),
        height / (networkDims.height + 4)
    )
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
    stroke(255,100)
    strokeWeight(1)
    noFill()
    for (let y=-height;y<height;y+=100){
        arc(width/2, y-height, width*2, width*2, 0, 180)
    }

    network.forEach((node, i) => {
        node.pos = node.pos.add(p(random(-30, 30), random(-30, 30)))
    })
    
    stroke(backgroundColor)
    strokeWeight(10)
    noFill()
    for (let i=0;i<network.length-1;i++) {
        const node = network[i]
        const nextNode = network[i + 1]
        drawConnectionLine(node, nextNode)
    }

    stroke(255)
    strokeWeight(2)
    noFill()
    for (let i=0;i<network.length-1;i++) {
        const node = network[i]
        const nextNode = network[i + 1]
        drawConnectionLine(node, nextNode)
    }
    fill(255)
    stroke(backgroundColor)
    strokeWeight(10)
    network.forEach((node, i) => {
        circle(node.pos.x, node.pos.y, 30)
    })

    // loadPixels()
    // for (let i=0;i<pixels.length;i+=4){
    //     const r = random(-30,30)
    //     pixels[i] += r
    //     pixels[i+1] += r
    //     pixels[i+2] += r
    // }
    // updatePixels()
}

function drawConnectionLine(n1,n2){
    beginShape()
    for (let i=0;i<=4;i++){
        const newPosx = lerp(n1.pos.x, n2.pos.x, i/4)
        const newPosy = lerp(n1.pos.y, n2.pos.y, i/4)
        const n = noise(newPosx / 30, newPosy / 30) * 360
        vertex(newPosx + 10 * cos(n), newPosy + 10 * sin(n))
    }
    endShape()
}

//:FILE end

//:FILE hidden
//.hidden true
function updateParams() {
    drawStuff()
}
//:FILE end