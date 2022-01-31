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
import Uranus from "./entities/Uranus";
import Neptune from "./entities/Neptune";
import Pluto from "./entities/Pluto";
import Stats from "three/examples/jsm/libs/stats.module.js";
import moment from "moment";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class PlanetCanvas {
  constructor() {
    this.AUTOMOVE = true;
    this.cam_rotation = 0.001;
    this.entities = [];
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.00001,
      1000000
    );

    this.canvas = document.querySelector("#canvas");
    this.scene.add(this.camera);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      canvas: this.canvas,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.planet = null;
    document.body.appendChild(this.renderer.domElement);
    this.calibrateRenderer();
    global.stats = new Stats();
    global.stats.showPanel(0);

    //document.body.appendChild(stats.domElement);
  }
  setFocus(x, y, z, zaxis) {
    this.focusAt = new THREE.Vector3(x, y, z);
    this.camera.lookAt(this.focusAt);
    this.camera.position.set(x, y, z - zaxis);
    this.controls.target.set(x, y, z);
    this.controls.update();
  }
  async focusPlanet(planet, mounted, isMoon) {
    if (this.planet && this.planet.name != "sun" && !planet.moon) {
      this.planet.elem.style.display = "flex";
      this.planet.drawTrail();
      this.planet.unmount();
    }

    if (planet.name != "sun") {
      document
        .querySelector(":root")
        .style.setProperty("--content-color", "#" + planet.color.toString(16));
      const content = document.querySelector(".content");
      document.querySelector(".bring-content-back").style.display = "none";
      if (content.classList.contains("is-not-visible")) {
        content.classList.remove("is-not-visible");
      }

      content.querySelector(".content-wrap").classList.add("is-not-visible");
      content.querySelector(".loader").classList.add("is-visible");

      fetch("https://ssd-abh80.vercel.app/body/" + planet.name.toLowerCase())
        .then((x) => x.json())
        .then((data) => {
          if(isMoon){
            content.querySelector(".content-wrap").classList.remove("is-not-visible");
            content.querySelector(".loader").classList.remove("is-visible");
  
            // const moon_name = document.querySelector(".planet_name");
            // moon_name.textContent = `${planet.name[0].toUpperCase()+planet.name.slice(1)}`;
            // const moon_desc = document.querySelector(".planet_desc");
            // moon_desc.textContent = `${data.description}`;   
            // const moon_image = document.querySelector(".planet_image");
            // moon_image.style.backgroundImage = `url(${data.cover})`;

            content.querySelector(".planet_desc").textContent = data.description;
            content.querySelector(".planet_name").textContent =
              planet.name[0].toUpperCase() + planet.name.slice(1);
            content.querySelector(
              ".planet_image"
            ).style.backgroundImage = `url(${data.cover})`;

          
            const table = document.querySelector(".other_data");
            table.innerHTML = "";
            table.innerHTML+= `<div class="planet_data" data-label="rev_time">
            <div class="num">${data.table.year.value}</div>
            <div class="info">Length of year </div>            
          </div>`
 
          }
          else{

          content.querySelector(".content-wrap").classList.remove("is-not-visible");
          content.querySelector(".loader").classList.remove("is-visible");
           
          content.querySelector(".planet_desc").textContent = data.description;
          content.querySelector(".planet_name").textContent =
            planet.name[0].toUpperCase() + planet.name.slice(1);
          content.querySelector(
            ".planet_image"
          ).style.backgroundImage = `url(${data.cover})`;
          content.querySelector(".planet_type span").textContent =
            data.table.type;
          content
            .querySelector(`[data-label="rev_time"]`)
            .querySelector(".num").innerHTML =
            data.table.year.value +
            `<span class="unit"> ${data.table.year.suffix}</span>`;

          content
            .querySelector(`[data-label="sun_distance"]`)
            .querySelector(".num").innerHTML =
            Math.ceil(planet.radius / 500) + '<span class="unit"> AU</span>';

          var totalsec = (
            (planet.radius * 149597871 * 1000) /
            (3 * Math.pow(10, 8) * 500)
          ).toFixed(2);
          content
            .querySelector(`[data-label="time_to_sun"]`)
            .querySelector(".num").textContent = moment
            .utc(totalsec * 1000)
            .format("HH:mm:ss");
          content
            .querySelector(`[data-label="moons_count"]`)
            .querySelector(".num").textContent = data.table.moons;

          content
            .querySelector(`[data-label="name_sake"]`)
            .querySelector(".num").textContent = data.table.namesake;

          
          content.querySelector(".loader").classList.remove("is-visible");
          content
            .querySelector(".content-wrap")
            .classList.remove("is-not-visible");
          }
          // table.innerHTML = "";
          
          
        })
        .catch((err) => {});
    }
    if (isMoon) {
      this.setFocus(
        planet.position.x,
        planet.position.y,
        planet.position.z,
        0.3
      );
    } else
      this.setFocus(
        planet[planet.name.toLowerCase() + "Sphere"].position.x,
        planet[planet.name.toLowerCase() + "Sphere"].position.y,
        planet[planet.name.toLowerCase() + "Sphere"].position.z,
        planet.zaxis
      );
    this.planet = planet;
    if (this.planet.name != "sun") {
      this.planet.elem.style.display = "none";
    }
    if (!mounted && this.planet.name != "sun") {
      this.planet.mount();
    }

    this.AUTOMOVE = true;
    this.controls.autoRotate = true;
    if (this.planet.name != "sun") planet.removeTrail();
  }

  travelTo(x, isMoon) {
    const travel_stats = document.querySelector("#travel_stats");
    var camPos = this.camera.position;
    var initCampos = camPos.clone();
    let target = null;
    if (isMoon) target = x.position;
    else target = x[x.name.toLowerCase() + "Sphere"].position;
    x.mount();
    this.controls.enabled = false;
    travel_stats.innerHTML =
      `${x.symbol} Traveling to <span class="bold-text" style="color:${
        "#" + x.color.toString(16)
      };">` +
      x.name[0].toUpperCase() +
      x.name.slice(1) +
      "</span>";
    travel_stats.classList.add("is-visible");
    let animate = () => {
      const distance_in_percentage_from_init =
        initCampos.distanceTo(camPos) / initCampos.distanceTo(target);
      if (distance_in_percentage_from_init > 0.8) {
        this.focusPlanet(x, true, isMoon);
        this.controls.enabled = true;
        setTimeout(() => {
          travel_stats.classList.remove("is-visible");
        }, 1000);
        return;
      } else requestAnimationFrame(animate);
      camPos.x += (target.x - camPos.x) * 0.03;
      camPos.y += (target.y - camPos.y) * 0.03;
      camPos.z += (target.z - camPos.z) * 0.03;
      this.camera.position.set(camPos.x, camPos.y, camPos.z);
      this.camera.lookAt(target);
    };
    requestAnimationFrame(animate);
  }
  loadEntities() {
    const sun = new SUN(this.scene, this.camera, this.renderer);
    sun.init();
    this.sun = sun;

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
    // this.focusPlanet(mars); 
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
      this.scene,
      this.camera,
      this.renderer,
      this.data.find((x) => x.name === "Saturn")
    );
    saturn.init();
    // this.focusPlanet(saturn);
    this.entities.push(saturn);

    const mercury = new Mercury(
      this.scene,
      this.camera,
      this.renderer,
      this.data.find((x) => x.name === "Mercury")
    );
    mercury.init();
    // this.focusPlanet(mercury);
    this.entities.push(mercury);

    const uranus = new Uranus(
      this.scene,
      this.camera,
      this.renderer,
      this.data.find((x) => x.name === "Uranus")
    );
    uranus.init();
    // this.focusPlanet(uranus);
    this.entities.push(uranus);

    const neptune = new Neptune(
      this.scene,
      this.camera,
      this.renderer,
      this.data.find((x) => x.name === "Neptune")
    );
    neptune.init();

    this.entities.push(neptune);

    const pluto = new Pluto(
      this.scene,
      this.camera,
      this.renderer,
      this.data.find((x) => x.name === "Pluto")
    );
    pluto.init();
    this.entities.push(pluto);

    var search = document.querySelector("input");
    const ul = document.querySelector(".search-holder ul");
    search.addEventListener("keyup", (e) => {
      if (!search.value) return;
      let results = this.entities.filter((x) =>
        x.name.toLowerCase().startsWith(search.value.toLowerCase())
      );
      ul.innerHTML = "";
      results.forEach((x) => {
        const el = document.createElement("li");
        el.textContent = x.name[0].toUpperCase() + x.name.slice(1);
        el.addEventListener("click", () => {
          if (this.planet && this.planet.name == x.name) return;
          this.travelTo(x);
          ul.innerHTML = "";
          search.value = "";
        });
        ul.appendChild(el);
      });
    });

    this.entities.forEach((x) => {
      x.elem = document.createElement("div");
      x.elem.className = "label";
      const text = document.createElement("div");
      text.textContent = x.name[0].toUpperCase() + x.name.slice(1);
      text.className = "label-text";
      const ring = document.createElement("div");
      ring.className = "label-ring";
      ring.style.borderColor = "#" + x.color.toString(16);
      x.elem.appendChild(ring);
      x.elem.appendChild(text);
      document.body.appendChild(x.elem);
      x.onMoonClick = (e) => {
        this.travelTo(e, true);
      };
      x.elem.addEventListener("click", () => {
        this.travelTo(x);
      });
    });

    this.focusPlanet(sun);

    document.querySelector("#travel_stats").innerHTML =
      `${this.sun.symbol} Welcome to <span class="bold-text" style="color:${
        "#" + this.sun.color.toString(16)
      };">` +
      "Solar System" +
      "</span>";
    document.querySelector("#travel_stats").classList.add("is-visible");
    setTimeout(() => {
      document.querySelector("#travel_stats").classList.remove("is-visible");
    }, 5000);
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

    var geometryBackground = new THREE.SphereGeometry(60000, 32, 32);
    var meshBackground = new THREE.Mesh(geometryBackground, materialBackground);

    background.load("/assets/star_map.png", (t) => {
      materialBackground.map = t;
      this.scene.add(meshBackground);
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.07);
    this.scene.add(ambientLight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.controls.minDistance = 0.1;
    this.controls.autoRotateSpeed = -0.5;
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
    if (this.planet.name != "sun") this.planet.render();
    this.sun.render();

    if (this.planet) {
      if (this.planet.moons || (this.planet.t && this.planet.t.moons)) {
        const loopFor = this.planet.moons || this.planet.t.moons;
        loopFor.forEach((x) => {
          const tempV = new THREE.Vector3();
          x.updateMatrixWorld(true, false);
          x.getWorldPosition(tempV);
          tempV.project(this.camera);
          var targetPosition = new THREE.Vector3();
          targetPosition = targetPosition.setFromMatrixPosition(x.matrixWorld);
          this.camera.updateMatrixWorld();
          var frustum = new THREE.Frustum();
          frustum.setFromProjectionMatrix(
            new THREE.Matrix4().multiplyMatrices(
              this.camera.projectionMatrix,
              this.camera.matrixWorldInverse
            )
          );
          if (!frustum.containsPoint(x.position)) {
            x.elem.style.display = "none";
            return;
          } else {
            x.elem.style.display = "block";
          }
          const x1 = (tempV.x * 0.5 + 0.5) * this.canvas.clientWidth;
          const y = (tempV.y * -0.5 + 0.5) * this.canvas.clientHeight;

          x.elem.style.transform = `translate(-50%, -50%) translate(${x1}px, ${y}px)`;
        });
      }
    }
    this.entities.forEach((vx) => {
      if (this.planet.name == vx.name) return;
      const tempV = new THREE.Vector3();
      vx[vx.name.toLowerCase() + "Sphere"].updateWorldMatrix(true, false);
      vx[vx.name.toLowerCase() + "Sphere"].getWorldPosition(tempV);
      tempV.project(this.camera);
      var targetPosition = new THREE.Vector3();
      targetPosition = targetPosition.setFromMatrixPosition(
        vx[vx.name.toLowerCase() + "Sphere"].matrixWorld
      );

      this.camera.updateMatrixWorld();
      var frustum = new THREE.Frustum();

      frustum.setFromProjectionMatrix(
        new THREE.Matrix4().multiplyMatrices(
          this.camera.projectionMatrix,
          this.camera.matrixWorldInverse
        )
      );
      if (
        !frustum.containsPoint(vx[vx.name.toLowerCase() + "Sphere"].position)
      ) {
        vx.elem.style.display = "none";
        return;
      } else {
        vx.elem.style.display = "block";
      }
      const x = (tempV.x * 0.5 + 0.5) * this.canvas.clientWidth;
      const y = (tempV.y * -0.5 + 0.5) * this.canvas.clientHeight;
      vx.elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
    });
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
