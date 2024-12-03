//:FILE main
blobSize = 12
blurSize = 8
threshold = .5
border = 100

backgroundColor = '#3b3a3a'
families = ['#b5b5b5', '#8c8c8c', '#5f5f5f', '#3b3b3b', '#1f1f1f']
dotsPerFamily = 2500


async function setup() {
    initP5(true)
    noStroke()

    // initialize all dots
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
    allDots.forEach(d => d.show())
    
    if (frameCount == 100) {
        for (family of families)
            showCompound(family)
        noLoop()    
    }
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
//:FILE end

//:FILE Dot_Class
const allDots = []
class Dot extends GenericParticleClass {
    constructor(family) {
        super(random(border, width - border), random(border, height - border))
        this.family = family
        allDots.push(this)
    }

    simulate() {
        let neighborIds = spatialIndexer.within(this.pos.x, this.pos.y, 20);
        neighborIds = neighborIds.slice(0,50)
        neighborIds.forEach(nId => {
            const n = allDots[nId]
            const dist = n.pos.distance(this.pos)
            const shouldRepel = n.family != this.family || dist < 10
            this.relativeForce(n.pos, 1, shouldRepel)
        })
    }

    show() {
        fill(this.family)
        circle(this.pos.x, this.pos.y, blobSize / 2)
    }
}
//:FILE end

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
//:FILE end