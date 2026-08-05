/******************************************************************************
 *
 * File: content-manager.js
 * Author: Tango Hunter
 *
 * Description:
 * Generic JSON Content Manager used to edit all JSON driven content
 * throughout the Tango Hunter website.
 *
 ******************************************************************************/

//==============================================================================
// DOM REFERENCES
//==============================================================================

const DOM = {

    applicationButtons: document.getElementById("applicationButtons"),

    applicationTitle: document.getElementById("applicationTitle"),
    applicationDescription: document.getElementById("applicationDescription"),

    applicationInfo: document.getElementById("applicationInfo"),
    fileSection: document.getElementById("fileSection"),
    editorSection: document.getElementById("editorSection"),
    previewSection: document.getElementById("previewSection"),
    actionSection: document.getElementById("actionSection"),
    filePreview: document.getElementById("filePreview"),

    selectedFile: document.getElementById("selectedFile"),
    selectFileBtn: document.getElementById("selectFileBtn"),

    form: document.getElementById("json-form"),

    output: document.getElementById("output"),
    fileOutput: document.getElementById("fileOutput"),

    editBadge: document.getElementById("editBadge"),

    saveBtn: document.getElementById("saveBtn"),
    deleteBtn: document.getElementById("deleteBtn"),
    clearBtn: document.getElementById("clearBtn"),

    status: document.getElementById("status"),

    confirmModal: document.getElementById("confirmModal"),
    confirmJSON: document.getElementById("confirmJSON"),
    confirmBtn: document.getElementById("confirmBtn"),
    cancelBtn: document.getElementById("cancelBtn")

};


//==============================================================================
// APPLICATION STATE
//==============================================================================

const APP = {

    schema: null,

    fileHandle: null,

    fileData: [],

    selectedIndex: null,

    pendingEntry: null,

    actionType: null,

    isDirty: false,

    originalEntry: null

};


//==============================================================================
// INITIALIZATION
//==============================================================================

initialize();

function initialize() {

    registerEvents();

    hideEditor();

}


//==============================================================================
// EVENT REGISTRATION
//==============================================================================

function registerEvents() {

    //----------------------------------------------------------
    // Application Buttons
    //----------------------------------------------------------

    document
        .querySelectorAll(".application-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                selectApplication(button.dataset.schema);

            });

        });

    //----------------------------------------------------------
    // File Selection
    //----------------------------------------------------------

    DOM.selectFileBtn.addEventListener(
        "click",
        selectJsonFile
    );

    //----------------------------------------------------------
    // CRUD
    //----------------------------------------------------------

    DOM.saveBtn.addEventListener(
        "click",
        saveEntry
    );

    DOM.deleteBtn.addEventListener(
        "click",
        deleteEntry
    );

    DOM.clearBtn.addEventListener(
        "click",
        clearSelection
    );

    //----------------------------------------------------------
    // Modal
    //----------------------------------------------------------

    DOM.confirmBtn.addEventListener(
        "click",
        confirmAction
    );

    DOM.cancelBtn.addEventListener(
        "click",
        closeModal
    );

}


//==============================================================================
// APPLICATION SELECTION
//==============================================================================

function selectApplication(schemaId) {

    //----------------------------------------------------------
    // Load Schema
    //----------------------------------------------------------

    APP.schema = SCHEMAS[schemaId];

    if (!APP.schema) {

        console.error(`Unknown schema: ${schemaId}`);

        return;

    }

    //----------------------------------------------------------
    // Reset State
    //----------------------------------------------------------

    APP.fileHandle = null;
    APP.fileData = [];

    APP.selectedIndex = null;

    APP.pendingEntry = null;
    APP.actionType = null;

    APP.isDirty = false;
    APP.originalEntry = null;

    //----------------------------------------------------------
    // Update Header
    //----------------------------------------------------------

    DOM.applicationTitle.textContent =
        APP.schema.applicationTitle;

    DOM.applicationDescription.textContent =
        APP.schema.applicationDescription;

    //----------------------------------------------------------
    // Reset File Status
    //----------------------------------------------------------

    DOM.selectedFile.textContent =
        "No file selected.";

    //----------------------------------------------------------
    // Clear Existing UI
    //----------------------------------------------------------

    DOM.form.innerHTML = "";

    DOM.output.textContent = "{}";

    DOM.fileOutput.innerHTML = `
        <p class="placeholder">
            Select a JSON file to begin.
        </p>
    `;

    //----------------------------------------------------------
    // Update Active Button
    //----------------------------------------------------------

    document
        .querySelectorAll(".application-btn")
        .forEach(button => {

            button.classList.remove("active");

            if (button.dataset.schema === schemaId) {

                button.classList.add("active");

            }

        });

    //----------------------------------------------------------
    // Reveal Sections
    //----------------------------------------------------------

    DOM.applicationInfo.classList.remove("hidden");

    DOM.fileSection.classList.remove("hidden");

    DOM.editorSection.classList.add("hidden");
    DOM.previewSection.classList.add("hidden");
    DOM.actionSection.classList.add("hidden");
    DOM.filePreview.classList.add("hidden");

}


