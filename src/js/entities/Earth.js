import * as THREE from "three";
export default class Earth {
  constructor(scene, camera, renderer, data) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.data = data;
    this.radius = 500 * this.data.data[0].radius;
    this.theeta = this.data.data[0].angular_distance;
    this.name = "earth";
  }

  init() {
    const EarthGeometry = new THREE.SphereGeometry(10 / 54, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0x48659f,
      map: new THREE.TextureLoader().load("assets/earth_main.jpg"),
    });
    this.earthSpehere = new THREE.Mesh(EarthGeometry, material);
    this.earthSpehere.position.set(0, 0, this.radius);
    this.scene.add(this.earthSpehere);

    const cloudGeometry = new THREE.SphereGeometry(10 / 54 + 0.001, 32, 32);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load("assets/cloud_map_earth.png"),
      transparent: true,
    });
    const cloudSphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
    this.earthSpehere.add(cloudSphere);
    this.earthSpehere.rotation.x = 23.43643 * (Math.PI / 180);
    this.drawTrail();
  }
  drawTrail() {
    const ellipse = new THREE.EllipseCurve(
      0,
      0,
      this.radius,
      this.radius,
      this.theeta,
      0,
      false,
      0
    );
    const points = ellipse.getPoints(50);
    for (let i = 0; i < points.length; i++) {
      points[i] = new THREE.Vector3(
        points[i].x,
        points[i].x * Math.sin(this.data.data[0].inclination * (Math.PI / 180)),
        points[i].y
      );
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // make a gradient line
    const colors = [];
    let alpha = 0.5;
    const initialColor = 0x3f5d98;
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      var color = new THREE.Color();
      
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
    this.trail = line;
    this.scene.add(line);
  }
  seconds = () =>
    new Date().getUTCHours() * 3600 +
    new Date().getUTCMinutes() * 60 +
    new Date().getUTCSeconds();

  render() {
    this.earthSpehere.rotation.y =
      -80 * (Math.PI / 180) + this.seconds() * ((2 * Math.PI) / (24 * 3600));
  }
}
