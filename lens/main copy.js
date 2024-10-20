import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

let backgroundColor = 'white'
let elementColor = 'white'
let word = 'Geva'

const sumLenses = 10
const minSize = 1
const maxSize = 12

let scene, renderer, camera
function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    const ratio = window.innerWidth / window.innerHeight;
    scene.fog = new THREE.Fog('white', 1, 500);
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

function createLenses() {
    for (let z = 0; z < sumLenses; z ++) {
        const t = z / sumLenses
        new Lens(lerp(maxSize, minSize, t), lerp(0, 15, t))
    }
}

function createElement() {
    const hardMaterial = new THREE.MeshPhysicalMaterial({
        color: elementColor,
        roughness: 1,
        metalness: 0.2,
    })
    const fontUrl = 'https://raw.githubusercontent.com/7dir/json-fonts/refs/heads/master/fonts/cyrillic/roboto/Roboto_Regular.json'
    const fontLoader = new FontLoader()
    fontLoader.load(fontUrl, (font) => {
        console.log(font)
        const shapes = font.generateShapes(word, 7);
        // const geometry = new THREE.ShapeGeometry(shapes);
        const extrudeSettings = {
            steps: 2,
            depth: .3,
            bevelEnabled: true,
            bevelThickness: .1,
            bevelSize: .1,
            bevelSegments: 3
        };
        const geometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings)
        geometry.computeBoundingBox();
        geometry.center();

        // const geometry = new THREE.SphereGeometry(7, 32, 32);
        // geometry.scale(1, 1, .1)
        const hardSlate = new THREE.Mesh(geometry, hardMaterial);
        hardSlate.position.set(0, 0, -1);
        addToScene(hardSlate);
    }, (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, (err) => {
        console.log('An error happened');
    })
}


let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
function onMouseMove(event) {
    targetX = (event.clientX / window.innerWidth - 0.5) * 2;
    targetY = (event.clientY / window.innerHeight - 0.5) * 2;

}
document.addEventListener('mousemove', onMouseMove, false);

function updateCamera() {
    mouseX = lerp(mouseX, targetX, 0.1);
    mouseY = lerp(mouseY, targetY, 0.1);

    const rotationAngle = -(mouseX * Math.PI / 3)
    camera.position.x = 50 * Math.sin(rotationAngle);
    camera.position.z = 50 * Math.cos(rotationAngle);
    camera.position.y = -20 + mouseY * 40;
    camera.lookAt(0, 0, 0);
}

function createSlate(width, height, thickness, radius) {
    const roundedRectShape = new THREE.Shape();
    function roundedRect(ctx, x, y, width, height, radius) {
        x -= width / 2;
        y -= height / 2;
        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, y + height - radius);
        ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
        ctx.lineTo(x + width - radius, y + height);
        ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
        ctx.lineTo(x + width, y + radius);
        ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.quadraticCurveTo(x, y, x, y + radius);
    }
    roundedRect(roundedRectShape, 0, 0, width, height, radius);

    const extrudeSettings = {
        steps: 2,
        depth: thickness,
        bevelEnabled: true,
        bevelThickness: thickness / 2,
        bevelSize: thickness / 2,
        bevelSegments: 10
    };
    const geometry = new THREE.ExtrudeGeometry(roundedRectShape, extrudeSettings)
    return geometry
}

function addToScene(mech, castShadow = true, receiveShadow = true) {
    scene.add(mech);
    if (castShadow) mech.castShadow = true;
    if (receiveShadow) mech.receiveShadow = true;
}


function createMaterial(thickness = 1) {
    return new THREE.MeshPhysicalMaterial({
        attenuationDistance: 100,
        attenuationColor: 'white',
        roughness: .2,//random(),
        transmission: 5,//random(1, 500),
        thickness: random(30),
        // transparent: true,
        // opacity: .8,//random(.1, .6)
    });
}

const lenses = []
class Lens {
    constructor(r, z) {
        const geometry = new THREE.SphereGeometry(r, 32, 32);
        // const geometry = new THREE.TorusGeometry(r, r / 2, 32, 32);
        geometry.scale(1, 1, .5)
        // this.mesh = new THREE.Mesh(createSlate(r*2, r*2, .3, 3), createMaterial());
        this.mesh = new THREE.Mesh(geometry, createMaterial());
        this.mesh.position.set(0, 0, z);
        addToScene(this.mesh)
        this.targetZ = random(15)
        lenses.push(this)
    }

    update() {
        // this.mesh.position.z = lerp(this.mesh.position.z, this.targetZ, 0.01)
        // if (Math.abs(this.mesh.position.z - this.targetZ) < 1) {
        //     this.targetZ = random(15)
        // }
    }
}

function start() {
    initScene()
    initLights()
    createLenses()
    createElement()
    animate()
}

function animate() {
    requestAnimationFrame(animate);
    updateCamera();
    lenses.forEach(lens => lens.update())
    renderer.render(scene, camera);
}
start()