//==============================================================================
// UI HELPERS
//==============================================================================

function hideEditor() {

    DOM.applicationInfo.classList.add("hidden");
    DOM.fileSection.classList.add("hidden");
    DOM.editorSection.classList.add("hidden");
    DOM.previewSection.classList.add("hidden");
    DOM.actionSection.classList.add("hidden");
    DOM.filePreview.classList.add("hidden");

}


//==============================================================================
// SHOW EDITOR
//==============================================================================

function showEditor() {

    DOM.editorSection.classList.remove("hidden");

    DOM.previewSection.classList.remove("hidden");

    DOM.actionSection.classList.remove("hidden");

    DOM.filePreview.classList.remove("hidden");

}


//==============================================================================
// FORM GENERATION
//==============================================================================

function generateForm() {

    DOM.form.innerHTML = "";

    APP.schema.template.forEach(field => {

        DOM.form.appendChild(createField(field));

    });

}


//==============================================================================
// FIELD FACTORY
//==============================================================================

function createField(field) {

    switch (field.type) {

        case "text":
        case "url":
        case "date":
            return createInputField(field);

        case "textarea":
            return createTextareaField(field);

        case "select":
            return createSelectField(field);

        case "array":
            return createArrayField(field);

        default:

            console.warn(
                `Unknown field type: ${field.type}`
            );

            return document.createElement("div");

    }

}


//==============================================================================
// INPUT
//==============================================================================

function createInputField(field) {

    const wrapper = document.createElement("div");

    wrapper.className = field.class;

    const label = document.createElement("label");

    label.textContent = field.label;

    const input = document.createElement("input");

    input.type = field.type;

    input.id = field.id;

    input.placeholder = field.placeholder ?? "";

    input.value = field.default;

    wrapper.appendChild(label);

    wrapper.appendChild(input);

    return wrapper;

}


//==============================================================================
// TEXTAREA
//==============================================================================

function createTextareaField(field) {

    const wrapper = document.createElement("div");

    wrapper.className = field.class;

    const label = document.createElement("label");

    label.textContent = field.label;

    const textarea = document.createElement("textarea");

    textarea.id = field.id;

    textarea.placeholder = field.placeholder ?? "";

    textarea.value = field.default;

    wrapper.appendChild(label);

    wrapper.appendChild(textarea);

    return wrapper;

}


//==============================================================================
// SELECT
//==============================================================================

function createSelectField(field) {

    const wrapper = document.createElement("div");

    wrapper.className = field.class;

    const label = document.createElement("label");

    label.textContent = field.label;

    const select = document.createElement("select");

    select.id = field.id;

    //----------------------------------------------------------
    // Blank Option
    //----------------------------------------------------------

    const blankOption = document.createElement("option");

    blankOption.value = "";

    blankOption.textContent = "-- Select --";

    select.appendChild(blankOption);

    //----------------------------------------------------------
    // Options
    //----------------------------------------------------------

    field.options.forEach(option => {

        const element = document.createElement("option");

        element.value = option.value;

        element.textContent = option.label;

        select.appendChild(element);

    });

    select.value = field.default;

    wrapper.appendChild(label);

    wrapper.appendChild(select);

    return wrapper;

}


//==============================================================================
// ARRAY
//==============================================================================

function createArrayField(field) {

    const wrapper = document.createElement("div");

    wrapper.className = field.class;

    const heading = document.createElement("h3");

    heading.textContent = field.label;

    const container = document.createElement("div");

    container.id = `${field.id}Container`;

    const button = document.createElement("button");

    button.type = "button";

    button.className = field.addButton.class;

    button.textContent = field.addButton.text;

    button.addEventListener("click", () => {

        addArrayRow(field);

        updatePreview();

    });

    wrapper.appendChild(heading);

    wrapper.appendChild(container);

    wrapper.appendChild(button);

    addArrayRow(field, null, container);

    return wrapper;

}


