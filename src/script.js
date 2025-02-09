import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import { Character } from "./Character";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { Food } from "./Food";
/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.castShadow = true;
// directionalLight.shadow.mapSize.set(1024, 1024);
// directionalLight.shadow.camera.far = 15;
// directionalLight.shadow.camera.left = -7;
// directionalLight.shadow.camera.top = 7;
// directionalLight.shadow.camera.right = 7;
// directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(-3, 34, 39);
scene.add(directionalLight);
// let lightHelper = new THREE.DirectionalLightHelper(directionalLight);
// scene.add(lightHelper);

let lightPosition = gui.addFolder("LightPosition");
lightPosition.add(directionalLight.position, "x").min(-100).max(100).step(1);
lightPosition.add(directionalLight.position, "y").min(-100).max(100).step(1);
lightPosition.add(directionalLight.position, "z").min(-100).max(100).step(1);
let lightRotation = gui.addFolder("LightRotation");
lightRotation
  .add(directionalLight.rotation, "x")
  .min(0)
  .max(Math.PI * 2)
  .step(0.01);
lightRotation
  .add(directionalLight.rotation, "y")
  .min(0)
  .max(Math.PI * 2)
  .step(0.01);
lightRotation
  .add(directionalLight.rotation, "z")
  .min(0)
  .max(Math.PI * 2)
  .step(0.01);

const raycaster = new THREE.Raycaster();
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
let foodModel;
let gltfLoader = new GLTFLoader();
gltfLoader.load(
  "/mushroom.glb",
  (gltf) => {
    foodModel = gltf.scene;
  },
  () => {},
  (e) => {
    console.log(e);
  }
);
let treeModel;
let secondTree;
let thirdTree;
gltfLoader.load(
  "/tree_oak_dark.glb",
  (gltf) => {
    treeModel = gltf.scene;
    treeModel.scale.setScalar(25);
    treeModel.position.set(24, 1.5, -25);
    gui.add(treeModel.position, "x");
    gui.add(treeModel.position, "z");
    scene.add(treeModel);
    secondTree = gltf.scene.clone();
    secondTree.scale.setScalar(30);
    secondTree.position.set(-23, 1.5, -24);
    secondTree.rotateY(Math.PI / 4);
    gui.add(secondTree.position, "x");
    gui.add(secondTree.position, "z");
    scene.add(secondTree);
    thirdTree = gltf.scene.clone();
    thirdTree.scale.setScalar(20);
    thirdTree.position.set(-24, 1.5, 6);
    thirdTree.rotateY(Math.PI / 2);
    gui.add(thirdTree.position, "x");
    gui.add(thirdTree.position, "z");
    scene.add(thirdTree);
  },
  () => {},
  (e) => {
    console.log(e);
  }
);

let pine;
gltfLoader.load(
  "tree_pineGroundB.glb",
  (gltf) => {
    pine = gltf.scene.clone();
    pine.scale.setScalar(25);
    pine.position.set(-22, 1.5, 22);
    gui.add(pine.position, "x");
    gui.add(pine.position, "z");
    scene.add(pine);
  },
  () => {},
  (e) => {
    console.log(e);
  }
);
function updateAllMaterials() {
  scene.traverse((child) => {
    if (child.isMesh) {
      child.receiveShadow = true;
      child.castShadow = true;
      // Activate shadow here
    }
  });
}
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

let food = [];
let pointer = new THREE.Vector2(0, 0);

const removeFood = (event) => {
  let removeIndex = food.findIndex(
    (entry) => entry.foodMesh.position === event
  );
  food.splice(removeIndex, 1);
};
const addFood = (event) => {
  let xPos = (event.clientX / window.innerWidth) * 2 - 1;
  let yPos = -(event.clientY / window.innerHeight) * 2 + 1;
  pointer.x = xPos;
  pointer.y = yPos;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, false);
  if (intersects.length > 0 && foodModel) {
    let point = intersects[0].point;
    let newFood = new Food(scene, point, removeFood, foodModel);
    food.push(newFood);
  }
};
window.addEventListener("pointerdown", addFood);
/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  25,
  sizes.width / sizes.height,
  0.1,
  1000
);
let camPos = 130;
camera.position.set(camPos, camPos, camPos);
gui.add(camera.position, "x");
gui.add(camera.position, "y");
gui.add(camera.position, "z");
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const rendererParameters = {};
rendererParameters.clearColor = "#1d1f2a";

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setClearColor(rendererParameters.clearColor);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

gui.addColor(rendererParameters, "clearColor").onChange(() => {
  renderer.setClearColor(rendererParameters.clearColor);
});
let groundSize = 60;
let groundPlane = new THREE.PlaneGeometry(groundSize, groundSize, 10);

let groundMesh = new THREE.Mesh(
  groundPlane,
  new THREE.MeshStandardMaterial({ color: "#1e7e34" })
);
groundMesh.receiveShadow = true;
groundMesh.rotateX(-Math.PI / 2);
scene.add(groundMesh);

let underGround = new THREE.Mesh(
  new THREE.BoxGeometry(groundSize, groundSize, 60),
  new THREE.MeshStandardMaterial({ color: "#390e0e" })
);
underGround.position.y = -groundSize / 2 - 0.1;
scene.add(underGround);
// scene.fog = new THREE.FogExp2("#04343f", 1);
//add character
let character = new Character(scene);
/**
 * Animate
 */
const clock = new THREE.Clock();
updateAllMaterials();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();
  for (let entry of food) {
    entry.update(elapsedTime);
  }
  character.update(elapsedTime, food);
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
