import * as THREE from "three";
export default class Earth {
  constructor(scene, camera, renderer, perihelion) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.perihelion = perihelion;
  }

  init() {
    const EarthGeometry = new THREE.SphereGeometry(20 / 54, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0x48659f,
      map: new THREE.TextureLoader().load("assets/earth_main.jpg"),
    });
    this.earthSpehere = new THREE.Mesh(EarthGeometry, material);
    this.earthSpehere.rotation.y = -90 * (Math.PI / 180);
    this.earthSpehere.position.set(0, 0, this.perihelion);
    this.scene.add(this.earthSpehere);
    

    const cloudGeometry = new THREE.SphereGeometry(20 / 54 + 0.001, 32, 32);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load("assets/cloud_map_earth.png"),
      transparent: true,
    });
    const cloudSphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
    this.earthSpehere.add(cloudSphere);
    this.earthSpehere.rotation.x = -23.43643 * (Math.PI / 180);
    this.earthSpehere.rotation.y = -90 * (Math.PI / 180);
  }
  seconds = () =>
    new Date().getUTCHours() * 3600 +
    new Date().getUTCMinutes() * 60 +
    new Date().getUTCSeconds();

  render() {
    this.earthSpehere.rotation.y =
      80 * (Math.PI / 180) - this.seconds() * ((2 * Math.PI) / (24 * 3600));
  }
}
