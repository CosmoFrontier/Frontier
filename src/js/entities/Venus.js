import * as THREE from "three";
import BaseEntity from "../BaseEntity";
export default class Venus extends BaseEntity {
  constructor(scene, camera, renderer, data) {
    super(scene, camera, renderer, data, 0x8B7D82, (3.4 * Math.PI) / 180);
    this.name = "venus";
    this.symbol = "♀";
  }
  get zaxis() {
    return 0.7;
  }
  init() {
    const VenusGeometry = new THREE.SphereGeometry(10 / 115.06, 32, 32);
    this.size = 10 / 115.06;
    const material = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load("assets/venus_main.jpg"),
      shininess: 0,
    });
    this.venusSphere = new THREE.Mesh(VenusGeometry, material);
    this.venusSphere.rotateX(this.tilt * (Math.PI / 180));
    this.venusSphere.position.set(
      Math.sin(this.theta) * this.radius,
      this.y_distance,
      this.radius * Math.cos(this.theta)
    );

    this.scenes.push(this.venusSphere);
    this.createTrail();
  }
}
