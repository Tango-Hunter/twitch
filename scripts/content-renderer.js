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

    //----------------------------------------------------------
    // Replace Native Select
    //----------------------------------------------------------

    const existing =
        DOM.contentSelect;

    let selector;

    if (
        existing &&
        existing.tagName === "SELECT"
    ) {

        selector =
            document.createElement("div");

        selector.id =
            "contentSelect";

        selector.className =
            "content-selector";

        existing.replaceWith(selector);

        DOM.contentSelect =
            selector;

    }

    else {

        selector =
            existing;

        selector.className =
            "content-selector";

        selector.innerHTML = "";

    }

    //----------------------------------------------------------
    // Selector Button
    //----------------------------------------------------------

    const button =
        document.createElement("button");

    button.type =
        "button";

    button.className =
        "content-selector-button";

    button.setAttribute(
        "aria-haspopup",
        "listbox"
    );

    button.setAttribute(
        "aria-expanded",
        "false"
    );

    //----------------------------------------------------------
    // Button Text
    //----------------------------------------------------------

    const buttonText =
        document.createElement("span");

    buttonText.className =
        "content-selector-text";

    buttonText.textContent =
        APP.schema.selectorPlaceholder ??
        "Jump To...";

    //----------------------------------------------------------
    // Arrow
    //----------------------------------------------------------

    const arrow =
        document.createElement("span");

    arrow.className =
        "content-selector-arrow";

    arrow.setAttribute(
        "aria-hidden",
        "true"
    );

    arrow.textContent = "⌄";

    button.appendChild(
        buttonText
    );

    button.appendChild(
        arrow
    );

    //----------------------------------------------------------
    // Menu
    //----------------------------------------------------------

    const menu =
        document.createElement("div");

    menu.className =
        "content-selector-menu";

    menu.setAttribute(
        "role",
        "listbox"
    );

    //----------------------------------------------------------
    // Default Option
    //----------------------------------------------------------

    const defaultOption =
        document.createElement("button");

    defaultOption.type =
        "button";

    defaultOption.className =
        "content-selector-option is-placeholder";

    defaultOption.setAttribute(
        "role",
        "option"
    );

    defaultOption.textContent =
        APP.schema.selectorPlaceholder ??
        "Jump To...";

    defaultOption.addEventListener(
        "click",
        () => {

            buttonText.textContent =
                APP.schema.selectorPlaceholder ??
                "Jump To...";

            closeContentSelector();

        }
    );

    menu.appendChild(
        defaultOption
    );

    //----------------------------------------------------------
    // Content Items
    //----------------------------------------------------------

    APP.data.forEach(
        (item, index) => {

            const option =
                document.createElement("button");

            option.type =
                "button";

            option.className =
                "content-selector-option";

            option.setAttribute(
                "role",
                "option"
            );

            option.dataset.index =
                index;

            option.textContent =
                getPrimaryHeading(item);

            option.addEventListener(
                "click",
                () => {

                    buttonText.textContent =
                        getPrimaryHeading(item);

                    closeContentSelector();

                    openModal(item);

                }
            );

            menu.appendChild(
                option
            );

        }
    );

    //----------------------------------------------------------
    // Assemble Selector
    //----------------------------------------------------------

    selector.appendChild(
        button
    );

    selector.appendChild(
        menu
    );

    //----------------------------------------------------------
    // Toggle
    //----------------------------------------------------------

    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            const isOpen =
                selector.classList.contains(
                    "open"
                );

            closeContentSelector();

            if (!isOpen) {

                selector.classList.add(
                    "open"
                );

                button.setAttribute(
                    "aria-expanded",
                    "true"
                );

                const firstOption =
                    menu.querySelector(
                        ".content-selector-option"
                    );

                if (firstOption) {

                    firstOption.focus();

                }

            }

        }
    );

}

/*==============================================================================
    CONTENT SELECTOR HELPERS
==============================================================================*/

function closeContentSelector() {

    const selector =
        DOM.contentSelect;

    if (!selector) {

        return;

    }

    selector.classList.remove(
        "open"
    );

    const button =
        selector.querySelector(
            ".content-selector-button"
        );

    if (button) {

        button.setAttribute(
            "aria-expanded",
            "false"
        );

    }

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

        //----------------------------------------------------------
        // Content Selector
        //----------------------------------------------------------

        if (
            event.target.closest(
                ".content-selector"
            )
        ) {

            return;

        }

        //----------------------------------------------------------
        // Existing Filter / Sort Dropdowns
        //----------------------------------------------------------

        if (
            event.target.closest(
                ".icon-dropdown"
            )
        ) {

            return;

        }

        //----------------------------------------------------------
        // Close Content Selector
        //----------------------------------------------------------

        closeContentSelector();

        //----------------------------------------------------------
        // Close Filter / Sort Menus
        //----------------------------------------------------------

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
    CONTENT SELECTOR KEYBOARD SUPPORT
==============================================================================*/

document.addEventListener(

    "keydown",

    event => {

        const selector =
            DOM.contentSelect;

        if (!selector) {

            return;

        }

        const button =
            selector.querySelector(
                ".content-selector-button"
            );

        const menu =
            selector.querySelector(
                ".content-selector-menu"
            );

        if (!button || !menu) {

            return;

        }

        //----------------------------------------------------------
        // Open / Close
        //----------------------------------------------------------

        if (
            event.key === "Enter" &&
            document.activeElement === button
        ) {

            event.preventDefault();

            button.click();

            return;

        }

        if (
            event.key === "Escape" &&
            selector.classList.contains("open")
        ) {

            event.preventDefault();

            closeContentSelector();

            button.focus();

            return;

        }

        //----------------------------------------------------------
        // Ignore Navigation When Closed
        //----------------------------------------------------------

        if (
            !selector.classList.contains("open")
        ) {

            return;

        }

        //----------------------------------------------------------
        // Menu Options
        //----------------------------------------------------------

        const options = [

            ...menu.querySelectorAll(
                ".content-selector-option"
            )

        ];

        if (!options.length) {

            return;

        }

        const currentIndex =
            options.indexOf(
                document.activeElement
            );

        //----------------------------------------------------------
        // Arrow Down
        //----------------------------------------------------------

        if (
            event.key === "ArrowDown"
        ) {

            event.preventDefault();

            const nextIndex =
                currentIndex < options.length - 1
                    ? currentIndex + 1
                    : 0;

            options[nextIndex].focus();

        }

        //----------------------------------------------------------
        // Arrow Up
        //----------------------------------------------------------

        else if (
            event.key === "ArrowUp"
        ) {

            event.preventDefault();

            const previousIndex =
                currentIndex > 0
                    ? currentIndex - 1
                    : options.length - 1;

            options[previousIndex].focus();

        }

        //----------------------------------------------------------
        // Home
        //----------------------------------------------------------

        else if (
            event.key === "Home"
        ) {

            event.preventDefault();

            options[0].focus();

        }

        //----------------------------------------------------------
        // End
        //----------------------------------------------------------

        else if (
            event.key === "End"
        ) {

            event.preventDefault();

            options[
                options.length - 1
            ].focus();

        }

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

    //----------------------------------------------------------
    // Section Heading
    //----------------------------------------------------------

    if (field.label) {

        const heading =
            document.createElement("h4");

        heading.className =
            "section-heading";

        heading.textContent =
            field.label;

        section.appendChild(heading);

    }

    //----------------------------------------------------------
    // Section Content
    //----------------------------------------------------------

    const lines =
        String(value)
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

    lines.forEach(line => {

        const paragraph =
            document.createElement("p");

        paragraph.textContent =
            line;

        section.appendChild(paragraph);

    });

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
