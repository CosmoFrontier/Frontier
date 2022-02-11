import * as THREE from "three";
import BaseEntity from "./../BaseEntity";

export default class Jupiter extends BaseEntity {
  constructor(scene, camera, renderer, data) {
    super(scene, camera, renderer, data, 0xbcafb2, 1.304 * (Math.PI / 180));
    this.name = "jupiter";
    this.texture = window.location.pathname + "assets/jupiter_main.jpg";
    this.symbol = "♃";
  }
  get zaxis() {
    return 5;
  }
  init() {

    //initializing the jupiter geometry
    const JupiterGeometry = new THREE.SphereGeometry(10 / 9.6, 32, 32);
    this.size = 10 / 9.6;
    const material = new THREE.MeshPhongMaterial({});
    this.jupiterSphere = new THREE.Mesh(JupiterGeometry, material);
    this.jupiterSphere.rotateX(this.tilt * (Math.PI / 180));

    this.jupiterSphere.position.set(
      Math.sin(this.theta) * this.radius,
      this.y_distance,
      this.radius * Math.cos(this.theta)
    );

    this.scenes.push(this.jupiterSphere);

    this.createTrail();
  }

  render() {}
}
