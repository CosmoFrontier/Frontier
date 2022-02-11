import * as THREE from "three";
import BaseEntity from "./../BaseEntity";

export default class Uranus extends BaseEntity {
  constructor(scene, camera, renderer, data) {
    super(scene, camera, renderer, data, 0x4fd0e7, (0.8 * Math.PI) / 180);
    this.name = "uranus";
    this.symbol = "⛢";
    this.texture = window.location.pathname + "assets/uranus_main.jpg";
  }
  get zaxis() {
    return 1.5;
  }
  init() {

    //initializing the uranus geometry
    const UranusGeometry = new THREE.SphereGeometry(10 / 27.45, 32, 32);
    this.size = 10 / 27.45;
    const material = new THREE.MeshPhongMaterial({
      shininess: 0,
    });
    this.uranusSphere = new THREE.Mesh(UranusGeometry, material);
    this.uranusSphere.rotateX(this.tilt * (Math.PI / 180));

    this.uranusSphere.position.set(
      Math.sin(this.theta) * this.radius,
      this.y_distance,
      this.radius * Math.cos(this.theta)
    );

    this.scenes.push(this.uranusSphere);
    this.createTrail();
  }
}
