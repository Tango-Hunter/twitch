/**
 * Title: json.js
 * Author: Tango Hunter
 * Date Created: 4/20/26
 * Date Modified: 4/20/26
 * Description: Script that controls the form and preview windows and allows for CRUD operations for a local JSON file.
 */

const techContainer = document.getElementById("techContainer");
const output = document.getElementById("output");
const form = document.getElementById("jsonForm");
const statusBox = document.getElementById("status");
const fileOutput = document.getElementById("fileOutput");
const saveBtn = document.getElementById("saveBtn");

const titleInput = document.getElementById("title");
const videoInput = document.getElementById("video");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");

let fileHandle = null;
let fileData = [];
let selectedIndex = null;
let pendingEntry = null;
let actionType = null;

let isDirty = false;
let originalEntry = null;

// ---------------- SAVE BUTTON ----------------
function updateSaveButtonState() {
  saveBtn.disabled = selectedIndex !== null && !isDirty;
}

// ---------------- TECH ----------------
function addTech(name = "", link = "") {
  const row = document.createElement("div");
  row.className = "tech-row";

  row.innerHTML = `
    <input value="${name}">
    <input value="${link}">
    <button type="button" class="danger">X</button>
  `;

  row.querySelector("button").onclick = () => {
    row.remove();
    updateJSON();
  };

  techContainer.appendChild(row);
}

// ---------------- FORM ----------------
function getTechData() {
  return [...document.querySelectorAll(".tech-row")].map(row => {
    const inputs = row.querySelectorAll("input");
    return { name: inputs[0].value, link: inputs[1].value };
  });
}

function buildFormData() {
  return {
    title: titleInput.value.trim(),
    video: videoInput.value.trim(),
    date: dateInput.value,
    description: descriptionInput.value.trim(),
    tech: getTechData()
  };
}

function updateJSON() {
  output.textContent = JSON.stringify(buildFormData(), null, 2);
}

form.addEventListener("input", () => {
  updateJSON();

  if (selectedIndex !== null) {
    isDirty = JSON.stringify(buildFormData()) !== originalEntry;
  }

  updateSaveButtonState();
});

// ---------------- FILE ----------------
async function openFile() {
  try {
    [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: "JSON Files",
        accept: { "application/json": [".json"] }
      }]
    });

    const file = await fileHandle.getFile();
    let parsed = JSON.parse(await file.text());

    if (!Array.isArray(parsed)) parsed = [parsed];

    fileData = parsed;

    renderPreview();
    showStatus("File loaded", true);

  } catch {
    showStatus("Error opening file", false);
  }
}

// ---------------- PREVIEW ----------------
function renderPreview() {
  fileOutput.innerHTML = "";

  fileData.forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "entry";
    div.innerHTML = `<strong>${entry.title}</strong><br>${entry.date}`;

    if (index === selectedIndex) div.classList.add("selected");

    div.onclick = (e) => {
      e.stopPropagation();
      selectEntry(index);
    };

    fileOutput.appendChild(div);
  });
}

// ---------------- SELECT ----------------
function selectEntry(index) {
  selectedIndex = index;
  const entry = fileData[index];

  titleInput.value = entry.title;
  videoInput.value = entry.video;
  dateInput.value = entry.date;
  descriptionInput.value = entry.description;

  techContainer.innerHTML = "";
  entry.tech.forEach(t => addTech(t.name, t.link));

  originalEntry = JSON.stringify(entry);
  isDirty = false;

  document.getElementById("editBadge").classList.remove("hidden");

  renderPreview();
  updateSaveButtonState();
  updateJSON();
}

// ---------------- CLEAR ----------------
function clearSelection() {
  selectedIndex = null;
  isDirty = false;
  originalEntry = null;

  titleInput.value = "";
  videoInput.value = "";
  dateInput.value = "";
  descriptionInput.value = "";

  techContainer.innerHTML = "";
  addTech();

  document.getElementById("editBadge").classList.add("hidden");

  updateJSON();
  updateSaveButtonState();
  renderPreview();
}

// ---------------- SAVE ----------------
function appendEntry() {
  const data = buildFormData();

  if (!data.title) {
    showStatus("Title required", false);
    return;
  }

  if (selectedIndex !== null && !isDirty) {
    showStatus("No changes to save", false);
    return;
  }

  pendingEntry = data;
  actionType = selectedIndex !== null ? "edit" : "add";

  document.getElementById("confirmJSON").textContent =
    JSON.stringify(pendingEntry, null, 2);

  document.querySelector("#confirmModal h3").textContent = "Confirm Save";

  document.getElementById("confirmModal").style.display = "flex";
}

// ---------------- DELETE ----------------
function deleteEntry() {
  if (selectedIndex === null) {
    showStatus("No entry selected to delete", false);
    return;
  }

  actionType = "delete";

  document.getElementById("confirmJSON").textContent =
    JSON.stringify(fileData[selectedIndex], null, 2);

  document.querySelector("#confirmModal h3").textContent = "Confirm Delete";

  document.getElementById("confirmModal").style.display = "flex";
}

// ---------------- CONFIRM ----------------
async function confirmAction() {
  try {
    if (!fileHandle) {
      showStatus("No file selected", false);
      return;
    }

    const writable = await fileHandle.createWritable();

    if (actionType === "edit") {
      fileData[selectedIndex] = pendingEntry;
    } 
    else if (actionType === "add") {
      fileData.push(pendingEntry);
    } 
    else if (actionType === "delete") {
      fileData.splice(selectedIndex, 1);
      selectedIndex = null;
    }

    await writable.write(JSON.stringify(fileData, null, 2));
    await writable.close();

    clearSelection();
    renderPreview();

    closeModal();

    showStatus(
      actionType === "delete"
        ? "Entry deleted successfully"
        : "File saved successfully",
      true
    );

  } catch {
    closeModal();
    showStatus("Error saving file", false);
  }
}

// ---------------- UI ----------------
function closeModal() {
  document.getElementById("confirmModal").style.display = "none";
}

// 🔥 FIXED STATUS SYSTEM
function showStatus(msg, ok) {
  setTimeout(() => {

    statusBox.style.display = "none";
    statusBox.className = "status";

    // FORCE REFLOW
    void statusBox.offsetHeight;

    statusBox.textContent = msg;
    statusBox.classList.add("show", ok ? "success" : "error");
    statusBox.style.display = "block";

    clearTimeout(statusBox._timer);

    statusBox._timer = setTimeout(() => {
      statusBox.classList.add("fade-out");

      setTimeout(() => {
        statusBox.style.display = "none";
        statusBox.className = "status";
      }, 500);

    }, 4000);

  }, 150);
}

// ---------------- INIT ----------------
addTech();
updateJSON();
updateSaveButtonState();
