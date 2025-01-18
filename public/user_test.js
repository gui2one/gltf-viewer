import { GLTFViewer } from "./gltf-viewer.mjs";
const target_element = document.querySelector("#gltf-container");

let options = {
    target_element: target_element,
    transparent: true,
    camera_distance: 1.5,
    gltf_url: "export_1.glb",
    // hdr_env_url: "brown_photostudio_02_1k.hdr",
    show_env: false
};
GLTFViewer(options);