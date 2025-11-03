document.addEventListener("DOMContentLoaded", () => {
  const form   = document.getElementById("introForm");
  const result = document.getElementById("result");
  const h2     = document.querySelector("h2");
  const btn    = document.getElementById("generateJSONBtn"); 

  if (!form || !result || !h2 || !btn) return;

  const toJSON = (obj) => JSON.stringify(obj, null, 2);

  const esc = (s = "") =>
    String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  function pickFromBullets(f, prefix) {
    prefix = prefix.toLowerCase();
    for (let i = 1; i <= 7; i++) {
      const raw = (f.get("b" + i) || "").trim();
      const low = raw.toLowerCase();
      if (low.startsWith(prefix)) {
        const colon = raw.indexOf(":");
        return colon >= 0 ? raw.slice(colon + 1).trim() : raw.trim();
      }
    }
    return "";
  }

  function collectCourses() {
    const out = [];
    document.querySelectorAll("#courses .course-row").forEach((row) => {
      const fields = Array.from(row.querySelectorAll("input,select,textarea"))
        .map(el => (el.value || "").trim())
        .filter(Boolean);

      const getByName = (name) => row.querySelector(`[name="${name}"]`)?.value?.trim() || "";

      let department = getByName("department");
      let number     = getByName("number");
      let name       = getByName("courseName") || getByName("name");
      let reason     = getByName("reason");

      if (!department && fields[0]) department = fields[0];
      if (!number     && fields[1]) number     = fields[1];
      if (!name       && fields[2]) name       = fields[2];
      if (!reason     && fields[3]) reason     = fields[3];

      if (department || number || name || reason) {
        out.push({ department, number, name, reason });
      }
    });

    if (!out.length) out.push({ department: "", number: "", name: "", reason: "" });
    return out;
  }

  function inferLinkName(url, i) {
    const u = url.toLowerCase();
    if (u.includes("linkedin.com"))  return "LinkedIn";
    if (u.includes("github.io"))     return "GitHub Page";
    if (u.includes("github.com"))    return "GitHub";
    if (u.includes("freecodecamp"))  return "freeCodeCamp";
    if (u.includes("codecademy"))    return "Codecademy";
    if (u.includes("charlotte.edu")) return "UNCC Page";
    return `Website ${i}`;
  }

  function collectLinks(f) {
    const out = [];
    for (let i = 1; i <= 5; i++) {
      const href = (f.get("link" + i) || "").trim();
      if (!href) continue;
      out.push({ name: inferLinkName(href, i), href });
    }
    return out;
  }

  btn.addEventListener("click", () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const f = new FormData(form);

    const firstName     = (f.get("firstName") || "").trim();
    const preferredName = (f.get("nickname") || "").trim(); 
    const middle        = (f.get("middle") || "").trim();
    const middleInitial = middle ? middle[0] : "";
    const lastName      = (f.get("lastName") || "").trim();

    const divider          = (f.get("divider") || "").trim();
    const mascotAdjective  = (f.get("mascAdj") || "").trim();
    const mascotAnimal     = (f.get("mascAnimal") || "").trim();

    const image        = (f.get("imgUrl") || "").trim();
    const imageCaption = (f.get("imgCap") || "").trim();

    const personalStatement      = (f.get("statement") || "").trim();
    const personalBackground     = pickFromBullets(f, "personal background");
    const professionalBackground = pickFromBullets(f, "professional background");
    const academicBackground     = pickFromBullets(f, "academic background");
    const subjectBackground      = pickFromBullets(f, "web development background")
                                   || pickFromBullets(f, "subject background");
    const primaryComputer        = pickFromBullets(f, "primary computer") || "";

    const courses = collectCourses();
    const links   = collectLinks(f);

    const payload = {
      firstName,
      preferredName,
      middleInitial,
      lastName,
      divider,
      mascotAdjective,
      mascotAnimal,
      image,
      imageCaption,
      personalStatement,
      personalBackground,
      professionalBackground,
      academicBackground,
      subjectBackground,
      primaryComputer,
      courses,
      links
    };

    h2.textContent = "Introduction HTML";
    form.hidden = true;
    result.hidden = false;

    const jsonText = toJSON(payload);

    result.innerHTML = `
<div style="display:flex; gap:.5rem; flex-wrap:wrap; margin-bottom:.75rem;">
  <button id="copyJsonBtn">Copy JSON</button>
  <button id="restartBtn" style="margin-left:auto;">Restart Form</button>
</div>
<section>
  <pre><code class="language-json">${esc(jsonText)}</code></pre>
</section>
`;

    if (window.hljs?.highlightAll) hljs.highlightAll();

    document.getElementById("copyJsonBtn")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(jsonText);
        const b = document.getElementById("copyJsonBtn");
        b.textContent = "Copied!";
        setTimeout(() => (b.textContent = "Copy JSON"), 1200);
      } catch {
        alert("Copy failed — select the code and copy manually.");
      }
    });

    document.getElementById("restartBtn")?.addEventListener("click", () => {
      window.location.reload();
    });
  });
});
