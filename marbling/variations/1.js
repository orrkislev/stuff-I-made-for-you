//:FILE Main
backgroundColor = 'orange'

function setup() {
    initP5(true)
    noStroke()
    fill(255)
}

function draw() {
    if (mouseIsPressed) {
        background(backgroundColor)
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
//:FILE end

//:FILE Drop
drops = []
class Drop {
    constructor(x, y) {
        this.center = V(x, y)
        this.r = 10
        this.points = []
        for (var a = 0; a < 360; a += 1)
            this.points.push(p5.Vector.fromAngle(radians(a)).mult(this.r).add(this.center))
        drops.forEach(drop => drop.marbleBy(this))
        this.index = drops.length
        this.age = 0
        drops.push(this)
    }

    marbleBy(drop) {
        this.points.forEach(P => {
            var C = drop.center
            var diff = P.dist(C)
            var r = drop.r
            P.set(p5.Vector.add(C, p5.Vector.sub(P, C).mult(sqrt(1 + r * r / (diff * diff)))))
        })
        this.rebuild()
    }

    rebuild() {
        var shouldRebuild = false
        var newPoints = []
        for (var i = 0; i < this.points.length; i++) {
            var p1 = this.points[i]
            var p2 = this.points[(i + 1) % this.points.length]
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
    }
}
//:FILE end