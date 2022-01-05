import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  Lensflare,
  LensflareElement,
} from "three/examples/jsm/objects/Lensflare";
import {
  GodRaysEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  KernelSize,
  BlendFunction,
  BloomEffect,
} from "postprocessing";
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
  

  let godrayseffect = new GodRaysEffect(camera, sunSphere, {
    resolutionScale: 0.75,
    kernelSize: KernelSize.SMALL,
    density: 0.96,
    decay: 0.93,
    weight: 0.3,
    exposure: 0.55,
    samples: 60,
    clampMax: 1.0,
    blendFunction: BlendFunction.SCREEN,
  });
  godrayseffect.dithering = true;
  const bloomEffect = new BloomEffect({
    blendFunction: BlendFunction.SCREEN,
    kernelSize: KernelSize.MEDIUM,
    resolutionScale: 0.5,
    distinction: 3.8,
  });
  bloomEffect.blendMode.opacity.value = 2.5;

  const effectPass = new EffectPass(camera, bloomEffect, godrayseffect);

  effectPass.renderToScreen = true;
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(effectPass);

  composer.setSize(window.innerWidth, window.innerHeight);
  composer.render(scene, camera);
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
  const textureLoader = new THREE.TextureLoader();

  const textureFlare3 = textureLoader.load("assets/lensflare3.png");

  focuslight.position.set(0, 0, 50);
  const lensflare = new Lensflare();

  lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6));
  lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.7));
  lensflare.addElement(new LensflareElement(textureFlare3, 120, 0.9));
  lensflare.addElement(new LensflareElement(textureFlare3, 70, 1));
  focuslight.add(lensflare);
  focuslight.add(sunSphere);
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
    composer.render(scene, camera);
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
