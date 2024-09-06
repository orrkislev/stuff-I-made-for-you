//: FILE setup_stuff
//.description global variables, three.js scene, camera, renderer, controls and materials

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let backgroundColor = 'tan'
let boxColor = 'orange'
let bubbleColor = 'black'
let shadowColor = 'purple'
let bubbleCount = 80
let boxCount = 20


const elements = []

// set scene and camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(backgroundColor);
const width = window.innerWidth;
const height = window.innerHeight;
const ratio = width / height;
const camera = new THREE.OrthographicCamera(-15 * ratio, 15 * ratio, 15, -15, 1, 1000);
camera.position.set(46, 20, 70);
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
controls.autoRotate = true
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
const bubbleMaterial = new THREE.MeshBasicMaterial({ color: bubbleColor });
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
const bottom = random(0, 10)
const top = random(0, 10)
const boxes = []
const bubbles = []
for (let i = 0; i < boxCount; i++) makeBox()
for (let i = 0; i < bubbleCount; i++) makeBubble()

let speed = 0

function animate() {
    requestAnimationFrame(animate);

    speed = lerp(speed, 0, .05)
    if (speed < .005) {
        speed = 1
        boxes.forEach(box => {
            box.speedRotZ = random(-3, 3) * Math.PI / 180
            box.speedRotX = random(-3, 3) * Math.PI / 180
            box.speedMoveX = random(-10, 10) * Math.PI / 180
        })
    }
    boxes.forEach(box => {
        box.rotation.z += box.speedRotZ ? speed * box.speedRotZ : 0
        box.rotation.x += box.speedRotX ? speed * box.speedRotX : 0
        box.position.x += box.speedMoveX ? speed * box.speedMoveX : 0
    })

    controls.update();
    elements.forEach(element => element.update());
    renderer.render(scene, camera);
}
animate();

//:FILE end

//:FILE helpers
//.description helper functions that create the boxes, each with its own shadow and outline elements, bubbles and mirror stuff


function makeBox(){
    let pos = [random(5) + random() ** 3 * 5, random(bottom, top), random(-10, 10)]
    let rot = [random(-30, 30), random(-10, 10), random(40)]
    const size = [random(1,5), random(.2, .8), random(1, 11)]
    const box = makeBoxElement(size, pos, rot)
    makeMirrorElement(box)
    boxes.push(box)
}

function makeBubble() {
    let pos = [random(-5,5) + random(-1,1) ** 3 * 5, random(bottom-3, top+3), random(-10, 10)]
    const sphereGeometry = new THREE.SphereGeometry(random(.05,.3), 32, 32);
    const sphere = new THREE.Mesh(sphereGeometry, bubbleMaterial)
    sphere.position.set(...pos);
    sphere.castShadow = true;
    scene.add(sphere);
    bubbles.push(sphere)
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

function makeMirrorElement(element){
    const mirror = makeMirrorMesh(element)
    mirror.position.set(-element.position.x, element.position.y, element.position.z)
    mirror.rotation.set(element.rotation.x + Math.PI, element.rotation.y, element.rotation.z)
    makeElement(mirror)
    element.updateChildren = element.update
    element.update = function(){
        element.updateChildren()
        mirror.position.set(-element.position.x, element.position.y, element.position.z)
        mirror.rotation.set(element.rotation.x + Math.PI, element.rotation.y, element.rotation.z)
    }
    element.removeChildren = element.remove
    element.remove = function(){
        element.removeChildren()
        mirror.remove()
    }
}

function makeMirrorMesh(mesh){
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
window.updateParams = (params)=>{
    elementMaterial.color.set(params.boxColor)
    shadowMaterial.color.set(params.shadowColor)
    bubbleMaterial.color.set(params.bubbleColor)
    scene.background.set(params.backgroundColor)
    floor.material.color.set(params.backgroundColor)

    if (params.bubbleCount > bubbles.length) for (let i = 0; i < params.bubbleCount - bubbles.length; i++) makeBubble()
    else for (let i = 0; i < bubbles.length - params.bubbleCount; i++) scene.remove(bubbles.pop())
    
    if (params.boxCount > boxes.length) for (let i = 0; i < params.boxCount - boxes.length; i++) makeBox()
    else for (let i = 0; i < boxes.length - params.boxCount; i++) boxes.pop().remove()
}
const realWindow = window.parent || window;
realWindow.addEventListener( 'mousedown',   controls._onMouseDown, false );
realWindow.addEventListener( 'pointerup',   controls._onPointerUp, false );
realWindow.addEventListener( 'mousemove',   controls._onMouseMove, false );
//: FILE end
