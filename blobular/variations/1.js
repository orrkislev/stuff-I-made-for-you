//:FILE main
blobSize = 12
blurSize = 8
threshold = .3
border = 200

backgroundColor = 'midnightblue'
const families = ['gold', 'tomato']
const dotsPerFamily = 1000

async function setup() {
    initP5(true)
    noStroke()
    families.forEach(family => {
        for (let i = 0; i < dotsPerFamily; i++) new Dot(family)
    })
}

function draw() {
    spatialIndexer = new KDBush(families.length * dotsPerFamily);
    allDots.forEach(d => spatialIndexer.add(d.pos.x, d.pos.y));
    spatialIndexer.finish();
    allDots.forEach(d => d.simulate())
    allDots.forEach(d => d.bounceOffWalls(border, .8))
    allDots.forEach(d => d.update())

    background(backgroundColor)
    for (family of families)
        showCompound(family)
}

let paintGraphics
function showCompound(family) {
    const dots = allDots.filter(d => d.family == family)
    if (!paintGraphics) paintGraphics = createGraphics(width, height)
    paintGraphics.background(255)
    paintGraphics.fill(0)
    paintGraphics.noStroke()
    dots.forEach(p => paintGraphics.circle(p.pos.x, p.pos.y, blobSize))

    blurFilter(paintGraphics, blurSize)
    thresholdFilter(paintGraphics, color(family))

    image(paintGraphics, 0, 0)
}


//:FILE Dot_Class
const allDots = []
class Dot extends GenericParticleClass {
    constructor(family) {
        super(random(border, width - border), random(border, height - border))
        this.family = family
        allDots.push(this)
    }

    simulate() {
        let gravity = VV(0, 0)

        let neighborIds = spatialIndexer.within(this.pos.x, this.pos.y, 20);
        neighborIds = neighborIds.slice(0,50)
        neighborIds.forEach(nId => {
            const n = allDots[nId]
            const dist = n.pos.distance(this.pos)
            const shouldRepel = n.family != this.family || dist < 10
            this.relativeForce(n.pos, 1, shouldRepel)
            if (!shouldRepel) gravity.y += 0.1
        })
        this.applyForce(gravity)

        // repel mouse
        {
            const mouse = VV(mouseX, mouseY)
            let dist = mouse.distance(this.pos)
            if (dist < 100) {
                if (dist < 1) dist = 1
                const forceMag = 50 / dist
                const dir = mouse.direction(this.pos).normalize(forceMag)
                this.applyForce(dir)
            }
        }

        {
            const dir = this.pos.direction(VV(width / 2, height / 2)).normalize(.5)
            this.applyForce(dir)
        }
    }
}


//:FILE filters
function blurFilter(graphics, size) {
    graphics.drawingContext.filter = `blur(${size}px)`
    graphics.image(graphics.get(), 0, 0)
    graphics.drawingContext.filter = 'none'
}

const shaders = []
let filterGraphics
function thresholdFilter(graphics, clr) {
    if (!filterGraphics) filterGraphics = createGraphics(width, height, WEBGL);
    if (!shaders.find(s => s.name == 'threshold')) {
        let fragSrc = `precision highp float;
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
        }`;
        const newShader = filterGraphics.createFilterShader(fragSrc);
        shaders.push({ name: 'threshold', shader: newShader });
    }

    const thresholdShader = shaders.find(s => s.name == 'threshold').shader;
    filterGraphics.shader(thresholdShader);
    thresholdShader.setUniform('tex0', graphics)
    thresholdShader.setUniform('mainColor', color(clr).levels.map(c => c / 255))

    filterGraphics.clear()
    filterGraphics.rect(-width / 2, -height / 2, width, height)
    graphics.clear()
    graphics.image(filterGraphics, 0, 0);
}
