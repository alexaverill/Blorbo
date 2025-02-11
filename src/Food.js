import * as THREE from "three";

export class Food {
  health = 100;
  healthDecrement = 0;
  lastUpdate = 0;
  updateIntervalSeconds = 5;
  scene;
  foodMesh;
  remove;
  constructor(scene, position, removeCallback, foodModel) {
    this.remove = removeCallback;
    this.scene = scene;
    this.foodMesh = foodModel.clone();
    this.foodMesh.position.x = position.x;
    this.foodMesh.position.z = position.z;
    this.foodMesh.scale.setScalar(20);
    this.scene.add(this.foodMesh);
  }
  map(x, in_min, in_max, out_min, out_max) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }
  getAte() {
    this.remove(this.foodMesh.position);
    this.scene.remove(this.foodMesh);
    document.dispatchEvent(new CustomEvent("foodEaten"));
  }
  update(time) {
    if (time - this.lastUpdate > this.updateIntervalSeconds) {
      this.health -= this.healthDecrement;
      if (this.health <= 0) {
        this.remove(this.foodMesh.position);
        this.scene.remove(this.foodMesh);
      } else {
        let newScale = this.map(this.health, 0, 100, 0, 1);
        //this.foodMesh.scale.setScalar(newScale);
      }
      this.lastUpdate = time;
    }
  }
}
