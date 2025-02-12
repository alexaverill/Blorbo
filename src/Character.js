import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { map } from "./map";
import gsap from "gsap";
export class Character {
  lastUpdate = 0;
  lastHungerUpdate = 0;
  updateHungerIntervalSeconds = 2;
  updateIntervalSeconds = 0.5;
  characterMesh;
  hunger = 100;
  hungerDecrease = 5;
  thirst = 100;
  thirstDecrease = 10;
  speed = 1;
  yPos = 0;
  scene;
  constructor(scene) {
    this.scene = scene;
    const gltfLoader = new GLTFLoader();
    const model = gltfLoader.load(
      "BLORB.glb",
      (gltf) => {
        this.characterMesh = gltf.scene;
        this.characterMesh.castsShadow = true;
        this.characterMesh.position.y = this.yPos;
        // mesh.scale.setScalar(0.025);
        scene.add(this.characterMesh);
        //scene.add(gltf.scene);
      },
      () => {},
      (e) => {
        console.log(e);
      }
    );
    this.reachedFood.bind(this);
  }
  eatFood(food) {
    this.hunger = Math.min(this.hunger + food.health, 100);
    food.getAte();
    this.sendHungerEvent();
  }

  sendHungerEvent() {
    let event = new CustomEvent("hungerChanged", { detail: this.hunger });
    document.dispatchEvent(event);
  }
  decreaseHunger() {
    this.hunger -= this.hungerDecrease;
    if (this.hunger <= 0) {
      document.dispatchEvent(new CustomEvent("death"));
    }
    this.sendHungerEvent();
  }
  newX = 0;
  newZ = 0;
  foodPosition = null;
  startPosition = new THREE.Vector3(0, this.yPos, 0);
  newPosition = new THREE.Vector3(0, this.yPos, 0);
  shouldMove = false;
  delta = 0;
  speed = 0;
  reachedFood() {
    this.eatFood(this.foodPosition.food);
    this.foodPosition = null;
    this.startPosition = this.characterMesh.position;
    this.characterMesh.position.copy(this.startPosition);
    this.delta = 0;
    console.log(this.delta);
    return;
  }
  update(time, food) {
    //console.log(time);
    if (time - this.lastHungerUpdate > this.updateHungerIntervalSeconds) {
      this.decreaseHunger();
      this.lastHungerUpdate = time;
    }
    if (time - this.lastUpdate > this.updateIntervalSeconds) {
      if (food.length > 0) {
        if (this.foodPosition === null) {
          for (let entry of food) {
            let position = entry.foodMesh.position;
            let distance = this.characterMesh.position.distanceTo(position);
            if (this.foodPosition == null) {
              this.foodPosition = { position, distance, food: entry };
              this.characterMesh.lookAt(this.foodPosition.position);
              gsap.to(this.characterMesh.position, {
                duration: 3,
                x: this.foodPosition.position.x,
                z: this.foodPosition.position.z,
                onComplete: () => this.reachedFood(),
              });
            } else if (distance < this.foodPosition.distance) {
              this.foodPosition = { position, distance, food: entry };
              console.log(this.foodPosition);
              this.characterMesh.lookAt(this.foodPosition.position);
              gsap.to(this.characterMesh.position, {
                duration: 3,
                x: this.foodPosition.position.x,
                z: this.foodPosition.position.z,
                onComplete: () => this.reachedFood(),
              });
            }
          }
        }
      }

      this.lastUpdate = time;
    }
  }
}
