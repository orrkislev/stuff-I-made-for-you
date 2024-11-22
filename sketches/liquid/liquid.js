ripples = 3
rippleHeight = 20
let H, S, B

async function setup() {
    initP5(true)
    noFill()
    colorMode(HSB)
    await makeImage()
}

async function makeImage() {
    background('beige')
    translate(width / 2, height / 2)

    maxR = width * .4

    for (let r = width / 2; r > 0; r -= 1) {
        const fade = 1 - (r / maxR) ** 3
        const thresh = r / maxR
        const s = sin(r * ripples * 2)
        const c = cos(r * ripples * 2)
        for (let a = 180; a < 360; a += 1) {
            if (noise(a / 100, r / 3) < thresh) continue

            setHSB(a, r, c, fade)

            const x = r * cos(a) * 2
            const y = r * sin(a) * .6 + s * rippleHeight * fade
            brushStroke(x, y)
        }
        await timeout()
    }

    for (let t = 0; t < 1; t += .05) {
        const s = (sin(t * 180 - 90) + 1) / 2
        const r = ((sin(t * 180) + 1) - 1) * 20 * s
        for (let a = 180; a < 360; a += 1) {
            setHSB(a, r, 0, 1)
            const x = r * cos(a) * 2
            const y = r * sin(a) * .6
            brushStroke(x, -s * 100 + y)
        }
        await timeout()
    }
    for (let t = 0; t < 1; t += .05) {
        const s = (sin(t * 180 - 90) + 1) / 2
        const r = ((sin(t * 180) + 1) - 1) * 20 * s
        for (let a = 0; a < 180; a += 1) {
            setHSB(a, r, 0, 1)
            const x = r * cos(a) * 2
            const y = r * sin(a) * .6
            brushStroke(x, -s * 100 + y)
        }
        await timeout()
    }

    for (let r = 0; r < width / 2; r += 1) {
        const fade = 1 - (r / maxR) ** 3
        const thresh = r / maxR
        const s = sin(r * ripples * 2)
        const c = cos(r * ripples * 2)
        for (let a = 0; a < 180; a += 1) {
            if (noise(a / 100, r / 3, 10) < thresh) continue

            setHSB(a, r, c, fade)

            const x = r * cos(a) * 2
            const y = r * sin(a) * .6 + s * rippleHeight * fade
            brushStroke(x, y)
        }
        await timeout()
    }
}

function setHSB(a, r, c, fade) {
    H = (noise(a / 150, r / 3) * 360 + 180) % 360
    if (c < 0) H = (H + 90) % 360
    B = c * 30 + 70
    S = fade * 60
}

function brushStroke(x, y) {
    const n = noise((x + 1000) / 100, (y + 1000) / 100)
    y += n * 40
    const dir = random() < .5 ? -1 : 1
    const change = random(-7, 7)
    const length = 10
    for (let i = 0; i < 15; i++) {
        thinStroke(x, y + random(-5, 5), random(length), dir, change)
    }
}
function thinStroke(x, y, length, dir, change) {
    stroke(H + random(-10, 10), S, B + random(-10, 10), .3)
    bezier(x - dir * length * .5, y,
        x, y,
        x + dir * length * .5, y + change / 2,
        x + dir * length, y + change)
}