import * as THREE from "three";
import BaseEntity from "../BaseEntity";
export default class Mercury extends BaseEntity {
  constructor(scene, camera, renderer, data) {
    super(scene, camera, renderer, data, 0xd5d2d1, 7 * (Math.PI / 180));
    this.name = "mercury";
    this.symbol = "☿";
    this.texture = window.location.pathname + "assets/mercury_main.jpeg";
  }
  get zaxis() {
    return 0.2;
  }
  init() {

    //initializing the mercury geometry
    const MercuryGeometry = new THREE.SphereGeometry(10 / 285, 32, 32);
    this.size = 10 / 285;
    const material = new THREE.MeshPhongMaterial({});
    this.mercurySphere = new THREE.Mesh(MercuryGeometry, material);
    this.mercurySphere.rotateX(this.tilt * (Math.PI / 180));
    this.mercurySphere.position.set(
      Math.sin(this.theta) * this.radius,
      this.y_distance,
      this.radius * Math.cos(this.theta)
    );

    this.scenes.push(this.mercurySphere);
    this.createTrail();
  }
}
