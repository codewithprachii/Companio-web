const app = document.getElementById("app");
const loadingPercentage = document.getElementById("loading-percentage");

let progress = 0;

const loadingTimer = setInterval(() => {
    progress++;

    loadingPercentage.textContent = `${progress}%`;

    if (progress >= 100) {
        clearInterval(loadingTimer);

        // Small pause after reaching 100%
        setTimeout(() => {
            showStayConnected();
        }, 400);
    }
}, 60);


function showStayConnected() {
    app.innerHTML = `
        <main class="onboarding-screen setup-choice-screen">

            <h1>Who are you setting<br>Companio up for?</h1>

            <p class="setup-subtitle">
                We'll personalise the experience for you
            </p>

            <div class="setup-options">

                <button class="setup-card" onclick="selectSetup('myself')">

                    <div class="setup-icon flower-icon">
                        🌼
                    </div>

                    <h2>Myself</h2>

                    <p>I'll be using Companio for me.</p>

                    <strong>
                        Set up your own profile → Patient experience
                    </strong>

                </button>

                <button class="setup-card someone-card"
                        onclick="selectSetup('someone')">

                    <div class="setup-icon heart-icon">
                        ❤️
                    </div>

                    <h2>Someone Else</h2>

                    <p>I'm a caregiver setting it up for someone.</p>

                    <strong>
                        Caregiver setup · Dashboard · Monitor progress
                    </strong>

                </button>

            </div>

        </main>
    `;
}


let setupFor = "";

function selectSetup(type) {
    setupFor = type;
    showPatientInfo();
}


function nextScreen() {
    showOfflineScreen();
}


function showOfflineScreen() {
    app.innerHTML = `
        <main class="onboarding-screen">

            <div class="onboarding-icon offline-icon">
                📡
            </div>

            <h1>Works Even Offline</h1>

            <p class="onboarding-description">
                Essential features continue without
                internet. Data syncs automatically
                when connectivity returns.
            </p>

            <div class="page-dots">
                <span class="dot"></span>
                <span class="dot active"></span>
                <span class="dot"></span>
            </div>

            <button class="primary-button" onclick="showSetupScreen()">
                Get Started
            </button>

        </main>
    `;
}


function showSetupScreen() {
    app.innerHTML = `
        <main class="onboarding-screen setup-choice-screen">

            <h1>Who are you setting<br>Companio up for?</h1>

            <p class="setup-subtitle">
                We'll personalise the experience for you
            </p>

            <div class="setup-options">

                <button class="setup-card"
                        onclick="selectSetup('myself')">

                    <div class="setup-icon flower-icon">
                        🌼
                    </div>

                    <h2>Myself</h2>

                    <p>
                        I'll be using Companio for me.
                    </p>

                    <strong>
                        Set up your own profile → Patient experience
                    </strong>

                </button>


                <button class="setup-card someone-card"
                        onclick="selectSetup('someone')">

                    <div class="setup-icon heart-icon">
                        ❤️
                    </div>

                    <h2>Someone Else</h2>

                    <p>
                        I'm a caregiver setting it up for someone.
                    </p>

                    <strong>
                        Caregiver setup · Dashboard · Monitor progress
                    </strong>

                </button>

            </div>

        </main>
    `;
}

function showPatientInfo() {
    app.innerHTML = `
        <main class="form-screen">

            <div class="screen-header">
                <span class="back-button" onclick="showSetupScreen()">←</span>

                <div>
                    <p class="step-label">STEP 1 OF 5</p>
                    <h1>Patient's Name & Age</h1>
                </div>
            </div>

            <div class="form-content">

                <label for="patient-name">
                    Full name
                </label>

                <input
                    id="patient-name"
                    type="text"
                    placeholder="e.g. Ravi Kumar Sharma"
                >

                <label for="patient-age">
                    Age
                </label>

                <input
                    id="patient-age"
                    type="number"
                    placeholder="e.g. 72"
                >

            </div>

            <button class="primary-button form-next"
                    onclick="continueAfterPatientInfo()">
                Next →
            </button>

        </main>
    `;
}

