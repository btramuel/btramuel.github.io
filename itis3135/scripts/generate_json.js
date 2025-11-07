document.addEventListener("DOMContentLoaded", () => {
  const form   = document.getElementById("introForm");
  const result = document.getElementById("result");
  const jsonBtn = document.getElementById("generateJSONBtn");
  if (!form || !result || !jsonBtn) return;

  const esc = (s = "") =>
    String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#39;");

  function getVal(fd, key) { return (fd.get(key) || "").toString().trim(); }

  function collectBullets(fd) {
    const out = [];
    for (let i = 1; i <= 7; i++) out.push(getVal(fd, "b" + i));
    return out;
  }

  function collectLinks(fd) {
    const out = [];
    for (let i = 1; i <= 5; i++) {
      const v = getVal(fd, "link" + i);
      if (v) out.push(v);
    }
    return out;
  }

  function collectCourses() {
    const container = document.getElementById("courses");
    if (!container) return [];
    const rows = Array.from(container.querySelectorAll(".course-row"));
    return rows.map((row) => {
      const inputs = Array.from(row.querySelectorAll("input"));
      const obj = {};
      inputs.forEach((inp, idx) => {
        const name = (inp.name || "").trim();
        const val  = (inp.value || "").trim();
        if (!val) return;
        if (name) obj[name] = val;
        else if (idx === 0) obj.department = val;
        else if (idx === 1) obj.number = val;
        else if (idx === 2) obj.title = val;
        else if (idx === 3) obj.schedule = val;
        else obj["field" + idx] = val;
      });
      return obj;
    }).filter(o => Object.keys(o).length > 0);
  }

  function formToJson() {
    const fd = new FormData(form);
    return {
      identity: {
        firstName:  getVal(fd, "firstName"),
        middle:     getVal(fd, "middle"),
        nickname:   getVal(fd, "nickname"),
        lastName:   getVal(fd, "lastName"),
      },
      acknowledgement: {
        statement:  getVal(fd, "ackStmt"),
        date:       getVal(fd, "ackDate"),
      },
      mascot: {
        adjective:  getVal(fd, "mascAdj"),
        animal:     getVal(fd, "mascAnimal"),
        divider:    getVal(fd, "divider"),
      },
      picture: {
        defaultUrl: getVal(fd, "imgUrl"),
        caption:    getVal(fd, "imgCap"),
      },
      statement: getVal(fd, "statement"),
      bullets: collectBullets(fd),
      courses: collectCourses(),
      quote: {
        text:   getVal(fd, "quote"),
        author: getVal(fd, "quoteAuthor"),
      },
      optional: {
        funny: getVal(fd, "funny"),
        share: getVal(fd, "share"),
      },
      links: collectLinks(fd),
      generatedAt: new Date().toISOString()
    };
  }

  function showJson(obj) {
    const pretty = JSON.stringify(obj, null, 2);
    const safe = pretty.replace(/[&<>"']/g, (m) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
    result.innerHTML = `<h2>Generated JSON</h2>
<pre><code class="language-json">${safe}</code></pre>
<button type="button" id="restartBtn">Restart</button>`;
    result.hidden = false;
    if (window.hljs?.highlightElement) window.hljs.highlightElement(result.querySelector("code"));
    document.getElementById("restartBtn")?.addEventListener("click", () => {
      result.hidden = true;
      result.innerHTML = "";
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  jsonBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showJson(formToJson());
  });
});
