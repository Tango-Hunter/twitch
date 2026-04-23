/**
 * Title: tech.js
 * Author: Tango Hunter
 * Date Created: 4/20/26
 * Date Modified: 4/20/26
 * Description: Script that allows users to filter/sort streams in the drop-down-menu and handles how the JSON data is displayed.
 */

const data = window.techData;

let selectedFilters = [];
let currentSort = "newest";

const grid = document.getElementById("grid");
const modal = document.getElementById("modal");
const modalVideo = document.getElementById("modalVideo");
const modalInfo = document.getElementById("modalInfo");
const streamSelect = document.getElementById("streamSelect");
const filterMenu = document.getElementById("filterMenu");

// ---------------- INIT ----------------
init();

function init() {
  buildDropdown();
  buildFilters();
  applyFilters();
}

// -------------- DROPDOWN --------------
function buildDropdown() {
  data.forEach((item, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = item.title;
    streamSelect.appendChild(opt);
  });
}

streamSelect.onchange = e => {
  if (e.target.value === "") return;
  openModal(data[e.target.value]);
};

// --------------- FILTER ---------------
function buildFilters() {
  const techSet = new Set();
  data.forEach(d => d.tech.forEach(t => techSet.add(t.name)));

  techSet.forEach(name => {
    const label = document.createElement("label");
    const input = document.createElement("input");

    input.type = "checkbox";
    input.value = name;

    input.onchange = () => {
      if (input.checked) selectedFilters.push(name);
      else selectedFilters = selectedFilters.filter(f => f !== name);
      applyFilters();
    };

    label.appendChild(input);
    label.appendChild(document.createTextNode(name));
    filterMenu.appendChild(label);
  });
}

// ------------ FILTER + SORT -----------
function applyFilters() {
  let filtered = data.filter(item => {
    if (!selectedFilters.length) return true;

    return selectedFilters.some(f =>
      item.tech.some(t => t.name === f)
    );
  });

  filtered.sort((a,b) =>
    currentSort === "newest"
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date)
  );

  renderGrid(filtered);
}

// ---------------- GRID ----------------
function renderGrid(list) {
  grid.innerHTML = "";

  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img class="thumbnail" src="https://img.youtube.com/vi/${item.video}/hqdefault.jpg">
      <div class="card-body">
        <div class="card-title">${item.title}</div>
        <div class="card-date">${item.date}</div>
      </div>
    `;

    card.onclick = () => openModal(item);
    grid.appendChild(card);
  });
}

// ------- MODAL WITH FALLBACK ----------
function openModal(item) {
  modal.classList.add("active");

  const videoId = item.video;

  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
  iframe.title = "YouTube video player";
  iframe.frameBorder = "0";
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.referrerpolicy = "strict-origin-when-cross-origin"
  iframe.allowFullscreen = true;

  modalVideo.innerHTML = "";
  modalVideo.appendChild(iframe);

  const fallbackTimer = setTimeout(() => {
    showFallback(videoId);
  }, 3000);

  iframe.onload = () => clearTimeout(fallbackTimer);
  iframe.onerror = () => {
    clearTimeout(fallbackTimer);
    showFallback(videoId);
  };

  modalInfo.innerHTML = `
    <h3>${item.title}</h3>
    <p><strong>Date:</strong> ${item.date}</p>
    <p>${item.description}</p>

    <div class="tech-stack">
      ${item.tech.map(t => `
        <a href="${t.link}" target="_blank" rel="noopener noreferrer" class="tech-tag">
          ${t.name}
        </a>
      `).join("")}
    </div>
  `;
}

function showFallback(videoId) {
  modalVideo.innerHTML = `
    <div class="video-fallback">
      <p>Video could not be loaded.</p>
      <a href="https://www.youtube.com/watch?v=${videoId}" 
         target="_blank" 
         rel="noopener noreferrer"
         class="watch-btn">
         ▶ Watch on YouTube
      </a>
    </div>
  `;
}

// ------------ CLOSE MODAL -------------
document.getElementById("closeModal").onclick = closeModal;

function closeModal() {
  modal.classList.remove("active");
  modalVideo.innerHTML = "";
}

modal.onclick = e => {
  if (e.target === modal) closeModal();
};

// ---------------- SORT ----------------
document.getElementById("sortMenu").onclick = e => {
  if (!e.target.dataset.sort) return;
  currentSort = e.target.dataset.sort;
  applyFilters();
};

// ---------- DROPDOWN TOGGLE -----------
document.querySelectorAll(".icon-btn").forEach(btn => {
  btn.onclick = () => btn.parentElement.classList.toggle("open");
});

// ---------- CLOSE DROPDOWNS -----------
document.addEventListener("click", e => {
  if (!e.target.closest(".icon-dropdown")) {
    document.querySelectorAll(".icon-dropdown")
      .forEach(d => d.classList.remove("open"));
  }
});
