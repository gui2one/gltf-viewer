import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
const drop_zone = document.querySelector("#drop-zone") as HTMLDivElement;

let scene : THREE.Scene;
let camera : THREE.PerspectiveCamera;
let renderer : THREE.WebGLRenderer;
let loader : GLTFLoader;
let controls : OrbitControls;
let clock : THREE.Clock;
let obj : THREE.Object3D;

function dropHandler(e: DragEvent) {
    e.preventDefault();

    if (e.dataTransfer) {
        (e.target as HTMLDivElement).classList.remove("file-hover");
        (e.target as HTMLDivElement).style.visibility = ("hidden");

        [...e.dataTransfer.files].forEach((file, i) => {

            let reader = new FileReader();
            reader.onload = function (load_file_event) {
                let buffer = load_file_event.target?.result as ArrayBuffer;
                // console.log(buffer);
                loader.parse(buffer, "/", (data)=>{
                    obj = data.scene.children[0];
                    let bounds = new THREE.Box3().setFromObject(obj);
                    let size_x = bounds.max.x - bounds.min.x;
                    let size_y = bounds.max.y - bounds.min.y;
                    let size_z = bounds.max.z - bounds.min.z;
                    let max_size = Math.max(size_x, Math.max(size_y, size_z));
                    obj.receiveShadow = true;


                    obj.scale.set(1.0/max_size, 1.0/max_size, 1.0/max_size);
                    // console.log(bounds);
                    // console.log(max_size);

                    obj.traverse( (child : THREE.Object3D)=>{
                        child.receiveShadow = true;
                        child.castShadow = true;
                    })

                    scene.add(obj);
                    console.log(obj);
                    
                    controls.minDistance = 0.02;
                    controls.maxDistance = 2.0;

                    camera.position.setZ(2.0);
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

clock = new THREE.Clock(true);
renderer = new THREE.WebGLRenderer({ antialias : true, alpha : true});

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.domElement.classList.add("canvas");
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFShadowMap;

camera = new THREE.PerspectiveCamera(45, 1.0, 0.01, 100.0);
camera.position.set(0,0,5.0);

scene = new THREE.Scene();

loader = new GLTFLoader();
let light1 = new THREE.DirectionalLight();
light1.position.setX(2);
light1.position.setY(2);
light1.position.setZ(2);
light1.lookAt(new THREE.Vector3(0,0,0));
light1.intensity = 1.0;
light1.castShadow = true;
light1.shadow.mapSize.width = 1024;
light1.shadow.mapSize.height = 1024;
light1.shadow.camera.top = 1.0;
light1.shadow.camera.bottom = -1.0;
light1.shadow.camera.left = -1.0;
light1.shadow.camera.right = 1.0;
light1.shadow.camera.near = 0.1;
light1.shadow.camera.far = 30.0;
// light1.shadow.bias = 0.0001;
light1.shadow.normalBias = 0.0001;
light1.shadow.radius = 3.0;
scene.add(light1);
let light2 = new THREE.DirectionalLight("lightblue");
light2.position.setX(-1);
light2.position.setY(-1);
light2.position.setZ(-1);
light2.intensity = 0.6;

light2.lookAt(new THREE.Vector3(0,0,0))
scene.add(light2);

let sky_light = new THREE.HemisphereLight();
sky_light.intensity = 0.3;
scene.add(sky_light);
controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = true;
controls.autoRotate = false;
controls.minDistance = 0.02;
controls.maxDistance = 1.0;
controls.minAzimuthAngle = Math.PI / 6.0;

document.body.appendChild(renderer.domElement);
console.log("GLTF Viewer");

function animate()
{
    requestAnimationFrame(animate);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setPixelRatio(camera.aspect);
    
    let dt = clock.getDelta();
    controls.update(dt);

    if(obj){

        obj.rotation.y += dt * 0.2;
    }

    renderer.render(scene, camera);

}

animate();