import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Earth from "./entities/Earth";
import SUN from "./entities/Sun";
import months from "./months";
import Mars from "./entities/Mars";
import Stats from "three/examples/jsm/libs/stats.module.js";

export default class PlanetCanvas {
  constructor() {
    this.AUTOMOVE = true;
    this.cam_rotation = 0.001;
    this.entities = [];
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );

    this.scene.add(this.camera);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      canvas: document.querySelector("#canvas"),
    });

    document.body.appendChild(this.renderer.domElement);
    this.camera_distance = this.camera.position.z;
    this.calibrateRenderer();
    global.stats = new Stats();
    global.stats.showPanel(0);

    document.body.appendChild(stats.domElement);
  }
  setFocus(x, y, z) {
    this.focusAt = new THREE.Vector3(x, y, z);
    this.camera.lookAt(this.focusAt);
    this.camera.position.set(x, y, z - 1.2);
    this.controls.target.set(x, y, z);
    this.controls.update();
    console.log(x, y, z);
  }
  loadEntities() {
    const sun = new SUN(this.scene, this.camera, this.renderer);
    sun.init();
    this.entities.push(sun);
    const earth = new Earth(
      this.scene,
      this.camera,
      this.renderer,
      this.data.find((x) => x.name === "Earth")
    );

    earth.init();

    this.entities.push(earth);

    const mars = new Mars(
      this.scene,
      this.camera,
      this.renderer,
      this.data.find((x) => x.name === "Mars")
    );

    mars.init();
    this.setFocus(
      mars.marsSphere.position.x,
      mars.marsSphere.position.y,
      mars.marsSphere.position.z
    );
    this.entities.push(mars);
  }
  async fetchData() {
    try {
      const res = await fetch("https://ssd-abh80.vercel.app/all");
      const data = await res.json();
      this.data = data;
    } catch {
      console.log("Error while fetching data!");
    }
    this.init();
  }
  init() {
    var background = new THREE.TextureLoader().load("assets/star_map.png");

    var materialBackground = new THREE.MeshBasicMaterial({
      map: background,
      side: THREE.BackSide,
    });
    var geometryBackground = new THREE.SphereGeometry(2000, 32, 32);
    var meshBackground = new THREE.Mesh(geometryBackground, materialBackground);
    //this.scene.add(meshBackground);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.controls.minDistance = 1;
    this.controls.addEventListener("change", () => (this.AUTOMOVE = false));
    this.loadEntities();
    this.renderer.render(this.scene, this.camera);

    this.render();
  }

  calibrateRenderer() {
    this.renderer.autoClear = false;
    this.renderer.clearDepth();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(1);
    this.camera.updateProjectionMatrix();
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    if (this.AUTOMOVE) {
      this.cam_rotation += 0.001;
      this.camera.position.x =
        this.camera_distance * Math.sin(this.cam_rotation);
      this.camera.position.z =
        this.camera_distance * Math.cos(this.cam_rotation) + 500;
      this.camera.lookAt(this.focusAt);
    }

    this.entities.forEach((entity) => entity.render());
    stats.update();

    let date = new Date();
    document.querySelector(".date-time .date").textContent =
      months[date.getMonth()] +
      " " +
      date.getDate() +
      ", " +
      date.getFullYear();
    document.querySelector(".date-time .time").textContent =
      date.toLocaleTimeString();
  }
}
