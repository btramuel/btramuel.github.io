const form = document.getElementById("introForm");
const result = document.getElementById("result");
const clearBtn = document.getElementById("clearBtn");
const addCourseBtn = document.getElementById("addCourseBtn");
const coursesWrap = document.getElementById("courses");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const imgFileInput = document.getElementById("imgFile");
const imgPreview = document.getElementById("image-preview");

function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else e.setAttribute(k, v);
  });
  children.forEach(c => e.append(c));
  return e;
}

function getValue(name) {
  const f = form.elements[name];
  return f ? f.value.trim() : "";
}

function updateProgress() {
  const requiredFields = ["firstName","lastName","ackStmt","ackDate","mascAdj","mascAnimal","divider","imgUrl","imgCap","statement","b1","b2","b3","b4","b5","b6","b7","quote","quoteAuthor","link1","link2","link3","link4","link5"];
  const filled = requiredFields.filter(n => getValue(n)).length;
  const percentage = Math.round((filled / requiredFields.length) * 100);
  
  progressBar.style.width = percentage + "%";
  progressText.textContent = percentage + "% Complete";
}

form.addEventListener("input", updateProgress);
form.addEventListener("change", updateProgress);

imgFileInput.addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      imgPreview.src = event.target.result;
      imgPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    imgPreview.style.display = "none";
  }
});

function addCourseRow(prefill = {}) {
  const row = el("div", { class: "course-row" });
  row.append(
    el("input", { name: "cDept", placeholder: "Dept (e.g., ITIS)", value: prefill.dept || "" }),
    el("input", { name: "cNum", placeholder: "Number (e.g., 3135)", value: prefill.num || "" }),
    el("input", { name: "cName", placeholder: "Name (e.g., Front-End Web App Dev)", value: prefill.name || "" }),
    el("input", { name: "cReason", placeholder: "Reason (e.g., degree req / interest)", value: prefill.reason || "" }),
    (() => {
      const del = el("button", { type: "button" }, "Delete");
      del.addEventListener("click", () => row.remove());
      return del;
    })()
  );
  coursesWrap.append(row);
}

addCourseRow();

addCourseBtn.addEventListener("click", function() {
  addCourseRow();
});

clearBtn.addEventListener("click", () => {
  Array.from(form.querySelectorAll("input, textarea")).forEach(inp => {
    if (inp.type === "date" || inp.type === "file") inp.value = "";
    else inp.value = "";
  });
  coursesWrap.innerHTML = "";
  addCourseRow();
  imgPreview.style.display = "none";
  updateProgress();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  result.hidden = true;
  form.hidden = false;
  coursesWrap.innerHTML = "";
  addCourseRow();
  imgPreview.style.display = "none";
  updateProgress();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const requiredNames = ["firstName","lastName","ackStmt","ackDate","mascAdj","mascAnimal","divider","imgUrl","imgCap","statement","b1","b2","b3","b4","b5","b6","b7","quote","quoteAuthor","link1","link2","link3","link4","link5"];
  const missing = requiredNames.filter(n => !getValue(n));
  if (missing.length) {
    alert("Please complete all required fields.");
    return;
  }

  const fileInput = document.getElementById("imgFile");
  let imgSrc = getValue("imgUrl");
  if (fileInput.files && fileInput.files[0]) {
    imgSrc = URL.createObjectURL(fileInput.files[0]);
  }

  const courseRows = Array.from(coursesWrap.querySelectorAll(".course-row"));
  const courses = courseRows.map(r => {
    const [dept, num, name, reason] = r.querySelectorAll("input");
    return {
      dept: dept.value.trim(),
      num: num.value.trim(),
      name: name.value.trim(),
      reason: reason.value.trim()
    };
  }).filter(c => c.dept || c.num || c.name || c.reason);

  const h2 = el("h2", {}, "Introduction Form");
  const idLine = el("p", { html: `<strong>${getValue("firstName")} ${getValue("middle")} ${getValue("lastName")}${getValue("nick") ? ` (${getValue("nick")})` : ""}</strong>` });

  const imgFig = el("figure");
  imgFig.append(el("img", { src: imgSrc, alt: "Profile image" }));
  imgFig.append(el("figcaption", {}, getValue("imgCap")));

  const ul = el("ul");
  for (let i = 1; i <= 7; i++) {
    const text = getValue(`b${i}`);
    const li = el("li");
    const parts = text.split(":");
    if (parts.length > 1) {
      li.innerHTML = `<strong>${parts[0]}:</strong> ${parts.slice(1).join(":").trim()}`;
    } else {
      li.textContent = text;
    }
    ul.append(li);
  }

  const coursesList = el("ul");
  courses.forEach(c => {
    const label = `${c.dept || ""} ${c.num || ""} - ${c.name || ""}`.trim();
    const li = el("li");
    li.innerHTML = `<strong>${label}:</strong> ${c.reason || ""}`;
    coursesList.append(li);
  });

  const quoteP = el("p", { html: `"${getValue("quote")}" — <em>${getValue("quoteAuthor")}</em>` });

  const optList = el("ul");
  if (getValue("funny")) optList.append(el("li", {}, `Funny thing: ${getValue("funny")}`));
  if (getValue("share")) optList.append(el("li", {}, `Something to share: ${getValue("share")}`));

  const divider = getValue("divider");
  const mascotLine = el("p", { html: `<strong>Mascot:</strong> ${getValue("mascAdj")}${divider}${getValue("mascAnimal")}` });

  const linksWrap = el("ul");
  ["link1","link2","link3","link4","link5"].forEach(n => {
    const url = getValue(n);
    const li = el("li");
    li.innerHTML = `<a href="${url}" target="_blank" rel="noopener">${url}</a>`;
    linksWrap.append(li);
  });

  result.innerHTML = "";
  result.append(
    h2,
    idLine,
    imgFig,
    el("p", {}, getValue("statement")),
    ul,
    el("h3", {}, "Current Courses"),
    coursesList,
    quoteP,
    optList,
    mascotLine,
    el("hr"),
    (() => {
      const back = el("button", { type: "button", id: "restartBtn" }, "Reset and try again");
      back.addEventListener("click", () => {
        result.hidden = true;
        form.hidden = false;
        form.reset();
        coursesWrap.innerHTML = "";
        addCourseRow();
        imgPreview.style.display = "none";
        updateProgress();
        window.scrollTo(0, 0);
      });
      return back;
    })()
  );

  form.hidden = true;
  result.hidden = false;
  window.scrollTo(0, 0);
});

updateProgress();
