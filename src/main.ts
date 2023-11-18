import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
const drop_zone = document.querySelector("#drop-zone") as HTMLDivElement;

function dropHandler(e: DragEvent) {
    e.preventDefault();

    if (e.dataTransfer) {
        (e.target as HTMLDivElement).classList.remove("file-hover");
        (e.target as HTMLDivElement).style.visibility = ("hidden");

        [...e.dataTransfer.files].forEach((file, i) => {

            let reader = new FileReader();
            reader.onload = function (load_file_event) {
                let buffer = load_file_event.target?.result as ArrayBuffer;
                console.log(buffer);
                loader.parse(buffer, "/", (data)=>{
                    console.log(data);
                    scene.add(data.scene.children[0]);
                })

            }
            reader.readAsArrayBuffer(file);

        })
    }

};

function dragOverHandler(ev) {
    // console.log("File(s) in drop zone");
    ev.target.classList.toggle("file-hover", true);
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
}

drop_zone.addEventListener("drop", dropHandler);
drop_zone.addEventListener("dragover", dragOverHandler);

let clock = new THREE.Clock();
let renderer = new THREE.WebGLRenderer({ antialias : true});
renderer.domElement.classList.add("canvas");
let camera = new THREE.PerspectiveCamera(45, 1.0, 0.01, 100.0);
let scene = new THREE.Scene();
let loader = new GLTFLoader();
let light1 = new THREE.DirectionalLight();
light1.position.setX(1);
light1.position.setY(1);
light1.lookAt(new THREE.Vector3(0,0,0))
scene.add(light1);
let controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = true;
controls.autoRotate = true;
controls.minDistance = 0.02;
controls.maxDistance = 1.0;

document.body.appendChild(renderer.domElement);
console.log("GLTF Viewer");

function animate()
{
    requestAnimationFrame(animate);
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(camera.aspect);
    camera.updateProjectionMatrix();
    let dt = 
    controls.update();

    renderer.render(scene, camera);

}

animate();