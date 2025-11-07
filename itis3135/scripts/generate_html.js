document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("introForm");
  const header = document.querySelector("h2");
  let result = document.getElementById("result");
  const htmlBtn = document.getElementById("generateHTMLBtn");

  if (!result) {
    result = document.createElement("section");
    result.id = "result";
    result.hidden = true;
    form.insertAdjacentElement("afterend", result);
  }

  const esc = (s = "") =>
    String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#39;");

  function getVal(fd, key) {
    const v = fd.get(key);
    return v == null ? "" : String(v).trim();
  }

  function collectBullets(fd) {
    const out = [];
    for (let i = 1; i <= 7; i++) {
      const v = getVal(fd, "b" + i);
      if (v) out.push(v);
    }
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
    const box = document.getElementById("courses");
    if (!box) return [];
    const rows = Array.from(box.querySelectorAll(".course-row"));
    return rows
      .map((row) => {
        const obj = {};
        const inputs = Array.from(row.querySelectorAll("input"));
        inputs.forEach((inp, i) => {
          const name = inp.name || "";
          const val = inp.value.trim();
          if (!val) return;
          if (name) obj[name] = val;
          else if (i === 0) obj.department = val;
          else if (i === 1) obj.number = val;
          else if (i === 2) obj.title = val;
          else if (i === 3) obj.schedule = val;
          else obj["field" + i] = val;
        });
        return obj;
      })
      .filter((o) => Object.keys(o).length > 0);
  }

  function buildHTML(fd) {
    const first = getVal(fd, "firstName");
    const middle = getVal(fd, "middle");
    const last = getVal(fd, "lastName");
    const nick = getVal(fd, "nickname");
    const full = [first, middle, last].filter(Boolean).join(" ");
    const nickname = nick ? ` "${nick}"` : "";

    const adj = getVal(fd, "mascAdj");
    const animal = getVal(fd, "mascAnimal");
    const star = "★";
    const mascot = [adj, animal].filter(Boolean).join(" ");

    const img = getVal(fd, "imgUrl");
    const cap = getVal(fd, "imgCap");

    const stmt = getVal(fd, "statement");

    const bullets = collectBullets(fd)
      .map((b) => `    <li>${b}</li>`)
      .join("\n");

    const links = collectLinks(fd)
      .map((l) => `    <li><a href="${l}" target="_blank" rel="noopener">${l}</a></li>`)
      .join("\n");

    const courses = collectCourses();
    let courseHTML = "";
    if (courses.length) {
      const headers = Array.from(
        courses.reduce((s, o) => {
          Object.keys(o).forEach((k) => s.add(k));
          return s;
        }, new Set())
      );
      const headRow = "<tr>" + headers.map((h) => `<th>${h}</th>`).join("") + "</tr>";
      const rows = courses
        .map((o) => "<tr>" + headers.map((h) => `<td>${o[h] || ""}</td>`).join("") + "</tr>")
        .join("\n");
      courseHTML = `
<h3>Courses</h3>
<table>
${headRow}
${rows}
</table>`;
    }

    return `<h2>Introduction HTML</h2>
<h3>${full}${nickname} ${star} ${mascot}</h3>
<figure>
  <img src="${img}" alt="Picture of ${full}" />
  <figcaption>${cap}</figcaption>
</figure>
<p>${stmt}</p>
<ul>
${bullets}
</ul>
${links ? `<h3>Links</h3>\n<ul>\n${links}\n</ul>` : ""}
${courseHTML}`.trim();
  }

  function show(htmlText) {
    header.textContent = "Introduction HTML";
    form.hidden = true;

    result.hidden = false;
    result.innerHTML = `
<pre><code class="language-html">${esc(htmlText)}</code></pre>
`;

    if (window.hljs) {
      const code = result.querySelector("code");
      window.hljs.highlightElement(code);
    }
  }

  htmlBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const html = buildHTML(fd);
    show(html);
  });
});
