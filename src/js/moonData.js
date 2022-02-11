import { refetch } from "./Util";

export default function moonData(name) {
  //URL fetching for only moons
  return new Promise(async (resolve, reject) => {
    try {
      const data = await refetch(
        "https://ssd-abh80.vercel.app/satellite/" + name //https://ssd-abh80.vercel.app/satellite/
      );
      const json = await data.json();
      resolve(json);
    } catch (e) {
      reject(e);
    }
  });
}
