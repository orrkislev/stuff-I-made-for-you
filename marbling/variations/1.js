//: FILE Main
backgroundColor = 'pink'

function setup() {
    initP5(true)
    noStroke()
    fill(255)
    background(backgroundColor)
    blendMode(DIFFERENCE)
    if (debugMode) {
        blendMode(BLEND)
        noFill()
        stroke(255, 0, 255)
    }
}

function draw() {
    if (mouseIsPressed) {
        blendMode(BLEND)
        if (debugMode) background(0)
        else background(backgroundColor)
        blendMode(DIFFERENCE)
        new Drop(mouseX, mouseY)
        drops.forEach(drop => drop.show())
    }
}

function mouseReleased() {
    makeSVG(drops)
}
function keyPressed() {
    if (key == 's') saveSVG()
}
//: FILE end

//: FILE Drop
const drops = []
class Drop {
    constructor(x, y) {
        this.center = V(x, y)
        this.r = random(10, 40)
        this.points = []
        for (let a = 0; a < 360; a += 1)
            this.points.push(p5.Vector.fromAngle(radians(a)).mult(this.r).add(this.center))
        drops.forEach(drop => drop.marbleBy(this))
        this.index = drops.length
        this.age = 0
        drops.push(this)
    }

    marbleBy(drop) {
        this.points.forEach(P => {
            const C = drop.center
            const diff = P.dist(C)
            const r = drop.r
            P.set(p5.Vector.add(C, p5.Vector.sub(P, C).mult(sqrt(1 + r * r / (diff * diff)))))
        })
        this.rebuild()
    }

    rebuild() {
        let shouldRebuild = false
        const newPoints = []
        for (let i = 0; i < this.points.length; i++) {
            const p1 = this.points[i]
            const p2 = this.points[(i + 1) % this.points.length]
            newPoints.push(p1)
            if (p1.dist(p2) > 10) {
                newPoints.push(p5.Vector.add(p1, p2).div(2))
                shouldRebuild = true
            }
        }
        this.points = newPoints
        if (shouldRebuild) this.rebuild()
    }

    show() {
        if (this.age++ > 500) {
            drops.splice(this.index, 1)
            return
        }
        beginShape()
        this.points.forEach(point => {
            vertex(point.x, point.y)
        })
        endShape(CLOSE)

        if (debugMode) {
            for (let i = 0; i < this.points.length; i += 10) {
                ellipse(this.points[i].x, this.points[i].y, 2)
            }
        }
    }
}
//: FILE end