import * as THREE from "three";
import moonData from "./moonData";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
export default class BaseEntity {
  constructor(scene, camera, renderer, data, color, inclination) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.data = data;
    this.name = data.name;
    this.radius = 500 * this.data.data[0].radius;
    this.theeta = this.data.data[0].angular_distance;
    this.theta = this.theeta;
    this.inclination = inclination;
    this.y_distance =
      this.radius * Math.sin(this.data.data[0].inclination * (Math.PI / 180));
    this.color = color;
    this.tilt = this.data.tilt;
    this.scenes = [];
    this.moons = [];
    this.fetchedMoons = false;
  }
  setScene(scene) {
    this.scenes = [...scene, ...this.scenes];
  }

  async loadMoons() {
    let data = null;
    try {
      data = await moonData(this.name);
      this.fetchedMoons = true;
    } catch (e) {
      this.fetchedMoons = true;
    }

    if (!data.length) return;
    data.forEach(async (moon) => {
      if (!moon.texture) return;
      const data = moon.datas[0];
      let p = this.drawMoonTrail(
        Math.sin(this.theeta) * this.radius,
        this.radius * Math.cos(this.theeta),
        (this.size / 2) * 25 + data.radius * 500,
        data.angular_distance,
        data.inclination * (Math.PI / 180),
        moon.name
      );
      const x = p.x + this.radius * Math.sin(this.theeta);

      const y =
        this.y_distance +
        ((this.size / 2) * 25 + data.radius * 500) *
          Math.sin(data.inclination * (Math.PI / 180));
      const z = p.z + this.radius * Math.cos(this.theeta);

      if (moon.texture.drawSelf) {
        this.setupMoon(
          this.createMoon(
            moon.name,
            "assets/" + moon.texture.map,
            moon.radius,
            {
              x,
              y,
              z,
            },
            data.inclination * (Math.PI / 180)
          )
        );
      } else {
        this.setupMoon(
          await this.loadGlb(
            moon.name,
            "assets/moons/" +
              moon.texture.map[0].toUpperCase() +
              moon.texture.map.slice(1),
            10 / moon.radius,
            { x, y, z },
            data.inclination * (Math.PI / 180)
          )
        );
      }

      this.scene.add(this.scenes.find((x) => x.name == moon.name + "Trail"));
    });
  }
  loadGlb(name, map, radius, pos = { x: 0, y: 0, z: 0 }, incl) {
    return new Promise((resolve, reject) => {
      if (!map) return;
      const Loader = new GLTFLoader();

      var sceneExtent = new THREE.BoxGeometry(radius, radius, radius);
      var cube = new THREE.Mesh(sceneExtent);
      var sceneBounds = new THREE.Box3().setFromObject(cube);
      let lengthSceneBounds = {
        x: Math.abs(sceneBounds.max.x - sceneBounds.min.x),
        y: Math.abs(sceneBounds.max.y - sceneBounds.min.y),
        z: Math.abs(sceneBounds.max.z - sceneBounds.min.z),
      };

      // Calculate side lengths of glb-model bounding box

      // Calculate length ratios

      Loader.load(
        map,
        (glb) => {
          const obj = glb.scene;
          var meshBounds = new THREE.Box3().setFromObject(obj);
          let lengthMeshBounds = {
            x: Math.abs(meshBounds.max.x - meshBounds.min.x),
            y: Math.abs(meshBounds.max.y - meshBounds.min.y),
            z: Math.abs(meshBounds.max.z - meshBounds.min.z),
          };
          let lengthRatios = [
            lengthSceneBounds.x / lengthMeshBounds.x,
            lengthSceneBounds.y / lengthMeshBounds.y,
            lengthSceneBounds.z / lengthMeshBounds.z,
          ];
          let minRatio = Math.min(...lengthRatios);
          obj.scale.set(minRatio, minRatio, minRatio);
          obj.position.set(pos.x, pos.y, pos.z);

          obj.name = name;

          resolve(obj);
        },
        function (xhr) {},
        function (err) {
          reject(err);
        }
      );
    });
  }
  setupMoon(moon) {
    moon.t = this;
    moon.moon = true;
    moon.elem = document.createElement("div");
    moon.elem.className = "label";
    const text = document.createElement("div");
    text.textContent = moon.name[0].toUpperCase() + moon.name.slice(1);
    text.className = "label-text";
    const ring = document.createElement("div");
    ring.className = "label-ring";
    ring.style.borderColor = "#" + this.color.toString(16);
    moon.elem.appendChild(text);
    moon.elem.appendChild(ring);
    moon.render = this.render.bind(this);
    document.body.appendChild(moon.elem);
    moon.color = this.color;
    moon.mount = () => {
      this.scene.add(moon);
    };
    moon.symbol = this.symbol;
    moon.unmount = () => {
      this.scene.remove(moon);
    };
    moon.drawTrail = () => {
      this.scene.add(this.scenes.find((x) => x.name == moon.name + "Trail"));
    };

    moon.removeTrail = () => {
      var trail = this.scene.getObjectByName(moon.name + "Trail");
      this.scene.remove(trail);
    };
    Object.defineProperty(moon, "removeTrail", {
      value: moon.removeTrail.bind(this),
    });
    Object.defineProperty(moon, "drawTrail", {
      value: moon.drawTrail.bind(this),
    });
    moon.elem.onclick = () => {
      this.onMoonClick(moon);
    };
    this.moons.push(moon);
  }
  createMoon(name, map, radius, pos = { x: 0, y: 0, z: 0 }, incl) {
    const moonGeometry = new THREE.SphereGeometry(10 / radius, 32, 32);
    const moonMaterial = new THREE.MeshPhongMaterial({
      shininess: 0,
      map: new THREE.TextureLoader().load(map),
    });

    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.name = name;
    moon.position.set(pos.x, pos.y, pos.z);

    return moon;
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

    line.name = this.name + "Trail";

    line.rotateX(-this.inclination);
    this.trail = line;

    this.scene.add(line);
  }
  drawMoonTrail(x, z, radius, theeta, incl, name) {
    const ellipse = new THREE.EllipseCurve(
      0,
      0,
      radius,
      radius,
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

    line.position.set(x, this.y_distance, z);
    line.rotateX(-incl);
    line.name = name + "Trail";
    line.updateMatrix();

    this.scenes.push(line);
    const temp = points[0].clone();
    line.localToWorld(temp);
    return temp;
  }
  removeTrail() {
    var trail = this.scene.getObjectByName(this.name + "Trail");
    this.scene.remove(trail);
  }
  render() {}

  mount() {
    if (!this.fetchedMoons) this.loadMoons();
    this.scenes.forEach((scene) => scene && this.scene.add(scene));
  }
  unmount() {
    this.scenes.forEach((scene) => scene && this.scene.remove(scene));
  }
}
