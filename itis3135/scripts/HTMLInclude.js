(function () {
  function load(el) {
    const file = el.getAttribute("data-include");
    if (!file) return;
    fetch(file, {cache:"no-cache"})
      .then(r => r.ok ? r.text() : Promise.reject(r))
      .then(html => { el.innerHTML = html; })
      .catch(() => { el.innerHTML = "<!-- include failed: " + file + " -->"; });
  }
  document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll("[data-include]").forEach(load);
  });
})();
