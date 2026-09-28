const phases = [
    {
        id: "new",
        name: "New Moon",
        description: "A quiet beginning. There is room for something new.",
        cssClass: "moon-new"
    },
    {
        id: "waxing-crescent",
        name: "Waxing Crescent",
        description: "A little light returns, one small step at a time.",
        cssClass: "moon-waxing-crescent"
    },
    {
        id: "first-quarter",
        name: "First Quarter",
        description: "A moment to choose a direction and keep moving.",
        cssClass: "moon-first-quarter"
    },
    {
        id: "waxing-gibbous",
        name: "Waxing Gibbous",
        description: "A little more light than yesterday.",
        cssClass: "moon-waxing-gibbous"
    },
    {
        id: "full",
        name: "Full Moon",
        description: "A night to notice what has become clear.",
        cssClass: "moon-full"
    },
    {
        id: "waning-gibbous",
        name: "Waning Gibbous",
        description: "Some things become clearer when we begin to let go.",
        cssClass: "moon-waning-gibbous"
    },
    {
        id: "last-quarter",
        name: "Last Quarter",
        description: "A pause between what was and what comes next.",
        cssClass: "moon-last-quarter"
    },
    {
        id: "waning-crescent",
        name: "Waning Crescent",
        description: "A softer ending before the sky begins again.",
        cssClass: "moon-waning-crescent"
    }
];


let selectedPhase = "waxing-gibbous";
let selectedMood = "";

const storageKey = "moonJournalEntries";


const mainMoon = document.getElementById("mainMoon");
const phaseName = document.getElementById("phaseName");
const phaseDescription = document.getElementById("phaseDescription");
const phaseNumber = document.getElementById("phaseNumber");

const phaseSelector = document.getElementById("phaseSelector");

const journalForm = document.getElementById("journalForm");
const journalText = document.getElementById("journalText");

const moodButtons = document.querySelectorAll(".mood-button");

const entriesContainer = document.getElementById("entriesContainer");
const entryCount = document.getElementById("entryCount");

const saveMessage = document.getElementById("saveMessage");

const currentDate = document.getElementById("currentDate");


/* -----------------------------
   Current Date
----------------------------- */

function showCurrentDate() {

    const date = new Date();

    currentDate.textContent =
        date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).toUpperCase();
}


/* -----------------------------
   Moon Phase Selector
----------------------------- */

function renderPhaseSelector() {

    phaseSelector.innerHTML = "";

    phases.forEach((phase, index) => {

        const button = document.createElement("button");

        button.type = "button";

        button.className = "phase-option";

        if (phase.id === selectedPhase) {
            button.classList.add("selected");
        }

        button.innerHTML = `
            <div class="moon ${phase.cssClass}"></div>
            <div class="phase-label">${phase.name}</div>
        `;

        button.addEventListener("click", () => {

            selectPhase(phase.id);

        });

        phaseSelector.appendChild(button);
    });
}


/* -----------------------------
   Select Phase
----------------------------- */

function selectPhase(id) {

    const phase = phases.find(
        item => item.id === id
    );

    if (!phase) {
        return;
    }

    selectedPhase = id;

    const index = phases.indexOf(phase);

    phaseNumber.textContent =
        `${String(index + 1).padStart(2, "0")} / 08`;

    mainMoon.className =
        `moon ${phase.cssClass}`;

    phaseName.textContent =
        phase.name;

    phaseDescription.textContent =
        phase.description;

    renderPhaseSelector();
}


/* -----------------------------
   Mood Selection
----------------------------- */

moodButtons.forEach(button => {

    button.addEventListener("click", () => {

        moodButtons.forEach(item => {
            item.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedMood =
            button.dataset.mood;
    });

});


/* -----------------------------
   Local Storage
----------------------------- */

function getEntries() {

    try {

        const saved =
            localStorage.getItem(storageKey);

        if (!saved) {
            return [];
        }

        const entries =
            JSON.parse(saved);

        return Array.isArray(entries)
            ? entries
            : [];

    } catch (error) {

        console.error(
            "Unable to load entries:",
            error
        );

        return [];
    }
}


function saveEntries(entries) {

    localStorage.setItem(
        storageKey,
        JSON.stringify(entries)
    );
}


/* -----------------------------
   Date Formatting
----------------------------- */

function formatDate(dateString) {

    return new Date(dateString)
        .toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short"
        })
        .toUpperCase();
}


/* -----------------------------
   Escape User Text
----------------------------- */

function escapeHTML(text) {

    const element =
        document.createElement("div");

    element.textContent = text;

    return element.innerHTML;
}


/* -----------------------------
   Render Entries
----------------------------- */

function renderEntries() {

    const entries = getEntries();

    entriesContainer.innerHTML = "";

    entryCount.textContent =
        `${entries.length} ${entries.length === 1 ? "ENTRY" : "ENTRIES"}`;


    if (entries.length === 0) {

        entriesContainer.innerHTML = `
            <p class="empty-message">
                Your night notes will appear here.
            </p>
        `;

        return;
    }


    /*
       Only show the latest three entries.
       This keeps the entire interface inside
       the laptop viewport.
    */

    entries.slice(0, 3).forEach(entry => {

        const article =
            document.createElement("article");

        article.className = "entry";

        article.innerHTML = `

            <div class="entry-date">
                ${formatDate(entry.date)}
            </div>

            <div class="entry-content">

                <div class="entry-meta">
                    ${escapeHTML(entry.phase)}
                    ${entry.mood
                        ? ` · ${escapeHTML(entry.mood)}`
                        : ""}
                </div>

                <div class="entry-text">
                    ${escapeHTML(entry.text)}
                </div>

            </div>

            <button
                class="delete-entry"
                type="button"
                data-id="${entry.id}"
            >
                Delete
            </button>
        `;

        entriesContainer.appendChild(article);
    });


    document
        .querySelectorAll(".delete-entry")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteEntry(
                        button.dataset.id
                    );

                }
            );

        });
}


/* -----------------------------
   Delete Entry
----------------------------- */

function deleteEntry(id) {

    const entries = getEntries();

    const updated =
        entries.filter(
            entry => entry.id !== id
        );

    saveEntries(updated);

    renderEntries();
}


/* -----------------------------
   Save Journal
----------------------------- */

journalForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const text =
            journalText.value.trim();


        if (!text) {

            showMessage(
                "Write something first."
            );

            journalText.focus();

            return;
        }


        const phase =
            phases.find(
                item => item.id === selectedPhase
            );


        const entry = {

            id: Date.now().toString(),

            date:
                new Date().toISOString(),

            phase:
                phase.name,

            mood:
                selectedMood,

            text:
                text
        };


        const entries =
            getEntries();

        entries.unshift(entry);

        saveEntries(entries);

        renderEntries();


        journalText.value = "";

        selectedMood = "";

        moodButtons.forEach(
            button =>
                button.classList.remove("selected")
        );


        showMessage("Entry saved.");
    }
);


/* -----------------------------
   Save Message
----------------------------- */

function showMessage(message) {

    saveMessage.textContent = message;

    clearTimeout(showMessage.timeout);

    showMessage.timeout =
        setTimeout(() => {

            saveMessage.textContent = "";

        }, 2500);
}


/* -----------------------------
   Initialize
----------------------------- */

showCurrentDate();

selectPhase(selectedPhase);

renderEntries();