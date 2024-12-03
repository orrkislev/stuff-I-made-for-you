//:FILE main

maxConnections = 15
normalStrength = .3
cellSize = 100
strokeThickness = .5
backgroundColor = 'white'
strokeColor = 'black'
eyeCount = 2

async function setup() {
    initP5(true)
    P_D = pixelDensity()
    initPaper(false)
    textAlign(CENTER, CENTER)
    makeGrid()
}

let absX, absY
async function makeGrid() {
    background(backgroundColor)
    stroke(strokeColor)
    initGrid()
    makeRandomColsAndRows()
    makeGridBorderEmpty()
    fillGrid()
}

function draw() {
    makeRandomColsAndRows()
    background(backgroundColor)
    stroke(strokeColor)
    translate(width / 2, height / 2)
    translate(-cols * cellSize / 2 + cellSize, -rows * cellSize / 2 + cellSize)
    for (let x = 0; x < cols; x++)
        for (let y = 0; y < rows; y++)
            drawCell(x, y, grid[x + ',' + y])
}


//:FILE grid_functions
function initGrid() {
    grid = {}
    rows = floor(height / cellSize)
    cols = floor(width / cellSize)
    translate(width / 2, height / 2)
    translate(-cols * cellSize / 2 + cellSize, -rows * cellSize / 2 + cellSize)
}

function makeRandomColsAndRows() {
    const totalWidth = (cols - 2) * cellSize
    const totalHeight = (rows - 2) * cellSize
    rowWidths = Array(cols - 2).fill().map((_, i) => noise(i * 50, frameCount / 100))
    const totalRowWidths = sum(rowWidths)
    rowWidths = rowWidths.map(v => v / totalRowWidths * totalWidth)
    colHeights = Array(rows - 2).fill().map((_, i) => noise(i * 50 + 500, frameCount / 100))
    const totalColHeights = sum(colHeights)
    colHeights = colHeights.map(v => v / totalColHeights * totalHeight)
}

function makeGridBorderEmpty() {
    for (let x = 0; x < cols; x++) {
        grid[x + ',0'] = { left: null, right: null, top: null, bottom: 0 }
        grid[x + ',' + (rows - 1)] = { left: null, right: null, top: 0, bottom: null }
    }
    for (let y = 0; y < rows; y++) {
        grid['0,' + y] = { left: null, right: 0, top: null, bottom: null }
        grid[(cols - 1) + ',' + y] = { left: 0, right: null, top: null, bottom: null }
    }
}

function fillGrid() {
    allPositions = []
    for (x = 0; x < cols; x++)
        for (y = 0; y < rows; y++)
            allPositions.push([x, y])
    allPositions.sort(() => random() - 0.5)
    for (let i = 0; i < allPositions.length; i++) {
        makeCell(allPositions[i][0], allPositions[i][1])
    }
}


//:FILE cell_functions
function makeCell(x, y) {
    if (grid[x + ',' + y]) return
    let cell = setupCellByNeighbors(x, y)
    cell = setCellOulets(cell)
    makeCellConnections(x, y, cell)
    grid[x + ',' + y] = cell
}

function setupCellByNeighbors(x, y) {
    const cell = {
        left: grid[(x - 1) + ',' + y] ? grid[(x - 1) + ',' + y].right : null,
        right: grid[(x + 1) + ',' + y] ? grid[(x + 1) + ',' + y].left : null,
        top: grid[x + ',' + (y - 1)] ? grid[x + ',' + (y - 1)].bottom : null,
        bottom: grid[x + ',' + (y + 1)] ? grid[x + ',' + (y + 1)].top : null
    }
    cell.targetConnections = maxConnections
    return cell
}

function setCellOulets(cell) {
    let tries = 0
    while (tries++ < 100) {
        nulls = cell.filter(v => v === null)
        nullCount = nulls.length()
        connections = sum(Object.values(cell).filter(v => v !== null))
        restCount = maxConnections * 2 - connections

        if (nullCount == 0) break

        if (nullCount == 1) {
            cell[nulls.getKey(0)] = restCount
        } else if (nullCount > 1) {
            const dir = choose(Object.keys(nulls))
            const maxVal = min(maxConnections, restCount)
            const minVal = max(0, restCount - (nulls.length() - 1) * maxConnections)
            cell[dir] = round_random(minVal, maxVal)
        }
    }
    return cell
}




