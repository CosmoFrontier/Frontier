import * as THREE from "three";
export default class Earth {
  constructor(scene, camera, renderer, data) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.data = data;
    this.radius = 500 * this.data.data[0].radius;
    this.theeta = this.data.data[0].angular_distance;
    this.inclination = 0;
    this.tilt = this.data.tilt;
    this.name = "earth";
    this.scenes = [];
    this.color = 0x3f5d98;
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

    const moonGeometry = new THREE.SphereGeometry(20 / 3.74, 32,32);
    const moon_material = new THREE.MeshPhongMaterial({
      color:0xF7EAC6,
      map: new THREE.TextureLoader().load("assets/moon_texture.jpg"),

    });

    this.moonSphere = new THREE.Mesh(moonGeometry, moon_material);
    this.moonSphere.position.set(
      Math.sin(this.theeta) * this.radius,
      0, this.radius * Math.cos(this.theeta)
    );

    const cloudGeometry = new THREE.SphereGeometry(10 / 54 + 0.001, 32, 32);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load("assets/cloud_map_earth.png"),
      transparent: true,
    });
    const cloudSphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
    this.earthSphere.add(cloudSphere);
    this.earthSphere.rotateX(this.tilt * (Math.PI / 180));
    this.scenes.push(this.earthSphere, this.moonSphere);
    this.drawTrail();
  }
  removeTrail() {
    var trail = this.scene.getObjectByName(this.trail.name);
    this.scene.remove(trail);
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

    const initialColor = 0x3f5d98;
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

  render() {
    this.earthSphere.rotation.y =
      -80 * (Math.PI / 180) + this.seconds() * ((2 * Math.PI) / (24 * 3600));
  }
}
