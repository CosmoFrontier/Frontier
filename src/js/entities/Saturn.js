import * as THREE from "three";
import { retextureLoader } from "../Util";
import BaseEntity from "./../BaseEntity";

export default class Saturn extends BaseEntity {
  constructor(scene, camera, renderer, data) {
    super(scene, camera, renderer, data, 0xfae5bf, (2.5 * Math.PI) / 180);
    this.name = "Saturn";
    this.symbol = "♄";
    this.texture = window.location.pathname + "assets/saturn_main.jpg";
  }
  get zaxis() {
    return 4.5;
  }
  async init() {

    //initializing the saturn geometry
    const SaturnGeometry = new THREE.SphereGeometry(10 / 11.95, 32, 32);
    this.size = 10 / 11.95;
    const material = new THREE.MeshPhongMaterial({
      shininess: 0,
    });
    this.saturnSphere = new THREE.Mesh(SaturnGeometry, material);
    this.saturnSphere.rotateX(this.tilt * (Math.PI / 180));
    this.saturnSphere.position.set(
      Math.sin(this.theta) * this.radius,
      this.y_distance,
      this.radius * Math.cos(this.theta)
    );
    this.saturnSphere.castShadow = true;
    this.saturnSphere.receiveShadow = true;

    //initializing code for ring geometry of saturn
    const ringMap = await retextureLoader("assets/saturnRings.png");
    const ring_material = new THREE.MeshPhongMaterial({
      map: ringMap,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const geometry = new THREE.RingBufferGeometry(1.3, 2, 64);
    var pos = geometry.attributes.position;
    var v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      geometry.attributes.uv.setXY(i, v3.length() < 1.8 ? 0 : 1, 1);
    }

    this.mesh = new THREE.Mesh(geometry, ring_material);
    this.mesh.position.set(
      Math.sin(this.theta) * this.radius,
      this.y_distance,
      this.radius * Math.cos(this.theta)
    );
    this.mesh.rotateX(-0.5 * Math.PI + this.tilt * (Math.PI / 180));
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.scenes.push(this.saturnSphere, this.mesh);
    this.createTrail();
  }
}
