import * as THREE from "three";
import BaseEntity from "../BaseEntity";
import { retextureLoader } from "../Util";
export default class Earth extends BaseEntity {
  constructor(scene, camera, renderer, data) {
    super(scene, camera, renderer, data, 0x3f5d98, 0);
    this.name = "earth";
    this.symbol = "🜨";
    this.texture = window.location.pathname + "assets/earth_main.jpg";
    this.cloud_texture =
      window.location.pathname + "assets/cloud_map_earth.png";
  }
  get zaxis() {
    return 1;
  }
  init() {

    //initializing the earth geometry
    const EarthGeometry = new THREE.SphereGeometry(10 / 54, 32, 32);
    this.size = 10 / 54;
    const material = new THREE.MeshPhongMaterial({
      color: 0x48659f,
    });
    this.earthSphere = new THREE.Mesh(EarthGeometry, material);
    this.earthSphere.position.set(
      Math.sin(this.theeta) * this.radius,
      0,
      this.radius * Math.cos(this.theeta)
    );

    //initializing the clouds texture around earth

    const cloudGeometry = new THREE.SphereGeometry(10 / 54 + 0.001, 32, 32);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      transparent: true,
    });
    const cloudSphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
    this.cloudSphere = cloudSphere;
    this.earthSphere.add(cloudSphere);
    this.earthSphere.rotateX(this.tilt * (Math.PI / 180));
    this.scenes.push(this.earthSphere);

    this.createTrail();
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
  async mount() {
    try {
      if (!this.fetchedMoons) this.loadMoons();

      this.scenes.forEach((scene) => scene && this.scene.add(scene));
      if (!this[this.name.toLowerCase() + "Sphere"].material.texture) {
        let texture = await retextureLoader(this.texture);
        this[this.name.toLowerCase() + "Sphere"].material.map = texture;
        this[this.name.toLowerCase() + "Sphere"].material.needsUpdate = true;
        let tex = await retextureLoader(this.cloud_texture);
        this.cloudSphere.material.map = tex;
        this.cloudSphere.material.needsUpdate = true;
      }
    } catch (e) {}

    this.removeTrail();
  }
}
