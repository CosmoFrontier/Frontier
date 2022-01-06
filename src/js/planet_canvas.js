import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Earth from "./entities/Earth";
import SUN from "./entities/Sun";
import months from "./months";
import Stats from "three/examples/jsm/libs/stats.module.js";

export default class PlanetCanvas {
  constructor() {
    this.AUTOMOVE = true;
    this.cam_rotation = 0.001;
    this.entities = [];
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight
    );
    this.camera.position.z = 2;
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: document.querySelector("#canvas"),
    });
    document.body.appendChild(this.renderer.domElement);
    this.camera_distance = this.camera.position.z;
    this.calibrateRenderer();
    global.stats = new Stats();
    global.stats.showPanel(0);

    document.body.appendChild(stats.domElement);
  }
  loadEntities() {
    const sun = new SUN(this.scene, this.camera, this.renderer);
    sun.init();
    this.entities.push(sun);
    const earth = new Earth(this.scene, this.camera, this.renderer);
    earth.init();
    this.entities.push(earth);
  }

  init() {
    var background = new THREE.TextureLoader().load("assets/star_map.png");
    background.wrapS = background.wrapT = THREE.RepeatWrapping;
    background.repeat.set(1, 1);

    var materialBackground = new THREE.MeshBasicMaterial({
      map: background,
      side: THREE.BackSide,
    });
    var geometryBackground = new THREE.SphereGeometry(80, 1200, 1200);
    var meshBackground = new THREE.Mesh(geometryBackground, materialBackground);
    this.scene.add(meshBackground);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxDistance = 100;
    this.controls.minDistance = 1;
    this.controls.addEventListener("change", () => (this.AUTOMOVE = false));
    this.loadEntities();
    this.controls.update();

    this.renderer.render(this.scene, this.camera);

    this.render();
  }

  calibrateRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.innerWidth / window.innerHeight);
    this.camera.updateProjectionMatrix();
  }

  render() {
    if (this.AUTOMOVE) {
      this.cam_rotation += 0.001;
      this.camera.position.x =
        this.camera_distance * Math.sin(this.cam_rotation);
      this.camera.position.z =
        this.camera_distance * Math.cos(this.cam_rotation);
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    //this.renderer.render(this.scene, this.camera);
    this.entities.forEach((entity) => entity.render());

    stats.update();

    requestAnimationFrame(this.render.bind(this));

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
