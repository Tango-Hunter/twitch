/**
 * Title: updates-app.js
 * Author: Tango Hunter
 * Date Created: 7/27/2026
 * Description: CRUD editor for updates.json
 */

//======================================================
// DOM REFERENCES
//======================================================

const notesContainer = document.getElementById("notesContainer");
const output = document.getElementById("output");
const form = document.getElementById("jsonForm");
const statusBox = document.getElementById("status");
const fileOutput = document.getElementById("fileOutput");
const saveBtn = document.getElementById("saveBtn");

const versionInput = document.getElementById("version");
const titleInput = document.getElementById("title");
const dateInput = document.getElementById("date");
const summaryInput = document.getElementById("summary");

//======================================================
// STATE
//======================================================

let fileHandle = null;
let fileData = [];
let selectedIndex = null;

let pendingEntry = null;
let actionType = null;

let isDirty = false;
let originalEntry = null;

//======================================================
// SAVE BUTTON
//======================================================

function updateSaveButtonState() {

    saveBtn.disabled =
        selectedIndex !== null &&
        !isDirty;

}

//======================================================
// NOTES
//======================================================

function addNote(text = "") {

    const row = document.createElement("div");

    row.className = "note-row";

    row.innerHTML = `

        <textarea
            placeholder="Update Note">${text}</textarea>

        <button
            type="button"
            class="danger">

            X

        </button>

    `;

    row.querySelector("button").onclick = () => {

        row.remove();

        updateJSON();

    };

    notesContainer.appendChild(row);

}

//======================================================
// FORM DATA
//======================================================

function getNotes() {

    return [...document.querySelectorAll(".note-row textarea")]

        .map(t => t.value.trim())

        .filter(t => t.length);

}

function buildFormData() {

    return {

        version: versionInput.value.trim(),

        title: titleInput.value.trim(),

        date: dateInput.value,

        summary: summaryInput.value.trim(),

        notes: getNotes()

    };

}

function updateJSON() {

    output.textContent =

        JSON.stringify(

            buildFormData(),

            null,

            2

        );

}

form.addEventListener("input", () => {

    updateJSON();

    if (selectedIndex !== null) {

        isDirty =

            JSON.stringify(buildFormData())

            !==

            originalEntry;

    }

    updateSaveButtonState();

});

//======================================================
// FILE
//======================================================

async function openFile() {

    try {

        [fileHandle] =

            await window.showOpenFilePicker({

                types: [

                    {

                        description: "JSON Files",

                        accept: {

                            "application/json":

                            [".json"]

                        }

                    }

                ]

            });

        const file = await fileHandle.getFile();

        let parsed =

            JSON.parse(

                await file.text()

            );

        if (!Array.isArray(parsed))

            parsed = [parsed];

        fileData = parsed;

        renderPreview();

        showStatus(

            "File loaded",

            true

        );

    }

    catch {

        showStatus(

            "Error opening file",

            false

        );

    }

}

//======================================================
// PREVIEW
//======================================================

function renderPreview() {

    fileOutput.innerHTML = "";

    fileData.forEach((entry, index) => {

        const div = document.createElement("div");

        div.className = "entry";

        div.innerHTML = `

            <strong>${entry.version}</strong>

            <br>

            ${entry.title}

            <br>

            ${entry.date}

        `;

        if (index === selectedIndex)

            div.classList.add("selected");

        div.onclick = e => {

            e.stopPropagation();

            selectEntry(index);

        };

        fileOutput.appendChild(div);

    });

}

//======================================================
// SELECT
//======================================================

function selectEntry(index) {

    selectedIndex = index;

    const entry = fileData[index];

    versionInput.value = entry.version;

    titleInput.value = entry.title;

    dateInput.value = entry.date;

    summaryInput.value = entry.summary;

    notesContainer.innerHTML = "";

    entry.notes.forEach(addNote);

    originalEntry =

        JSON.stringify(entry);

    isDirty = false;

    document

        .getElementById("editBadge")

        .classList

        .remove("hidden");

    renderPreview();

    updateSaveButtonState();

    updateJSON();

}

