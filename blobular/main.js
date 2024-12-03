//:FILE main
//.description Define parameters for the network, setup and main draw sequence
//.notes try having lots of different colors, try removing the 'background' line

blobSize = 8
blurSize = 6
threshold = .4
border = 250

backgroundColor = '#333'
families = ['pink', 'white']
dotsPerFamily = 100


async function setup() {
    initP5(true)
    noStroke()

    // initialize all dots
    for (let familyIndex = 0; familyIndex < families.length; familyIndex++) {
        for (let i = 0; i < dotsPerFamily; i++) new Dot(familyIndex)
    }
}

function draw() {
    spatialIndexer = new KDBush(allDots.length);
    allDots.forEach(d => spatialIndexer.add(d.pos.x, d.pos.y));
    spatialIndexer.finish();
    allDots.forEach(d => d.simulate())
    allDots.forEach(d => d.bounceOffWalls(border, .8))
    allDots.forEach(d => d.update())

    background(backgroundColor)
    for (let i = 0; i < families.length; i++)
        showCompound(i)
}

let paintGraphics
function showCompound(familyIndex) {
    const dots = allDots.filter(d => d.family == familyIndex)
    if (!paintGraphics) paintGraphics = createGraphics(width, height)
    paintGraphics.background(255)
    paintGraphics.fill(0)
    paintGraphics.noStroke()
    dots.forEach(p => paintGraphics.circle(p.pos.x, p.pos.y, blobSize))
    blurFilter(paintGraphics, blurSize)
    thresholdFilter(paintGraphics, color(families[familyIndex]))

    drawingContext.filter = 'blur(10px)'
    image(paintGraphics, 0, 0)
    drawingContext.filter = 'none'
    image(paintGraphics, 0, 0)

}
//:FILE end

//:FILE Dot_Class
//.description Define the Dot class and its methods
//.notes try making a circle bounding box for the dots, try adding a method to make the dots follow the mouse

const allDots = []
class Dot extends GenericParticleClass {
    constructor(family) {
        super(random(border, width - border), random(border, height - border))
        this.family = family
        allDots.push(this)
    }

    simulate() {
        let neighborIds = spatialIndexer.within(this.pos.x, this.pos.y, 20);
        neighborIds = neighborIds.slice(0, 50)
        neighborIds.forEach(nId => {
            const n = allDots[nId]
            const dist = n.pos.distance(this.pos)
            const shouldRepel = n.family != this.family || dist < 10
            this.relativeForce(n.pos, 1, shouldRepel)
        })

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
            dir.rotate(-1)
            this.applyForce(dir)
        }
    }
}
//:FILE end

//:FILE filters
//.description Define filters to apply to the graphics
//.notes try making stripes instead of blur

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
        uniform float threshold;
        void main() {
            vec4 color = texture2D(tex0, vTexCoord);
            if (color.r < threshold) {
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
    thresholdShader.setUniform('threshold', threshold)
    thresholdShader.setUniform('mainColor', color(clr).levels.map(c => c / 255))

    filterGraphics.clear()
    filterGraphics.rect(-width / 2, -height / 2, width, height)
    graphics.clear()
    graphics.image(filterGraphics, 0, 0);
}
//:FILE end

//:FILE hidden
//.hidden true
let oldDotsPerFamily = dotsPerFamily
function updateParams() {
    if (dotsPerFamily != oldDotsPerFamily) {
        if (oldDotsPerFamily < dotsPerFamily) {
            for (let familyIndex = 0; familyIndex < families.length; familyIndex++) {
                for (let i = 0; i < dotsPerFamily - oldDotsPerFamily; i++) new Dot(familyIndex)
            }
        } else {
            const newAllDots = []
            familiesCount = Array(families.length).fill(0)
            for (let i = 0; i < allDots.length; i++) {
                const d = allDots[i]
                if (familiesCount[d.family] < dotsPerFamily) {
                    newAllDots.push(d)
                    familiesCount[d.family]++
                }
            }
            allDots.length = 0
            allDots.push(...newAllDots)
        }
    }
    oldDotsPerFamily = dotsPerFamily
}
//:FILE end