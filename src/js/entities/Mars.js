import * as THREE from "three";
import { BufferAttribute } from "three";

export default class Mars {
  constructor(scene, camera, renderer, aphelion) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.aphelion = aphelion;
  }

  init() {
    const MarsGeometry = new THREE.SphereGeometry(10 / 102.525711, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0x9c2e35,
      map: new THREE.TextureLoader().load("assets/mars_main.jpg"),
    });
    this.marsSphere = new THREE.Mesh(MarsGeometry, material);
    this.marsSphere.rotation.y = -90 * (Math.PI / 180);
    let inclination = 1.848;
    this.marsSphere.position.set(
      0,
      this.aphelion * Math.sin((inclination * Math.PI) / 180),
      this.aphelion
    );
    this.scene.add(this.marsSphere);

    const ellipse = new THREE.EllipseCurve(
      0,
      0,
      this.aphelion,
      this.aphelion,
      0,
      2 * Math.PI,
      false,
      0
    );
    const points = ellipse.getPoints(50);
    for (let i = 0; i < points.length; i++) {
      points[i] = new THREE.Vector3(
        points[i].x,
        points[i].x * Math.sin((inclination * Math.PI) / 180),
        points[i].y
      );
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // make a gradient line
    const colors = [];
    let alpha = 0.5;
    const initialColor = 0xb87f5f;
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      var color = new THREE.Color(initialColor);
      color.setHSL(0, 0.5, alpha - i / geometry.attributes.position.count);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(colors), 3)
    );
    const Linematerial = new THREE.LineBasicMaterial({
      vertexColors: THREE.VertexColors,
      transparent: true,
    });
    const line = new THREE.Line(geometry, Linematerial);
    this.scene.add(line);
  }
  seconds = () =>
    new Date().getUTCHours() * 3600 +
    new Date().getUTCMinutes() * 60 +
    new Date().getUTCSeconds();

  render() {
    this.marsSphere.rotation.y =
      80 * (Math.PI / 180) + this.seconds() * ((2 * Math.PI) / (24 * 3600));
  }
}
