let attaching = false
let attachIndex = 0
let landmarks = [];
const totalStars = 1000

function setup() {
    initP5(true)
    initFaceApi(onFaces)
    for (let i = 0; i < totalStars; i++) new Star();
    for (let i = 0; i < 30; i++) new Person()
}

function draw() {
    handleAttachment()
    drawBackground()
    stars.forEach(star => star.draw());
    moon()
    hills()
    people.forEach(person => person.draw())
}


// ------------------ FACE ----------------------------
// ----------------------------------------------------
function onFaces(faces) {
    attaching = false
    if (faces.length > 0) {
        if (faces[0].alignedRect.box.area > width * height / 10) {
            landmarks = faces[0].landmarks.positions;
            attaching = true
        }
    }
}

function handleAttachment() {
    if (attaching && attachIndex < totalStars) {
        attachIndex += 10
        if (attachIndex >= totalStars / 2)
            people.forEach(person => person.runAway())
    }
    if (!attaching && attachIndex > 0) {
        attachIndex -= 20
        if (attachIndex < totalStars < 3)
            people.forEach(person => person.comeBack())
    }
}


// ----------------- Stars -----------------
// ----------------------------------------------

let stars = [];
class Star {
    constructor() {
        this.targetx = this.origX = this.x = random(width);
        this.targety = this.origY = this.y = random(height);
        this.offsetX = random(-10, 10)
        this.offsetY = random(-10, 10)
        this.size = random(1, 3);
        this.attaching = false;
        this.index = round_random(totalStars);
        const landMarkIndex = this.index / (totalStars / 68)
        this.landmark1 = Math.max(floor(landMarkIndex), 0)
        this.landmark2 = Math.min(ceil(landMarkIndex), 67)
        this.landmarkT = landMarkIndex - this.landmark1
        stars.push(this);
    }

    draw() {
        if (this.index < attachIndex) {
            this.targetx = width - lerp(landmarks[this.landmark1].x, landmarks[this.landmark2].x, this.landmarkT)
            this.targety = lerp(landmarks[this.landmark1].y, landmarks[this.landmark2].y, this.landmarkT)
        } else {
            this.targetx = this.origX;
            this.targety = this.origY;
        }
        this.x = lerp(this.x, this.targetx, 0.1);
        this.y = lerp(this.y, this.targety, 0.1);
        noStroke();
        fill(255);
        circle(this.x + this.offsetX, this.y + this.offsetY, this.size);
    }
}

// ----------------- SCENE Drawing -----------------
// -------------------------------------------------
function drawBackground() {
    EasyGrad.down(0, 0, 0, height, '#000', '#222')
    rect(0, 0, width, height)
}

function moon() {
    fill(255)
    circle(width - 100, 100, 50)
    withBlur([100, 100, 100, 100], () => circle(width - 100, 100, 50))
    withBlur([20, 3], () => circle(width - 100, 100, 50))
}
function hills() {
    fill(0)
    beginShape()
    for (let x = -100; x < width + 100; x += 50)
        curveVertex(x, getTerrainHeight(x))
    vertex(width + 100, height + 100)
    vertex(-100, height + 100)
    endShape(CLOSE)
}
function getTerrainHeight(x) {
    return height - 100 - noise(x / 100) * 100
}


// ----------------- People -----------------
// -----------------------------------------
let people = []
class Person {
    constructor() {
        this.x = random(width)
        this.targetx = this.x
        this.speed = random(1, 3)
        people.push(this)
    }
    runAway() {
        if (this.targetx > 0 && this.targetx < width)
            this.targetx = random() < .5 ? -100 : width + 100
    }
    comeBack() {
        this.targetx = width * random(.3, .7)
    }
    draw() {
        if (this.targetx < this.x - 2) this.x -= this.speed
        else if (this.targetx > this.x + 2) this.x += this.speed
        const y = getTerrainHeight(this.x)
        fill(0)
        rect(this.x, y - 3, 6, 30, 100)
        circle(this.x + 3, y - 8, 6)
    }
}