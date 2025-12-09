document.addEventListener("DOMContentLoaded", () => {
  const apiUrl =
    "https://dvonb.xyz/api/2025-fall/itis-3135/students?full=1";

  const slideshowContainer = document.getElementById("students-slideshow");
  const statusEl = document.getElementById("students-status");
  const countEl = document.getElementById("students-count");
  const positionEl = document.getElementById("students-position");

  const nameSearchInput = document.getElementById("students-name-search");

  const prevBtn = document.getElementById("students-prev");
  const nextBtn = document.getElementById("students-next");

  const optName = document.getElementById("opt-name");
  const optMascot = document.getElementById("opt-mascot");
  const optImage = document.getElementById("opt-image");
  const optStatement = document.getElementById("opt-statement");
  const optBackgrounds = document.getElementById("opt-backgrounds");
  const optClasses = document.getElementById("opt-classes");
  const optExtra = document.getElementById("opt-extra");
  const optQuote = document.getElementById("opt-quote");
  const optLinks = document.getElementById("opt-links");

  if (!slideshowContainer) return;

  let students = [];
  let currentIndex = 0;
  let nameSearchTerm = "";

  const options = {
    showName: true,
    showMascot: true,
    showImage: true,
    showStatement: true,
    showBackgrounds: true,
    showClasses: true,
    showExtra: true,
    showQuote: true,
    showLinks: true,
  };

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text || "";
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalize(str) {
    return (str || "").toString().toLowerCase();
  }

  function updateOptionsFromCheckboxes() {
    options.showName = !!optName?.checked;
    options.showMascot = !!optMascot?.checked;
    options.showImage = !!optImage?.checked;
    options.showStatement = !!optStatement?.checked;
    options.showBackgrounds = !!optBackgrounds?.checked;
    options.showClasses = !!optClasses?.checked;
    options.showExtra = !!optExtra?.checked;
    options.showQuote = !!optQuote?.checked;
    options.showLinks = !!optLinks?.checked;
  }

  function getFilteredStudents() {
    const term = normalize(nameSearchTerm).trim();
    if (!term) return students;

    return students.filter((s) => {
      const first = normalize(s.name && s.name.first);
      const last = normalize(s.name && s.name.last);
      const preferred = normalize(s.name && s.name.preferred);

      // Match on first, last, or preferred name
      return (
        first.includes(term) ||
        last.includes(term) ||
        preferred.includes(term) ||
        (first + " " + last).includes(term)
      );
    });
  }

  function renderCard(student) {
    const nameParts = [];
    if (student.name && student.name.first) nameParts.push(student.name.first);
    if (student.name && student.name.middleInitial)
      nameParts.push(student.name.middleInitial + ".");
    if (student.name && student.name.last) nameParts.push(student.name.last);
    const fullName = nameParts.join(" ") || student.prefix || "Student";

    const preferred =
      student.name && student.name.preferred
        ? `<p class="muted">Preferred name: ${escapeHtml(
            student.name.preferred
          )}</p>`
        : "";

    const mascotLine =
      options.showMascot && student.mascot
        ? `<p class="muted">
            Prefix: <strong>${escapeHtml(student.prefix)}</strong> |
            Mascot: <strong>${escapeHtml(student.mascot)}</strong>
          </p>`
        : "";

    const platform =
      options.showExtra && student.platform
        ? `<p class="muted">
            Device: ${escapeHtml(student.platform.device)} |
            OS: ${escapeHtml(student.platform.os)}
          </p>`
        : "";

    const backgrounds = student.backgrounds || {};
    const bgLines = [];
    if (backgrounds.personal)
      bgLines.push(
        `<p><strong>Personal:</strong> ${escapeHtml(
          backgrounds.personal
        )}</p>`
      );
    if (backgrounds.professional)
      bgLines.push(
        `<p><strong>Professional:</strong> ${escapeHtml(
          backgrounds.professional
        )}</p>`
      );
    if (backgrounds.academic)
      bgLines.push(
        `<p><strong>Academic:</strong> ${escapeHtml(
          backgrounds.academic
        )}</p>`
      );
    if (backgrounds.subject)
      bgLines.push(
        `<p><strong>Subject:</strong> ${escapeHtml(
          backgrounds.subject
        )}</p>`
      );

    const backgroundsHtml =
      options.showBackgrounds && bgLines.length
        ? `
      <section>
        <h3>Background</h3>
        ${bgLines.join("")}
      </section>`
        : "";

    let coursesHtml = "";
    if (
      options.showClasses &&
      Array.isArray(student.courses) &&
      student.courses.length
    ) {
      const items = student.courses
        .map((c) => {
          const label = [c.dept, c.num].filter(Boolean).join(" ");
          const name = c.name || "";
          const reason = c.reason
            ? ` <span class="muted">(${escapeHtml(c.reason)})</span>`
            : "";
          return `<li>${escapeHtml(label)} – ${escapeHtml(
            name
          )}${reason}</li>`;
        })
        .join("");
      coursesHtml = `
        <section>
          <h3>Current Classes</h3>
          <ul>${items}</ul>
        </section>
      `;
    }

    let quoteHtml = "";
    if (options.showQuote && student.quote && student.quote.text) {
      const author = student.quote.author
        ? `<footer>– ${escapeHtml(student.quote.author)}</footer>`
        : "";
      quoteHtml = `
        <section>
          <h3>Favorite Quote</h3>
          <blockquote>
            “${escapeHtml(student.quote.text)}”
            ${author}
          </blockquote>
        </section>
      `;
    }

    let funFact = "";
    if (options.showExtra && student.funFact) {
      funFact = `<p><strong>Fun fact:</strong> ${escapeHtml(
        student.funFact
      )}</p>`;
    }

    let linksHtml = "";
    if (options.showLinks) {
      const links = student.links || {};
      const linkMap = [
        ["charlotte", "Charlotte Webspace"],
        ["github", "GitHub"],
        ["githubio", "GitHub Pages"],
        ["itis3135", "ITIS 3135 Site"],
        ["freecodecamp", "freeCodeCamp"],
        ["codecademy", "Codecademy"],
        ["linkedin", "LinkedIn"],
      ];
      const linkItems = linkMap
        .filter(([key]) => links[key])
        .map(
          ([key, label]) =>
            `<li><a href="${links[key]}" target="_blank" rel="noreferrer">${label}</a></li>`
        )
        .join("");
      if (linkItems) {
        linksHtml = `
          <section>
            <h3>Links</h3>
            <ul>${linkItems}</ul>
          </section>
        `;
      }
    }

    let imageHtml = "";
    if (
      options.showImage &&
      student.media &&
      student.media.hasImage &&
      student.media.src
    ) {
      const src = "https://dvonb.xyz" + student.media.src;
      const caption = student.media.caption || "";
      imageHtml = `
        <figure>
          <img src="${src}" alt="${escapeHtml(
        caption || fullName
      )}" style="max-width: 100%; border-radius: 6px;" />
          ${
            caption
              ? `<figcaption>${escapeHtml(caption)}</figcaption>`
              : ""
          }
        </figure>
      `;
    }

    const statementHtml =
      options.showStatement && student.personalStatement
        ? `<section><h3>Personal Statement</h3><p>${escapeHtml(
            student.personalStatement
          )}</p></section>`
        : "";

    const headerHtml = options.showName
      ? `
      <header>
        <h3>${escapeHtml(fullName)}</h3>
        ${preferred}
        ${mascotLine}
        ${platform}
      </header>`
      : `
      <header>
        ${mascotLine}
        ${platform}
      </header>`;

    return `
      <article class="card">
        ${headerHtml}
        ${imageHtml}
        ${backgroundsHtml}
        ${coursesHtml}
        ${statementHtml}
        ${quoteHtml}
        ${funFact}
        ${linksHtml}
      </article>
    `;
  }

  function render() {
    const list = getFilteredStudents();

    if (countEl) {
      countEl.textContent = `${list.length} introduction${
        list.length === 1 ? "" : "s"
      } found`;
    }

    if (!list.length) {
      slideshowContainer.innerHTML =
        "<p>No introductions match your search.</p>";
      if (positionEl) positionEl.textContent = "Slide 0 of 0";
      return;
    }

    if (currentIndex >= list.length) {
      currentIndex = list.length - 1;
    }
    if (currentIndex < 0) {
      currentIndex = 0;
    }

    const student = list[currentIndex];
    slideshowContainer.innerHTML = renderCard(student);

    if (positionEl) {
      positionEl.textContent = `Slide ${currentIndex + 1} of ${
        list.length
      }`;
    }
  }

  // Events
  if (nameSearchInput) {
    nameSearchInput.addEventListener("input", (e) => {
      nameSearchTerm = e.target.value || "";
      currentIndex = 0;
      render();
    });
  }

  [optName, optMascot, optImage, optStatement,
   optBackgrounds, optClasses, optExtra, optQuote, optLinks]
    .forEach((chk) => {
      if (!chk) return;
      chk.addEventListener("change", () => {
        updateOptionsFromCheckboxes();
        render();
      });
    });

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const list = getFilteredStudents();
      if (!list.length) return;
      currentIndex = (currentIndex - 1 + list.length) % list.length;
      render();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const list = getFilteredStudents();
      if (!list.length) return;
      currentIndex = (currentIndex + 1) % list.length;
      render();
    });
  }

  // Initial options
  updateOptionsFromCheckboxes();

  // Fetch data and kick things off
  setStatus("Loading students...");
  fetch(apiUrl)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load data");
      return res.json();
    })
    .then((data) => {
      students = Array.isArray(data) ? data : [];
      if (!students.length) {
        setStatus("No students returned from API.");
      } else {
        setStatus("");
      }
      currentIndex = 0;
      render();
    })
    .catch((err) => {
      console.error(err);
      setStatus("Error loading students. Try again later.");
      slideshowContainer.innerHTML =
        "<p>Unable to load introductions right now.</p>";
    });
});
