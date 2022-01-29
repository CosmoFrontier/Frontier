import * as THREE from "three";
import BaseEntity from "../BaseEntity";
export default class Earth extends BaseEntity {
  constructor(scene, camera, renderer, data) {
    super(scene, camera, renderer, data, 0x3f5d98, 0);
    this.name = "earth";
    this.symbol = "🜨";
  }
  get zaxis() {
    return 1;
  }
  init() {
    const EarthGeometry = new THREE.SphereGeometry(10 / 54, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0x48659f,
      map: new THREE.TextureLoader().load("assets/earth_main.jpg"),
    });
    this.earthSphere = new THREE.Mesh(EarthGeometry, material);
    this.earthSphere.position.set(
      Math.sin(this.theeta) * this.radius,
      0,
      this.radius * Math.cos(this.theeta)
    );

    const cloudGeometry = new THREE.SphereGeometry(10 / 54 + 0.001, 32, 32);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load("assets/cloud_map_earth.png"),
      transparent: true,
    });
    const cloudSphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
    this.earthSphere.add(cloudSphere);
    this.earthSphere.rotateX(this.tilt * (Math.PI / 180));
    this.scenes.push(this.earthSphere);

    this.drawTrail();
  }

  seconds = () =>
    new Date().getUTCHours() * 3600 +
    new Date().getUTCMinutes() * 60 +
    new Date().getUTCSeconds();

  render() {
    super.render();
    this.earthSphere.rotation.y =
      -80 * (Math.PI / 180) + this.seconds() * ((2 * Math.PI) / (24 * 3600));
  }
}
