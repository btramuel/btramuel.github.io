document.addEventListener("DOMContentLoaded", () => {
  const form   = document.getElementById("introForm");
  const result = document.getElementById("result");
  const h2     = document.querySelector("h2");
  const btn    = document.getElementById("generateHTMLBtn"); 

  if (!form || !result || !h2 || !btn) return;

  const esc = (s = "") =>
    String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  btn.addEventListener("click", () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const f = new FormData(form);

    const first = (f.get("firstName") || "").trim();
    const mid   = (f.get("middle") || "").trim();
    const last  = (f.get("lastName") || "").trim();
    const fullName = [first, mid, last].filter(Boolean).join(" ");

    const mascAdj    = (f.get("mascAdj") || "").trim();
    const mascAnimal = (f.get("mascAnimal") || "").trim();
    const mascot     = [mascAdj, mascAnimal].filter(Boolean).join(" ");

    const imgUrl    = (f.get("imgUrl") || "").trim();
    const imgCap    = (f.get("imgCap") || "").trim();
    const statement = (f.get("statement") || "").trim();

    const bulletLis = [];
    for (let i = 1; i <= 7; i++) {
      const v = (f.get("b" + i) || "").trim();
      if (v) bulletLis.push(`<li>${esc(v)}</li>`);
    }

    const parts = [];
    parts.push(`<h2>Introduction HTML</h2>`);

    const h3Line = [fullName, mascot ? `★ ${mascot}` : ""].filter(Boolean).join(" ");
    if (h3Line) parts.push(`<h3>${esc(h3Line)}</h3>`);

    if (imgUrl) {
      parts.push(
`<figure>
    <img src="${esc(imgUrl)}" alt="Headshot of ${esc(fullName || "student")}" />
    ${imgCap ? `<figcaption>${esc(imgCap)}</figcaption>` : ""}
</figure>`
      );
    }

    if (statement) parts.push(`<p>${esc(statement)}</p>`);
    if (bulletLis.length) parts.push(`<ul>\n  ${bulletLis.join("\n  ")}\n</ul>`);

    const quote = (f.get("quote") || "").trim();
    const quoteAuthor = (f.get("quoteAuthor") || "").trim();
    if (quote) parts.push(`<blockquote>“${esc(quote)}” — ${esc(quoteAuthor || "Unknown")}</blockquote>`);

    const introHTML = parts.join("\n");

    h2.textContent = "Introduction HTML";
    form.hidden = true;
    result.hidden = false;
    result.innerHTML = `
<div style="display:flex; gap:.5rem; flex-wrap:wrap; margin-bottom:.75rem;">
  <button id="copyBtn">Copy Code</button>
  <button id="restartBtn" style="margin-left:auto;">Restart Form</button>
</div>
<section>
  <pre><code class="language-html">${esc(introHTML)}</code></pre>
</section>
`;

    if (window.hljs?.highlightAll) hljs.highlightAll();

    document.getElementById("copyBtn")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(introHTML);
        const b = document.getElementById("copyBtn");
        b.textContent = "Copied!";
        setTimeout(() => (b.textContent = "Copy Code"), 1200);
      } catch {
        alert("Copy failed — select the code and copy manually.");
      }
    });
    document.getElementById("restartBtn")?.addEventListener("click", () => location.reload());
  });
});
