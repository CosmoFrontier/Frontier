import PlanetCanvas from "./planet_canvas";

const wait = (delay = 0) =>
  new Promise((resolve) => setTimeout(resolve, delay));

// const setVisible = (elementOrSelector, visible) =>
//   ((typeof elementOrSelector === "string"
//     ? document.querySelector(elementOrSelector)
//     : elementOrSelector
//   ).style.display = visible ? "block" : "none");

// setVisible(".page", false);
// setVisible("#loading", true);

document.addEventListener("DOMContentLoaded", () =>
  wait(2000).then(() => {
    const canvas = new PlanetCanvas();
    canvas.fetchData();
    document.querySelector(".close-svg").addEventListener("click", () => {
      document.querySelector(".content").classList.add("is-not-visible");
    });
  })
);

// document.addEventListener("DOMContentLoaded", () =>
//   wait(4000).then(() => {
//     setVisible(".page", true);
//     setVisible("#loading", false);
//   })
// );
