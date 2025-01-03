gridx = 5, gridy = 5, cs = 20
function setup() {
    initP5(true)
    grid = Array(gridy).fill().map(() => Array(gridx).fill(0))
    gridObjects = []
    translate(width / 2, height / 2 - gridy * cs / 2)
    fill(0)
    for (let i = 0; i < 1000; i++) insertToGrid()
    resetMatrix()
    scale(-1, 1)
    copy(width / 2, 0, width / 2, height, -width / 2, 0, width / 2, height)
}
function insertToGrid() {
    let x = round_random(gridx - 1)
    let y = round_random(gridy - 1)
    let s = round_random(5)
    for (let i = x; i < x + s; i++) {
        for (let j = y; j < y + s; j++) {
            if (i < 0 || j < 0 || i >= gridx || j >= gridy) return
            if (grid[i][j] == 1) return
        }
    }
    for (let i = x; i < x + s; i++)
        for (let j = y; j < y + s; j++)
            grid[i][j] = 1
    x = (x - 1) * cs
    y = y * cs
    s = s * cs
    if (random() < .5) circle(x + s / 2, y + s / 2, s)
    else {
        push()
        noFill()
        strokeWeight(5)
        stroke(0)
        translate(x + s / 2, y + s / 2)
        rotate(round_random(4) * 90)
        arc(s / 2, s / 2, s * 2, s * 2, 180, 270)
        pop()
    }
    return true
}
/// look at me, i am the 42nd line