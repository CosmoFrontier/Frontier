export default function moonData(name) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await fetch(
        "https://ssd-abh80.vercel.app/satellite/" + name
      );
      const json = await data.json();
      resolve(json);
    } catch (e) {
      reject(e);
    }
  });
}
