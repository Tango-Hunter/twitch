/******************************************************************************
 * Title: content-renderer.js
 * Author: Tango Hunter
 * Date Created: 8/2/26
 * Description:
 * Generic renderer used by the Tech Streams, SYNARA Updates,
 * SYNARA Features, and SYNARA Commands pages.
 ******************************************************************************/

/*==============================================================================
    CONFIGURATION
==============================================================================*/

/*
    Each HTML page must define CONTENT_TYPE before loading this file.

    Example:

    <script>
        const CONTENT_TYPE = "tech";
    </script>

    Supported values:

        tech
        updates
        features
        commands
*/

if (typeof CONTENT_TYPE === "undefined") {

    throw new Error(
        "CONTENT_TYPE was not defined before loading content-renderer.js."
    );

}

/*==============================================================================
    APPLICATION STATE
==============================================================================*/

const APP = {

    schema: null,

    data: [],

    filteredData: [],

    selectedFilters: [],

    currentItem: null

};

/*==============================================================================
    DOM REFERENCES
==============================================================================*/

const DOM = {

    //----------------------------------------------------------
    // Controls
    //----------------------------------------------------------

    contentSelect:
        document.getElementById("contentSelect"),

    filterContainer:
        document.getElementById("filterContainer"),

    filterMenu:
        document.getElementById("filterMenu"),

    sortContainer:
        document.getElementById("sortContainer"),

    sortMenu:
        document.getElementById("sortMenu"),

    //----------------------------------------------------------
    // Content
    //----------------------------------------------------------

    grid:
        document.getElementById("contentGrid"),

    //----------------------------------------------------------
    // Modal
    //----------------------------------------------------------

    modal:
        document.getElementById("contentModal"),

    modalContent:
        document.getElementById("modalContent"),

    closeModal:
        document.getElementById("closeModal")

};

/*==============================================================================
    INITIALIZATION
==============================================================================*/

document.addEventListener(
    "DOMContentLoaded",
    initialize
);

async function initialize() {

    console.log(
        `Initializing ${CONTENT_TYPE} renderer...`
    );

    //----------------------------------------------------------
    // Load Schema
    //----------------------------------------------------------

    APP.schema = SCHEMAS[CONTENT_TYPE];

    if (!APP.schema) {

        throw new Error(
            `Unknown content type: ${CONTENT_TYPE}`
        );

    }

    //----------------------------------------------------------
    // Load JSON
    //----------------------------------------------------------

    await loadData();

}

/*==============================================================================
    LOAD JSON
==============================================================================*/

async function loadData() {

    try {

        const response = await fetch(

            APP.schema.jsonUrl

        );

        if (!response.ok) {

            throw new Error(

                `Failed to load ${APP.schema.jsonFile}`

            );

        }

        const json = await response.json();

        APP.data = Array.isArray(json)
            ? json
            : [json];

        APP.filteredData = [...APP.data];

        //------------------------------------------------------
        // Initialize Page
        //------------------------------------------------------

        buildControls();

        renderGrid();

    }

    catch (error) {

        console.error(error);

        DOM.grid.innerHTML =

            `<p class="error">

                Unable to load content.

            </p>`;

    }

}

/*==============================================================================
    BUILD CONTROLS
==============================================================================*/

function buildControls() {

    buildContentSelector();

    buildFilterMenu();

    buildSortMenu();

    updateControlVisibility();

}

/*==============================================================================
    CONTENT SELECTOR
==============================================================================*/

function buildContentSelector() {

    DOM.contentSelect.innerHTML = "";

    //----------------------------------------------------------
    // Default Option
    //----------------------------------------------------------

    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";

    defaultOption.textContent =
        APP.schema.selectorPlaceholder ??
        "Jump To...";

    DOM.contentSelect.appendChild(defaultOption);

    //----------------------------------------------------------
    // Items
    //----------------------------------------------------------

    APP.data.forEach((item, index) => {

        const option =
            document.createElement("option");

        option.value = index;

        option.textContent =
            getPrimaryHeading(item);

        DOM.contentSelect.appendChild(option);

    });

}

/*==============================================================================
    FILTER MENU
==============================================================================*/

function buildFilterMenu() {

    DOM.filterMenu.innerHTML = "";

    if (!APP.schema.display.filters) {

        return;

    }

    const {

        field

    } = APP.schema.display.filters;

    const values = new Set();

    APP.data.forEach(item => {

        if (field === "tech") {

            (item.tech || []).forEach(tech =>

                values.add(tech.name)

            );

        }

        else if (item[field]) {

            values.add(item[field]);

        }

    });

    [...values]

        .sort()

        .forEach(value => {

            const label = document.createElement("label");

            const input = document.createElement("input");

            input.type = "checkbox";

            input.value = value;

            input.addEventListener(

                "change",

                handleFilterChange

            );

            label.appendChild(input);

            label.append(

                document.createTextNode(value)

            );

            DOM.filterMenu.appendChild(label);

        });

}

