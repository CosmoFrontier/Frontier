import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import months from "./months";

document.addEventListener("DOMContentLoaded", function () {
  let AUTOMOVE = true;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight
  );
  camera.position.z = 2;
  scene.add(camera);

  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector("#canvas"),
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  const EarthGeometry = new THREE.SphereGeometry(0.4, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    color: 0x48659f,
    map: new THREE.TextureLoader().load("assets/earth_main.jpg"),
  });
  const earthSpehere = new THREE.Mesh(EarthGeometry, material);
  earthSpehere.rotation.y = -90 * (Math.PI / 180);
  const date = new Date();

  const seconds = () =>
    date.getUTCHours() * 3600 +
    date.getUTCMinutes() * 60 +
    date.getUTCSeconds();
  earthSpehere.rotation.y =
    80 * (Math.PI / 180) + -seconds() * ((2 * Math.PI) / (24 * 3600));
  scene.add(earthSpehere);

  const cloudGeometry = new THREE.SphereGeometry(0.401, 32, 32);
  const cloudMaterial = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load("assets/cloud_map_earth.png"),
    transparent: true,
  });
  const cloudSphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
  earthSpehere.add(cloudSphere);
  earthSpehere.rotation.x = -23.43643 * (Math.PI / 180);
  earthSpehere.rotation.y = -90 * (Math.PI / 180);

  const SunGeometry = new THREE.SphereGeometry(1, 32, 32);
  const SunMaterial = new THREE.MeshPhongMaterial({
    color: 0xfff93e,
    emissive: 0xfff93e,
    map: new THREE.TextureLoader().load("assets/sun_main.jpg"),
  });
  const sunSphere = new THREE.Mesh(SunGeometry, SunMaterial);
  sunSphere.position.set(0, 0, 50);

  scene.add(sunSphere);

  const sunOut = new THREE.SphereGeometry(1.1, 32, 32);
  const sunOutMaterial = new THREE.MeshPhongMaterial({
    color: 0xfff93e,
    transparent: true,
    opacity: 0.5,
    emissive: 0xfff93e,
    emissiveIntensity: 0.5,
  });
  const sunOutSphere = new THREE.Mesh(sunOut, sunOutMaterial);
  sunOutSphere.position.set(0, 0, 50);
  scene.add(sunOutSphere);

  //background
  var background = new THREE.TextureLoader().load("assets/star_map.png");
  background.wrapS = background.wrapT = THREE.RepeatWrapping;
  background.repeat.set(1, 1);

  var materialBackground = new THREE.MeshBasicMaterial({
    map: background,
    side: THREE.BackSide,
  });
  var geometryBackground = new THREE.SphereGeometry(80, 1200, 1200);
  var meshBackground = new THREE.Mesh(geometryBackground, materialBackground);
  scene.add(meshBackground);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const focuslight = new THREE.PointLight(0xffffff, 1.5, 0);
  focuslight.position.set(0, 0, 50);
  scene.add(focuslight);

  var cam_rotation = 0.001;
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxDistance = 100;
  controls.minDistance = 1;
  controls.addEventListener("change", function () {
    AUTOMOVE = false;
  });
  controls.update();

  const animate = function () {
    var radius = 2;
    earthSpehere.rotation.y =
      80 * (Math.PI / 180) + seconds() * ((2 * Math.PI) / (24 * 3600));
    if (AUTOMOVE) {
      cam_rotation += 0.001;
      camera.position.x = radius * Math.sin(cam_rotation);
      camera.position.z = radius * Math.cos(cam_rotation);
    }
    let date = new Date();
    document.querySelector(".date-time .date").textContent =
      months[date.getMonth()] +
      " " +
      date.getDate() +
      ", " +
      date.getFullYear();
    document.querySelector(".date-time .time").textContent =
      date.toLocaleTimeString();
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.lookAt(earthSpehere.position);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();
  renderer.render(scene, camera);

  document.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.innerWidth / window.innerHeight);
  };
});