function continueAfterPatientInfo() {
    if (setupFor === "someone") {
        showCaregiverInfo();
    } else {
        showEmergencyContact();
    }
}

function showCaregiverInfo() {
    app.innerHTML = `
        <main class="form-screen">

            <div class="screen-header">
                <span class="back-button" onclick="showPatientInfo()">←</span>

                <div>
                    <p class="step-label">STEP 2 OF 5</p>
                    <h1>Caregiver Details</h1>
                </div>
            </div>

            <div class="form-content">

                <label for="caregiver-name">
                    Primary caregiver name
                </label>

                <input
                    id="caregiver-name"
                    type="text"
                    placeholder="e.g. Ananya Sharma"
                >

                <label for="relationship">
                    Relationship with patient
                </label>

                <input
                    id="relationship"
                    type="text"
                    placeholder="e.g. Daughter"
                >

            </div>

            <button class="primary-button form-next"
                    onclick="showEmergencyContact()">
                Next →
            </button>

        </main>
    `;
}


function showEmergencyContact() {
    app.innerHTML = `
        <main class="form-screen photo-screen">

            <div class="screen-header">
                <span class="back-button" onclick="goBackFromPhoto()">←</span>

                <div>
                    <p class="step-label">STEP 3 OF 5</p>
                    <h1>Patient's Photo</h1>
                </div>
            </div>

            <div class="photo-content">

                <div class="photo-placeholder">
                    <span>👤</span>
                </div>

                <h2>Add a photo</h2>

                <p>
                    A familiar face helps Companio
                    recognise and connect with them.
                </p>

                <div class="photo-buttons">

                    <button type="button">
                        📷 Camera
                    </button>

                    <button type="button">
                        🖼️ Gallery
                    </button>

                </div>

            </div>

            <button class="primary-button form-next"
                    onclick="showQuestionnaire()">
                Continue to Support Needs
            </button>

        </main>
    `;
}

function goBackFromPhoto() {
    if (setupFor === "someone") {
        showCaregiverInfo();
    } else {
        showPatientInfo();
    }
}


const questions = [
    "Do they have difficulty remembering recent events?",
    "Do they repeat the same questions or stories?",
    "Do they forget names of familiar people?",
    "Do they have difficulty recognising familiar faces?",
    "Do they forget appointments or important events?",
    "Do they have difficulty finding the right words?",
    "Do they become confused about where they are?",
    "Do they need reminders for daily activities?",
    "Do they have difficulty managing medicines?",
    "Do they become anxious or frustrated when confused?",
    "Do they have difficulty following conversations?",
    "Do they have difficulty completing familiar tasks?",
    "Do they forget where everyday objects are kept?",
    "Do they have difficulty remembering instructions?",
    "Do they have difficulty following multi-step instructions?"
];

let currentQuestion = 0;
let answers = [];


function showQuestionnaire() {
    currentQuestion = 0;
    answers = [];

    renderQuestion();
}


function renderQuestion() {
    const question = questions[currentQuestion];
    const progress = currentQuestion + 1;

    app.innerHTML = `
        <main class="questionnaire-screen">

            <div class="questionnaire-header">

                <span class="back-button"
                      onclick="goBackFromQuestionnaire()">
                    ←
                </span>

                <div class="question-count">
                    <span>${progress} answered</span>
                    <span>15 questions</span>
                </div>

            </div>

            <div class="question-progress">
                <div style="width: ${(progress / 15) * 100}%"></div>
            </div>

            <div class="question-card">

                <p class="question-number">
                    ${progress}.
                </p>

                <h1>${question}</h1>

                <div class="answer-options">

                    <button onclick="answerQuestion('Rarely')">
                        Rarely
                    </button>

                    <button onclick="answerQuestion('Sometimes')">
                        Sometimes
                    </button>

                    <button onclick="answerQuestion('Frequently')">
                        Frequently
                    </button>

                    <button onclick="answerQuestion('Very Frequently')">
                        Very Frequently
                    </button>

                    <button onclick="answerQuestion('Not sure')">
                        Not sure
                    </button>

                </div>

            </div>

            <button class="voice-input-button">
                🎙 Voice Input
            </button>

        </main>
    `;
}


