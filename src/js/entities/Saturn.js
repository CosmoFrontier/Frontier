import * as THREE from "three";
import { PointsMaterial } from "three";
import { Scene } from "three";

export default class Saturn {
  constructor(scene, camera, renderer, data) {
    this.name = "Saturn";
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.data = data;
    this.radius = 500 * this.data.data[0].radius;
    this.theta = this.data.data[0].angular_distance;
    this.inclination = 2.5 * (Math.PI / 180);
    this.y_distance =
      this.radius * Math.sin(this.data.data[0].inclination * (Math.PI / 180));
    this.scenes = [];
    this.color = 0xfae5bf;
  }
  get zaxis() {
    return 4.5;
  }
  init() {
    const SaturnGeometry = new THREE.SphereGeometry(10 / 11.95, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load("assets/saturn_main.jpg"),
      shininess: 0,
    });
    this.saturnSphere = new THREE.Mesh(SaturnGeometry, material);
    this.saturnSphere.position.set(
      Math.sin(this.theta) * this.radius,
      this.y_distance,
      this.radius * Math.cos(this.theta)
    );
    this.saturnSphere.castShadow = true;
    this.saturnSphere.receiveShadow = true;
    const texture = new THREE.TextureLoader().load("assets/saturnRings.png");

    const ring_material = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
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
    this.mesh.rotateX(-0.5 * Math.PI);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.scenes.push(this.saturnSphere, this.mesh);
    this.drawTrail();
  }

  drawTrail() {
    const ellipse = new THREE.EllipseCurve(
      0,
      0,
      this.radius,
      this.radius,
      -(1.5 * Math.PI + this.theta),
      -Math.PI * 1.5,
      false,
      0
    );

    const points = ellipse.getPoints(50);
    for (let i = 0; i < points.length; i++) {
      points[i] = new THREE.Vector3(points[i].x, 0, points[i].y);
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const colors = [];
    const initialColor = 0xfae5bf;
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      var color = new THREE.Color(initialColor);
      color.r = color.r - (color.r / geometry.attributes.position.count) * i;
      color.g = color.g - (color.g / geometry.attributes.position.count) * i;
      color.b = color.b - (color.b / geometry.attributes.position.count) * i;
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
    line.rotateX(-this.inclination);
    line.name = "saturnTrail";
    this.trail = line;
    this.scene.add(line);
  }

  removeTrail() {
    var trail = this.scene.getObjectByName(this.trail.name);
    this.scene.remove(trail);
  }
  mount() {
    this.scenes.forEach((scene) => this.scene.add(scene));
  }
  unmount() {
    this.scenes.forEach((scene) => this.scene.remove(scene));
  }
  seconds = () =>
    new Date().getUTCHours() * 3600 +
    new Date().getUTCMinutes() * 60 +
    new Date().getUTCSeconds();

  render() {}
}