/*==============================================================================
    SORT MENU
==============================================================================*/

function buildSortMenu() {

    DOM.sortMenu.innerHTML = "";

    if (!APP.schema.display.sortBy) {

        return;

    }

    let options = [];

    if (APP.schema.display.sortBy === "date") {

        options = [

            {
                label: "Newest → Oldest",
                value: "newest"
            },

            {
                label: "Oldest → Newest",
                value: "oldest"
            }

        ];

    }

    else if (APP.schema.display.sortBy === "alpha") {

        options = [

            {
                label: "A → Z",
                value: "az"
            },

            {
                label: "Z → A",
                value: "za"
            }

        ];

    }

    options.forEach(option => {

        const item = document.createElement("div");

        item.dataset.sort = option.value;

        item.textContent = option.label;

        DOM.sortMenu.appendChild(item);

    });

}

/*==============================================================================
    CONTROL VISIBILITY
==============================================================================*/

function updateControlVisibility() {

    //----------------------------------------------------------
    // Filter Button
    //----------------------------------------------------------

    DOM.filterContainer.style.display =
        hasFilters()
            ? ""
            : "none";

    //----------------------------------------------------------
    // Sort Button
    //----------------------------------------------------------

    DOM.sortContainer.style.display =
        hasSortOptions()
            ? ""
            : "none";

}

/*==============================================================================
    CONTROL HELPERS
==============================================================================*/

function hasFilters() {

    return Boolean(

        APP.schema.display.filters

    );

}

function hasSortOptions() {

    return Boolean(APP.schema.display.sortBy);

}

/*==============================================================================
    PRIMARY HEADING
==============================================================================*/

function getPrimaryHeading(item) {

    const headingField =
        APP.schema.display.fields.find(field =>

            field.element === "h3"

        );

    if (!headingField) {

        return "Untitled";

    }

    return item[headingField.id] ?? "Untitled";

}

/*==============================================================================
    REFRESH CONTENT
==============================================================================*/

function refreshContent() {

    APP.filteredData = [...APP.data];

    applyFilters();

    applySorting();

    renderGrid();

}

/*==============================================================================
    FILTERING
==============================================================================*/

function applyFilters() {

    if (

        APP.selectedFilters.length === 0 ||

        !APP.schema.display.filters

    ) {

        return;

    }

    const {

        field

    } = APP.schema.display.filters;

    APP.filteredData = APP.filteredData.filter(item => {

        if (field === "tech") {

            return (item.tech || []).some(tech =>

                APP.selectedFilters.includes(

                    tech.name

                )

            );

        }

        return APP.selectedFilters.includes(

            item[field]

        );

    });

}

/*==============================================================================
    FILTER EVENTS
==============================================================================*/

function handleFilterChange() {

    APP.selectedFilters = [

        ...DOM.filterMenu.querySelectorAll(
            "input:checked"
        )

    ].map(input => input.value);

    refreshContent();

}

/*==============================================================================
    SORTING
==============================================================================*/

function applySorting() {

    const active =
        DOM.sortMenu.querySelector(
            "[data-active='true']"
        );

    if (!active) {

        return;

    }

    const direction =
        active.dataset.sort;

    //----------------------------------------------------------
    // Alphabetical
    //----------------------------------------------------------

    if (
        direction === "az" ||
        direction === "za"
    ) {

        APP.filteredData.sort((a, b) => {

            const first =
                getPrimaryHeading(a);

            const second =
                getPrimaryHeading(b);

            return direction === "az"

                ? first.localeCompare(second)

                : second.localeCompare(first);

        });

        return;

    }

    //----------------------------------------------------------
    // Date
    //----------------------------------------------------------

    APP.filteredData.sort((a, b) => {

        return direction === "newest"

            ? new Date(b.date) -
              new Date(a.date)

            : new Date(a.date) -
              new Date(b.date);

    });

}

/*==============================================================================
    GRID
==============================================================================*/

function renderGrid() {

    DOM.grid.innerHTML = "";

    //----------------------------------------------------------
    // No Results
    //----------------------------------------------------------

    if (APP.filteredData.length === 0) {

        const message =
            document.createElement("p");

        message.className =
            "empty-message";

        message.textContent =
            "No matching content found.";

        DOM.grid.appendChild(message);

        return;

    }

    //----------------------------------------------------------
    // Cards
    //----------------------------------------------------------

    APP.filteredData.forEach(item => {

        DOM.grid.appendChild(

            createCard(item)

        );

    });

}

/*==============================================================================
    CONTENT SELECTOR
==============================================================================*/