function answerQuestion(answer) {
    answers[currentQuestion] = answer;

    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        showQuestionnaireFinal();
    }
}


function goBackFromQuestionnaire() {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
    } else {
        showEmergencyContact();
    }
}


function showQuestionnaireFinal() {
    app.innerHTML = `
        <main class="questionnaire-screen">

            <div class="questionnaire-header">

                <span class="back-button"
                      onclick="renderQuestion()">
                    ←
                </span>

                <div class="question-count">
                    <span>15 answered</span>
                    <span>15 questions</span>
                </div>

            </div>

            <div class="question-progress">
                <div style="width: 100%"></div>
            </div>

            <div class="question-card final-question">

                <h1>Anything else you would like us to know?</h1>

                <textarea
                    placeholder="Optional — type or use voice..."
                ></textarea>

                <button class="voice-input-button">
                    🎙 Voice Input
                </button>

            </div>

            <button class="primary-button questionnaire-next"
                    onclick="showPeople()">
                Save & Continue →
            </button>

        </main>
    `;
}


function showPeople() {
    app.innerHTML = `
        <main class="form-screen">

            <div class="screen-header">
                <span class="back-button" onclick="showQuestionnaireFinal()">←</span>

                <div>
                    <p class="step-label">STEP 4 OF 5</p>
                    <h1>People They Know</h1>
                </div>
            </div>

            <div class="form-content">

                <p>
                    Add a few familiar people so Companio
                    can make conversations more personal.
                </p>

                <label for="person-name">
                    Person's name
                </label>

                <input
                    id="person-name"
                    type="text"
                    placeholder="e.g. Rahul"
                >

                <label for="person-relation">
                    Relationship
                </label>

                <input
                    id="person-relation"
                    type="text"
                    placeholder="e.g. Son"
                >

            </div>

            <button class="primary-button form-next"
                    onclick="showPreferences()">
                Continue →
            </button>

        </main>
    `;
}


function showPreferences() {
    app.innerHTML = `
        <main class="form-screen">

            <div class="screen-header">
                <span class="back-button" onclick="showEmergencyContact()">←</span>

                <div>
                    <p class="step-label">STEP 4 OF 5</p>
                    <h1>Preferences</h1>
                </div>
            </div>

            <div class="form-content">

                <label for="language">
                    Preferred language
                </label>

                <select id="language">
                    <option value="">Choose a language</option>
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Bengali</option>
                    <option>Assamese</option>
                    <option>Manipuri</option>
                </select>

                <label for="communication">
                    Preferred way to communicate
                </label>

                <select id="communication">
                    <option value="">Choose an option</option>
                    <option>Voice</option>
                    <option>Text</option>
                    <option>Both</option>
                </select>

                <label for="support">
                    What would you like Companio to focus on?
                </label>

                <div class="preference-options">

                    <button type="button"
                            onclick="togglePreference(this)">
                        🧠 Memory
                    </button>

                    <button type="button"
                            onclick="togglePreference(this)">
                        💬 Conversation
                    </button>

                    <button type="button"
                            onclick="togglePreference(this)">
                        ⏰ Daily routines
                    </button>

                    <button type="button"
                            onclick="togglePreference(this)">
                        🎮 Activities
                    </button>

                </div>

            </div>

            <button class="primary-button form-next"
                    onclick="showFinalSetup()">
                Next →
            </button>

        </main>
    `;
}


function togglePreference(button) {
    button.classList.toggle("selected");
}


function showFinalSetup() {
    showPatientDashboard();
}

