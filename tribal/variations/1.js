//:FILE main

maxConnections = 4
normalStrength = .3
cellSize = 160
strokeThickness = .5
backgroundColor = 'tan'
strokeColor = 'beige'
eyeCount = 2

async function setup() {
    initP5(true)
    P_D = pixelDensity()
    initPaper(false)
    textAlign(CENTER, CENTER)
    await makeImage()
}

let absX, absY
async function makeImage() {
    background(backgroundColor)
    stroke(strokeColor)
    initGrid()
    makeRandomColsAndRows()
    makeGridBorderEmpty()
    await fillGrid()
    for (let i = 0; i < eyeCount; i++) makeEye()
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
    rowWidths = Array(cols - 2).fill().map(_ => random(.1, 1))
    const totalRowWidths = sum(rowWidths)
    rowWidths = rowWidths.map(v => v / totalRowWidths * totalWidth)
    colHeights = Array(rows - 2).fill().map(_ => random(.1, 1))
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

async function fillGrid() {
    allPositions = []
    for (x = 0; x < cols; x++)
        for (y = 0; y < rows; y++)
            allPositions.push([x, y])
    allPositions.sort(() => random() - 0.5)
    for (let i = 0; i < allPositions.length; i++) {
        makeCell(allPositions[i][0], allPositions[i][1])
        await timeout()
    }
}


//:FILE cell_functions
function makeCell(x, y) {
    if (grid[x + ',' + y]) return
    let cell = setupCellByNeighbors(x, y)
    cell = setCellOulets(cell)
    grid[x + ',' + y] = cell
    drawCell(x, y, cell)
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




function drawCell(x, y, cell) {
    if (!cell) return
    absX = 0
    for (let i = 0; i < x - 1; i++) absX += rowWidths[i]
    absY = 0
    for (let i = 0; i < y - 1; i++) absY += colHeights[i]
    cellWidth = rowWidths[x - 1]
    cellHeight = colHeights[y - 1]

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

    connections.forEach(drawConnection)
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
    const normalFrom = normals[c.from.dir].rotate(random(-10, 10))
    const normalTo = normals[c.to.dir].rotate(random(-10, 10))
    myBezier(
        from.x, from.y,
        from.x + normalFrom.x, from.y + normalFrom.y,
        to.x + normalTo.x, to.y + normalTo.y,
        to.x, to.y,
    )
    myBezier(
        from.x,from.y,from.x,from.y,to.x,to.y,to.x,to.y
    )
}

function drawEye(x, y, w, h) {
    push()
    translate(x, y)
    strokeWeight(2)
    stroke(strokeColor)
    fill('white')
    myCircle(w / 2, h / 2, min(w, h) / 2)
    fill('black')
    myCircle(w / 2, h / 2, min(w, h) / 5)
    pop()
}

function myBezier(x1, y1, x2, y2, x3, y3, x4, y4) {
    const n = 200
    for (let i = 0; i < n; i++) {
        const t = i / n
        const x = bezierPoint(x1, x2, x3, x4, t) + absX
        const y = bezierPoint(y1, y2, y3, y4, t) + absY
        strokeWeight(strokeThickness * (cellSize / 6) * noise(x / 60, y / 60))
        stroke(0)
        point(x + 5, y + 5)
        stroke(strokeColor)
        point(x, y)
        if (i % 10 == 0) i += 10
    }
}
function myCircle(x, y, r) {
    push()
    noStroke()
    circle(x, y, r)
    pop()
    const n = 150
    for (let i = 0; i < n; i++) {
        const t = i / n * 360
        const x1 = x + cos(t) * r / 2
        const y1 = y + sin(t) * r / 2
        strokeWeight(strokeThickness * (cellSize / 10) * noise(x1 / 60, y1 / 60))
        point(x1, y1)
    }
}




//:FILE hidden
//.hidden true

function redrawGrid() {
    background(backgroundColor)
    stroke(strokeColor)
    for (let x = 0; x < cols; x++)
        for (let y = 0; y < rows; y++)
            drawCell(x, y, grid[x + ',' + y])
    for (let i = 0; i < eyeCount; i++) makeEye()
}

let prevMaxConnections, prevCellSize
function updateParams() {
    if ((prevMaxConnections && prevMaxConnections != maxConnections) ||
        (prevCellSize && prevCellSize != cellSize)) {
        resetMatrix()
        makeImage()
    } else {
        redrawGrid()
    }
    prevMaxConnections = maxConnections
    prevCellSize = cellSize
}