//======================================================
// CLEAR
//======================================================

function clearSelection() {

    selectedIndex = null;

    isDirty = false;

    originalEntry = null;

    versionInput.value = "";

    titleInput.value = "";

    dateInput.value = "";

    summaryInput.value = "";

    notesContainer.innerHTML = "";

    addNote();

    document

        .getElementById("editBadge")

        .classList

        .add("hidden");

    updateJSON();

    updateSaveButtonState();

    renderPreview();

}

//======================================================
// SAVE
//======================================================

function appendEntry() {

    const data = buildFormData();

    if (!data.version) {

        showStatus(

            "Version required",

            false

        );

        return;

    }

    if (!data.title) {

        showStatus(

            "Title required",

            false

        );

        return;

    }

    if (

        selectedIndex !== null &&

        !isDirty

    ) {

        showStatus(

            "No changes to save",

            false

        );

        return;

    }

    pendingEntry = data;

    actionType =

        selectedIndex !== null

        ? "edit"

        : "add";

    document

        .getElementById("confirmJSON")

        .textContent =

        JSON.stringify(

            pendingEntry,

            null,

            2

        );

    document.querySelector(

        "#confirmModal h3"

    ).textContent =

        "Confirm Save";

    document

        .getElementById("confirmModal")

        .style.display = "flex";

}

//======================================================
// DELETE
//======================================================

function deleteEntry() {

    if (selectedIndex === null) {

        showStatus(

            "No update selected",

            false

        );

        return;

    }

    actionType = "delete";

    document

        .getElementById("confirmJSON")

        .textContent =

        JSON.stringify(

            fileData[selectedIndex],

            null,

            2

        );

    document.querySelector(

        "#confirmModal h3"

    ).textContent =

        "Confirm Delete";

    document

        .getElementById("confirmModal")

        .style.display = "flex";

}

//======================================================
// SORT
//======================================================
function sortUpdates() {

    fileData.sort((a, b) => {

        return new Date(b.date) - new Date(a.date);

    });
}

//======================================================
// CONFIRM
//======================================================

async function confirmAction() {

    try {

        if (!fileHandle) {

            showStatus(

                "No file selected",

                false

            );

            return;

        }

        const writable =

            await fileHandle.createWritable();

        if (actionType === "edit") {

            fileData[selectedIndex] = pendingEntry;

        }

        else if (actionType === "add") {

            fileData.push(pendingEntry);

        }

        else if (actionType === "delete") {

            fileData.splice(
                selectedIndex,
                1
            );

            selectedIndex = null;

        }

        sortUpdates();

        await writable.write(

            JSON.stringify(

                fileData,

                null,

                2

            )

        );

        await writable.close();

        clearSelection();

        renderPreview();

        closeModal();

        showStatus(

            actionType === "delete"

            ? "Update deleted"

            : "File saved",

            true

        );

    }

    catch {

        closeModal();

        showStatus(

            "Error saving file",

            false

        );

    }

}

//======================================================
// MODAL
//======================================================

function closeModal() {

    document

        .getElementById("confirmModal")

        .style.display = "none";

}

//======================================================
// STATUS
//======================================================

function showStatus(msg, ok) {

    setTimeout(() => {

        statusBox.style.display = "none";

        statusBox.className = "status";

        void statusBox.offsetHeight;

        statusBox.textContent = msg;

        statusBox.classList.add(

            "show",

            ok

            ? "success"

            : "error"

        );

        statusBox.style.display = "block";

        clearTimeout(statusBox._timer);

        statusBox._timer =

            setTimeout(() => {

                statusBox.classList.add(

                    "fade-out"

                );

                setTimeout(() => {

                    statusBox.style.display = "none";

                    statusBox.className = "status";

                }, 500);

            }, 4000);

    }, 150);

}

//======================================================
// INITIALIZATION
//======================================================

addNote();

updateJSON();

updateSaveButtonState();
