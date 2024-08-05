//FILE waters

blobSize = 4
blurSize = 5
threshold = .8
border = 100
colors = ['tomato', 'cornflowerblue', 'gold']
backgroundColor = 'rgb(255, 245, 225)'
steps = 100
sumDots = 1000
repelStrength = 1
attractionStrength = 1
gravity = 1

async function setup() {
    initP5(true)
    initPaper(false)
    noStroke()

    colors.forEach(clr => {
        for (let i = 0; i < sumDots; i++) new Dot(clr)
    })

    grid = new HashGrid(width, height, 50)
    for (let i = 0; i < steps; i++) {
        grid.clearAndFill(allDots)
        allDots.forEach(d => d.update())

        background(backgroundColor)
        allDots.forEach(d => d.show())
        await timeout()
    }

    background(backgroundColor)
    for (clr of colors) showCompound(getAllFromColor(clr), clr)
}

const allDots = []
class Dot extends GenericParticleClass {
    constructor(clr) {
        super(width * random(.3, .7), height * random(.3, .7))
        this.clr = clr
        this.dampening = .6
        allDots.push(this)
    }

    update() {
        this.applyForce(V(0, gravity))

        const neighbors = grid.query(this, 50)
        neighbors.forEach(n => {
            if (n.clr == this.clr) this.attractTo(n.pos, attractionStrength)
            else this.repelFrom(n.pos, repelStrength)
        })

        const n = noise(this.pos.x / 50, this.pos.y / 50)
        this.applyForce(p5.Vector.fromAngle(n * 1500))

        super.update()
        this.bounceOffWalls(border, .8)
    }

    show() {
        fill(this.clr)
        circle(this.pos.x, this.pos.y, 3)
    }
}
function getAllFromColor(clr) {
    return allDots.filter(d => d.clr == clr)
}


let paintGraphics, paintPattern
function showCompound(dots, clr) {
    if (!paintGraphics) paintGraphics = createGraphics(width, height)
    paintGraphics.background(255)
    paintGraphics.fill(0)
    paintGraphics.noStroke()
    dots.forEach(p => paintGraphics.circle(p.pos.x, p.pos.y, blobSize))

    blurFilter(paintGraphics, blurSize)
    thresholdFilter(paintGraphics, color(clr))

    image(paintGraphics, 0, 0)
}





// --------------------
// ------ FILTER ------
// --------------------

function blurFilter(graphics, size) {
    graphics.drawingContext.filter = `blur(${size}px)`
    graphics.image(graphics.get(), 0, 0)
    graphics.drawingContext.filter = 'none'
}

function thresholdFilter(graphics, clr) {
    const currGraphics = graphics.get()
    graphics.clear()
    ApplyShader('threshold', `
        varying vec2 vTexCoord;
        uniform sampler2D tex0;
        uniform vec4 mainColor;
        void main() {
            vec4 color = texture2D(tex0, vTexCoord);
            if (color.r < ${threshold}) {
                gl_FragColor = mainColor;
            } else {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
            }
        }`,
        {
            tex0: currGraphics,
            mainColor: color(clr).levels.map(c => c / 255)
        },
        graphics)
}