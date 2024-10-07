//: FILE main

cellSize = 8

function setup() {
    initP5(true)
    noStroke()
    reset()
}

function draw() {
    image(bg, 0, 0)
    image(cave, 0, 0)
    player.update()
    bullets.forEach(b => b.update())
}

function mousePressed() {
    new Bullet(player.pos, player.angle)
    player.applyForce(V(cos(player.angle), sin(player.angle)).mult(-1))
}

//: FILE end

//: FILE classes

const speed = 1
const angSpeed = 4
function Player() {
    this.pos = V(width / 2, height / 2)
    this.angle = 0
    this.angularVel = 0
    this.vel = V(0, 0)

    this.applyForce = function (force) {
        this.vel.add(force)
    }

    this.update = function () {
        if (keyIsDown(87)) this.vel.y -= speed
        if (keyIsDown(83)) this.vel.y += speed
        if (keyIsDown(65)) this.vel.x -= speed
        if (keyIsDown(68)) this.vel.x += speed

        const angleToMouse = atan2(mouseY - this.pos.y, mouseX - this.pos.x)
        let diff = angleToMouse - this.angle
        if (diff > 180) diff -= 360
        if (diff < -180) diff += 360
        console.log()
        this.angularVel = diff / 10

        this.pos.add(this.vel)
        this.angle += this.angularVel
        this.angle = this.angle % 360
        this.angularVel *= 0.9
        this.vel.mult(0.95)

        const gridCell = getFromBG(this.pos.x, this.pos.y)
        if (gridCell == 1)
            reset()

        this.show()
    }

    this.show = function () {
        push()
        translate(this.pos.x, this.pos.y)
        rotate(this.angle)
        fill(255, 0, 0)
        rect(-5, -5, 20, 10)
        fill(0)
        circle(0, 0, 20)
        pop()
    }
}

const bullets = []
function Bullet(pos, angle) {
    this.pos = pos.copy()
    this.vel = V(cos(angle), sin(angle))
    this.vel.setMag(10)
    bullets.push(this)

    this.update = function () {
        this.pos.add(this.vel)
        if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) 
            this.disappear()

        const gridCell = getFromBG(this.pos.x, this.pos.y)
        if (gridCell == 1) 
            this.explode()

        this.show()
    }

    this.show = function () {
        fill(0)
        ellipse(this.pos.x, this.pos.y, 5)
    }

    this.explode = function () {
        for (let i = -3; i <= 3; i++) {
            for (let j = -3; j <= 3; j++) {
                if (dist(i, j, 0, 0) > 3) continue
                if (noise((this.pos.x + i * cellSize) / 100, (this.pos.y + j * cellSize) / 100) < 0.5)
                    setGridCell(this.pos.x + i * cellSize, this.pos.y + j * cellSize, 0)
            }
        }
        updateCave()
        bullets.splice(bullets.indexOf(this), 1)
    }

    this.disappear = function () {
        bullets.splice(bullets.indexOf(this), 1)
    }
}

//: FILE end

//: FILE cave

let bg
function reset() {
    if (!bg) bg = createGraphics(width, height)
    bg.clear()
    bg.noStroke()
    caveGrid = []
    for (let x = 0; x < width; x += cellSize) {
        const col = []
        for (let y = 0; y < height; y += cellSize) {
            const dirToCenter = V(x, y).sub(V(width / 2, height / 2))
            const n = noise(dirToCenter.x / 100, dirToCenter.y / 100)
            const n2 = noise(x / 100, y / 100) * 2
            const thresh = map(dist(x, y, width / 2, height / 2), 0, dist(0, 0, width / 2, height / 2), 0, 1)
            if (n * n2 < thresh) col.push(1)
            else col.push(0)

            if (n * n2 < thresh) bg.fill(lerpColor(color('brown'), color('orange'), n))
            else if (n * n2 < thresh + 0.1) bg.fill(lerpColor(color('orange'), color('brown'), n))
            else bg.fill(lerpColor(color('yellow'), color('orange'), n2))
            bg.rect(x, y, cellSize, cellSize)
        }
        caveGrid.push(col)
    }
    updateCave()
    player = new Player()
}

function getFromBG(x, y) {
    const cellX = floor(x / cellSize)
    const cellY = floor(y / cellSize)
    if (cellX < 0 || cellX >= caveGrid.length || cellY < 0 || cellY >= caveGrid[0].length) return 0
    return caveGrid[cellX][cellY]
}

function setGridCell(x, y, value) {
    const cellX = floor(x / cellSize)
    const cellY = floor(y / cellSize)
    if (cellX < 0 || cellX >= caveGrid.length || cellY < 0 || cellY >= caveGrid[0].length) return
    caveGrid[cellX][cellY] = value
}

let cave
function updateCave() {
    if (!cave) cave = createGraphics(width, height)
    cave.clear()
    cave.noStroke()
    cave.fill(0)
    noiseSeed(random(1000))
    for (let x = 0; x < caveGrid.length; x++) {
        for (let y = 0; y < caveGrid[x].length; y++) {
            if (caveGrid[x][y] == 1) {
                cave.rect(x * cellSize, y * cellSize, cellSize, cellSize)
            }
        }
    }
}

//: FILE end