function showPatientDashboard() {
    app.innerHTML = `
        <main class="dashboard-screen">

            <div class="dashboard-header">
                <p>Good Morning</p>
                <h1>Hello 👋</h1>
                <p>Let's see what's planned for today.</p>
            </div>

            <section class="dashboard-card">
                <h2>Today's Routine</h2>
                <p>You're doing great. Here's what comes next.</p>

                <div class="routine-item">
                    <span>☀️</span>
                    <div>
                        <strong>Morning Routine</strong>
                        <p>Start your day</p>
                    </div>
                </div>

                <div class="routine-item">
                    <span>💊</span>
                    <div>
                        <strong>Medicine Reminder</strong>
                        <p>Next reminder at 10:00 AM</p>
                    </div>
                </div>
            </section>

            <section class="dashboard-card">
                <h2>What do I do now?</h2>

                <div class="dashboard-actions">
                    <button onclick="showGames()">🎮<br>Play a Game</button>
                    <button>💬<br>Talk to Me</button>
                    <button>🧠<br>My Progress</button>
                    <button>❤️<br>My Memories</button>
                </div>
            </section>

            <button class="help-button">
                🆘 I Need Help
            </button>

            <nav class="bottom-nav">
                <button>⌂<span>Home</span></button>
                <button>🎮<span>Activities</span></button>
                <button>💚<span>Memories</span></button>
                <button>⚙<span>More</span></button>
            </nav>

        </main>
    `;
}

function showGames() {
    document.getElementById("app").innerHTML = `
        <main class="form-screen">

            <div class="screen-header">
                <button class="back-button" onclick="showPatientDashboard()">←</button>

                <div>
                    <div class="step-label">ACTIVITY</div>
                    <h1>Choose an Activity</h1>
                </div>
            </div>

            <div class="dashboard-card" style="margin-top: 45px;">
                <h2>🧩 Memory Match</h2>
                <p>Match the familiar objects and exercise your memory.</p>
                <button class="primary-button" onclick="startMemoryGame()">
                    Start Game
                </button>
            </div>

            <div class="dashboard-card">
                <h2>🔢 Number Sequence</h2>
                <p>Remember the numbers and choose them in the correct order.</p>
                <button class="primary-button" onclick="startNumberGame()">
                    Start Game
                </button>
            </div>

            <div class="dashboard-card">
                <h2>🗣️ Conversation</h2>
                <p>Talk with Companio through a simple guided activity.</p>
                <button class="primary-button">
                    Start Activity
                </button>
            </div>

        </main>
    `;
}

function startMemoryGame() {
    document.getElementById("app").innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <button class="back-button" onclick="showGames()">←</button>

                <div>
                    <div class="step-label">BRAIN ACTIVITY</div>
                    <h1>Memory Match</h1>
                </div>
            </div>

            <p class="game-instruction">
                Find the matching pairs.
            </p>

            <div class="memory-board" id="memory-board"></div>

            <p class="game-score">
                Matches: <span id="match-count">0</span> / 4
            </p>

        </main>
    `;

    createMemoryGame();
}

function createMemoryGame() {
    const cards = ["🌸", "🌸", "🦋", "🦋", "🍎", "🍎", "⭐", "⭐"];

    cards.sort(() => Math.random() - 0.5);

    const board = document.getElementById("memory-board");

    let firstCard = null;
    let secondCard = null;
    let locked = false;
    let matches = 0;

    cards.forEach((symbol) => {

        const card = document.createElement("button");

        card.className = "memory-card";
        card.dataset.symbol = symbol;
        card.innerHTML = "?";

        card.onclick = () => {

            if (locked || card === firstCard || card.classList.contains("matched")) {
                return;
            }

            card.innerHTML = symbol;

            if (!firstCard) {
                firstCard = card;
                return;
            }

            secondCard = card;
            locked = true;

            if (firstCard.dataset.symbol === secondCard.dataset.symbol) {

                firstCard.classList.add("matched");
                secondCard.classList.add("matched");

                matches++;

                document.getElementById("match-count").innerText = matches;

                firstCard = null;
                secondCard = null;
                locked = false;

                if (matches === 4) {
                    setTimeout(() => {
                        alert("Great job! You found all the pairs. 🌸");
                    }, 300);
                }

            } else {

                setTimeout(() => {
                    firstCard.innerHTML = "?";
                    secondCard.innerHTML = "?";

                    firstCard = null;
                    secondCard = null;
                    locked = false;
                }, 800);
            }
        };

        board.appendChild(card);
    });
}

function startNumberGame() {
    alert("Number Sequence will be added next.");
}