//==============================================================================
// ARRAY ROW
//==============================================================================

function addArrayRow(field, data = null, container = null) {

    if (!container) {

        container =
            document.getElementById(
                `${field.id}Container`
            );

    }

    const row = document.createElement("div");

    row.className = "array-row";

    field.template.forEach(item => {

        let element;

        if (item.type === "textarea") {

            element = document.createElement("textarea");

        }
        else {

            element = document.createElement("input");

            element.type = item.type;

        }

        element.dataset.field = item.id;

        element.placeholder =
            item.placeholder ?? "";

        element.className = item.class;

        element.value =
            data?.[item.id]
            ??
            item.default;

        row.appendChild(element);

    });

    const removeButton =
        document.createElement("button");

    removeButton.type = "button";

    removeButton.className =
        field.removeButton.class;

    removeButton.textContent =
        field.removeButton.text;

    removeButton.addEventListener("click", () => {

        row.remove();

        updatePreview();

    });

    row.appendChild(removeButton);

    container.appendChild(row);

}


//==============================================================================
// PREVIEW
//==============================================================================

function updatePreview() {

    DOM.output.textContent =
        JSON.stringify(
            buildEntry(),
            null,
            2
        );

}


//==============================================================================
// BUILD ENTRY
//==============================================================================

function buildEntry() {

    const entry = {};

    APP.schema.template.forEach(field => {

        //------------------------------------------------------
        // Arrays
        //------------------------------------------------------

        if (field.type === "array") {

            const array = buildArray(field);

            if (array.length > 0) {

                entry[field.id] = array;

            }

            return;

        }

        //------------------------------------------------------
        // Standard Fields
        //------------------------------------------------------

        const value =
            document
                .getElementById(field.id)
                .value
                .trim();

        if (value !== "") {

            entry[field.id] = value;

        }

    });

    return entry;

}


//==============================================================================
// BUILD ARRAY
//==============================================================================

function buildArray(field) {

    const container =
        document.getElementById(
            `${field.id}Container`
        );

    const rows =
        [...container.querySelectorAll(".array-row")];

    return rows
        .map(row => {

            //--------------------------------------------------
            // Single Field Array
            //--------------------------------------------------

            if (field.template.length === 1) {

                const value =
                    row
                        .querySelector("[data-field]")
                        .value
                        .trim();

                return value === ""
                    ? null
                    : value;

            }

            //--------------------------------------------------
            // Object Array
            //--------------------------------------------------

            const object = {};

            field.template.forEach(item => {

                const value =
                    row
                        .querySelector(
                            `[data-field="${item.id}"]`
                        )
                        .value
                        .trim();

                if (value !== "") {

                    object[item.id] = value;

                }

            });

            return Object.keys(object).length === 0
                ? null
                : object;

        })

        //------------------------------------------------------
        // Remove Empty Entries
        //------------------------------------------------------

        .filter(item => item !== null);

}


//==============================================================================
// FORM EVENTS
//==============================================================================

function enableFormEvents() {

    DOM.form.oninput = () => {

        updatePreview();

        if (APP.selectedIndex !== null) {

            APP.isDirty =
                JSON.stringify(buildEntry()) !== APP.originalEntry;

        }

        updateSaveButtonState();

    };

}


//==============================================================================
// FILE SELECTION
//==============================================================================

async function selectJsonFile() {

    if (!APP.schema) {

        showStatus(
            "Select a content type first.",
            "warning"
        );

        return;

    }

    try {

        //----------------------------------------------------------
        // Select File
        //----------------------------------------------------------

        [APP.fileHandle] =
            await window.showOpenFilePicker({

                types: [

                    {

                        description: "JSON Files",

                        accept: {

                            "application/json": [".json"]

                        }

                    }

                ]

            });

        //----------------------------------------------------------
        // Display File Name
        //----------------------------------------------------------

        DOM.selectedFile.textContent =
            APP.fileHandle.name;

        //----------------------------------------------------------
        // Read File
        //----------------------------------------------------------

        const file =
            await APP.fileHandle.getFile();

        let parsed =
            JSON.parse(
                await file.text()
            );

        if (!Array.isArray(parsed)) {

            parsed = [parsed];

        }

        APP.fileData = parsed;

        validateSelectedFile();

        //----------------------------------------------------------
        // Build Editor
        //----------------------------------------------------------

        generateForm();

        enableFormEvents();

        updatePreview();

        renderFilePreview();

        updateSaveButtonState();

        showEditor();

        //----------------------------------------------------------
        // Ready
        //----------------------------------------------------------

        if (validateSelectedFile()) {

            showStatus(
                "JSON file loaded successfully.",
                "success"
            );

        }
        else {

            showStatus(

                `You selected "${APP.fileHandle.name}", but this editor expects "${APP.schema.jsonFile}".`,

                "warning"

            );

        }

    }

    catch (error) {

        console.error(error);

        showStatus(
            error.message,
            "error"
        );

    }

}