function makeCellConnections(x, y, cell) {
    if (!cell) return
    if (cell.connections) return

    tries = 0
    while (tries++ < 100) {
        dirs = ['top', 'right', 'bottom', 'left']
        for (let i = 0; i < random(10); i++) dirs.unshift(dirs.pop())
        connections = []
        stack = []
        for (let i = 0; i < 4; i++) {
            if (cell[dirs[i]] !== null) {
                const oldStack = stack.slice()
                const newStack = []
                for (let j = 0; j < cell[dirs[i]]; j++) {
                    if (oldStack.length > 0) {
                        connections.push({
                            from: oldStack.pop(),
                            to: {
                                dir: dirs[i], position: j
                            }
                        })
                    } else {
                        newStack.push({
                            dir: dirs[i], position: j
                        })
                    }
                }
                stack = oldStack.concat(newStack)
            }
        }
        notConnected = []
        for (let i = 0; i < 4; i++) {
            const dir = dirs[i]
            for (let position = 0; position < cell[dir]; position++) {
                if (!connections.find(c =>
                    (c.to.dir == dir && c.to.position == position) ||
                    (c.from.dir == dir && c.from.position == position))) {
                    notConnected.push({ dir, position })
                }
            }
        }
        if (notConnected.length == 0) break
    }

    if (connections.length != maxConnections) {
        for (let i = 0; i < notConnected.length - 1; i++) {
            connections.push({
                from: notConnected[i],
                to: notConnected[i + 1]
            })
        }
    }

    cell.connections = connections
}

function drawCell(x, y, cell) {
    if (!cell) return
    if (!cell.connections) return
    absX = 0
    for (let i = 0; i < x - 1; i++) absX += rowWidths[i]
    absY = 0
    for (let i = 0; i < y - 1; i++) absY += colHeights[i]
    cellWidth = rowWidths[x - 1]
    cellHeight = colHeights[y - 1]

    getPosition = (dir, pos) => {
        const x = dir == 'left' ? 0 : dir == 'right' ? cellWidth : 0
        const y = dir == 'top' ? 0 : dir == 'bottom' ? cellHeight : 0
        const offsetHeight = (cellHeight / (cell[dir] + 1)) * (pos + 1)
        const dy = dir == 'left' ? cellHeight - offsetHeight : dir == 'right' ? offsetHeight : 0
        const offsetWidth = (cellWidth / (cell[dir] + 1)) * (pos + 1)
        const dx = dir == 'top' ? offsetWidth : dir == 'bottom' ? cellWidth - offsetWidth : 0
        return p(x + dx, y + dy)
    }
    normals = {
        'left': p(normalStrength * cellWidth, 0),
        'right': p(-normalStrength * cellWidth, 0),
        'top': p(0, normalStrength * cellHeight),
        'bottom': p(0, -normalStrength * cellHeight)
    }

    noFill()
    rect(absX, absY, cellWidth, cellHeight)
    cell.connections.forEach(drawConnection)
}



//:FILE misc_functions

function makeEye() {
    const x = floor(random(1, cols - 1))
    const y = floor(random(1, rows - 1))
    let posX = 0
    for (let i = 0; i < x - 1; i++) posX += rowWidths[i]
    let posY = 0
    for (let i = 0; i < y - 1; i++) posY += colHeights[i]
    const cellWidth = rowWidths[x - 1]
    const cellHeight = colHeights[y - 1]

    drawEye(posX + cellWidth / 2, posY + cellHeight / 2, cellWidth, cellHeight)
}


//:FILE drawing_functions

function drawConnection(c) {
    const from = getPosition(c.from.dir, c.from.position)
    const to = getPosition(c.to.dir, c.to.position)
    const normalFrom = normals[c.from.dir]
    const normalTo = normals[c.to.dir]
    circle(from.x + absX, from.y + absY, 5)
    circle(to.x + absX, to.y + absY, 5)
    bezier(
        absX + from.x, absY + from.y,
        absX + from.x + normalFrom.x, absY + from.y + normalFrom.y,
        absX + to.x + normalTo.x, absY + to.y + normalTo.y,
        absX + to.x, absY + to.y,
    )
}

function drawEye(x, y, w, h) {
    push()
    translate(x, y)
    strokeWeight(2)
    stroke(strokeColor)
    fill('white')
    circle(w / 2, h / 2, min(w, h) / 2)
    fill('black')
    circle(w / 2, h / 2, min(w, h) / 5)
    pop()
}



//:FILE hidden
//.hidden true

// function redrawGrid() {
//     background(backgroundColor)
//     stroke(strokeColor)
//     for (let x = 0; x < cols; x++)
//         for (let y = 0; y < rows; y++)
//             drawCell(x, y, grid[x + ',' + y])
// }

// let prevMaxConnections, prevCellSize
// function updateParams() {
//     if ((prevMaxConnections && prevMaxConnections != maxConnections) ||
//         (prevCellSize && prevCellSize != cellSize)) {
//         resetMatrix()
//         makeImage()
//     } else {
//         redrawGrid()
//     }
//     prevMaxConnections = maxConnections
//     prevCellSize = cellSize
// }


