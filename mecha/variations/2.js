//: FILE setup_stuff
//.description global variables, three.js scene, camera, renderer, controls and materials
//.notes try switching to PointLight, try playing with the materials, try adding more lights

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let backgroundColor = '#222'
let boxColor = 'beige'
let shadowColor = '#110909'
let boxCount = 8
let colors = ['pink', 'lime', 'skyblue', 'yellow']

const elements = []

// set scene and camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(backgroundColor);
const width = window.innerWidth;
const height = window.innerHeight;
const ratio = width / height;
const camera = new THREE.OrthographicCamera(-15 * ratio, 15 * ratio, 15, -15, 1, 1000);
camera.position.set(-20, 20, 20);
camera.lookAt(0, 0, 0);

// set renderer, shadowmap, antialias and other settings
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 1);
renderer.antialias = true;
document.body.appendChild(renderer.domElement);

// set controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.minPolarAngle = 0
controls.maxPolarAngle = (Math.PI / 2) * (1 - .1)
controls.target = new THREE.Vector3(0.4, 3.7, -1)

// set sun
const light = new THREE.DirectionalLight(backgroundColor, 1);
light.position.set(-50, 100, 50);
light.castShadow = true;
light.shadow.mapSize.width = 8024;
light.shadow.mapSize.height = 8024;
light.shadow.camera.near = 1;
light.shadow.camera.far = 300;
light.shadow.camera.top = 30;
light.shadow.camera.right = 30;
light.shadow.camera.bottom = -30;
light.shadow.camera.left = -30;
scene.add(light);

// materials
const shadowMaterial = new THREE.ShadowMaterial({ color: shadowColor });
const elementMaterial = new THREE.MeshBasicMaterial({ color: boxColor });
const outlineMaterial = new THREE.ShaderMaterial({
    vertexShader: `void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * 0.1, 1.0);
        }`,
    fragmentShader: `void main() {
            gl_FragColor = vec4(0,0,0,1);
        }`,
    side: THREE.BackSide
});

//:FILE end


//:FILE main
//.description create the scene with boxes and bubbles, and main animation loop
//.notes try adding small people on the ground, try making the boxes move


// set floor
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floor = new THREE.Mesh(floorGeometry, new THREE.MeshBasicMaterial({ color: backgroundColor }));
floor.rotation.x = -Math.PI / 2;
scene.add(floor);
const floorShadow = new THREE.Mesh(floorGeometry, shadowMaterial);
floorShadow.rotation.x = -Math.PI / 2;
floorShadow.receiveShadow = true;
scene.add(floorShadow);

// set boxes
const bottom = 3
const top = 10
const boxes = []
for (let i = 0; i < boxCount; i++) makeBox()

boxes.forEach(box => {
    const pos = box.position
    const box_w = box.geometry.parameters.width
    const box_d = box.geometry.parameters.depth
    box.left = pos.x - box_w / 2
    box.right = pos.x + box_w / 2
    box.front = pos.z + box_d / 2
    box.back = pos.z - box_d / 2
})

boxes.forEach((box, i) => {
    const corners = [
        [box.left+.3, box.front-.3],
        [box.left+.3, box.back+.3],
        [box.right-.3, box.front-.3],
        [box.right-.3, box.back+.3]
    ]

    corners.forEach(corner => {
        let legHeight = box.position.y
        boxes.forEach((otherBox, j) => {
            if (i === j) return
            if (corner[0] > otherBox.left && corner[0] < otherBox.right && corner[1] > otherBox.back && corner[1] < otherBox.front) {
                legHeight = Math.min(legHeight, box.position.y - otherBox.position.y)
            }
            const legPos = [corner[0], box.position.y - legHeight / 2-.1, corner[1]]
            const legSize = [.2, legHeight, .2]
            const leg = makeBoxElement(legSize, legPos, [0, 0, 0])
            leg.material = box.material
        })
    })
})


function animate() {
    requestAnimationFrame(animate);
    controls.update();
    elements.forEach(element => element.update());
    renderer.render(scene, camera);
}
animate();

//:FILE end

//:FILE helpers
//.description helper functions that create the boxes, each with its own shadow and outline elements, bubbles and mirror stuff
//.notes try switching the BoxGeometry to a SphereGeometry, try adding more randomness to the box sizes


function makeBox() {
    let pos = [random(-1, 1) + random(-1, 1) ** 3 * 5, random(bottom, top), random(-5, 5)]
    let rot = [0, 0, 0]
    const size = [random(1, 5), random(.2, .2), random(1, 11)]
    const box = makeBoxElement(size, pos, rot)
    box.material = new THREE.MeshBasicMaterial({ color: choose(colors) });
    boxes.push(box)
}

function makeBoxElement(size, pos, rot) {
    const cubeGeometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
    const cube = new THREE.Mesh(cubeGeometry, elementMaterial)
    cube.position.set(...pos);
    cube.rotation.set(...rot.map(x => x * Math.PI / 180));
    makeElement(cube);
    return cube
}

function makeElement(mesh) {
    mesh.castShadow = true;
    scene.add(mesh);
    mesh.shadow = new THREE.Mesh(mesh.geometry, shadowMaterial);
    mesh.shadow.receiveShadow = true;
    scene.add(mesh.shadow);
    mesh.outline = new THREE.Mesh(mesh.geometry, outlineMaterial);
    scene.add(mesh.outline);

    mesh.update = function () {
        mesh.shadow.position.copy(mesh.position);
        mesh.shadow.rotation.copy(mesh.rotation);
        mesh.outline.position.copy(mesh.position);
        mesh.outline.rotation.copy(mesh.rotation);
    }
    mesh.update();

    mesh.remove = function () {
        scene.remove(mesh);
        scene.remove(mesh.shadow);
        scene.remove(mesh.outline);
    }

    elements.push(mesh);
}

function makeMirrorMesh(mesh) {
    const mirrorGeo = mesh.geometry.clone()
    const mirror = new THREE.Mesh(mirrorGeo, mesh.material)
    mirror.position.set(-mesh.position.x, mesh.position.y, mesh.position.z)
    mirror.rotation.set(mesh.rotation.x + Math.PI, mesh.rotation.y, mesh.rotation.z)
    mirror.recieveShadow = mesh.recieveShadow
    mirror.castShadow = mesh.castShadow
    scene.add(mirror)
    return mirror
}

//:FILE end

//:FILE hidden
//.hidden true
window.updateParams = (params) => {
    elementMaterial.color.set(params.boxColor)
    shadowMaterial.color.set(params.shadowColor)
    bubbleMaterial.color.set(params.bubbleColor)
    scene.background.set(params.backgroundColor)
    floor.material.color.set(params.backgroundColor)

    if (params.boxCount > boxes.length) for (let i = 0; i < params.boxCount - boxes.length; i++) makeBox()
    else for (let i = 0; i < boxes.length - params.boxCount; i++) boxes.pop().remove()
}
const realWindow = window.parent || window;
realWindow.addEventListener('mousedown', controls._onMouseDown, false);
realWindow.addEventListener('pointerup', controls._onPointerUp, false);
realWindow.addEventListener('mousemove', controls._onMouseMove, false);
//: FILE end
