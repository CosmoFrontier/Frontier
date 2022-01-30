import * as THREE from "three";
import BaseEntity from "./../BaseEntity";

export default class Mars extends BaseEntity {
  constructor(scene, camera, renderer, data) {
    super(scene, camera, renderer, data, 0xb87f5f, 1.8 * (Math.PI / 180));
    this.name = "mars";
    this.symbol = "♂";
  }

  get zaxis() {
    return 0.5;
  }

  init() {
    const MarsGeometry = new THREE.SphereGeometry(10 / 205.26, 32, 32);
    this.size = 10 / 205.26;
    const material = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load("assets/mars_main.jpg"),
    });
    this.marsSphere = new THREE.Mesh(MarsGeometry, material);
    this.marsSphere.rotateX(this.tilt * (Math.PI / 180));
    this.marsSphere.position.set(
      Math.sin(this.theeta) * this.radius,
      this.y_distance,
      this.radius * Math.cos(this.theeta)
    );

    this.scenes.push(this.marsSphere);

    this.drawTrail();
  }
}