//==============================================================================
// FILE PREVIEW
//==============================================================================

function renderFilePreview() {

    DOM.fileOutput.innerHTML = "";

    if (APP.fileData.length === 0) {

        DOM.fileOutput.innerHTML = `

            <p class="placeholder">

                No entries found.

            </p>

        `;

        return;

    }

    APP.fileData.forEach((entry, index) => {

        const card =
            createPreviewCard(
                entry,
                index
            );

        DOM.fileOutput.appendChild(card);

    });

}


//==============================================================================
// REFRESH UI
//==============================================================================

function refreshUI() {

    renderFilePreview();

    updatePreview();

    updateSaveButtonState();

}

//==============================================================================
// REFRESH FILE LIST
//==============================================================================

function refreshFileList() {

    renderFilePreview();

    updateSaveButtonState();

}


//==============================================================================
// PREVIEW CARD
//==============================================================================

function createPreviewCard(entry, index) {

    const card =
        document.createElement("div");

    card.className = "entry";

    if (index === APP.selectedIndex) {

        card.classList.add("selected");

    }

    //----------------------------------------------------------
    // Build Summary
    //----------------------------------------------------------

    let html = "";

    APP.schema.template.forEach(field => {

        if (field.type === "array") {

            return;

        }

        if (!entry[field.id]) {

            return;

        }

        html += `
            <strong>${entry[field.id]}</strong><br>
        `;

    });

    card.innerHTML = html;

    //----------------------------------------------------------
    // Click Event
    //----------------------------------------------------------

    card.addEventListener("click", () => {

        selectEntry(index);

    });

    return card;

}


//==============================================================================
// SELECT ENTRY
//==============================================================================

function selectEntry(index) {

    APP.selectedIndex = index;

    const entry =
        APP.fileData[index];

    APP.schema.template.forEach(field => {

        //------------------------------------------------------
        // Arrays
        //------------------------------------------------------

        if (field.type === "array") {

            const container =
                document.getElementById(
                    `${field.id}Container`
                );

            container.innerHTML = "";

            entry[field.id].forEach(item => {

                if (
                    typeof item === "string"
                ) {

                    addArrayRow(
                        field,
                        {

                            note: item

                        }
                    );

                }

                else {

                    addArrayRow(
                        field,
                        item
                    );

                }

            });

        }

        //------------------------------------------------------
        // Standard Fields
        //------------------------------------------------------

        else {

            const element =
                document.getElementById(field.id);

            element.value =
                entry[field.id] ?? "";

        }

    });

    APP.originalEntry =
        JSON.stringify(entry);

    APP.isDirty = false;

    DOM.editBadge.classList.remove(
        "hidden"
    );

    updatePreview();

    renderFilePreview();

    updateSaveButtonState();

}


//==============================================================================
// CLEAR
//==============================================================================

function clearSelection() {

    APP.selectedIndex = null;

    APP.isDirty = false;

    APP.originalEntry = null;

    DOM.editBadge.classList.add("hidden");

    APP.schema.template.forEach(field => {

        //------------------------------------------------------
        // Array Fields
        //------------------------------------------------------

        if (field.type === "array") {

            const container =
                document.getElementById(
                    `${field.id}Container`
                );

            container.innerHTML = "";

            addArrayRow(field);

        }

        //------------------------------------------------------
        // Standard Fields
        //------------------------------------------------------

        else {

            const element =
                document.getElementById(field.id);

            element.value =
                field.default ?? "";

        }

    });

    updatePreview();

    renderFilePreview();

    updateSaveButtonState();

}


//==============================================================================
// SAVE
//==============================================================================

function saveEntry() {

    APP.pendingEntry = buildEntry();

    APP.actionType =
        APP.selectedIndex === null
            ? "create"
            : "update";

    DOM.confirmJSON.textContent =
        JSON.stringify(
            APP.pendingEntry,
            null,
            2
        );

    openModal();

}


