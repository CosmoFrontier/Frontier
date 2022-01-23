import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Earth from "./entities/Earth";
import SUN from "./entities/Sun";
import months from "./months";
import Mars from "./entities/Mars";
import Jupiter from "./entities/Jupiter";
import Venus from "./entities/Venus";
import Saturn from "./entities/Saturn";
import Mercury from "./entities/Mercury";
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
      15000
    );

    this.scene.add(this.camera);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      canvas: document.querySelector("#canvas"),
    });

    document.body.appendChild(this.renderer.domElement);
    this.calibrateRenderer();
    global.stats = new Stats();
    global.stats.showPanel(0);

    document.body.appendChild(stats.domElement);
  }
  setFocus(x, y, z) {
    this.focusAt = new THREE.Vector3(x, y, z);
    this.camera.lookAt(this.focusAt);
    this.camera.position.set(x, y, z-2.5);
    this.controls.target.set(x, y, z);
    this.controls.update();
  }
  focusPlanet(planet) {
    this.setFocus(
      planet[planet.name.toLowerCase() + "Sphere"].position.x,
      planet[planet.name.toLowerCase() + "Sphere"].position.y,
      planet[planet.name.toLowerCase() + "Sphere"].position.z
    );
    planet.removeTrail();
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
    // this.focusPlanet(earth);

    this.entities.push(earth);
   

    const mars = new Mars(
      this.scene,
      this.camera,
      this.renderer,
      this.data.find((x) => x.name === "Mars")
    );

    mars.init();
    
    // this.focusPlanet(mars); // to focus on earth this.focusPlanet(earth);
    this.entities.push(mars);


    const jupiter = new Jupiter(
      this.scene,
      this.camera,
      this.renderer,
      this.data.find((x) => x.name === "Jupiter")
    );
    jupiter.init();
    // this.focusPlanet(jupiter);
    this.entities.push(jupiter);

    const venus = new Venus(
      this.scene,
      this.camera,
      this.renderer,
      this.data.find((x) => x.name === "Venus")

    );

    venus.init();
    // this.focusPlanet(venus);
    this.entities.push(venus);

    const saturn = new Saturn(
      this.scene, this.camera, this.renderer, this.data.find((x) => x.name === "Saturn")

    );
    saturn.init();
    // this.focusPlanet(saturn);
    this.entities.push(saturn);

    const mercury = new Mercury(
      this.scene, this.camera, this.renderer, this.data.find((x)=> x.name === "Mercury")

    );
    mercury.init();
    this.focusPlanet(mercury);
    this.entities.push(mercury);
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
    var background = new THREE.TextureLoader();
    background.crossOrigin = true;

    var materialBackground = new THREE.MeshBasicMaterial({
      depthTest: false,
      side: THREE.BackSide,
    });

    var geometryBackground = new THREE.SphereGeometry(10000, 32, 32);
    var meshBackground = new THREE.Mesh(geometryBackground, materialBackground);

    background.load("/assets/star_map.png", (t) => {
      materialBackground.map = t;
      this.scene.add(meshBackground);
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.controls.minDistance = 1;
    this.controls.enableZoom = true;
    this.controls.autoRotate = true;
    this.controls.addEventListener("start", () => {
      this.controls.autoRotate = false;
      this.AUTOMOVE = false;
    });
    this.loadEntities();
    this.renderer.render(this.scene, this.camera);

    this.render();
  }

  calibrateRenderer() {
    this.renderer.autoClear = false;
    this.renderer.clearDepth();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.updateProjectionMatrix();
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    this.entities.forEach((entity) => entity.render());
    if (this.AUTOMOVE) {
      this.controls.update();
    }
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
