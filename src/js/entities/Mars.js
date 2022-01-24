import * as THREE from "three";

export default class Mars {
  constructor(scene, camera, renderer, data) {
    this.name = "mars";
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.data = data;
    this.radius = 500 * this.data.data[0].radius;
    this.theeta = this.data.data[0].angular_distance;
    this.inclination = 1.8 * (Math.PI / 180); // get inclination froom https://nssdc.gsfc.nasa.gov/planetary/factsheet/ (orbital inclination)
    this.y_distance =
      this.radius * Math.sin(this.data.data[0].inclination * (Math.PI / 180));
    this.scenes = [];
    this.color = 0xb87f5f;
  }

  get zaxis() {
    return 0.5;
  }

  init() {
    const MarsGeometry = new THREE.SphereGeometry(10 / 102.525711, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load("assets/mars_main.jpg"),
    });
    this.marsSphere = new THREE.Mesh(MarsGeometry, material);
    this.marsSphere.rotation.y = -90 * (Math.PI / 180);
    this.marsSphere.position.set(
      Math.sin(this.theeta) * this.radius,
      this.y_distance,
      this.radius * Math.cos(this.theeta)
    );

    this.scenes.push(this.marsSphere);
    this.drawTrail();
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
    // make a gradient line
    const colors = [];

    const initialColor = 0xb87f5f;
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
    line.name = "marsTrail";
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
