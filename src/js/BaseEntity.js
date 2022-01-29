import * as THREE from "three";
import moonData from "./moonData";
export default class BaseEntity {
  constructor(scene, camera, renderer, data, color, inclination) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.data = data;
    this.name = data.name;
    this.radius = 500 * this.data.data[0].radius;
    this.theeta = this.data.data[0].angular_distance;
    this.inclination = inclination;
    this.y_distance =
      this.radius * Math.sin(this.data.data[0].inclination * (Math.PI / 180));
    this.color = color;
    this.tilt = this.data.tilt;
    this.scenes = [];
    this.moons = [];
  }
  setScene(scene) {
    this.scenes = [...scene, ...this.scenes];
  }

  async loadMoons() {
    const data = await moonData(this.name);

    data.forEach((moon) => {
      if (!moon.texture) return;
      if (moon.texture.drawSelf) {
        const data = moon.datas[0];
        const x =
          Math.sin(this.theeta) * this.radius +
          data.radius * 500 * Math.sin(data.angular_distance);
        const y =
          this.y_distance +
          data.radius *
            500 *
            Math.sin((data.inclination + this.inclination) * (Math.PI / 180));
        const z =
          this.radius * Math.cos(this.theeta) +
          data.radius * 500 * Math.cos(data.angular_distance);

        this.createMoon(moon.name, "assets/" + moon.texture.map, moon.radius, {
          x,
          y,
          z,
        });

        this.drawMoonTrail(
          Math.sin(this.theeta) * this.radius,
          this.radius * Math.cos(this.theeta),
          data.radius,
          data.angular_distance,
          data.inclination * (Math.PI / 180)
        );
      }
    });
  }
  createMoon(name, map, radius, pos = { x: 0, y: 0, z: 0 }) {
    const moonGeometry = new THREE.SphereGeometry(10 / radius, 32, 32);
    const moonMaterial = new THREE.MeshPhongMaterial({
      shininess: 0,
      map: new THREE.TextureLoader().load(map),
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(pos.x, pos.y, pos.z);
    moon.elem = document.createElement("div");
    moon.elem.className = "label";
    const text = document.createElement("div");
    text.textContent = name[0].toUpperCase() + name.slice(1);
    text.className = "label-text";
    const ring = document.createElement("div");
    ring.className = "label-ring";
    ring.style.borderColor = "#" + this.color.toString(16);

    moon.elem.appendChild(ring);
    moon.elem.appendChild(text);

    moon.name = name;
    document.body.appendChild(moon.elem);
    this.moons.push(moon);
  }
  drawTrail() {
    const ellipse = new THREE.EllipseCurve(
      0,
      0,
      this.radius,
      this.radius,
      -(1.5 * Math.PI + this.theeta),
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

    const initialColor = this.color;
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
    line.name = "earthTrail";
    line.rotateX(-this.inclination);
    this.trail = line;
    this.scene.add(line);
  }
  drawMoonTrail(x, z, radius, theeta, incl) {
    const ellipse = new THREE.EllipseCurve(
      0,
      0,
      radius * 500,
      radius * 500,
      -(1.5 * Math.PI + theeta),
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
    const initialColor = this.color;
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
    line.rotateX(-incl);
    line.position.set(x, this.y_distance, z);
    this.scenes.push(line);
  }
  removeTrail() {
    var trail = this.scene.getObjectByName("earthTrail");
    this.scene.remove(trail);
  }
  render() {}

  mount() {
    this.scenes.forEach((scene) => scene && this.scene.add(scene));
  }
  unmount() {
    this.scenes.forEach((scene) => scene && this.scene.remove(scene));
  }
}
