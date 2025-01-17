import * as THREE from 'three';
import {EquirectangularReflectionMapping } from 'three';
import { RGBELoader } from "three/examples/jsm/Addons"
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const drop_zone = document.querySelector("#drop-zone") as HTMLDivElement;

let scene : THREE.Scene;
let camera : THREE.PerspectiveCamera;
let renderer : THREE.WebGLRenderer;
let loader : GLTFLoader;
let controls : OrbitControls;
let clock : THREE.Clock;
let obj : THREE.Object3D;



let rotation_min_speed = 0.15;
let rotation_max_speed = 0.35;
let rotation_speed = rotation_max_speed;
let speed_mult = 1.0;
let mouse_over = false;
function init_gltf_data(data : GLTF) : THREE.Object3D {

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
        if(child instanceof THREE.Mesh){

            if (child.material.normalMap) {
                /*
                    no need for this if I compute tangents directly in Houdini 
                */
                // child.geometry.computeVertexNormals();
                // child.geometry.computeTangents();
                // child.geometry.needsUpdate = true;

                (child.material.normalMap as THREE.Texture).wrapS = THREE.RepeatWrapping;
                (child.material.normalMap as THREE.Texture).wrapT = THREE.RepeatWrapping;
                (child.material.normalMap as THREE.Texture).repeat.set(50.0, 50.0);
                // (child.material.normalMap as THREE.Texture).flipY = true;
                
                let normal_mult = 0.05;
                child.material.normalScale.set(normal_mult, normal_mult);
                
                let normalMap = child.material.normalMap as THREE.Texture;
                normalMap.colorSpace = THREE.SRGBColorSpace; // Ensure correct encoding
                normalMap.generateMipmaps = true;
                normalMap.minFilter = THREE.LinearMipMapLinearFilter;
                normalMap.needsUpdate = true;

                // child.material.normalMap.height = 0.01;
            }
            child.material.needsUpdate = true;
        }
    });
    return obj;
}

function dropHandler(e: DragEvent) {
    e.preventDefault();

    if (e.dataTransfer) {
        (e.target as HTMLDivElement).classList.remove("file-hover");
        (e.target as HTMLDivElement).style.visibility = ("hidden");

        Array.from(e.dataTransfer.files).forEach((file, i) => {

            let reader = new FileReader();
            reader.onload = function (load_file_event) {
                let buffer = load_file_event.target?.result as ArrayBuffer;
                // console.log(buffer);
                loader.parse(buffer, "/", (data)=>{
                    // obj = data.scene.children[0];
                    // let bounds = new THREE.Box3().setFromObject(obj);
                    // let size_x = bounds.max.x - bounds.min.x;
                    // let size_y = bounds.max.y - bounds.min.y;
                    // let size_z = bounds.max.z - bounds.min.z;
                    // let max_size = Math.max(size_x, Math.max(size_y, size_z));
                    // obj.receiveShadow = true;
                    


                    // obj.scale.set(1.0/max_size, 1.0/max_size, 1.0/max_size);
                    // // console.log(bounds);
                    // // console.log(max_size);

                    // obj.traverse( (child : THREE.Object3D)=>{
                    //     child.receiveShadow = true;
                    //     child.castShadow = true;
                    //     if(child instanceof THREE.Mesh){
                    //         // BufferGeometryUtils.computeMikkTSpaceTangents(child.geometry, mikktspace, false);
                    //         console.log("computing Tangents for " + child.name);
                    //         if (child.material.normalMap) {
                    //             child.geometry.computeVertexNormals();
                    //             child.geometry.computeTangents();
                    //             child.geometry.needsUpdate = true;

                    //             (child.material.normalMap as THREE.Texture).wrapS = THREE.RepeatWrapping;
                    //             (child.material.normalMap as THREE.Texture).wrapT = THREE.RepeatWrapping;
                    //             (child.material.normalMap as THREE.Texture).repeat.set(2.0, 2.0);
                    //             // (child.material.normalMap as THREE.Texture).flipY = true;
                    //             child.material.normalScale.set(0.1, 0.1);
                    //             child.material.normalMap.colorSpace = THREE.NoColorSpace; // Ensure correct encoding
                    //             child.material.normalMap.needsUpdate = true;

                    //             // child.material.normalMap.height = 0.01;
                    //         }
                    //         child.material.needsUpdate = true;
                    //     }
                    // });

                    obj = init_gltf_data(data);


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

function dragOverHandler(ev : MouseEvent) {
    // console.log("File(s) in drop zone");
    (ev.target as HTMLDivElement).classList.toggle("file-hover", true);
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
}

if( drop_zone){

    drop_zone.addEventListener("drop", dropHandler);
    drop_zone.addEventListener("dragover", dragOverHandler);
}

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

new RGBELoader().load("HDR_110_Tunnel_Env.hdr", (texture)=>{
    texture.mapping = EquirectangularReflectionMapping;
    // this.scene.background = texture;
    scene.environment = texture;
})
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
light1.shadow.camera.far = 5.0;
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
sky_light.intensity = 0.8;
scene.add(sky_light);
controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = true;
controls.autoRotate = false;
controls.minDistance = 0.02;
controls.maxDistance = 3.0;

camera.position.setZ(1.5);
controls.minAzimuthAngle = Math.PI / 6.0;

document.body.appendChild(renderer.domElement);
console.log("GLTF Viewer");

renderer.domElement.addEventListener("mouseenter", (e)=>{
    mouse_over = true;
});

renderer.domElement.addEventListener("mouseout", (e)=>{
    mouse_over = false
});
loader.load("export_1.glb", (data)=>{
    console.log(data);
    // obj = data.scene.children[0];
    obj = init_gltf_data(data);
    console.log(obj);

    scene.add(obj);
    
});
function animate()
{
    requestAnimationFrame(animate);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setPixelRatio(camera.aspect);
    
    let dt = clock.getDelta();
    controls.update(dt);
    if( mouse_over){
        


        if(rotation_speed > rotation_min_speed){

            rotation_speed -= 0.01;
            // console.log(rotation_speed);
        }
    }else{
        if(rotation_speed < rotation_max_speed){

            rotation_speed += 0.02;
            // console.log(speed_mult);
        }
    }
    // console.log(rotation_speed);
    if(obj){

        obj.rotation.y += dt * rotation_speed;
    }

    renderer.render(scene, camera);

}

animate();