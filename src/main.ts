import * as THREE from "three";
import { EquirectangularReflectionMapping, LoadingManager } from "three";
import { RGBELoader } from "three/examples/jsm/Addons";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { animateObject3D, animateObjectProperty } from "./gui2one_lazy_easing.ts";
import { isTouchDevice } from "./utils.ts";
import "../public/style.css";

export interface GltfViewerOptions {
  target_element: HTMLElement;
  transparent: boolean;
  camera_distance: number;
  slow_rotation_speed: number;
  fast_rotation_speed: number;
  gltf_url: string;
  hdr_env_url: string;
  show_env: boolean;
}

const create_lights = (): THREE.Object3D[] => {
  let lights = [];
  let light1 = new THREE.DirectionalLight("lightyellow");
  light1.position.setX(2);
  light1.position.setY(2);
  light1.position.setZ(2);
  light1.lookAt(new THREE.Vector3(0, 0, 0));
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
  lights.push(light1);

  let light2 = new THREE.DirectionalLight("lightblue");
  light2.position.setX(-1);
  light2.position.setY(-1);
  light2.position.setZ(-1);
  light2.intensity = 0.6;

  light2.lookAt(new THREE.Vector3(0, 0, 0));
  lights.push(light2);

  // let sky_light = new THREE.HemisphereLight();
  // sky_light.intensity = 3.0;
  // lights.push(sky_light);

  return lights;
};
function init_gltf_data(data: GLTF): THREE.Object3D {
  let obj = data.scene.children[0];
  let bounds = new THREE.Box3().setFromObject(obj);
  let size_x = bounds.max.x - bounds.min.x;
  let size_y = bounds.max.y - bounds.min.y;
  let size_z = bounds.max.z - bounds.min.z;
  let max_size = Math.max(size_x, Math.max(size_y, size_z));
  obj.receiveShadow = true;

  obj.scale.set(1.0 / max_size, 1.0 / max_size, 1.0 / max_size);

  obj.traverse((child: THREE.Object3D) => {
    child.receiveShadow = true;
    child.castShadow = true;
    if (child instanceof THREE.Mesh) {
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

function create_loading_bar(target_element: HTMLElement): HTMLDivElement {
  let bar = document.createElement("div");
  bar.id = "loading_bar";
  bar.style.position = "absolute";
  bar.style.pointerEvents = "none";
  bar.style.opacity = "0.2";
  bar.style.height = "3px";
  bar.style.left = "50%";
  bar.style.bottom = "30px";
  bar.style.transform = "translateX(-50%) scaleX(0)";
  bar.style.width = "200px";
  bar.style.backgroundColor = "white";
  bar.style.transformOrigin = "left center";
  bar.style.transition = "all 0.1s ease-in-out";
  target_element.appendChild(bar);

  return bar;
}
function loading_bar_update(bar: HTMLDivElement, progress: number) {
  bar.style.transform = `translateX(-50%) scaleX(${progress})`;
}
function reset_object_rotation(
  obj: THREE.Object3D,
  duration: number = 600.0,
  exp: number = 2.0,
  ease_type: string = "ease-in-out"
) {
  let cur_angle = obj.rotation.y % (2.0 * Math.PI);
  let end_angle = 0.0;

  if (cur_angle > Math.PI) end_angle = Math.PI * 2.0;

  animateObjectProperty(obj, "rotation.y", cur_angle, end_angle, duration, exp, ease_type);
}
export function GLTFViewer(options: GltfViewerOptions): void {
  let is_touch_device = isTouchDevice();
  if (is_touch_device) {
    console.log("On a touch Device");
  } else {
    console.log("Not on a touch Device");
  }

  let target_element = options.target_element;

  if (target_element === undefined) throw new Error("Target element not defined");
  if (options.gltf_url === undefined) throw new Error("GLTF url not defined");

  if (options.hdr_env_url === undefined) {
    options.hdr_env_url = "HDR_110_Tunnel_Env.hdr";
  }
  if (options.show_env === undefined) options.show_env = false;
  target_element.style.zIndex = "1";

  let loading_bar = create_loading_bar(target_element);

  const drop_zone = document.querySelector("#drop-zone") as HTMLDivElement;
  const btn_reset = document.createElement("div");
  btn_reset.id = "reset_camera";
  btn_reset.innerHTML = "Reset";
  target_element.appendChild(btn_reset);

  let loading_manager: LoadingManager;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let gltf_loader: GLTFLoader;
  let env_loader: RGBELoader;
  let controls: OrbitControls;
  let clock: THREE.Clock;
  let obj: THREE.Object3D;

  let rotation_min_speed = options.slow_rotation_speed ?? 0.1;
  let rotation_max_speed = options.fast_rotation_speed ?? 0.35;
  let rotation_speed = rotation_max_speed;
  let mouse_over = false;

  function dropHandler(e: DragEvent) {
    e.preventDefault();

    if (e.dataTransfer) {
      (e.target as HTMLDivElement).classList.remove("file-hover");
      (e.target as HTMLDivElement).style.visibility = "hidden";

      Array.from(e.dataTransfer.files).forEach((file, i) => {
        let reader = new FileReader();
        reader.onload = function (load_file_event) {
          let buffer = load_file_event.target?.result as ArrayBuffer;

          gltf_loader.parse(buffer, "/", (data) => {
            obj = init_gltf_data(data);
            scene.add(obj);

            controls.minDistance = 0.02;
            controls.maxDistance = 2.0;

            camera.position.setZ(2.0);
          });
        };
        reader.readAsArrayBuffer(file);
      });
    }
  }

  function dragOverHandler(ev: MouseEvent) {
    (ev.target as HTMLDivElement).classList.toggle("file-hover", true);
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }

  if (drop_zone) {
    drop_zone.addEventListener("drop", dropHandler);
    drop_zone.addEventListener("dragover", dragOverHandler);
  }

  clock = new THREE.Clock(true);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.classList.add("canvas");
  renderer.domElement.style.zIndex = "-1";
  renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.PCFShadowMap;

  camera = new THREE.PerspectiveCamera(45, 1.0, 0.01, 100.0);
  camera.position.set(0, 0, 5.0);

  scene = new THREE.Scene();

  loading_manager = new LoadingManager();
  loading_manager.onProgress = (url, loaded, total) => {
    loading_bar_update(loading_bar, loaded / total);
  };
  loading_manager.onLoad = () => {
    obj.position.set(0, -1, 0);
    animateObject3D(obj, obj.position.clone(), new THREE.Vector3(0, 0, 0), 600.0, 2.0, "ease-out", () => {});

    setTimeout(() => {
      loading_bar.style.transform = "translateX(calc(-50% + 30px))";
      loading_bar.style.opacity = "0";
    }, 500);
  };

  gltf_loader = new GLTFLoader(loading_manager);
  gltf_loader.load(options.gltf_url, (data) => {
    obj = init_gltf_data(data);
    scene.add(obj);
  });
  env_loader = new RGBELoader(loading_manager);
  env_loader.load(options.hdr_env_url, (texture) => {
    texture.mapping = EquirectangularReflectionMapping;
    // scene.background = texture;
    if (options.show_env) scene.background = texture;
    scene.environment = texture;
  });

  let lights = create_lights();
  for (let light of lights) {
    scene.add(light);
  }

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = true;
  controls.autoRotate = false;
  controls.minDistance = 0.6;
  controls.maxDistance = 3.0;

  camera.position.setZ(options.camera_distance);
  let cam_pos = camera.position.clone();
  controls.minAzimuthAngle = Math.PI / 6.0;

  if (!target_element) {
    document.body.appendChild(renderer.domElement);
  } else {
    target_element.appendChild(renderer.domElement);
  }
  console.log("@gui2one --- GLTF Viewer");

  target_element.addEventListener("mouseover", (e) => {
    mouse_over = true;
  });

  target_element.addEventListener("mouseout", (e) => {
    mouse_over = false;
  });

  const ResetControls = () => {
    let duration = 500.0;
    let exp = 2.5;
    let ease_type = "ease-in-out";
    animateObject3D(camera, camera.position.clone(), cam_pos, duration, exp, ease_type);
    animateObjectProperty(controls, "target.x", controls.target.x, 0, duration, exp, ease_type);
    animateObjectProperty(controls, "target.y", controls.target.y, 0, duration, exp, ease_type);
    animateObjectProperty(controls, "target.z", controls.target.z, 0, duration, exp, ease_type);
    setTimeout(() => {
      reset_object_rotation(obj, duration, exp);
    }, duration - 100);
  };
  window.addEventListener("keypress", (e) => {
    if (e.key == "r") {
      ResetControls();
    }
  });
  if (btn_reset) {
    btn_reset.addEventListener("click", (e) => {
      ResetControls();
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    let dt = clock.getDelta();
    controls.update(dt);

    let rect = target_element.getBoundingClientRect();
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height);
    // renderer.setPixelRatio(camera.aspect);

    if (mouse_over) {
      if (rotation_speed > rotation_min_speed) {
        rotation_speed -= 0.01;
      }
    } else {
      if (rotation_speed < rotation_max_speed) {
        rotation_speed += 0.02;
      }
    }
    if (obj) {
      obj.rotation.y += dt * rotation_speed;
    }

    renderer.render(scene, camera);
  }

  animate();
}
