import * as THREE from "three";
import BaseEntity from "./../BaseEntity";

export default class Pluto extends BaseEntity {
  constructor(scene, camera, renderer, data) {
    super(scene, camera, renderer, data, 0xa3a3a3, 17.16 * (Math.PI / 180));

    this.name = "pluto";
    this.symbol = "⯓";
    this.texture = window.location.pathname + "assets/pluto_main.jpg";
  }

  get zaxis() {
    return 0.12;
  }

  init() {

    //initializing the earth geometry
    const PlutoGeometry = new THREE.SphereGeometry(10 / 585.996802154, 32, 32);
    this.size = 10 / 585.996802154;
    const material = new THREE.MeshPhongMaterial({
      shininess: 0,
    });
    this.plutoSphere = new THREE.Mesh(PlutoGeometry, material);
    this.plutoSphere.rotateX(this.tilt * (Math.PI / 180));
    this.plutoSphere.rotateY(Math.PI * 1.7);
    this.plutoSphere.position.set(
      Math.sin(this.theeta) * this.radius,
      this.y_distance,
      this.radius * Math.cos(this.theeta)
    );

    this.scenes.push(this.plutoSphere);
    this.createTrail();
  }
}
