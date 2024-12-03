//:FILE Setup
//.description Create a scene with a camera and lights
//.notes try adding more lights, try playing with the fog, try switching to PerspectiveCamera

import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

let backgroundColor = 'white'
let textColor = 'black'
let lensColor = '#FFFFFF'
let word = 'Cool'

let sumLenses = 10
let lensSize = [1, 12]

let roughness = .2
let transmission = 1
let thickness = 30
let opacity = 1

let scene, renderer, camera
function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    const ratio = window.innerWidth / window.innerHeight;
    scene.fog = new THREE.Fog(backgroundColor, 1, 200);
    camera = new THREE.OrthographicCamera(-15 * ratio, 15 * ratio, 15, -15, 1, 1000)
    camera.position.set(-10, -20, 50);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
}

function initLights() {
    const ambient = new THREE.AmbientLight('white', 0.5);
    scene.add(ambient);

    const light = new THREE.DirectionalLight('white', 1);
    light.position.set(50, 100, 50);
    light.castShadow = true;
    scene.add(light);
}

//:FILE end

//:FILE lenses
//.description Create the lens materials and the lenses (squished spheres)
//.notes try playing with the lens material, try using a torus shape, try moving them around a bit

function lensMaterial() {
    return new THREE.MeshPhysicalMaterial({
        attenuationDistance: 100,
        attenuationColor: 'white',
        roughness: roughness,
        transmission: transmission,
        thickness: thickness * random(.5, 1.5),
        transparent: true,
        opacity: opacity,
    });
}

let lenses = []
function createLenses() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    for (let x = -10; x < 10; x++) {
        for (let y = -10; y < 10; y++) {
            const lensMesh = new THREE.Mesh(geometry, lensMaterial());
            lensMesh.position.set(x, y, random(3))
            scene.add(lensMesh);
            lenses.push(lensMesh)
            lensMesh.rotationSpeed = random(1) / 100
        }
    }
}

function updateLenses() {
    lenses.forEach(lens => lens.rotation.x += lens.rotationSpeed)
}
//:FILE end

//:FILE Text
//.description Create a text mesh with a given font
//.notes try switching the font, try rotating the text, try changing the extrude or color settings

let textMesh, theFont
function placeText(font) {
    const textShape = font.generateShapes(word, 7);
    const extrudeSettings = {
        steps: 2,
        depth: .3,
        bevelEnabled: true,
        bevelThickness: .1,
        bevelSize: .1,
        bevelSegments: 3
    };
    const geometry = new THREE.ExtrudeGeometry(textShape, extrudeSettings)
    geometry.computeBoundingBox();
    geometry.center();

    const textMaterial = new THREE.MeshPhysicalMaterial({
        color: textColor,
        roughness: 1,
        metalness: 0.2,
    })

    // const geometry = new THREE.SphereGeometry(7, 32, 32);
    // geometry.scale(1, 1, .1)
    textMesh = new THREE.Mesh(geometry, textMaterial);
    textMesh.position.set(0, 0, -1);
    scene.add(textMesh);
    theFont = font
}
function createText() {
    const fontUrl = 'https://raw.githubusercontent.com/7dir/json-fonts/refs/heads/master/fonts/cyrillic/roboto/Roboto_Regular.json'
    const fontLoader = new FontLoader()
    if (!theFont) fontLoader.load(fontUrl, placeText)
    else placeText(theFont)
}
//:FILE end

//:FILE camera
//.description Update the camera position based on the mouse position
//.notes try adding a rotation to the camera, try adding a zoom effect

let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
function onMouseMove(event) {
    targetX = (event.clientX / window.innerWidth - 0.5) * 2;
    targetY = (event.clientY / window.innerHeight - 0.5) * 2;
}








function updateCamera() {
    mouseX = lerp(mouseX, targetX, 0.1);
    mouseY = lerp(mouseY, targetY, 0.1);

    const rotationAngle = -(mouseX * Math.PI / 3)
    camera.position.x = 50 * Math.sin(rotationAngle);
    camera.position.z = 50 * Math.cos(rotationAngle);
    camera.position.y = -20 + mouseY * 40;
    camera.lookAt(0, 0, 0);
}
//:FILE end


//:FILE run
//.description Start the scene and animate it
//.notes try adding a post-processing effect, try animating the lens movement
function start() {
    initScene()
    initLights()
    createLenses()
    createText()
    animate()
}

function animate() {
    requestAnimationFrame(animate);
    updateCamera();
    updateLenses();
    renderer.render(scene, camera);
}
start()
//:FILE end

//:FILE hidden
//.hidden true
window.updateParams = (params) => {
    if (params.textColor != textColor || params.word != word) {
        textColor = params.textColor || textColor
        word = params.word || word
        scene.remove(textMesh)
        createText()
    }

    lensColor = params.lensColor || lensColor
    sumLenses = params.sumLenses || sumLenses
    lensSize = params.lensSize || lensSize
    roughness = params.roughness || roughness
    transmission = params.transmission || transmission
    thickness = params.thickness || thickness

    if (sumLenses != lenses.length) {
        lenses.forEach(lens => scene.remove(lens))
        lenses = []
        createLenses()
    }

    lenses.forEach((lens, i) => {
        lens.material.color.set(lensColor)
        lens.material.roughness = roughness
        lens.material.transmission = transmission
        lens.material.thickness = thickness
        lens.material.opacity = params.opacity || opacity
    })

    if (params.backgroundColor != backgroundColor) {
        backgroundColor = params.backgroundColor || backgroundColor
        scene.background.set(params.backgroundColor)
    }
}
const realWindow = window.parent || window;
realWindow.addEventListener('mousemove', onMouseMove, false);
//:FILE end