//==============================================================================
// DELETE
//==============================================================================

function deleteEntry() {

    if (APP.selectedIndex === null) {

        showStatus(
            "No entry selected.",
            "warning"
        );

        return;

    }

    APP.actionType = "delete";

    DOM.confirmJSON.textContent =
        JSON.stringify(
            APP.fileData[APP.selectedIndex],
            null,
            2
        );

    openModal();

}


//==============================================================================
// CONFIRM
//==============================================================================

async function confirmAction() {

    switch (APP.actionType) {

        case "create":

            APP.fileData.unshift(APP.pendingEntry);

            APP.selectedIndex = 0;

            break;

        case "update":

            APP.fileData[APP.selectedIndex] =
                APP.pendingEntry;

            break;

        case "delete":

            APP.fileData.splice(
                APP.selectedIndex,
                1
            );

            await writeJsonFile();

            closeModal();

            clearSelection();

            renderFilePreview();

            showStatus(
                "Entry deleted successfully.",
                "success"
            );

            return;

    }

    APP.originalEntry =
        JSON.stringify(APP.pendingEntry);

    APP.isDirty = false;

    await writeJsonFile();

    closeModal();

    refreshFileList();

    showStatus(
        APP.actionType === "create"
            ? "Entry created successfully."
            : "Entry updated successfully.",
        "success"
    );

}


//==============================================================================
// WRITE FILE
//==============================================================================

async function writeJsonFile() {

    const writable =
        await APP.fileHandle.createWritable();

    await writable.write(
        JSON.stringify(
            APP.fileData,
            null,
            2
        )
    );

    await writable.close();

}


//==============================================================================
// MODAL
//==============================================================================

function openModal() {

    DOM.confirmModal.style.display = "flex";

}


function closeModal() {

    DOM.confirmModal.style.display = "none";

}


//==============================================================================
// STATUS
//==============================================================================

let statusTimer = null;

function showStatus(message, type = "success") {

    clearTimeout(statusTimer);

    DOM.status.textContent = message;

    //----------------------------------------------------------
    // Reset Classes
    //----------------------------------------------------------

    DOM.status.className = "status";

    DOM.status.classList.add("show");

    DOM.status.classList.add(type);

    //----------------------------------------------------------
    // Auto Hide
    //----------------------------------------------------------

    statusTimer = setTimeout(() => {

        DOM.status.classList.add("fade-out");

        setTimeout(() => {

            DOM.status.className = "status";

        }, 300);

    }, 3000);

}


//==============================================================================
// SAVE BUTTON
//==============================================================================

function updateSaveButtonState() {

    if (!APP.fileHandle) {

        DOM.saveBtn.disabled = true;

        DOM.deleteBtn.disabled = true;

        return;

    }

    DOM.saveBtn.disabled = false;

    DOM.deleteBtn.disabled =
        APP.selectedIndex === null;

}


//==============================================================================
// DIRTY STATE
//==============================================================================

function markDirty() {

    APP.isDirty = true;

    updateSaveButtonState();

}


function clearDirty() {

    APP.isDirty = false;

    updateSaveButtonState();

}


//==============================================================================
// FILE NAME VALIDATION
//==============================================================================

function validateSelectedFile() {

    if (!APP.fileHandle || !APP.schema) {

        return true;

    }

    const expected =
        APP.schema.jsonFile
            .split("/")
            .pop();

    const selected =
        APP.fileHandle.name;

    return expected === selected;

}


//==============================================================================
// APPLICATION RESET
//==============================================================================

function resetApplication() {

    APP.fileHandle = null;

    APP.fileData = [];

    APP.selectedIndex = null;

    APP.pendingEntry = null;

    APP.actionType = null;

    APP.originalEntry = null;

    APP.isDirty = false;

    DOM.selectedFile.textContent =
        "No file selected.";

    DOM.output.textContent = "{}";

    DOM.fileOutput.innerHTML = `
        <p class="placeholder">
            Select a JSON file to begin.
        </p>
    `;

    DOM.form.innerHTML = "";

    DOM.editBadge.classList.add(
        "hidden"
    );

}


//==============================================================================
// WINDOW EVENTS
//==============================================================================

window.addEventListener("beforeunload", event => {

    if (!APP.isDirty) {

        return;

    }

    event.preventDefault();

    event.returnValue = "";

});


//==============================================================================
// STARTUP
//==============================================================================

console.log(

    "Content Manager initialized."

);
