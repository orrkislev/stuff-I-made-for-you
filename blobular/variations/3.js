//:FILE main
blobSize = 8
blurSize = 8
threshold = .6
border = 250

backgroundColor = 'white'
families = ['red']
dotsPerFamily = 1200


async function setup() {
    initP5(true)
    noStroke()

    // initialize all dots
    families.forEach(family => {
        for (let i = 0; i < dotsPerFamily; i++) new Dot(family)
    })

    bgGrad = drawingContext.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
    bgGrad.addColorStop(0, '#c0c0ff')
    bgGrad.addColorStop(1, '#a8f3cc')
}

function draw() {
    spatialIndexer = new KDBush(families.length * dotsPerFamily);
    allDots.forEach(d => spatialIndexer.add(d.pos.x, d.pos.y));
    spatialIndexer.finish();
    allDots.forEach(d => d.simulate())
    allDots.forEach(d => d.bounceOffWalls(border, .8))
    allDots.forEach(d => d.update())

    drawingContext.fillStyle = bgGrad
    drawingContext.fillRect(0, 0, width, height)
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
    outlineFilter(paintGraphics)

    image(paintGraphics, 0, 0)
}
//:FILE end

//:FILE Dot_Class
const allDots = []
class Dot extends GenericParticleClass {
    constructor(family) {
        super(random(border, width - border), random(border, height - border))
        this.family = family
        this.dampen = 1
        allDots.push(this)
    }

    simulate() {
        let neighborIds = spatialIndexer.within(this.pos.x, this.pos.y, 20);
        neighborIds = neighborIds.slice(0,50)
        neighborIds.forEach(nId => {
            const n = allDots[nId]
            this.applyForce(n.vel.copy().normalize(0.1))
        })

        // repel mouse
        {
            const mouse = VV(mouseX, mouseY)
            let dist = mouse.distance(this.pos)
            if (dist < 100) {
                if (dist < 1) dist = 1
                const forceMag = 50 / dist
                const dir = this.pos.direction(mouse).normalize(forceMag)
                this.applyForce(dir)
            }
        }
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

function outlineFilter(graphics) {
    if (!filterGraphics) filterGraphics = createGraphics(width, height, WEBGL);
    if (!shaders.find(s => s.name == 'outline')) {
        let fragSrc = `precision highp float;
        varying vec2 vTexCoord;
        uniform sampler2D tex0;
        void main() {
            vec4 color = texture2D(tex0, vTexCoord);
            if (color.r < .5){
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }

            vec2 pixelSize = vec2(1.0 / ${width.toFixed(2)}, 1.0 / ${height.toFixed(2)});
            vec4 up = texture2D(tex0, vTexCoord + vec2(0, pixelSize.y));
            vec4 down = texture2D(tex0, vTexCoord + vec2(0, -pixelSize.y));
            vec4 left = texture2D(tex0, vTexCoord + vec2(pixelSize.x, 0));
            vec4 right = texture2D(tex0, vTexCoord + vec2(-pixelSize.x, 0));
            vec4 diff = vec4(0);
            if (up.r != color.r) diff += up;
            if (down.r != color.r) diff += down;
            if (left.r != color.r) diff += left;
            if (right.r != color.r) diff += right;
            if (diff.r > 0.1) gl_FragColor = vec4(.0 , .0 , .0 , 1.0);
            else gl_FragColor = vec4(0.0 , 0.0 , 0.0, 0.0);
        }`;
        const newShader = filterGraphics.createFilterShader(fragSrc);
        shaders.push({ name: 'outline', shader: newShader });
    }
    const outlineShader = shaders.find(s => s.name == 'outline').shader;
    filterGraphics.shader(outlineShader);
    outlineShader.setUniform('tex0', graphics)
    filterGraphics.clear()
    filterGraphics.rect(-width / 2, -height / 2, width, height)
    graphics.clear()
    graphics.image(filterGraphics, 0, 0);
}
//:FILE end