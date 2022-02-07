import * as THREE from "three";

/**
 *
 * @param {String} url
 * @returns {Promise<Response>}
 */

export function refetch(url) {
  return new Promise(async (resolve, reject) => {
    let stop = false;
    const wait = (time) => new Promise((res) => setTimeout(res, time));
    let tries = 0;
    let multiplyFactor = 0.5;
    while (!stop) {
      if (tries >= 10) tries = 0;
      try {
        const res = await fetch(url);
        stop = true;
        resolve(res);
      } catch (e) {}
      await wait(tries * multiplyFactor * 1000);
      tries++;
    }
  });
}
/**
 *
 * @param {String} url
 * @returns {Promise<THREE.Texture>}
 */
export function retextureLoader(url) {
  return new Promise(async (resolve, reject) => {
    let stop = false;
    const TextureLoader = new THREE.TextureLoader();
    const wait = (time) => new Promise((res) => setTimeout(res, time));
    let tries = 0;
    let multiplyFactor = 0.5;
    while (!stop) {
      if (tries >= 10) tries = 0;
      try {
        let texture = await TextureLoader.loadAsync(url);
        stop = true;
        resolve(texture);
      } catch (e) {}
      await wait(tries * multiplyFactor * 1000);
      tries++;
    }
  });
}
/**
 *
 * @param {String} url
 * @param {String} type
 */
export async function reloadBgImage(url, domElement) {
  let stop = false;
  const wait = (time) => new Promise((res) => setTimeout(res, time));
  let tries = 0;
  let multiplyFactor = 0.5;
  while (!stop) {
    if (tries >= 10) tries = 0;
    try {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        domElement.style.backgroundImage = `url(${url})`;
        stop = true;
      };
    } catch (e) {}
    await wait(tries * multiplyFactor * 1000);
    tries++;
  }
}
