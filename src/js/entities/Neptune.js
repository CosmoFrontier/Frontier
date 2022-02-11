import * as THREE from "three";
import BaseEntity from "./../BaseEntity";

export default class Neptune extends BaseEntity {
  constructor(scene, camera, renderer, data) {
    super(scene, camera, renderer, data, 0x73acac, 1.8 * (Math.PI / 180));
    this.texture = window.location.pathname + "assets/neptune_main.jpg";
    this.name = "neptune";
    this.symbol = "♆";
  }
  get zaxis() {
    return 1.5;
  }
  init() {

    //initializing the neptune geometry
    const NeptuneGeometry = new THREE.SphereGeometry(10 / 28.8, 32, 32);
    this.size = 10 / 28.8;
    const material = new THREE.MeshPhongMaterial({});

    this.neptuneSphere = new THREE.Mesh(NeptuneGeometry, material);
    this.neptuneSphere.rotateX(this.tilt * (Math.PI / 180));
    this.neptuneSphere.position.set(
      Math.sin(this.theta) * this.radius,
      this.y_distance,
      this.radius * Math.cos(this.theta)
    );

    this.scenes.push(this.neptuneSphere);
    this.createTrail();
  }
}
