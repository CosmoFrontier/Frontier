import * as THREE from "three";
import moonData from "./moonData";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { retextureLoader } from "./Util";
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


  //moons coordinates according to realtime space
  loadMoons() {
    return new Promise(async (resolve, reject) => {
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
        if (Math.abs(data.inclination) > 90) {
          if (data.inclination > 0)
            data.inclination = Math.abs(data.inclination) - 90;
          else data.inclination = -(Math.abs(data.inclination) - 90);
        }
        let multiplyFactor = 12.5;
        if (moon.articifial) multiplyFactor = 1;
        const rad = this.size * multiplyFactor + data.radius * 500;
        const x =
          this.radius * Math.sin(this.theeta) +
          rad * Math.sin(data.angular_distance);
        const y =
          this.y_distance + rad * Math.sin(data.inclination * (Math.PI / 180));
        const z =
          this.radius * Math.cos(this.theeta) +
          rad * Math.cos(data.angular_distance);
        let radius = rad;

        const points = [];
        const colors = [];
        const intensity = 0.02;
        let color = new THREE.Color(this.color);
        if (moon.articifial) {
          color = new THREE.Color(0x9fa9b3);
        }
        for (let i = 360; i > 0; i--) {
          const x1 =
            radius * Math.sin((i * Math.PI) / 180 + data.angular_distance);
          const current_incllination =
            data.inclination *
            (Math.PI / 180) *
            Math.cos(2 * Math.PI - (i * Math.PI) / 180);
          const y1 = radius * Math.sin(current_incllination);
          const z1 =
            radius * Math.cos((i * Math.PI) / 180 + data.angular_distance);
          points.push(new THREE.Vector3(x1, y1, z1));
          color.r = color.r - (color.r / 360) * (360 - i) * intensity;
          color.g = color.g - (color.g / 360) * (360 - i) * intensity;
          color.b = color.b - (color.b / 360) * (360 - i) * intensity;
          colors.push(color.r, color.g, color.b);
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          vertexColors: THREE.VertexColors,
          transparent: true,
        });
        geometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(colors, 3)
        );
        const line = new THREE.Line(geometry, material);
        line.position.set(
          this.radius * Math.sin(this.theeta),
          this.y_distance,
          this.radius * Math.cos(this.theeta)
        );
        line.name = moon.name + "Trail";

        this.scenes.push(line);

        if (moon.texture.drawSelf) {
          const ob = this.createMoon(
            moon.name,
            window.location.pathname + "assets/moons/" + moon.texture.map,
            moon.radius,
            {
              x,
              y,
              z,
            },
            data.inclination * (Math.PI / 180)
          );
          ob.data = data;
          this.setupMoon(ob);
        } else {
          if (!moon.radius) {
            moon.radius = 0.001;
          } else moon.radius = 10 / moon.radius;
          const geo = new THREE.BoxGeometry(
            moon.radius,
            moon.radius,
            moon.radius
          );
          const material = new THREE.MeshBasicMaterial({
            opacity: 0,
            transparent: 0,
          });
          const ob = new THREE.Mesh(geo, material);
          ob.loaded = false;
          ob.props = {
            x,
            y,
            z,
            inclination: data.inclination * (Math.PI / 180),
            radius: moon.radius,
          };
          ob.zaxis = ob.props.radius * 3;
          ob.name = moon.name;
          ob.texture =
            window.location.pathname +
            "assets/moons/" +
            moon.texture.map[0].toUpperCase() +
            moon.texture.map.slice(1);
          ob.articifial = moon.articifial;
          ob.data = data;
          ob.position.set(x, y, z);

          this.setupMoon(ob);
        }

        this.scene.add(this.scenes.find((x) => x.name == moon.name + "Trail"));
        resolve(true);
      });
    });
  }


  //loading function of 3D models of moons & satellites 
  loadGlb(name, map, radius, pos = { x: 0, y: 0, z: 0 }, incl) {
    if (isNaN(radius)) {
      radius = 0.001;
    }

    return new Promise(async (resolve, reject) => {
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
      let stop = false;
      let tries = 0;
      let wait = (time) => new Promise((res) => setTimeout(res, time));
      while (!stop) {
        if (tries >= 10) tries = 0;
        try {
          let glb = await Loader.loadAsync(map);
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

          obj.zaxis = radius * 3;
          stop = true;
          resolve(obj);
        } catch (e) {}
        await wait(tries * 0.5 * 1000);
        tries++;
      }
    });
  }

  //function for moons & satellites div
  setupMoon(moon) {

    //condition for being moon
    moon.t = this;
    moon.moon = true;
    moon.elem = document.createElement("div");
    moon.elem.className = "label";
    const text = document.createElement("div");
    text.textContent = moon.name[0].toUpperCase() + moon.name.slice(1);
    text.className = "label-text-sat";
    const ring = document.createElement("div");

    //condition for being only a satellite
    if (moon.articifial) ring.className = "label-square";
    else ring.className = "label-diamond";
    moon.elem.appendChild(text);
    moon.elem.appendChild(ring);
    moon.render = this.render.bind(this);
    document.body.appendChild(moon.elem);
    moon.color = this.color;
    var smallLoad = document.getElementById("lds-hourglass");
    moon.mount = async () => {
      moon.removeTrail();
      if (!moon.loaded) {
        smallLoad.style.display = "inline-block";
        try {
          let ob = await this.loadGlb(
            moon.name,
            moon.texture,
            moon.props.radius,
            { x: moon.props.x, y: moon.props.y, z: moon.props.z },
            moon.props.inclination
          );

          ob.loaded = true;
          moon.loaded = true;
          for (var k in moon) {
            if (!ob.hasOwnProperty(k)) {
              ob[k] = moon[k];
            }
          }
          moon = ob;
          this.scene.add(moon);
        } catch (e) {}
        smallLoad.style.display = "none";
      }
    };
    moon.symbol = this.symbol;
    moon.unmount = () => {
      this.scene.remove(moon);
      moon.removeTrail();
    };

    //adding the orbit lines to scene
    moon.drawTrail = () => {
      this.scene.add(this.scenes.find((x) => x.name == moon.name + "Trail"));
    };


    //removing the orbit lines from scene
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
      moon.elem.style.display = "none";
      this.onMoonClick(moon);
    };
    this.moons.push(moon);
  }

  //function for creating moon geometry upon promise returning
  async createMoon(name, map, radius, pos = { x: 0, y: 0, z: 0 }, incl) {
    const moonGeometry = new THREE.SphereGeometry(10 / radius, 32, 32);
    let map1 = await retextureLoader(map);
    const moonMaterial = new THREE.MeshPhongMaterial({
      shininess: 1,
      map: map1,
    });

    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.name = name;

    moon.zaxis = (10 / radius) * 3;
    moon.position.set(pos.x, pos.y, pos.z);

    return moon;
  }

  //function for creating orbit lines for moons & satellites
  createTrail() {
    const points = [];
    const colors = [];
    const color = new THREE.Color(this.color);
    for (let i = 360; i > 0; i -= 0.01) {
      const x1 = this.radius * Math.sin((i * Math.PI) / 180 + this.theeta);
      const current_incllination =
        this.data.data[0].inclination *
        (Math.PI / 180) *
        Math.cos(2 * Math.PI - (i * Math.PI) / 180);
      const y1 = this.radius * Math.sin(current_incllination);
      const z1 = this.radius * Math.cos((i * Math.PI) / 180 + this.theeta);
      points.push(new THREE.Vector3(x1, y1, z1));
      color.r = color.r - (color.r / 360) * (360 - i) * 0.0002;
      color.g = color.g - (color.g / 360) * (360 - i) * 0.0002;
      color.b = color.b - (color.b / 360) * (360 - i) * 0.0002;
      colors.push(color.r, color.g, color.b);
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
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

    this.scene.add(line);
    this.trail = line;
  }
  drawTrail() {
    if (!this.trail) this.createTrail();
    this.scene.add(this.trail);
  }
  removeTrail() {
    var trail = this.scene.getObjectByName(this.name + "Trail");
    this.scene.remove(trail);
  }
  render() {}

  async mount() {
    try {
      if (!this.fetchedMoons) this.loadMoons();
      if (!this[this.name.toLowerCase() + "Sphere"].material.texture) {
        let texture = await retextureLoader(this.texture);
        this[this.name.toLowerCase() + "Sphere"].material.map = texture;
        this[this.name.toLowerCase() + "Sphere"].material.needsUpdate = true;
      }
    } catch (e) {}

    this.scenes.forEach((scene) => scene && this.scene.add(scene));

    this.removeTrail();
  }
  unmount() {
    this.scenes.forEach((scene) => scene && this.scene.remove(scene));
    if (this.moons.length)
      this.moons.forEach((moon) => (moon.elem.style.display = "none"));
    this.drawTrail();
  }
}
