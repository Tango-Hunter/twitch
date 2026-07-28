/**
 * Title: updates.js
 * Author: Tango Hunter
 * Date Created: 7/27/2026
 * Description: Displays SYNARA updates from updates.json.
 * Renders update cards and handles the update modal.
 */

//======================================================
// CONFIGURATION
//======================================================

const GITHUB_JSON_URL = "https://cdn.jsdelivr.net/gh/Tango-Hunter/twitch@main/assets/data/synara-updates.json";

//======================================================
// STATE
//======================================================

let updates = [];

//======================================================
// DOM REFERENCES
//======================================================

const grid = document.getElementById("grid");

const modal = document.getElementById("modal");

const modalContent = document.getElementById("modalContent");

const closeButton = document.getElementById("closeModal");

//======================================================
// INITIALIZATION
//======================================================

loadUpdates();

//======================================================
// LOAD JSON
//======================================================

async function loadUpdates() {

    try {

        const response = await fetch(
            GITHUB_JSON_URL + "?v=" + Date.now()
        );

        const json = await response.json();

        updates = Array.isArray(json)
            ? json
            : [json];

        updates.sort((a, b) => {

            return new Date(b.date) - new Date(a.date);

        });

        renderGrid();

    }

    catch (err) {

        console.error(err);

        grid.innerHTML =
            "<p style='color:red'>Unable to load updates.</p>";

    }
}

//======================================================
// RENDER GRID
//======================================================

function renderGrid() {

    grid.innerHTML = "";

    updates.forEach(update => {

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `

            <div class="card-body">

                <div class="card-version">

                    ${update.version}

                </div>

                <div class="card-title">

                    ${update.title}

                </div>

                <div class="card-date">

                    ${formatDate(update.date)}

                </div>

                <div class="card-summary">

                    ${update.summary}

                </div>

            </div>

        `;

        card.onclick = () => openModal(update);

        grid.appendChild(card);

    });
}

//======================================================
// OPEN MODAL
//======================================================

function openModal(update) {

    modal.classList.add("active");

    let notesHTML = "";

    update.notes.forEach(note => {

        notesHTML += `

            <div class="note">

                ${note}

            </div>

        `;

    });

    modalContent.innerHTML = `

        <h2>

            ${update.title}

        </h2>

        <p class="version">

            ${update.version}

        </p>

        <p class="date">

            ${formatDate(update.date)}

        </p>

        <p class="summary">

            ${update.summary}

        </p>

        <div class="notes">

            ${notesHTML}

        </div>

    `;

}

//======================================================
// CLOSE MODAL
//======================================================

closeButton.onclick = closeModal;

function closeModal() {

    modal.classList.remove("active");

    modalContent.innerHTML = "";

}

modal.onclick = e => {

    if (e.target === modal) {

        closeModal();

    }
};

//======================================================
// UTILITIES
//======================================================

function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString(

        "en-US",

        {

            year: "numeric",

            month: "long",

            day: "numeric"

        }
    );
}
