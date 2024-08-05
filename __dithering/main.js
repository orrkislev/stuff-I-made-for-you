//FILE main.js

imageFile = './pic.png'
scl = 60

let img
function setup() {
    createCanvas(windowWidth, windowHeight)
    loadImage(imageFile, dithering)
}

function dithering(loadedImage) {
    img = loadedImage
    img.loadPixels()
    // error diffusion dithering
    for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
            let index = (x + y * img.width) * 4
            let r = img.pixels[index]
            let g = img.pixels[index + 1]
            let b = img.pixels[index + 2]

            let oldR = r
            let oldG = g
            let oldB = b

            let newR = r > 127 ? 255 : 0
            let newG = g > 127 ? 255 : 0
            let newB = b > 127 ? 255 : 0

            img.pixels[index] = newR
            img.pixels[index + 1] = newG
            img.pixels[index + 2] = newB

            let errR = oldR - newR
            let errG = oldG - newG
            let errB = oldB - newB

            addError(x + 1, y, errR * 7 / 16, errG * 7 / 16, errB * 7 / 16)
            addError(x - 1, y + 1, errR * 3 / 16, errG * 3 / 16, errB * 3 / 16)
            addError(x, y + 1, errR * 5 / 16, errG * 5 / 16, errB * 5 / 16)
            addError(x + 1, y + 1, errR * 1 / 16, errG * 1 / 16, errB * 1 / 16)
        }
    }
    img.updatePixels()
    image(img, 0, 0)
}

function addError(x, y, errR, errG, errB) {
    let index = (x + y * img.width) * 4
    if (x < img.width && y < img.height) {
        img.pixels[index] += errR
        img.pixels[index + 1] += errG
        img.pixels[index + 2] += errB
    }
}