DOM.contentSelect.addEventListener(

    "change",

    event => {

        if (event.target.value === "") {

            return;

        }

        openModal(

            APP.data[
                Number(event.target.value)
            ]

        );

    }

);

/*==============================================================================
    SORT MENU
==============================================================================*/

DOM.sortMenu.addEventListener(

    "click",

    event => {

        if (!event.target.dataset.sort) {

            return;

        }

        DOM.sortMenu
            .querySelectorAll("[data-sort]")
            .forEach(item =>

                delete item.dataset.active

            );

        event.target.dataset.active = true;

        refreshContent();

    }

);

/*==============================================================================
    DROPDOWN TOGGLE
==============================================================================*/

document.querySelectorAll(

    ".icon-btn"

).forEach(button => {

    button.addEventListener(

        "click",

        () =>

            button.parentElement
                .classList
                .toggle("open")

    );

});

/*==============================================================================
    CLOSE DROPDOWNS
==============================================================================*/

document.addEventListener(

    "click",

    event => {

        if (
            event.target.closest(
                ".icon-dropdown"
            )
        ) {

            return;

        }

        document
            .querySelectorAll(
                ".icon-dropdown"
            )

            .forEach(dropdown =>

                dropdown.classList.remove(
                    "open"
                )

            );

    }

);

/*==============================================================================
    CARD
==============================================================================*/

function createCard(item) {

    const card =
        document.createElement("article");

    card.className = "card";

    APP.schema.display.fields.forEach(field => {

        //------------------------------------------------------
        // Skip Modal Only Fields
        //------------------------------------------------------

        if (!field.card) {

            return;

        }

        const element =
            renderField(
                field,
                item,
                true
            );

        if (element) {

            card.appendChild(element);

        }

    });

    card.addEventListener(

        "click",

        () => openModal(item)

    );

    return card;

}

/*==============================================================================
    FIELD RENDERER
==============================================================================*/

function renderField(
    field,
    item,
    isCard = false
) {

    const value = item[field.id];

    if (
        value === undefined ||
        value === null
    ) {

        return null;

    }

    switch (field.element) {

        case "h3":
            return renderHeading(
                value,
                field
            );

        case "p":
            return renderParagraph(
                value,
                field
            );

        case "date":
            return renderDate(
                value,
                field
            );

        case "badge":
            return renderBadge(
                value,
                field,
                isCard
            );

        case "thumbnail":

            return renderThumbnail(value);

        case "video":

            return renderVideo(value);

        case "tags":
            return renderTags(
                value
            );

        case "list":
            return renderList(
                value,
                field
            );

        case "section":
            return renderSection(
                value,
                field
            );

        default:

            console.warn(

                `Unsupported display element: ${field.element}`

            );

            return null;

    }

}

/*==============================================================================
    HEADING
==============================================================================*/

function renderHeading(
    value,
    field
) {

    const heading =
        document.createElement("h3");

    heading.className =
        field.class;

    heading.textContent = value;

    return heading;

}

/*==============================================================================
    PARAGRAPH
==============================================================================*/

function renderParagraph(
    value,
    field
) {

    const paragraph =
        document.createElement("p");

    paragraph.className =
        field.class;

    paragraph.textContent = value;

    return paragraph;

}

/*==============================================================================
    DATE
==============================================================================*/

function renderDate(
    value,
    field
) {

    const paragraph =
        document.createElement("p");

    paragraph.className =
        field.class;

    paragraph.textContent = value;

    return paragraph;

}

/*==============================================================================
    BADGE
==============================================================================*/

function renderBadge(
    value,
    field,
    isCard = false
) {

    const wrapper =
        document.createElement("div");

    wrapper.className = "badge-wrapper";

    //----------------------------------------------------------
    // Badge
    //----------------------------------------------------------

    const badge =
        document.createElement("div");

    badge.className = field.class;

    badge.textContent = value;

    wrapper.appendChild(badge);

    //----------------------------------------------------------
    // Cards only display the badge
    //----------------------------------------------------------

    if (isCard) {

        return wrapper;

    }

    //----------------------------------------------------------
    // Modal description
    //----------------------------------------------------------

    const option =
        APP.schema.template
            .find(item => item.id === field.id)
            ?.options
            ?.find(option => option.value === value);

    if (option?.description) {

        const description =
            document.createElement("p");

        description.className =
            "content-category-description";

        description.textContent =
            option.description;

        wrapper.appendChild(description);

    }

    return wrapper;

}

/*==============================================================================
    VIDEO THUMBNAIL
==============================================================================*/

function renderThumbnail(videoId) {

    const image = document.createElement("img");

    image.className = "thumbnail";

    image.src =
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    image.alt = "Video Thumbnail";

    image.loading = "lazy";

    return image;

}

/*==============================================================================
    VIDEO EMBED
==============================================================================*/

