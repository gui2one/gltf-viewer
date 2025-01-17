import { GLTFViewer } from "./gltf-viewer.mjs";
const target_element = document.querySelector("#gltf-container");

let options = {
    target_element: target_element,
    transparent: true,
    camera_distance: 1.0,
    gltf_url: "export_1.glb",
};
GLTFViewer(options);