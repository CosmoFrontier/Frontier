import * as THREE from "three";
import BaseEntity from "./../BaseEntity";

export default class Mars extends BaseEntity {
  constructor(scene, camera, renderer, data) {
    super(scene, camera, renderer, data, 0xb87f5f, 0);
    this.name = "mars";
    this.symbol = "♂";
    this.texture = window.location.pathname + "assets/mars_main.jpg";
  }

  get zaxis() {
    return 0.5;
  }

  init() 
  {
    //initializing the mars geometry
    const MarsGeometry = new THREE.SphereGeometry(10 / 205.26, 32, 32);
    this.size = 10 / 205.26;
    const material = new THREE.MeshPhongMaterial({});
    this.marsSphere = new THREE.Mesh(MarsGeometry, material);
    this.marsSphere.rotateX(this.tilt * (Math.PI / 180));
    this.marsSphere.position.set(
      Math.sin(this.theeta) * this.radius,
      this.y_distance,
      this.radius * Math.cos(this.theeta)
    );

    this.scenes.push(this.marsSphere);

    this.createTrail();
  }

  seconds = () =>
    new Date().getUTCHours() * 3600 +
    new Date().getUTCMinutes() * 60 +
    new Date().getUTCSeconds();

  render() {
    super.render();
  }
}
