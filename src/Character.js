import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
export class Character {
  lastUpdate = 0;
  updateIntervalSeconds = 0.5;
  characterMesh;
  hunger = 100;
  hungerDecrease = 20;
  thirst = 100;
  thirstDecrease = 10;
  speed = 1;
  yPos = 0;
  scene;
  constructor(scene) {
    this.scene = scene;
    const gltfLoader = new GLTFLoader();
    const model = gltfLoader.load(
      "/BLORB.glb",
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
  startPosition;
  update(time, food) {
    //console.log(time);
    if (time - this.lastUpdate > this.updateIntervalSeconds) {
      this.decreaseHunger();
      if (food.length > 0) {
        if (this.foodPosition === null) {
          for (let entry of food) {
            let position = entry.foodMesh.position;
            let distance = this.characterMesh.position.distanceTo(position);
            if (this.foodPosition == null) {
              this.foodPosition = { position, distance, food };
            } else if (distance < foodPosition.distance) {
              this.foodPosition = { position, distance, food };
            }
          }
        }
        if (this.foodPosition.distance <= 1.1) {
          this.eatFood(this.foodPosition.food[0]);
          this.foodPosition = null;
          return;
        }
        this.characterMesh.lookAt(
          new THREE.Vector3(
            this.foodPosition.position.x,
            this.yPos,
            this.foodPosition.position.z
          )
        );
        let newVec = new THREE.Vector3().copy(this.foodPosition.position);
        // let direction = newVec
        //   .sub(this.characterMesh.position)
        //   .normalize()
        //   .multiplyScalar(this.speed);
        this.newX = this.foodPosition.position.x;
        this.newZ = this.foodPosition.position.z;
      }

      this.lastUpdate = time;
    }
    if (this.characterMesh) {
      this.characterMesh.position.lerp(
        new THREE.Vector3(this.newX, this.yPos, this.newZ),
        0.01
      );
    }
  }
}
