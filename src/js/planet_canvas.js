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
import { refetch, reloadBgImage, retextureLoader } from "./Util";
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
    this.bodies = [];

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

    //history function of user activity on website
    window.onhashchange = () => {
      const hash = window.location.hash.slice(1);

      if (hash === "") return;
      if (hash.includes("-")) {
        const parent = hash.split("-")[0];
        const child = hash.split("-")[1];
        if (this.planet && this.planet.t) {
          if (
            this.planet.t.name.toLowerCase() +
              "-" +
              this.planet.name.toLowerCase() ===
            hash
          )
            return;
        }
        const t = this.entities.find(
          (x) => x.name.toLowerCase() === parent.toLowerCase()
        );
        if (!t) return;
        const c = t.moons.find(
          (x) => x.name.toLowerCase() === child.toLowerCase()
        );
        if (!c) return;
        c.t.mount();
        this.travelTo(c, true);
        return;
      }
      if (
        !this.entities.find((x) => x.name.toLowerCase() == hash.toLowerCase())
      )
        return;
      if (this.planet && this.planet.name.toLowerCase() == hash.toLowerCase())
        return;
      this.travelTo(
        this.entities.find((x) => x.name.toLowerCase() == hash.toLowerCase())
      );
    };
  }

  //camera focus for each planet according to coordinates
  setFocus(x, y, z, zaxis, angle) {
    this.focusAt = new THREE.Vector3(x, y, z);
    this.camera.lookAt(this.focusAt);
    if (angle)
      this.camera.position.set(
        x + zaxis * Math.sin(angle),
        y + zaxis * Math.sin(angle),
        z - zaxis * Math.cos(angle)
      );
    else this.camera.position.set(x, y, z - zaxis);
    this.controls.target.set(x, y, z);
    this.controls.update();
  }

  //function executing on-click of planet
  async focusPlanet(planet, mounted, isMoon, angle) {
    if (this.planet && this.planet.name != "sun" && !planet.moon) {
      this.planet.elem.style.display = "flex";

      this.planet.unmount();
    }
    let hash = planet.name;
    if (planet.moon) {
      hash = planet.t.name.toLowerCase() + "-" + planet.name.toLowerCase();
    }
    window.location.hash = hash;
    if (this.planet && this.planet.name != "sun" && this.planet.moon) {
      this.planet.elem.style.display = "none";
      this.planet.unmount();

      if (this.planet.t.name != planet.name && !planet.t) {
        this.planet.t.elem.style.display = "flex";

        this.planet.t.unmount();
      } else if (planet.t && planet.t.name != this.planet.t.name) {
        this.planet.t.elem.style.display = "flex";
        this.planet.t.unmount();
      }
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

      refetch("https://ssd-abh80.vercel.app/body/" + planet.name.toLowerCase()) //https://ssd-abh80.vercel.app/body/
        .then((x) => x.json())
        .then((data) => {
          if (isMoon) {
            content
              .querySelector(".content-wrap")
              .classList.remove("is-not-visible");
            content.querySelector(".loader").classList.remove("is-visible");
            content.querySelector(".planet_desc").textContent =
              data.description;
            content.querySelector(".planet_name").textContent =
              planet.name[0].toUpperCase() + planet.name.slice(1);

            reloadBgImage(data.cover, content.querySelector(".planet_image"));
            content.querySelector(".planet_type span").textContent =
              data.table.type;

            const table = document.querySelector(".other_data");
            table.innerHTML = "";
            table.innerHTML += `<div class="planet_data" data-label="rev_time">
            <div class="num">${data.table.year.value}<span class="unit">${
              data.table.year.suffix
            }</span></div>
            <div class="info">Length of year </div>            
          </div>
          
         
          <div class="planet_data">
          <div class="num">${new Intl.NumberFormat("en-US").format(
            planet.data.radius * 1.49 * Math.pow(10, 8).toFixed(2)
          )}<span class="unit">Kms</span></div>
          <div class="info">Distance from ${
            planet.t.name[0].toUpperCase() + planet.t.name.slice(1)
          }</div>
          </div>
          <div class="planet_data" data-label="namesake">
          <div class="num" style="font-size:16px;">${data.table.namesake}</div>
          <div class="info">Namesake</div>
          </div>
          `;
            if (planet.articifial) {
              content.querySelector('[data-label="namesake"]').remove();
              table.innerHTML += `<div class="planet_data">
          <div class="num" style="font-size:16px;">${data.table.target}</div>
          <div class="info">Mission Target</div>
          </div>`;
            }
          } else {
            const table = document.querySelector(".other_data");
            table.innerHTML = `<div class="planet_data" data-label="rev_time">
          <div class="num">88</div>
          <div class="info">Length of year</div>
        </div>
        <div class="planet_data" data-label="sun_distance">
          <div class="num">0.4</div>
          <div class="info">Distance from Sun</div>
        </div>
        <div class="planet_data" data-label="time_to_sun">
          <div class="num">8</div>
          <div class="info">One way light time to Sun</div>
        </div>

        <div class="planet_data" data-label="moons_count">
          <div class="num">0</div>
          <div class="info">Moons</div>
        </div>
        <div class="planet_data" data-label="name_sake">
          <div class="num" style="font-size:16px;"><Roman god of speed></div>
          <div class="info">Namesake</div>
        </div>`;
            content
              .querySelector(".content-wrap")
              .classList.remove("is-not-visible");
            content.querySelector(".loader").classList.remove("is-visible");

            content.querySelector(".planet_desc").textContent =
              data.description;
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
        planet.zaxis
      );
    } else
      this.setFocus(
        planet[planet.name.toLowerCase() + "Sphere"].position.x,
        planet[planet.name.toLowerCase() + "Sphere"].position.y,
        planet[planet.name.toLowerCase() + "Sphere"].position.z,
        planet.zaxis,
        angle
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
  }

  //executes on-click of a certain moon or planet or satellite showing "traveling to data"
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

  //loads the planet.js files upon call
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


    //search bar function
    var search = document.querySelector("input");
    const ul = document.querySelector(".search-holder ul");
    search.addEventListener("keyup", (e) => {
      if (!search.value) return;
      let results = this.bodies.filter((x) =>
        x.name.toLowerCase().startsWith(search.value.toLowerCase())
      );

      ul.innerHTML = "";
      results.forEach((x) => {
        const el = document.createElement("li");
        el.textContent = x.name[0].toUpperCase() + x.name.slice(1);
        el.addEventListener("click", async () => {
          if (this.planet && this.planet.name == x.name) return;
          let target = this.entities.find((y) => y.name == x.name);

          if (!target) {
            target = this.entities.find(
              (y) => y.name.toLowerCase() == x.parent.toLowerCase()
            );

            await target.loadMoons();

            target.mount();

            target = target.moons.find(
              (y) => y.name.toLowerCase() == x.name.toLowerCase()
            );
          }
          this.travelTo(target, target.moon);
          ul.innerHTML = "";
          results.forEach((x) => {
            const el = document.createElement("li");
            el.textContent = x.toUpperCase() + x.slice(1);
            el.addEventListener("click", () => {
              if (this.planet && this.planet.name == x) return;
              this.travelTo(x);
              ul.innerHTML = "";
              search.value = "";
            });
            ul.appendChild(el);
          });
        });
        ul.appendChild(el);
      });
    });




    //label for each space body which includes ring and name of planet
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

    this.focusPlanet(sun, null, null, (60 * Math.PI) / 180);

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

  //API data fetch URLs for information panel
  async fetchData() {
    try {
      const res = await refetch("https://ssd-abh80.vercel.app/all"); //https://ssd-abh80.vercel.app/all
      const data = await res.json();
      const res1 = await refetch("https://ssd-abh80.vercel.app/bodies/all");
      const data1 = await res1.json();
      this.bodies = data1;
      this.data = data;
    } catch {
      console.log("Error while fetching data!");
    }
    this.init();
  }

  //background star body texture
  async init() {
    var background = await retextureLoader(
      window.location.pathname + "assets/star_map.png"
    );

    var materialBackground = new THREE.MeshBasicMaterial({
      depthTest: false,
      opacity: 1,
      side: THREE.BackSide,
    });

    var geometryBackground = new THREE.SphereGeometry(60000, 32, 32);
    var meshBackground = new THREE.Mesh(geometryBackground, materialBackground);

    materialBackground.map = background;
    this.scene.add(meshBackground);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.07);
    this.scene.add(ambientLight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.controls.minDistance = 0.0001;
    this.controls.autoRotateSpeed = 0.5;
    this.controls.enableZoom = true;
    this.controls.autoRotate = true;
    this.AUTOMOVE = true;


    //function to start movement after 8s again when clicked anywhere on the webpage

    const wait = (delay = 0) =>
      new Promise((resolve) => setTimeout(resolve, delay));

    this.controls.addEventListener("start", () => {
      this.controls.autoRotate = false;
      this.AUTOMOVE = false;
      wait(8000).then(() => {
        this.controls.autoRotate = true;
        this.AUTOMOVE = true;
      });

      setTimeout(stop, 4000);
      stop();
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
          if (this.planet && this.planet.name == x.name) return;
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


    //displaying data and time on the webpage

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