function renderVideo(videoId) {

    const container =
        document.createElement("div");

    container.className = "modal-video";

    const iframe =
        document.createElement("iframe");

    iframe.src =
        `https://www.youtube.com/embed/${videoId}?rel=0`;

    iframe.title = "YouTube Video Player";

    iframe.frameBorder = "0";

    iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

    iframe.referrerPolicy =
        "strict-origin-when-cross-origin";

    iframe.allowFullscreen = true;

    container.appendChild(iframe);

    return container;

}

/*==============================================================================
    TAGS
==============================================================================*/

function renderTags(tags) {

    const container =
        document.createElement("div");

    container.className =
        "technology-stack";

    tags.forEach(tag => {

        const link =
            document.createElement("a");

        link.className =
            "technology-tag";

        link.href = tag.link;

        link.target = "_blank";

        link.rel =
            "noopener noreferrer";

        link.textContent =
            tag.name;

        container.appendChild(link);

    });

    return container;

}

/*==============================================================================
    LIST
==============================================================================*/

function renderList(
    items,
    field
) {

    const container =
        document.createElement("div");

    container.className = field.class;

    //----------------------------------------------------------
    // Heading
    //----------------------------------------------------------

    const heading =
        document.createElement("h4");

    heading.className = "list-heading";

    heading.textContent = field.label;

    container.appendChild(heading);

    //----------------------------------------------------------
    // Items
    //----------------------------------------------------------

    items.forEach(item => {

        const row =
            document.createElement("div");

        row.className = "list-item";

        //------------------------------------------------------
        // Object
        //------------------------------------------------------

        if (typeof item === "object") {

            Object.entries(item).forEach(([key, value]) => {

                const paragraph =
                    document.createElement("p");

                paragraph.innerHTML =
                    `<strong>${capitalize(key)}:</strong> ${value}`;

                row.appendChild(paragraph);

            });

        }

        //------------------------------------------------------
        // Primitive
        //------------------------------------------------------

        else {

            row.textContent = item;

        }

        container.appendChild(row);

    });

    return container;

}

/*==============================================================================
    SECTION
==============================================================================*/

function renderSection(
    value,
    field
) {

    const section =
        document.createElement("section");

    section.className =
        field.class;

    if (field.heading) {

        const heading =
            document.createElement("h4");

        heading.textContent =
            field.heading;

        section.appendChild(heading);

    }

    const paragraph =
        document.createElement("p");

    paragraph.textContent =
        value;

    section.appendChild(paragraph);

    return section;

}

/*==============================================================================
    STRING HELPERS
==============================================================================*/

function capitalize(text) {

    if (!text) {

        return "";

    }

    return text.charAt(0).toUpperCase() +
           text.slice(1);

}

/*==============================================================================
    MODAL
==============================================================================*/

function openModal(item) {

    APP.currentItem = item;

    DOM.modalContent.innerHTML = "";

    const container = document.createElement("div");

    container.className = "modal-layout";

    //----------------------------------------------------------
    // Split Layout
    //----------------------------------------------------------

    if (APP.schema.display.layout === "split") {

        container.classList.add("modal-split");

        const left = document.createElement("div");

        left.className = "modal-left";

        const right = document.createElement("div");

        right.className = "modal-right";

        APP.schema.display.fields.forEach(field => {

            if (!field.modal) {

                return;

            }

            const element = renderField(field, item, false);

            if (!element) {

                return;

            }

            if (field.element === "video") {

                left.appendChild(element);

            }

            else {

                right.appendChild(element);

            }

        });

        container.appendChild(left);

        container.appendChild(right);

    }

    //----------------------------------------------------------
    // Standard Layout
    //----------------------------------------------------------

    else {

        APP.schema.display.fields.forEach(field => {

            if (!field.modal) {

                return;

            }

            const element = renderField(field, item, false);

            if (element) {

                container.appendChild(element);

            }

        });

    }

    DOM.modalContent.appendChild(container);

    DOM.modal.classList.add("active");

}

/*==============================================================================
    CLOSE MODAL
==============================================================================*/

function closeModal() {

    DOM.modal.classList.remove("active");

    DOM.modalContent.innerHTML = "";

    APP.currentItem = null;

}

/*==============================================================================
    MODAL EVENTS
==============================================================================*/

DOM.closeModal.addEventListener(

    "click",

    closeModal

);

DOM.modal.addEventListener(

    "click",

    event => {

        if (event.target === DOM.modal) {

            closeModal();

        }

    }

);

document.addEventListener(

    "keydown",

    event => {

        if (

            event.key === "Escape" &&
            DOM.modal.classList.contains("active")

        ) {

            closeModal();

        }

    }

);

/*==============================================================================
    FIND DISPLAY FIELD
==============================================================================*/

function getDisplayField(id) {

    return APP.schema.display.fields.find(

        field => field.id === id

    );

}
