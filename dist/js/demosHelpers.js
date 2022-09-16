const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const demo_id = urlParams.get("demo");

window.onload = function () {
  fetch(demo_id + ".md")
    .then((response) => response.text())
    .then((data) => {
      // based on https://gist.github.com/paulirish/1343518
      document.getElementById("main-content").innerHTML = data;
      (function () {
        [].forEach.call(
          document.querySelectorAll("[data-markdown]"),
          function fn(elem) {
            elem.innerHTML = new showdown.Converter().makeHtml(elem.innerHTML);
          }
        );
      })();
    });
};
