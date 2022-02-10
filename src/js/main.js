import PlanetCanvas from "./planet_canvas";



//function for loader time delay
const wait = (delay = 0) =>
  new Promise((resolve) => setTimeout(resolve, delay));



document.addEventListener("DOMContentLoaded", () =>
  wait(2000).then(() => {
    const canvas = new PlanetCanvas();
    canvas.fetchData();
    document
      .querySelector(".bring-content-back")
      .addEventListener("click", () => {
        document.querySelector(".content").classList.remove("is-not-visible");
        document.querySelector(".bring-content-back").style.display = "none";
      });
    document.querySelector(".close-svg").addEventListener("click", () => {
      document.querySelector(".content").classList.add("is-not-visible");
      document.querySelector(".bring-content-back").style.display = "block";
    });
    document.body.onclick = (e) => {
      // get element
      const el = e.target;
      if (!el.classList.contains("search-bar")) {
        document.querySelector(".search-bar input").value = "";
        document.querySelector(".search-bar .search-holder ul").innerHTML = "";
      }
    };
  })
);



