const app = document.getElementById("app");
const loadingPercentage = document.getElementById("loading-percentage");

// ---------------- API LAYER ----------------

const API = "";

async function api(path, opts = {}) {
    const res = await fetch(API + path, {
        headers: { "Content-Type": "application/json" },
        ...opts,
    });
    const body = await res.text();
    let json = null;
    try { json = body ? JSON.parse(body) : null; } catch (e) { json = body; }
    if (!res.ok) {
        const detail = json && json.detail
            ? (typeof json.detail === "string" ? json.detail : JSON.stringify(json.detail))
            : "Error " + res.status;
        throw new Error(detail + " (" + (opts.method || "GET") + " " + (API + path) + " -> " + res.status + ")");
    }
    return json;
}

function esc(s) {
    return String(s === undefined || s === null ? "" : s).replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
}

function fmtReminderTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${period}`;
}

// ---------------- APP STATE ----------------

const state = {
    setupFor: "",
    name: "",
    age: "",
    caregiverName: "",
    caregiverRelationship: "",
    patientId: null,
    sessionId: null,
    questions: [],
    assessment: null,
};

const savedState = JSON.parse(localStorage.getItem("companio-state") || "{}");
if (savedState.patientId) {
    state.patientId = savedState.patientId;
    state.name = savedState.name || "";
    state.age = savedState.age || "";
}

function persistState() {
    localStorage.setItem("companio-state", JSON.stringify({
        patientId: state.patientId,
        name: state.name,
        age: state.age,
    }));
}

// ---------------- GAME RESULTS ----------------

const gameResults = (() => {
    try {
        return JSON.parse(localStorage.getItem("companio-game-results") || "null") || {};
    } catch (e) {
        return {};
    }
})();

function persistGameResults() {
    localStorage.setItem("companio-game-results", JSON.stringify(gameResults));
}

function recordGameResult(gameName, score, level) {
    gameResults[gameName] = {
        score: score,
        level: level,
        completedAt: new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        }),
    };
    persistGameResults();
}

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
    showIntroStayConnected();
}

function showIntroStayConnected() {
    app.innerHTML = `
        <main class="onboarding-screen">

            <div class="onboarding-icon">
                ❤️
            </div>

            <h1>Stay Connected</h1>

            <p>
                Family connections, caregiver support
                and proactive check-ins — always with warmth.
            </p>

            <div class="onboarding-dots">
                <span class="active"></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <button class="primary-button" onclick="showIntroDailyCompanion()">
                Next
            </button>

        </main>
    `;
}


function showIntroDailyCompanion() {
    app.innerHTML = `
        <main class="onboarding-screen">

            <div class="onboarding-icon">
                🔔
            </div>

            <h1>Your Daily Companion</h1>

            <p>
                Medicine, meals, hydration and
                routine reminders with friendly
                voice guidance.
            </p>

            <div class="onboarding-dots">
                <span></span>
                <span class="active"></span>
                <span></span>
                <span></span>
            </div>

            <button class="primary-button" onclick="showIntroRememberEngage()">
                Next
            </button>

        </main>
    `;
}


function showIntroRememberEngage() {
    app.innerHTML = `
        <main class="onboarding-screen">

            <div class="onboarding-icon">
                🎯
            </div>

            <h1>Remember & Engage</h1>

            <p>
                Personalized memory, attention
                and reasoning activities —
                designed for their unique story.
            </p>

            <div class="onboarding-dots">
                <span></span>
                <span></span>
                <span class="active"></span>
                <span></span>
            </div>

            <button class="primary-button" onclick="showIntroOffline()">
                Next
            </button>

        </main>
    `;
}


function showIntroOffline() {
    app.innerHTML = `
        <main class="onboarding-screen">

            <div class="onboarding-icon">
                📡
            </div>

            <h1>Works Even Offline</h1>

            <p>
                Essential features continue without
                internet. Data syncs automatically
                when connectivity returns.
            </p>

            <div class="onboarding-dots">
                <span></span>
                <span></span>
                <span></span>
                <span class="active"></span>
            </div>

            <button class="primary-button" onclick="showLanguageScreen()">
                Get Started
            </button>

        </main>
    `;
}

let currentLanguage = "en";

function showLanguageScreen() {
    app.innerHTML = `
        <main class="language-screen">

            <div class="language-content">

                <div class="step-label">WELCOME TO COMPANIO</div>

                <h1>Choose Your Language</h1>

                <p>
                    Select the language you would like Companio to use.
                </p>

                <div class="language-options">

                    <button onclick="selectLanguage('en')">
                        🇬🇧
                        <span>English</span>
                    </button>

                    <button onclick="selectLanguage('hi')">
                        🇮🇳
                        <span>हिन्दी</span>
                    </button>

                    <button onclick="selectLanguage('as')">
                        অসমীয়া
                        <span>Assamese</span>
                    </button>

                    <button onclick="selectLanguage('bn')">
                        বাংলা
                        <span>Bengali</span>
                    </button>

                    <button onclick="selectLanguage('mni')">
                        ꯃꯤꯇꯩ
                        <span>Manipuri</span>
                    </button>

                    <button onclick="selectLanguage('brx')">
                        बड़ो
                        <span>Bodo</span>
                    </button>

                </div>

            </div>

        </main>
    `;
}

function selectLanguage(language) {
    currentLanguage = language;
    showSetupIntro();
}

function showSetupIntro() {
    app.innerHTML = `
        <main class="onboarding-screen setup-intro-screen">

            <div class="setup-intro-icon">
                🌸
            </div>

            <h1>Let's get to know you.</h1>

            <p class="setup-intro-description">
                We'll set up your profile so Companio
                can support you every day.
            </p>

            <div class="setup-intro-list">

                <div>
                    <span>📋</span>
                    <strong>Your basic profile</strong>
                </div>

                <div>
                    <span>🧩</span>
                    <strong>Memory & support needs</strong>
                </div>

                <div>
                    <span>🕐</span>
                    <strong>Daily routine & medicines</strong>
                </div>

                <div>
                    <span>👨‍👩‍👧</span>
                    <strong>Familiar people & places</strong>
                </div>

                <div>
                    <span>🎵</span>
                    <strong>Comfort preferences</strong>
                </div>

            </div>

            <button class="primary-button"
                    onclick="showSetupScreen()">
                Begin Setup
            </button>

        </main>
    `;
}

const translations = {
    en: {
        setupQuestion: "Who are you setting Companio up for?",
        setupSubtitle: "We'll personalise the experience for you",

        myself: "Myself",
        myselfDescription: "I'll be using Companio for me.",
        myselfDetails: "Set up your own profile → Patient experience",

        someoneElse: "Someone Else",
        someoneDescription: "I'm a caregiver setting it up for someone.",
        someoneDetails: "Caregiver setup · Dashboard · Monitor progress"
    },


    hi: {
        setupQuestion: "आप Companio किसके लिए सेट कर रहे हैं?",
        setupSubtitle: "हम आपके लिए अनुभव को व्यक्तिगत बनाएंगे",

        myself: "मेरे लिए",
        myselfDescription: "मैं अपने लिए Companio का उपयोग करूंगा/करूंगी।",
        myselfDetails: "अपनी प्रोफ़ाइल सेट करें → रोगी अनुभव",

        someoneElse: "किसी और के लिए",
        someoneDescription: "मैं किसी और के लिए इसे सेट करने वाला/वाली देखभालकर्ता हूँ।",
        someoneDetails: "देखभालकर्ता सेटअप · डैशबोर्ड · प्रगति देखें"
    },


    as: {
        setupQuestion: "আপুনি কাৰ বাবে Companio ছেট আপ কৰিছে?",
        setupSubtitle: "আমি আপোনাৰ বাবে অভিজ্ঞতাটো ব্যক্তিগত কৰি তুলিম",

        myself: "মোৰ বাবে",
        myselfDescription: "মই নিজৰ বাবে Companio ব্যৱহাৰ কৰিম।",
        myselfDetails: "নিজৰ প্ৰফাইল ছেট আপ কৰক → ৰোগীৰ অভিজ্ঞতা",

        someoneElse: "আন কাৰোবাৰ বাবে",
        someoneDescription: "মই আন কাৰোবাৰ বাবে ইয়াক ছেট আপ কৰা এজন যত্ন লওঁতা।",
        someoneDetails: "যত্ন লওঁতাৰ ছেটআপ · ডেশ্বব'ৰ্ড · অগ্ৰগতি নিৰীক্ষণ"
    },


    mni: {
        setupQuestion: "ꯅꯍꯥꯛꯅ ꯀꯅꯥꯒꯤꯗꯃꯛ Companio ꯁꯦꯠ ꯑꯞ ꯇꯧꯔꯤꯕꯒꯦ?",
        setupSubtitle: "ꯅꯍꯥꯛꯀꯤꯗꯃꯛ ꯑꯁꯤꯒꯤ ꯂꯣꯟ ꯑꯃꯁꯨꯡ ꯃꯇꯦꯡ ꯇꯧꯔꯒꯦ",

        myself: "ꯑꯩꯒꯤꯗꯃꯛ",
        myselfDescription: "ꯑꯩꯅ ꯑꯩꯒꯤꯗꯃꯛ Companio ꯁꯤꯖꯤꯟꯅꯒꯦ।",
        myselfDetails: "ꯑꯩꯒꯤ ꯄ꯭ꯔꯣꯐꯥꯏꯜ ꯁꯦꯠ ꯑꯞ ꯇꯧꯕ → ꯄꯦꯁꯦꯟꯇ ꯑꯅꯨꯕꯤꯡ",

        someoneElse: "ꯑꯇꯣꯞꯄꯒꯤꯗꯃꯛ",
        someoneDescription: "ꯑꯩ ꯑꯇꯣꯞꯄꯒꯤꯗꯃꯛ ꯁꯦꯠ ꯑꯞ ꯇꯧꯔꯤꯕ ꯀꯌꯔꯒꯤꯕ ꯑꯃꯅꯤ।",
        someoneDetails: "ꯀꯌꯔꯒꯤꯕ ꯁꯦꯠ ꯑꯞ · ꯗꯦꯁꯕꯣꯔꯗ · ꯄ꯭ꯔꯣꯒ꯭ꯔꯦꯁ ꯃꯣꯅꯤꯇꯔ"
    },


    brx: {
        setupQuestion: "नों बेसेखौ Companio सेटअप खालामगोन?",
        setupSubtitle: "नोंनि थाखाय अनुभवखौ निजि खालामगोन",

        myself: "आंनो",
        myselfDescription: "आं नोंथांनायनि थाखाय Companio बाहायगोन।",
        myselfDetails: "नोंनि प्रोफाइल सेटअप खालाम → रोगी अनुभव",

        someoneElse: "गुबुन जानायनो",
        someoneDescription: "आं गुबुन मोनसे मानो होनायनि थाखाय सेटअप खालामगोन।",
        someoneDetails: "केयरगिभार सेटअप · डेशबोर्ड · प्रोग्रेस मोनिटर"
    },


    bn: {
    chooseLanguage: "আপনার ভাষা নির্বাচন করুন",
    languageDescription: "Companio ব্যবহার করার জন্য আপনার পছন্দের ভাষা নির্বাচন করুন।",
    myself: "আমার জন্য",
    someoneElse: "অন্য কারও জন্য",
    patientNameAge: "রোগীর নাম ও বয়স",
    next: "পরবর্তী →",

    setupQuestion: "আপনি কার জন্য Companio সেট আপ করছেন?",
    setupSubtitle: "আমরা আপনার জন্য অভিজ্ঞতাটি ব্যক্তিগত করে তুলব",
    myselfDescription: "আমি নিজের জন্য Companio ব্যবহার করব।",
    myselfDetails: "নিজের প্রোফাইল সেট আপ করুন → রোগীর অভিজ্ঞতা",
    someoneDescription: "আমি অন্য কারও জন্য এটি সেট আপ করা একজন পরিচর্যাকারী।",
    someoneDetails: "পরিচর্যাকারী সেটআপ · ড্যাশবোর্ড · অগ্রগতি পর্যবেক্ষণ"
    },
};

function t(key) {
    return translations[currentLanguage][key] || translations.en[key] || key;
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

        <button class="setup-back-button" onclick="showLanguageScreen()">
            ← Back
        </button>

            <h1>${t("setupQuestion")}</h1>

            <p class="setup-subtitle">
                ${t("setupSubtitle")}
            </p>

            <div class="setup-options">

                <button class="setup-card"
                        onclick="selectSetup('myself')">

                    <div class="setup-icon flower-icon">
                        🌼
                    </div>

                    <h2>${t("myself")}</h2>

                    <p>
                        ${t("myselfDescription")}
                    </p>

                    <strong>
                        ${t("myselfDetails")}
                    </strong>

                </button>


                <button class="setup-card someone-card"
                        onclick="selectSetup('someone')">

                    <div class="setup-icon heart-icon">
                        ❤️
                    </div>

                    <h2>${t("someoneElse")}</h2>

                    <p>
                        ${t("someoneDescription")}
                    </p>

                    <strong>
                        ${t("someoneDetails")}
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
                    onclick="savePatientInfo()">
                Next →
            </button>

        </main>
    `;
}

let patientName = "";
let patientAge = "";

function savePatientInfo() {
    const nameInput = document.getElementById("patient-name");
    const ageInput = document.getElementById("patient-age");

    patientName = nameInput.value.trim();
    patientAge = ageInput.value.trim();
    state.name = patientName;
    state.age = patientAge;

    if (patientName === "" || patientAge === "") {
        alert("Please enter the patient's name and age.");
        return;
    }

    continueAfterPatientInfo();
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
                    onclick="saveCaregiverInfo()">
                Next →
            </button>

        </main>
    `;
}


function saveCaregiverInfo() {
    state.caregiverName = document.getElementById("caregiver-name").value.trim();
    state.caregiverRelationship = document.getElementById("relationship").value.trim();
    showEmergencyContact();
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
                    onclick="continueToScreening()">
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


async function continueToScreening() {
    try {
        if (!state.patientId) {
            const payload = {
                name: state.name,
                age: parseInt(state.age, 10),
                caregiver_name: state.caregiverName || null,
                caregiver_phone: null,
                caregiver_relationship: state.caregiverRelationship || null,
            };
            const p = await api("/api/patients/register", { method: "POST", body: JSON.stringify(payload) });
            state.patientId = p.id;
            persistState();
        }
        showQuestionnaire();
    } catch (e) {
        alert("Could not create the profile: " + e.message);
    }
}


let currentQuestion = 0;
let answers = [];


async function showQuestionnaire() {
    currentQuestion = 0;
    answers = [];

    try {
        if (!state.questions.length) {
            state.questions = await api("/api/screenings/questions?type=frequency");
        }
        const s = await api("/api/screenings/start", {
            method: "POST",
            body: JSON.stringify({ patient_id: state.patientId }),
        });
        state.sessionId = s.id;
        renderQuestion();
    } catch (e) {
        alert("Could not start the screening: " + e.message);
        showEmergencyContact();
    }
}


const FREQUENCY_VALUES = {
    "Rarely": 4,
    "Sometimes": 3,
    "Frequently": 2,
    "Very Frequently": 1,
    "Not sure": 0
};


function renderQuestion() {
    const question = state.questions[currentQuestion];
    const progress = currentQuestion + 1;
    const total = state.questions.length;

    app.innerHTML = `
        <main class="questionnaire-screen">

            <div class="questionnaire-header">

                <span class="back-button"
                      onclick="goBackFromQuestionnaire()">
                    ←
                </span>

                <div class="question-count">
                    <span>${progress} answered</span>
                    <span>${total} questions</span>
                </div>

            </div>

            <div class="question-progress">
                <div style="width: ${(progress / total) * 100}%"></div>
            </div>

            <div class="question-card">

                <p class="question-number">
                    ${progress}.
                </p>

                <span class="domain-chip">
                    ${esc(question.domain)}
                </span>

                <h1>${esc(question.question_text)}</h1>

                <p class="question-instruction">
                    ${esc(question.instruction || "Choose how often this happens.")}
                </p>

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

        </main>
    `;
}


async function answerQuestion(answer) {
    const question = state.questions[currentQuestion];

    answers[currentQuestion] = answer;

    try {
        await api(`/api/screenings/${state.sessionId}/respond`, {
            method: "POST",
            body: JSON.stringify({
                question_id: question.id,
                response_text: answer,
                response_value:
                    FREQUENCY_VALUES[answer] !== undefined
                        ? FREQUENCY_VALUES[answer]
                        : 2,
                time_taken_seconds: 15,
            }),
        });

        if (currentQuestion < state.questions.length - 1) {
            currentQuestion++;
            renderQuestion();
        } else {
            await completeScreening();
        }
    } catch (e) {
        alert("Could not save your answer: " + e.message);
    }
}

async function completeScreening() {
    try {
        const assessment = await api(`/api/screenings/${state.sessionId}/complete`, {
            method: "POST",
        });
        state.assessment = assessment;
        showScreeningResults();
    } catch (e) {
        alert("Could not generate the assessment: " + e.message);
        showQuestionnaireFinal();
    }
}


function getSupportLevel(score, maximum) {

    const percentage = (score / maximum) * 100;

    if (percentage >= 67) {
        return "High";
    }

    if (percentage >= 34) {
        return "Moderate";
    }

    return "Low";
}

function generatePatientProfile() {
    const profile = {
        memorySupport: 0,
        recognitionSupport: 0,
        communicationSupport: 0,
        routineSupport: 0,
        medicineSupport: 0,
        emotionalSupport: 0,
        taskSupport: 0
    };

    // Memory & remembering
    [0, 1, 4, 12, 13].forEach(index => {
        if (isFrequent(answers[index])) {
            profile.memorySupport++;
        }
    });

    // Recognising people / places
    [2, 3, 6].forEach(index => {
        if (isFrequent(answers[index])) {
            profile.recognitionSupport++;
        }
    });

    // Communication
    [5, 10].forEach(index => {
        if (isFrequent(answers[index])) {
            profile.communicationSupport++;
        }
    });

    // Daily routine
    [7].forEach(index => {
        if (isFrequent(answers[index])) {
            profile.routineSupport++;
        }
    });

    // Medicines
    [8].forEach(index => {
        if (isFrequent(answers[index])) {
            profile.medicineSupport++;
        }
    });

    // Emotional support
    [9].forEach(index => {
        if (isFrequent(answers[index])) {
            profile.emotionalSupport++;
        }
    });

    // Familiar / multi-step tasks
    [11, 14].forEach(index => {
        if (isFrequent(answers[index])) {
            profile.taskSupport++;
        }
    });

    window.patientProfile = profile;
}

function isFrequent(answer) {
    return answer === "Frequently" || answer === "Very Frequently";
}


function showScreeningResults() {
    const a = state.assessment;
    const riskClass = "r-" + (a.risk_category || "none").toLowerCase();
    const observations = (a.key_observations || []).map(x => `<li>${esc(x)}</li>`).join("");
    const steps = (a.suggested_next_steps || []).map(x => `<li>${esc(x)}</li>`).join("");

    app.innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <div>
                    <div class="step-label">SCREENING COMPLETE</div>
                    <h1>Your Results</h1>
                </div>
            </div>

            <div class="results-container">

                <div class="results-score-card">
                    <div class="results-icon">🧠</div>
                    <h2>Cognitive Score</h2>
                    <p class="results-score">${a.cognitive_score} / ${a.max_score}</p>
                    <span class="risk-pill ${riskClass}">
                        ${esc((a.risk_category || "").toUpperCase())} RISK
                    </span>
                    <p class="results-note">
                        Higher scores indicate fewer difficulties. This is a screening aid, not a diagnosis.
                    </p>
                </div>

                <div class="results-card">
                    <h2>Key Observations</h2>
                    <ul>${observations || "<li>No significant concerns identified.</li>"}</ul>
                </div>

                <div class="results-card">
                    <h2>Suggested Next Steps</h2>
                    <ul>${steps || "<li>Continue your normal routine and routine screenings.</li>"}</ul>
                </div>

                <div class="results-card">
                    <h2>Important</h2>
                    <p>${esc(a.disclaimer)}</p>
                </div>

                <button class="primary-button" onclick="showQuestionnaireFinal()">
                    Continue
                </button>

            </div>

        </main>
    `;
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
                    placeholder="Optional — type anything else..."
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
    showRoutineSetup();
}

let routineActivities = [
    {
        icon: "🍳",
        name: "Breakfast",
        time: "9:00 AM",
        frequency: "Daily"
    },
    {
        icon: "🚶",
        name: "Morning Walk",
        time: "10:00 AM",
        frequency: "Daily"
    },
    {
        icon: "🍲",
        name: "Lunch",
        time: "1:00 PM",
        frequency: "Daily"
    },
    {
        icon: "☕",
        name: "Tea & Water",
        time: "4:00 PM",
        frequency: "Daily"
    },
    {
        icon: "🌙",
        name: "Dinner",
        time: "8:00 PM",
        frequency: "Daily"
    },
    {
        icon: "😴",
        name: "Sleep",
        time: "10:00 PM",
        frequency: "Daily"
    }
];

let editingRoutineIndex = null;


function showRoutineSetup() {

    app.innerHTML = `
        <main class="form-screen routine-setup-screen">

            <div class="screen-header">

                <button class="back-button"
                        onclick="showPreferences()">
                    ←
                </button>

                <div>
                    <p class="step-label">STEP 5 OF 5</p>
                    <h1>Daily Routine</h1>
                </div>

            </div>

            <p class="routine-setup-description">
                Help them remember what happens each day.
            </p>

            <div id="routine-list" class="routine-setup-list">

                ${routineActivities.map((activity, index) => `

                    <div class="setup-routine-card">

                        <div class="setup-routine-icon">
                            ${activity.icon}
                        </div>

                        <div class="setup-routine-info">

                            <strong>${activity.name}</strong>

                            <p>
                                ${activity.time} · ${activity.frequency}
                            </p>

                        </div>

                        <button class="routine-edit-button"
                                onclick="editRoutine(${index})">
                            ✎
                        </button>

                        <button class="routine-remove-button"
                                onclick="removeRoutine(${index})">
                            ×
                        </button>

                    </div>

                `).join("")}

            </div>

            <button class="add-routine-button"
                    onclick="addRoutine()">
                + Add Activity
            </button>

            <button class="primary-button form-next"
                    onclick="saveRoutine()">
                Save Routine →
            </button>

        </main>
    `;
}


function addRoutine() {

    routineActivities.push({
        icon: "✨",
        name: "",
        time: "",
        frequency: "Daily"
    });

    editingRoutineIndex = routineActivities.length - 1;

    showRoutineEditor(editingRoutineIndex);
}


function editRoutine(index) {

    editingRoutineIndex = index;

    showRoutineEditor(index);
}


function showRoutineEditor(index) {

    const activity = routineActivities[index];

    app.innerHTML = `
        <main class="form-screen routine-editor-screen">

            <div class="screen-header">

                <button class="back-button"
                        onclick="showRoutineSetup()">
                    ←
                </button>

                <div>
                    <p class="step-label">DAILY ROUTINE</p>
                    <h1>Edit Activity</h1>
                </div>

            </div>

            <div class="routine-editor-content">

                <label for="routine-name">
                    Activity name
                </label>

                <input
                    id="routine-name"
                    type="text"
                    value="${activity.name}"
                    placeholder="e.g. Morning Exercise"
                >

                <label for="routine-time">
                    Time
                </label>

                <input
                    id="routine-time"
                    type="time"
                    value="${convertTo24Hour(activity.time)}"
                >

                <label for="routine-frequency">
                    Frequency
                </label>

                <select id="routine-frequency">

                    <option value="Daily"
                        ${activity.frequency === "Daily" ? "selected" : ""}>
                        Daily
                    </option>

                    <option value="Weekdays"
                        ${activity.frequency === "Weekdays" ? "selected" : ""}>
                        Weekdays
                    </option>

                    <option value="Weekends"
                        ${activity.frequency === "Weekends" ? "selected" : ""}>
                        Weekends
                    </option>

                </select>

            </div>

            <button class="primary-button form-next"
                    onclick="saveRoutineActivity()">
                Save Activity
            </button>

        </main>
    `;
}


function saveRoutineActivity() {

    const name = document.getElementById("routine-name").value.trim();
    const timeValue = document.getElementById("routine-time").value;
    const frequency = document.getElementById("routine-frequency").value;

    if (!name || !timeValue) {
        alert("Please enter the activity name and time.");
        return;
    }

    routineActivities[editingRoutineIndex].name = name;
    routineActivities[editingRoutineIndex].time = convertTo12Hour(timeValue);
    routineActivities[editingRoutineIndex].frequency = frequency;

    editingRoutineIndex = null;

    showRoutineSetup();
}


function removeRoutine(index) {

    routineActivities.splice(index, 1);

    showRoutineSetup();
}


function convertTo24Hour(time) {

    if (!time) return "";

    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);

    if (!match) return "";

    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3].toUpperCase();

    if (period === "PM" && hours !== 12) {
        hours += 12;
    }

    if (period === "AM" && hours === 12) {
        hours = 0;
    }

    return `${String(hours).padStart(2, "0")}:${minutes}`;
}


function convertTo12Hour(time) {

    if (!time) return "";

    let [hours, minutes] = time.split(":");

    hours = parseInt(hours);

    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${period}`;
}


function nextTimeISO(time) {
    if (!time) return new Date().toISOString();
    const hhmm = convertTo24Hour(time);
    const today = new Date().toISOString().slice(0, 10);
    return `${today}T${hhmm}:00`;
}

async function saveRoutine() {
    if (!state.patientId) {
        showPatientDashboard();
        return;
    }

    try {
        for (const activity of routineActivities) {
            if (!activity.name || !activity.time) continue;
            const type = /medic|pills|tablet|medication/i.test(activity.name)
                ? "medication"
                : "appointment";
            await api("/api/reminders/", {
                method: "POST",
                body: JSON.stringify({
                    patient_id: state.patientId,
                    reminder_type: type,
                    title: activity.name,
                    description: `${activity.frequency} · ${activity.time}`,
                    scheduled_at: nextTimeISO(activity.time),
                }),
            });
        }
    } catch (e) {
        alert("Could not save your routine reminders: " + e.message);
        return;
    }

    if (setupFor === "someone") {
        showAccessChoice();
    } else {
        showPatientStartChoice();
    }
}  

function showPatientDashboard() {
    const profile = window.patientProfile || {
        memorySupport: "Low",
        recognitionSupport: "Low",
        communicationSupport: "Low",
        routineSupport: "Low",
        medicineSupport: "Low",
        emotionalSupport: "Low",
        taskSupport: "Low"
    };

    document.getElementById("app").innerHTML = `
        <main class="new-dashboard">

            <!-- HEADER -->
            <section class="dashboard-welcome">
                <div>
                    <p class="dashboard-eyebrow">YOUR DAILY COMPANION</p>
                    <h1>Hello, ${patientName} 👋</h1>
                    <p>Let's see what's planned for today.</p>
                </div>

                <div class="profile-circle">
                    👤
                </div>
            </section>


            <!-- TODAY'S OVERVIEW -->
            <section class="overview-grid">

                <div class="overview-card cognitive-card">
                    <div class="overview-icon">🧠</div>
                    <div>
                        <p>Cognitive Activity</p>
                        <h2>0 activities</h2>
                        <span>Keep your mind active today</span>
                    </div>
                </div>

                <div class="overview-card checkin-card">
                    <div class="overview-icon">💚</div>
                    <div>
                        <p>Today's Check-in</p>
                        <h2>Not completed</h2>
                        <span>How are you feeling today?</span>
                    </div>
                </div>

            </section>


            <!-- TODAY'S ROUTINE -->
            <section class="colour-card routine-dashboard-card">

                <div class="section-title-row">
                    <div>
                        <p class="dashboard-eyebrow">TODAY</p>
                        <h2>Daily Routine</h2>
                    </div>

                    <button class="small-action-button"
                            onclick="showRoutine()">
                        View All
                    </button>
                </div>

                <div class="dashboard-routine-item active-routine">
                    <div class="routine-time">9:00 AM</div>

                    <div class="routine-dot">🍳</div>

                    <div class="routine-details">
                        <strong>Breakfast</strong>
                        <span>Start your day with breakfast</span>
                    </div>

                    <span class="routine-status">Next</span>
                </div>

                <div class="dashboard-routine-item">
                    <div class="routine-time">10:00 AM</div>

                    <div class="routine-dot">🚶</div>

                    <div class="routine-details">
                        <strong>Morning Walk</strong>
                        <span>A little movement for the day</span>
                    </div>
                </div>

                <div class="dashboard-routine-item">
                    <div class="routine-time">1:00 PM</div>

                    <div class="routine-dot">🍲</div>

                    <div class="routine-details">
                        <strong>Lunch</strong>
                        <span>Time for your afternoon meal</span>
                    </div>
                </div>

            </section>


            <!-- WHAT DO I DO NOW -->
            <section class="next-activity-card">

                <div class="next-activity-icon">✨</div>

                <div>
                    <p class="dashboard-eyebrow">YOUR NEXT ACTIVITY</p>
                    <h2>What do I do now?</h2>
                    <p>Companio can help you decide what to do next.</p>
                </div>

                <button class="primary-button"
                        onclick="showNextActivity()">
                    Show Me
                </button>

            </section>


            <!-- MEDICINES + HYDRATION -->
            <section class="dashboard-two-column">

                <div class="colour-card information-card">
                    <div class="card-icon">💊</div>

                    <p class="dashboard-eyebrow">MEDICINES</p>
                    <h2>Today's Medicines</h2>

                    <div class="progress-number">
                        0 / 2
                    </div>

                    <p>reminders acknowledged</p>

                    <button class="small-action-button"
                            onclick="showMedicines()">
                        View Medicines
                    </button>
                </div>


                <div class="colour-card information-card">
                    <div class="card-icon">💧</div>

                    <p class="dashboard-eyebrow">HYDRATION</p>
                    <h2>Water Today</h2>

                    <div class="hydration-progress">
                        <div class="hydration-fill"></div>
                    </div>

                    <p id="hydration-count">0 / 5 glasses</p>

                    <button class="small-action-button" onclick="logWater()">
                        Log a Glass
                    </button>
                </div>

            </section>


            <!-- BRAIN ACTIVITIES -->
            <section class="colour-card">

                <div class="section-title-row">
                    <div>
                        <p class="dashboard-eyebrow">KEEP YOUR MIND ACTIVE</p>
                        <h2>Brain Activities</h2>
                    </div>

                    <button class="small-action-button"
                            onclick="showGames()">
                        See All
                    </button>
                </div>

                <div class="activity-mini-grid">

                    <button class="activity-mini-card"
                            onclick="startMemoryGame()">
                        <span>🧩</span>
                        <strong>Memory Match</strong>
                        <small>Exercise memory</small>
                    </button>

                    <button class="activity-mini-card"
                            onclick="startNumberGame()">
                        <span>🔢</span>
                        <strong>Remember the Sequence</strong>
                        <small>Train attention</small>
                    </button>

                    <button class="activity-mini-card"
                            onclick="startSpotDifference()">
                        <span>👀</span>
                        <strong>Spot the Difference</strong>
                        <small>Improve attention</small>
                    </button>

                    <button class="activity-mini-card"
                            onclick="startWhatDidYouSee()">
                        <span>🧠</span>
                        <strong>What Did You See?</strong>
                        <small>Remember a scene</small>
                    </button>

                </div>

            </section>


            <!-- PERSONALIZED SUPPORT -->
            <section class="colour-card support-profile-card">

                <div class="section-title-row">
                    <div>
                        <p class="dashboard-eyebrow">PERSONALISED FOR YOU</p>
                        <h2>Your Support Profile</h2>
                    </div>

                    <span class="personalised-badge">✨ Personalised</span>
                </div>

                <div class="support-grid">

                    <div>
                        <span>🧠</span>
                        <strong>Memory</strong>
                        <small>${profile.memorySupport} support</small>
                    </div>

                    <div>
                        <span>👥</span>
                        <strong>Recognition</strong>
                        <small>${profile.recognitionSupport} support</small>
                    </div>

                    <div>
                        <span>💬</span>
                        <strong>Communication</strong>
                        <small>${profile.communicationSupport} support</small>
                    </div>

                    <div>
                        <span>⏰</span>
                        <strong>Routine</strong>
                        <small>${profile.routineSupport} support</small>
                    </div>

                </div>

            </section>


            <!-- QUICK ACTIONS -->
            <section class="quick-actions">

                <button onclick="showTalkToMe()">
                    💬
                    <span>Talk to Me</span>
                </button>

                <button onclick="showMemories()">
                    ❤️
                    <span>My Memories</span>
                </button>

            </section>


            <!-- BOTTOM NAV -->
            <div class="bottom-nav">
                <button onclick="showPatientDashboard()">
                    ⌂
                    <span>Home</span>
                </button>

                <button onclick="showGames()">
                    ♡
                    <span>Activities</span>
                </button>

                <button onclick="showSettings()">
                    ⚙
                    <span>Settings</span>
                </button>
            </div>

            <!-- FOOTER -->
            <div class="dashboard-footer">
                <p>Good Morning</p>
                <h1>Hello, ${patientName} 👋</h1>
                <p>Age: ${patientAge}</p>
                <p>Let's see what's planned for today.</p>
                <p><span id="risk-badge" class="risk-pill r-none">Loading…</span></p>
            </div>

        </main>
    `;
}

let waterCount = 0;

function logWater() {
    if (waterCount < 5) {
        waterCount++;
    }

    const countElement = document.getElementById("hydration-count");
    const fillElement = document.querySelector(".hydration-fill");

    if (countElement) {
        countElement.textContent = `${waterCount} / 5 glasses`;
    }

    if (fillElement) {
        fillElement.style.width = `${(waterCount / 5) * 100}%`;
    }
}

function showCaregiverDashboard() {
    document.getElementById("app").innerHTML = `
        <main class="caregiver-dashboard">

            <!-- HEADER -->
            <section class="caregiver-welcome">
                <div>
                    <p class="dashboard-eyebrow">COMPANIO CARE</p>
                    <h1>Hello, Caregiver 👋</h1>
                    <p>Here's how ${patientName || "your loved one"} is doing today.</p>
                </div>

                <div class="profile-circle">👤</div>
            </section>

            <!-- PATIENT STATUS -->
            <section class="patient-status-card">
                <div class="patient-avatar">👩</div>

                <div class="patient-status-info">
                    <p class="dashboard-eyebrow">PATIENT</p>
                    <h2>${patientName || "Patient"}</h2>
                    <p>Age: ${patientAge || "--"}</p>
                    <span class="online-status">● Active today</span>
                </div>

                <div class="patient-id">
                    <small>Patient ID</small>
                    <strong>CP-48291</strong>
                </div>
            </section>

            <!-- TODAY OVERVIEW -->
            <section class="caregiver-overview-grid">

                <div class="caregiver-stat-card cognitive-stat">
                    <span>🧠</span>
                    <small>COGNITIVE ACTIVITY</small>
                    <strong>4</strong>
                    <p>Games completed today</p>
                </div>

                <div class="caregiver-stat-card accuracy-stat">
                    <span>🎯</span>
                    <small>AVERAGE ACCURACY</small>
                    <strong>78%</strong>
                    <p>Today's performance</p>
                </div>

                <div class="caregiver-stat-card routine-stat">
                    <span>⏰</span>
                    <small>ROUTINE</small>
                    <strong>80%</strong>
                    <p>Completed today</p>
                </div>

                <div class="caregiver-stat-card checkin-stat">
                    <span>💚</span>
                    <small>CHECK-IN</small>
                    <strong>Done</strong>
                    <p>Today's check-in</p>
                </div>

            </section>

            <!-- COGNITIVE ACTIVITY -->
            <section class="caregiver-card">

                <div class="section-title-row">
                    <div>
                        <p class="dashboard-eyebrow">TODAY</p>
                        <h2>Cognitive Activity</h2>
                    </div>

                    <button class="small-action-button"
                            onclick="showProgress()">
                        View Progress
                    </button>
                </div>

                <div class="game-progress-list">

                    <div class="game-progress-item">
                        <div class="game-progress-icon">🧩</div>
                        <div>
                            <strong>Memory Match</strong>
                            <span>Completed · 85% accuracy</span>
                        </div>
                        <b>85%</b>
                    </div>

                    <div class="game-progress-item">
                        <div class="game-progress-icon">🔢</div>
                        <div>
                            <strong>Remember the Sequence</strong>
                            <span>Level 2 completed</span>
                        </div>
                        <b>80%</b>
                    </div>

                    <div class="game-progress-item">
                        <div class="game-progress-icon">👀</div>
                        <div>
                            <strong>Spot the Difference</strong>
                            <span>Level 1 completed</span>
                        </div>
                        <b>70%</b>
                    </div>

                    <div class="game-progress-item">
                        <div class="game-progress-icon">🧠</div>
                        <div>
                            <strong>What Did You See?</strong>
                            <span>Level 2 completed</span>
                        </div>
                        <b>78%</b>
                    </div>

                </div>

            </section>

            <!-- DAILY ROUTINE -->
            <section class="caregiver-card">

                <div class="section-title-row">
                    <div>
                        <p class="dashboard-eyebrow">TODAY</p>
                        <h2>Daily Routine</h2>
                    </div>

                    <button class="small-action-button"
                            onclick="showRoutine()">
                        View Routine
                    </button>
                </div>

                <div class="caregiver-timeline">

                    <div class="timeline-item completed">
                        <div class="timeline-time">7:00 AM</div>
                        <div class="timeline-dot">✓</div>
                        <div>
                            <strong>Wake-up</strong>
                            <span>Completed</span>
                        </div>
                    </div>

                    <div class="timeline-item upcoming">
                        <div class="timeline-time">8:00 AM</div>
                        <div class="timeline-dot">💊</div>
                        <div>
                            <strong>Medicine</strong>
                            <span>Pending</span>
                        </div>
                    </div>

                    <div class="timeline-item completed">
                        <div class="timeline-time">9:00 AM</div>
                        <div class="timeline-dot">🍳</div>
                        <div>
                            <strong>Breakfast</strong>
                            <span>Completed</span>
                        </div>
                    </div>

                    <div class="timeline-item completed">
                        <div class="timeline-time">10:00 AM</div>
                        <div class="timeline-dot">🚶</div>
                        <div>
                            <strong>Morning Walk</strong>
                            <span>Completed</span>
                        </div>
                    </div>

                </div>

            </section>

            <!-- MEDICINES + HYDRATION -->
            <section class="caregiver-two-column">

                <div class="caregiver-card mini-care-card">
                    <div class="card-icon">💊</div>
                    <p class="dashboard-eyebrow">MEDICINES</p>
                    <h2>2 / 3</h2>
                    <p>reminders acknowledged</p>

                    <div class="mini-progress">
                        <div style="width: 66%;"></div>
                    </div>
                </div>

                <div class="caregiver-card mini-care-card">
                    <div class="card-icon">💧</div>
                    <p class="dashboard-eyebrow">HYDRATION</p>
                    <h2>3 / 5</h2>
                    <p>water reminders completed</p>

                    <div class="mini-progress">
                        <div style="width: 60%;"></div>
                    </div>
                </div>

            </section>

            <!-- RECENT ACTIVITY -->
            <section class="caregiver-card">

                <div class="section-title-row">
                    <div>
                        <p class="dashboard-eyebrow">RECENT</p>
                        <h2>Recent Activity</h2>
                    </div>
                </div>

                <div class="recent-care-activity">
                    <span>🧩</span>
                    <div>
                        <strong>Completed Memory Match</strong>
                        <p>Score: 85% · 10 minutes ago</p>
                    </div>
                </div>

                <div class="recent-care-activity">
                    <span>💊</span>
                    <div>
                        <strong>Medicine reminder acknowledged</strong>
                        <p>Today · 8:02 AM</p>
                    </div>
                </div>

                <div class="recent-care-activity">
                    <span>💬</span>
                    <div>
                        <strong>Talked with Companio</strong>
                        <p>Asked about a family member</p>
                    </div>
                </div>

            </section>

            <!-- INSIGHTS -->
            <section class="care-insight-card">
                <div class="insight-icon">✨</div>

                <div>
                    <p class="dashboard-eyebrow">COMPANIO INSIGHT</p>
                    <h2>Steady progress today</h2>
                    <p>
                        ${patientName || "The patient"} has been engaging well
                        with cognitive activities. Keep encouraging regular
                        activities and routine.
                    </p>
                </div>
            </section>

            <!-- BOTTOM NAV -->
            <div class="bottom-nav caregiver-nav">
                <button onclick="showCaregiverDashboard()">
                    ⌂
                    <span>Overview</span>
                </button>

                <button onclick="showCaregiverProgress()">
                    📈
                    <span>Progress</span>
                </button>

                <button onclick="showCaregiverActivities()">
                    🧠
                    <span>Activities</span>
                </button>

                <button onclick="showCaregiverSettings()">
                    ⚙
                    <span>Settings</span>
                </button>
            </div>

        </main>
    `;

    loadDashboardProfile();
}

async function loadDashboardProfile() {
    const badge = document.getElementById("risk-badge");
    if (!badge || !state.patientId) return;

    try {
        const p = await api(`/api/patients/${state.patientId}`);
        state.assessment = p.latest_assessment || state.assessment;

        if (state.assessment) {
            const r = (state.assessment.risk_category || "none").toLowerCase();
            badge.textContent = `${(state.assessment.risk_category || "").toUpperCase()} RISK · ${state.assessment.cognitive_score}/${state.assessment.max_score}`;
            badge.className = "risk-pill r-" + r;
        } else {
            badge.textContent = "No assessment yet";
            badge.className = "risk-pill r-none";
        }
    } catch (e) {
        badge.textContent = "Offline";
        badge.className = "risk-pill r-none";
    }
}

function showCaregiverProgress() {
    app.innerHTML = `
        <main class="caregiver-screen">

            <div class="screen-header">
                <button class="back-button" onclick="showCaregiverDashboard()">←</button>
                <div>
                    <div class="step-label">COMPANIO CARE</div>
                    <h1>Progress & Insights</h1>
                </div>
            </div>

            <section class="caregiver-card">
                <h2>Cognitive Activity</h2>
                <p class="card-subtitle">This Week</p>

                <div class="progress-chart">
                    <div class="chart-bar"><span style="height:65%"></span><small>M</small></div>
                    <div class="chart-bar"><span style="height:72%"></span><small>T</small></div>
                    <div class="chart-bar"><span style="height:58%"></span><small>W</small></div>
                    <div class="chart-bar"><span style="height:80%"></span><small>T</small></div>
                    <div class="chart-bar"><span style="height:75%"></span><small>F</small></div>
                    <div class="chart-bar"><span style="height:88%"></span><small>S</small></div>
                    <div class="chart-bar"><span style="height:78%"></span><small>S</small></div>
                </div>

                <div class="progress-summary">
                    <div>
                        <strong>74%</strong>
                        <span>Average accuracy</span>
                    </div>

                    <div>
                        <strong>↑</strong>
                        <span>Improving</span>
                    </div>
                </div>
            </section>

            <section class="progress-metrics">

                <div class="metric-card">
                    <strong>78%</strong>
                    <span>Memory Games</span>
                    <small>Average accuracy</small>
                </div>

                <div class="metric-card">
                    <strong>71%</strong>
                    <span>Attention</span>
                    <small>Average accuracy</small>
                </div>

                <div class="metric-card">
                    <strong>83%</strong>
                    <span>Check-in Rate</span>
                    <small>This week</small>
                </div>

                <div class="metric-card">
                    <strong>76%</strong>
                    <span>Routine</span>
                    <small>Completion</small>
                </div>

            </section>

            <section class="caregiver-card">
                <h2>Recognition Performance</h2>

                <div class="recognition-row">
                    <span>Family members</span>
                    <strong>85%</strong>
                </div>

                <div class="recognition-row">
                    <span>Familiar places</span>
                    <strong>72%</strong>
                </div>

                <div class="recognition-row">
                    <span>Common objects</span>
                    <strong>90%</strong>
                </div>
            </section>

            <section class="care-insight-card">
                <div class="insight-icon">💡</div>
                <div>
                    <h3>Steady progress this week</h3>
                    <p>
                        ${patientName || "The patient"} has been consistently engaging with
                        activities. Keep up the great care!
                    </p>
                </div>
            </section>

        </main>
    `;
}

function showCaregiverActivities() {
    app.innerHTML = `
        <main class="caregiver-screen">

            <div class="screen-header">
                <button class="back-button" onclick="showCaregiverDashboard()">←</button>
                <div>
                    <div class="step-label">COMPANIO CARE</div>
                    <h1>Activities</h1>
                </div>
            </div>

            <p class="games-intro">
                Recent cognitive activities and performance.
            </p>

            <section class="caregiver-card">

                <div class="game-progress-item">
                    <div class="game-progress-icon">🧩</div>
                    <div>
                        <strong>Find the Pairs</strong>
                        <span>
                            ${gameResults["Find the Pairs"]
                                ? `Level ${gameResults["Find the Pairs"].level} completed`
                                : "Not played yet"}
                        </span>
                    </div>
                    <b>
                        ${gameResults["Find the Pairs"]
                            ? `${gameResults["Find the Pairs"].score}`
                            : "—"}
                    </b>
                </div>

                <div class="game-progress-item">
                    <div class="game-progress-icon">🔢</div>
                    <div>
                        <strong>Remember the Sequence</strong>
                        <span>
                            ${gameResults["Remember the Sequence"]
                                ? `Level ${gameResults["Remember the Sequence"].level} completed`
                                : "Not played yet"}
                        </span>
                    </div>
                    <b>
                        ${gameResults["Remember the Sequence"]
                            ? `${gameResults["Remember the Sequence"].score}`
                            : "—"}
                    </b>
                </div>

                <div class="game-progress-item">
                    <div class="game-progress-icon">👀</div>
                    <div>
                        <strong>Spot the Difference</strong>
                        <span>
                            ${gameResults["Spot the Difference"]
                                ? `Level ${gameResults["Spot the Difference"].level} completed`
                                : "Not played yet"}
                        </span>
                    </div>
                    <b>
                        ${gameResults["Spot the Difference"]
                            ? `${gameResults["Spot the Difference"].score}`
                            : "—"}
                    </b>
                </div>

                <div class="game-progress-item">
                    <div class="game-progress-icon">🖼️</div>
                    <div>
                        <strong>What Did You See?</strong>
                        <span>
                            ${gameResults["What Did You See?"]
                                ? `Level ${gameResults["What Did You See?"].level} completed`
                                : "Not played yet"}
                        </span>
                    </div>
                    <b>
                        ${gameResults["What Did You See?"]
                            ? `${gameResults["What Did You See?"].score}`
                            : "—"}
                    </b>
                </div>

                <div class="game-progress-item">
                    <div class="game-progress-icon">📖</div>
                    <div>
                        <strong>Read & Respond</strong>
                        <span>
                            ${gameResults["Read & Respond"]
                                ? `Level ${gameResults["Read & Respond"].level} completed`
                                : "Not played yet"}
                        </span>
                    </div>
                    <b>
                        ${gameResults["Read & Respond"]
                            ? `${gameResults["Read & Respond"].score}`
                            : "—"}
                    </b>
                </div>

            </section>

        </main>
    `;
}

function showCaregiverSettings() {
    app.innerHTML = `
        <main class="caregiver-screen">

            <div class="screen-header">
                <button class="back-button" onclick="showCaregiverDashboard()">←</button>
                <div>
                    <div class="step-label">COMPANIO CARE</div>
                    <h1>Settings</h1>
                </div>
            </div>

            <section class="caregiver-card">

                <div class="settings-item">
                    <div>
                        <strong>Patient Profile</strong>
                        <span>View connected patient information</span>
                    </div>
                    <span>→</span>
                </div>

                <div class="settings-item">
                    <div>
                        <strong>Notifications</strong>
                        <span>Manage activity and routine updates</span>
                    </div>
                    <span>→</span>
                </div>

                <div class="settings-item">
                    <div>
                        <strong>Privacy & Access</strong>
                        <span>Manage caregiver access</span>
                    </div>
                    <span>→</span>
                </div>

            </section>

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
                <h2>🔢 Remember the Sequence</h2>
                <p>Remember the numbers and choose them in the correct order.</p>
                <button class="primary-button" onclick="startNumberGame()">
                   Start Game
                </button>
            </div>

            <div class="dashboard-card">
                <h2>👀 Spot the Difference</h2>
                <p>Look carefully and find the differences.</p>
                <button class="primary-button" onclick="startSpotDifference()">
                    Start Game
                </button>
            </div>

            <div class="dashboard-card">
                <h2>🧠 What Did You See?</h2>
                <p>Look carefully, remember the scene, and answer the questions.</p>
                <button class="primary-button" onclick="startWhatDidYouSee()">
                    Start Game
                </button>
            </div>

            <div class="dashboard-card">
                <h2>🧠 Familiar People</h2>
                <p>Look at familiar people and remember who they are.</p>
                <button class="primary-button" onclick="startPeopleActivity()">
                    Start Activity
                </button>
            </div>

            <div class="dashboard-card">
                <h2>📖 Read & Respond</h2>
                <p>Read a short passage and answer questions about it.</p>
                <button class="primary-button" onclick="startReadRespond()">
                    Start Activity
                </button>
            </div>

        </main>
    `;
}

let memoryLevel = 1;
let memoryScore = 0;
let memoryCards = [];
let memoryFlipped = [];
let memoryMatched = 0;
let memoryLocked = false;

const memoryImages = [
    { name: "fish", image: "/static/memory-images/fish_1.png" },
    { name: "turtle", image: "/static/memory-images/turtle_1.png" },
    { name: "dolphin", image: "/static/memory-images/dolphin_1.png" },
    { name: "seahorse", image: "/static/memory-images/seahorse_1.png" },
    { name: "crab", image: "/static/memory-images/crab_1.png" },
    { name: "jellyfish", image: "/static/memory-images/jellyfish_1.png" },
    { name: "starfish", image: "/static/memory-images/starfish_1.png" },
    { name: "whale", image: "/static/memory-images/whale_1.png" }
];

function startMemoryGame() {
    memoryLevel = 1;
    memoryScore = 0;
    showMemoryLevelIntro();
}

function showMemoryLevelIntro() {

    const pairCount = memoryLevel === 1 ? 4 :
                      memoryLevel === 2 ? 6 : 8;

    app.innerHTML = `
        <main class="game-screen memory-game-screen">

            <div class="game-header">

                <button class="back-button"
                        onclick="showGames()">←</button>

                <div>
                    <div class="step-label">MEMORY ACTIVITY</div>
                    <h1>Find the Pairs</h1>
                </div>

            </div>

            <div class="memory-level-card">

                <div class="memory-game-icon">
                    🧠
                </div>

                <p class="memory-level-label">
                    LEVEL ${memoryLevel}
                </p>

                <h2>Find the matching pairs</h2>

                <p>
                    Turn over the cards and find
                    two matching pictures.
                </p>

                <div class="memory-reward">
                    ⭐ ${memoryScore} points
                </div>

                <p class="memory-difficulty">
                    ${pairCount} matching pairs
                </p>

                <button class="primary-button"
                        onclick="startMemoryRound()">
                    Start Level ${memoryLevel}
                </button>

            </div>

        </main>
    `;
}

function startMemoryRound() {

    const pairCount = memoryLevel === 1 ? 4 :
                      memoryLevel === 2 ? 6 : 8;

    memoryCards = memoryImages
        .slice(0, pairCount)
        .flatMap(item => [
            {
                name: item.name,
                image: item.image
            },
            {
                name: item.name,
                image: item.image
            }
        ]);

    memoryCards.sort(() => Math.random() - 0.5);

    memoryFlipped = [];
    memoryMatched = 0;
    memoryLocked = false;

    renderMemoryBoard();
}

function renderMemoryBoard() {

    app.innerHTML = `
        <main class="game-screen memory-game-screen">

            <div class="game-header">

                <button class="back-button"
                        onclick="showMemoryLevelIntro()">←</button>

                <div>
                    <div class="step-label">
                        LEVEL ${memoryLevel}
                    </div>

                    <h1>Find the Pairs</h1>
                </div>

            </div>

            <p class="game-instruction">
                Find all the matching pictures.
            </p>

            <div class="memory-progress">
                Pairs found:
                <strong>${memoryMatched}</strong>
                /
                ${memoryCards.length / 2}
            </div>

            <div class="memory-image-board">

                ${memoryCards.map((card, index) => `
                    <button
                        class="memory-image-card"
                        id="memory-card-${index}"
                        onclick="flipMemoryCard(${index})">

                        <span class="memory-card-back">?</span>

                        <img
                            src="${card.image}"
                            alt="${card.name}">
                    </button>
                `).join("")}

            </div>

            <p id="memory-message"
               class="game-message">
            </p>

        </main>
    `;
}

function flipMemoryCard(index) {

    if (memoryLocked) return;

    const cardElement =
        document.getElementById(`memory-card-${index}`);

    if (
        memoryFlipped.includes(index) ||
        cardElement.classList.contains("matched")
    ) {
        return;
    }

    cardElement.classList.add("flipped");

    memoryFlipped.push(index);

    if (memoryFlipped.length < 2) {
        return;
    }

    memoryLocked = true;

    const firstIndex = memoryFlipped[0];
    const secondIndex = memoryFlipped[1];

    const firstCard = memoryCards[firstIndex];
    const secondCard = memoryCards[secondIndex];

    if (firstCard.name === secondCard.name) {

        document
            .getElementById(`memory-card-${firstIndex}`)
            .classList.add("matched");

        document
            .getElementById(`memory-card-${secondIndex}`)
            .classList.add("matched");

        memoryMatched++;

        memoryScore += 5;

        memoryFlipped = [];
        memoryLocked = false;

        renderMemoryProgress();

        if (memoryMatched === memoryCards.length / 2) {

            setTimeout(() => {
                completeMemoryLevel();
            }, 600);
        }

    } else {

        setTimeout(() => {

            document
                .getElementById(`memory-card-${firstIndex}`)
                .classList.remove("flipped");

            document
                .getElementById(`memory-card-${secondIndex}`)
                .classList.remove("flipped");

            memoryFlipped = [];
            memoryLocked = false;

        }, 900);
    }
}

function renderMemoryProgress() {

    const progress = document.querySelector(".memory-progress");

    if (progress) {
        progress.innerHTML = `
            Pairs found:
            <strong>${memoryMatched}</strong>
            /
            ${memoryCards.length / 2}
        `;
    }
}

function completeMemoryLevel() {
    recordGameResult("Find the Pairs", memoryScore, memoryLevel);

    if (memoryLevel < 3) {

        app.innerHTML = `
            <main class="game-screen memory-game-screen">

                <div class="memory-reward-screen">

                    <div class="big-reward">
                        ⭐
                    </div>

                    <h1>Well done! 🌸</h1>

                    <p>
                        You found all the matching pairs.
                    </p>

                    <div class="reward-points">
                        +${memoryMatched * 5} points
                    </div>

                    <p>
                        Total: ${memoryScore} points
                    </p>

                    <button class="primary-button"
                            onclick="nextMemoryLevel()">
                        Next Level →
                    </button>

                </div>

            </main>
        `;

    } else {

        app.innerHTML = `
            <main class="game-screen memory-game-screen">

                <div class="memory-reward-screen">

                    <div class="big-reward">
                        🏆
                    </div>

                    <h1>Excellent! 🌸</h1>

                    <p>
                        You completed all 3 levels.
                    </p>

                    <div class="reward-points">
                        ⭐ ${memoryScore} points
                    </div>

                    <p>
                        Your memory is getting stronger.
                    </p>

                    <button class="primary-button"
                            onclick="showGames()">
                        Back to Activities
                    </button>

                </div>

            </main>
        `;
    }
}

function nextMemoryLevel() {

    memoryLevel++;

    showMemoryLevelIntro();
}

function startNumberGame() {
    sequenceLevel = 1;
    sequenceScore = 0;

    showSequenceLevelIntro();
}

function showSequenceLevelIntro() {
    const sequenceLength = sequenceLevel + 2;

    document.getElementById("app").innerHTML = `
        <main class="game-screen sequence-game-screen">

            <div class="game-header">
                <button class="back-button" onclick="showGames()">←</button>

                <div>
                    <div class="step-label">MEMORY ACTIVITY</div>
                    <h1>Remember the Sequence</h1>
                </div>
            </div>

            <div class="sequence-level-card">

                <div class="sequence-game-icon">
                    🧠
                </div>

                <p class="sequence-level-label">
                    LEVEL ${sequenceLevel}
                </p>

                <h2>Remember the numbers</h2>

                <p>
                    Watch the sequence carefully,
                    then tap the numbers in the same order.
                </p>

                <div class="sequence-reward">
                    ⭐ ${sequenceScore} points
                </div>

                <button class="primary-button"
                        onclick="startSequenceRound()">
                    Start Level ${sequenceLevel}
                </button>

            </div>

        </main>
    `;
}

function startSequenceRound() {

    const length = sequenceLevel + 2;

    sequence = [];

    for (let i = 0; i < length; i++) {
        sequence.push(Math.floor(Math.random() * 9) + 1);
    }

    sequenceAnswer = [];
    sequenceIndex = 0;

    document.getElementById("app").innerHTML = `
        <main class="game-screen sequence-game-screen">

            <div class="game-header">

                <div>
                    <div class="step-label">
                        LEVEL ${sequenceLevel}
                    </div>

                    <h1>Remember</h1>
                </div>

            </div>

            <div class="sequence-display-card">

                <p class="game-instruction">
                    Remember this sequence
                </p>

                <div id="sequence-display"
                     class="sequence-display">
                    ${sequence.join("   ")}
                </div>

                <p class="sequence-countdown">
                    Look carefully...
                </p>

            </div>

        </main>
    `;

    setTimeout(() => {
        showSequenceOptions();
    }, 3000);
}

function showSequenceOptions() {

    const shuffledNumbers = [...sequence];

    // Add extra numbers so the player has to remember
    while (shuffledNumbers.length < sequence.length + 3) {

        const number = Math.floor(Math.random() * 9) + 1;

        if (!shuffledNumbers.includes(number)) {
            shuffledNumbers.push(number);
        }
    }

    shuffledNumbers.sort(() => Math.random() - 0.5);

    document.getElementById("app").innerHTML = `
        <main class="game-screen sequence-game-screen">

            <div class="game-header">

                <div>
                    <div class="step-label">
                        LEVEL ${sequenceLevel}
                    </div>

                    <h1>Your Turn</h1>
                </div>

            </div>

            <div class="sequence-question-card">

                <p class="game-instruction">
                    Tap the numbers in the order you remember.
                </p>

                <div class="sequence-answer-display"
                     id="sequence-answer-display">
                    ${sequenceAnswer.map(() => "•").join(" ")}
                </div>

                <div class="sequence-options">

                    ${shuffledNumbers.map(number => `
                        <button class="sequence-number-button"
                                onclick="chooseSequenceNumber(${number})">
                            ${number}
                        </button>
                    `).join("")}

                </div>

                <p id="sequence-message"
                   class="game-message">
                </p>

            </div>

        </main>
    `;
}

function chooseSequenceNumber(number) {

    const message = document.getElementById("sequence-message");

    sequenceAnswer.push(number);

    const currentPosition = sequenceAnswer.length - 1;

    if (number !== sequence[currentPosition]) {

        message.innerText =
            "That's okay. Let's try this level again. 🌸";

        message.className = "game-message wrong";

        setTimeout(() => {
            showSequenceLevelIntro();
        }, 1200);

        return;
    }

    const answerDisplay =
        document.getElementById("sequence-answer-display");

    answerDisplay.innerText =
        sequenceAnswer.join("   ");

    if (sequenceAnswer.length === sequence.length) {

        sequenceScore += sequenceLevel * 10;

        setTimeout(() => {
            completeSequenceLevel();
        }, 600);
    }
}

function completeSequenceLevel() {
    recordGameResult("Remember the Sequence", sequenceScore, sequenceLevel);

    if (sequenceLevel < 3) {

        document.getElementById("app").innerHTML = `
            <main class="game-screen sequence-game-screen">

                <div class="sequence-reward-screen">

                    <div class="big-reward">
                        ⭐
                    </div>

                    <h1>Well done! 🌸</h1>

                    <p>
                        You remembered the whole sequence.
                    </p>

                    <div class="reward-points">
                        +${sequenceLevel * 10} points
                    </div>

                    <p>
                        Total: ${sequenceScore} points
                    </p>

                    <button class="primary-button"
                            onclick="nextSequenceLevel()">
                        Next Level →
                    </button>

                </div>

            </main>
        `;

    } else {

        document.getElementById("app").innerHTML = `
            <main class="game-screen sequence-game-screen">

                <div class="sequence-reward-screen">

                    <div class="big-reward">
                        🏆
                    </div>

                    <h1>Excellent! 🌸</h1>

                    <p>
                        You completed all 3 levels.
                    </p>

                    <div class="reward-points">
                        ⭐ ${sequenceScore} points
                    </div>

                    <p>
                        You did a great job remembering
                        the sequences.
                    </p>

                    <button class="primary-button"
                            onclick="showGames()">
                        Back to Activities
                    </button>

                </div>

            </main>
        `;
    }
}

function nextSequenceLevel() {

    sequenceLevel++;

    showSequenceLevelIntro();
}

function startNumberRound() {
    const display = document.getElementById("number-display");
    const startButton = document.getElementById("start-number-button");
    const options = document.getElementById("number-options");
    const message = document.getElementById("number-message");

    startButton.style.display = "none";
    options.innerHTML = "";
    message.innerText = "";

    const sequence = [];

    for (let i = 0; i < 3; i++) {
        sequence.push(Math.floor(Math.random() * 9) + 1);
    }

    display.innerText = sequence.join(" ");

    setTimeout(() => {

        display.innerText = "?";

        const shuffled = [...sequence].sort(() => Math.random() - 0.5);

        shuffled.forEach((number) => {
            const button = document.createElement("button");

            button.className = "number-option";
            button.innerText = number;

            button.onclick = () => {

                const chosen = Number(button.innerText);

                if (chosen === sequence[0]) {
                    message.innerText = "Correct! 🌸";
                    message.className = "game-message correct";
                } else {
                    message.innerText = "Try again!";
                    message.className = "game-message wrong";
                }
            };

            options.appendChild(button);
        });

    }, 2500);
}

let spotLevel = 1;
let spotScore = 0;
let spotFound = 0;

const spotLevels = [
    {
        level: 1,
        differences: 5,
        original: "/static/companio_spot_difference_levels/level_2_cow_5_differences/original.png",
        changed: "/static/companio_spot_difference_levels/level_2_cow_5_differences/changed.png",
        spots: [
            { x: 22, y: 25 },
            { x: 63, y: 28 },
            { x: 75, y: 35 },
            { x: 55, y: 65 },
            { x: 13, y: 82 }
        ]
    },

    {
        level: 2,
        differences: 7,
        original: "/static/companio_spot_difference_levels/level_3_icecream_7_differences/original.png",
        changed: "/static/companio_spot_difference_levels/level_3_icecream_7_differences/changed.png",
        spots: [
            { x: 18, y: 22 },
            { x: 50, y: 20 },
            { x: 67, y: 28 },
            { x: 77, y: 45 },
            { x: 25, y: 62 },
            { x: 55, y: 70 },
            { x: 88, y: 88 }
        ]
    },

    {
        level: 3,
        differences: 10,
        original: "/static/companio_spot_difference_levels/level_4_bugs_10_differences/original.png",
        changed: "/static/companio_spot_difference_levels/level_4_bugs_10_differences/changed.png",
        spots: [
            { x: 18, y: 28 },
            { x: 38, y: 22 },
            { x: 60, y: 25 },
            { x: 82, y: 25 },
            { x: 30, y: 48 },
            { x: 48, y: 50 },
            { x: 65, y: 52 },
            { x: 82, y: 55 },
            { x: 35, y: 75 },
            { x: 70, y: 78 }
        ]
    }
];

function startSpotDifference() {
    spotLevel = 1;
    spotScore = 0;
    showSpotLevelIntro();
}

function showSpotLevelIntro() {
    const level = spotLevels[spotLevel - 1];

    document.getElementById("app").innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <button class="back-button" onclick="showGames()">←</button>

                <div>
                    <div class="step-label">BRAIN ACTIVITY</div>
                    <h1>Spot the Difference</h1>
                </div>
            </div>

            <div class="memory-level-card">

                <div class="level-badge">
                    LEVEL ${level.level}
                </div>

                <h2>👀 Spot the Difference</h2>

                <p>
                    Find ${level.differences} differences
                    between the two pictures.
                </p>

                <p class="level-score">
                    ⭐ Points: ${spotScore}
                </p>

                <button class="primary-button"
                    onclick="startSpotRound()">
                    Start Level
                </button>

            </div>

        </main>
    `;
}

function startSpotRound() {
    const level = spotLevels[spotLevel - 1];

    spotFound = 0;

    document.getElementById("app").innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <button class="back-button"
                    onclick="showSpotLevelIntro()">←</button>

                <div>
                    <div class="step-label">LEVEL ${level.level}</div>
                    <h1>Spot the Difference</h1>
                </div>
            </div>

            <p class="game-instruction">
                Look carefully and tap the differences.
            </p>

            <div class="spot-images">

                <div class="spot-image-box">
                    <span>Picture 1</span>

                    <div class="spot-picture">
                        <img src="${level.original}">
                        ${createSpotHotspots(level)}
                    </div>
                </div>

                <div class="spot-image-box">
                    <span>Picture 2</span>

                    <div class="spot-picture">
                        <img src="${level.changed}">
                        ${createSpotHotspots(level)}
                    </div>
                </div>

            </div>

            <div class="spot-progress">
                Differences found:
                <strong id="spot-found">0</strong>
                / ${level.differences}
            </div>

        </main>
    `;
}

function createSpotHotspots(level) {
    return level.spots.map((spot, index) => `
        <button
            class="spot-hotspot"
            style="left:${spot.x}%; top:${spot.y}%"
            onclick="findSpotDifference(${index}, this)">
        </button>
    `).join("");
}

function findSpotDifference(index, button) {

    if (button.classList.contains("found")) {
        return;
    }

    button.classList.add("found");

    spotFound++;

    document.getElementById("spot-found").innerText = spotFound;

    if (spotFound === spotLevels[spotLevel - 1].differences) {
        spotScore += spotLevel * 10;

        setTimeout(() => {
            completeSpotLevel();
        }, 600);
    }
}

function completeSpotLevel() {
    recordGameResult("Spot the Difference", spotScore, spotLevel);

    if (spotLevel < spotLevels.length) {

        document.getElementById("app").innerHTML = `
            <main class="game-screen">

                <div class="memory-reward-screen">

                    <div class="reward-icon">🌟</div>

                    <h1>Level Complete!</h1>

                    <p>
                        You found all the differences!
                    </p>

                    <h2>⭐⭐ Great job!</h2>

                    <p>
                        Points earned:
                        <strong>+${spotLevel * 10}</strong>
                    </p>

                    <button class="primary-button"
                        onclick="nextSpotLevel()">
                        Next Level →
                    </button>

                </div>

            </main>
        `;

    } else {

        document.getElementById("app").innerHTML = `
            <main class="game-screen">

                <div class="memory-reward-screen">

                    <div class="reward-icon">🏆</div>

                    <h1>All Levels Complete!</h1>

                    <p>
                        Amazing! You found every difference.
                    </p>

                    <h2>⭐⭐⭐</h2>

                    <p>
                        Your total score:
                        <strong>${spotScore}</strong>
                    </p>

                    <button class="primary-button"
                        onclick="showGames()">
                        Back to Activities
                    </button>

                </div>

            </main>
        `;
    }
}

function nextSpotLevel() {
    spotLevel++;
    showSpotLevelIntro();
}

function startPeopleActivity() {
    document.getElementById("app").innerHTML = `
        <main class="form-screen">

            <div class="screen-header">
                <button class="back-button" onclick="showGames()">←</button>

                <div>
                    <div class="step-label">PERSONAL</div>
                    <h1>Familiar People</h1>
                </div>
            </div>

            <div class="dashboard-card" style="margin-top: 40px;">

                <div style="font-size: 50px; text-align: center;">👥</div>

                <h2>People You Know</h2>

                <p>
                    Add people who are familiar and important to you.
                </p>

                <button class="primary-button"
                        onclick="showAddPersonForm()">
                    + Add a Person
                </button>

            </div>

            <div id="people-list"></div>

        </main>
    `;

    renderPeopleList();
}

let familiarPeople = [];

function showAddPersonForm() {
    document.getElementById("app").innerHTML = `
        <main class="form-screen">

            <div class="screen-header">
                <button class="back-button"
                        onclick="startPeopleActivity()">←</button>

                <div>
                    <div class="step-label">PERSONAL</div>
                    <h1>Add a Person</h1>
                </div>
            </div>

            <div class="dashboard-card" style="margin-top: 40px;">

                <label>Name</label>
                <input
                    type="text"
                    id="person-name"
                    placeholder="Enter their name"
                >

                <label>Relationship</label>
                <input
                    type="text"
                    id="person-relation"
                    placeholder="e.g. Daughter, Brother, Friend"
                >

                <button class="primary-button"
                        onclick="saveFamiliarPerson()">
                    Save Person
                </button>

            </div>

        </main>
    `;
}

function saveFamiliarPerson() {
    const name = document.getElementById("person-name").value.trim();
    const relation = document.getElementById("person-relation").value.trim();

    if (!name || !relation) {
        alert("Please enter the name and relationship.");
        return;
    }

    familiarPeople.push({
        name: name,
        relation: relation
    });

    startPeopleActivity();
}

function renderPeopleList() {
    const list = document.getElementById("people-list");

    if (!list) return;

    if (familiarPeople.length === 0) {
        list.innerHTML = `
            <div class="dashboard-card">
                <p style="text-align: center;">
                    No familiar people added yet.
                </p>
            </div>
        `;
        return;
    }

    list.innerHTML = familiarPeople.map((person, index) => `
        <div class="dashboard-card familiar-person-card">

            <div>
                <h2>👤 ${person.name}</h2>
                <p>${person.relation}</p>
            </div>

            <button
                class="secondary-button"
                onclick="removeFamiliarPerson(${index})">
                Remove
            </button>

        </div>
    `).join("");
}

function removeFamiliarPerson(index) {
    familiarPeople.splice(index, 1);
    startPeopleActivity();
}

function checkPersonAnswer(button, correct) {
    const message = document.getElementById("people-message");

    if (correct) {
        message.innerText = "That's right! 🌸";
        message.className = "game-message correct";
    } else {
        message.innerText = "That's okay, try another one.";
        message.className = "game-message wrong";
    }
}

function showTalkToMe() {
    document.getElementById("app").innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <button class="back-button" onclick="showPatientDashboard()">←</button>

                <div>
                    <div class="step-label">COMPANIO</div>
                    <h1>Talk to Me</h1>
                </div>
            </div>

            <div class="talk-container">

                <div class="companio-message">
                    <div class="message-icon">🌸</div>
                    <p>Hello! I'm here with you.</p>
                    <p>How are you feeling today?</p>
                </div>

                <div class="talk-options">

                    <button onclick="talkResponse('happy')">
                        😊 I'm feeling good
                    </button>

                    <button onclick="talkResponse('okay')">
                        😐 I'm okay
                    </button>

                    <button onclick="talkResponse('sad')">
                        😔 I'm not feeling good
                    </button>

                </div>

                <p id="talk-response" class="game-message"></p>

            </div>

        </main>
    `;
}

function showProgress() {
    document.getElementById("app").innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <button class="back-button" onclick="showPatientDashboard()">←</button>

                <div>
                    <div class="step-label">MY PROGRESS</div>
                    <h1>Your Progress</h1>
                </div>
            </div>

            <div class="progress-container" id="progress-container">
                <p class="game-message">Loading your progress…</p>
            </div>

        </main>
    `;

    renderProgress();
}

async function renderProgress() {
    const container = document.getElementById("progress-container");
    if (!container) return;

    try {
        let a = state.assessment;
        if (!a) {
            const p = await api(`/api/patients/${state.patientId}`);
            a = p.latest_assessment;
            state.assessment = a;
        }

        if (!a) {
            container.innerHTML = `
                <div class="progress-card">
                    <span>🌸</span>
                    <div>
                        <strong>No assessment yet</strong>
                        <p>Complete the support questionnaire to see your results.</p>
                    </div>
                </div>
            `;
            return;
        }

        const doms = a.domain_scores || {};
        const bars = Object.keys(doms)
            .filter(k => doms[k].max > 0)
            .map(k => `
                <div class="domain-row">
                    <span class="domain-name">${esc(k.replace(/_/g, " "))}</span>
                    <div class="domain-bar"><div style="width:${Math.min(100, Number(doms[k].percent) || 0)}%"></div></div>
                    <span class="domain-pct">${Number(doms[k].percent || 0).toFixed(0)}%</span>
                </div>
            `).join("");

        const observations = (a.key_observations || []).map(x => `<li>${esc(x)}</li>`).join("");
        const steps = (a.suggested_next_steps || []).map(x => `<li>${esc(x)}</li>`).join("");
        const riskClass = "r-" + (a.risk_category || "none").toLowerCase();

        container.innerHTML = `
            <div class="progress-card">
                <span>🧠</span>
                <div>
                    <strong>Cognitive Score: ${a.cognitive_score} / ${a.max_score}</strong>
                    <p><span class="risk-pill ${riskClass}">${esc((a.risk_category || "").toUpperCase())} RISK</span></p>
                </div>
            </div>

            <div class="progress-card domain-focus">
                <div>
                    <strong>By Area</strong>
                </div>
            </div>
            ${bars}

            <div class="progress-card">
                <div>
                    <strong>Key Observations</strong>
                </div>
            </div>
            <ul class="progress-list">${observations || "<li>No significant concerns identified.</li>"}</ul>

            <div class="progress-card">
                <div>
                    <strong>Suggested Next Steps</strong>
                </div>
            </div>
            <ul class="progress-list">${steps || "<li>Continue routine check-ins.</li>"}</ul>

            <div class="progress-card">
                <div>
                    <strong>Important</strong>
                    <p>${esc(a.disclaimer)}</p>
                </div>
            </div>
        `;
    } catch (e) {
        container.innerHTML = `<p class="game-message wrong">${esc(e.message)}</p>`;
    }
}

function showMemories() {
    document.getElementById("app").innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <button class="back-button" onclick="showPatientDashboard()">←</button>

                <div>
                    <div class="step-label">MY MEMORIES</div>
                    <h1>My Memories</h1>
                </div>
            </div>

            <div class="memories-container">

                <div class="memory-card">
                    <div class="memory-icon">📷</div>
                    <div>
                        <h2>Family</h2>
                        <p>Photos and memories with your loved ones.</p>
                    </div>
                </div>

                <div class="memory-card">
                    <div class="memory-icon">🏡</div>
                    <div>
                        <h2>Special Places</h2>
                        <p>Places that are familiar and meaningful to you.</p>
                    </div>
                </div>

                <div class="memory-card">
                    <div class="memory-icon">🎵</div>
                    <div>
                        <h2>Favourite Things</h2>
                        <p>Music, activities and things you enjoy.</p>
                    </div>
                </div>

                <button class="primary-button" onclick="addMemory()">
                    + Add a Memory
                </button>

            </div>

        </main>
    `;
}

function addMemory() {
    alert("Memory upload will be added later.");
}

function showHelp() {
    document.getElementById("app").innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <button class="back-button" onclick="showPatientDashboard()">←</button>

                <div>
                    <div class="step-label">SUPPORT</div>
                    <h1>I Need Help</h1>
                </div>
            </div>

            <div class="help-container">

                <p class="game-instruction">
                    What do you need help with?
                </p>

                <button class="help-option" onclick="helpResponse('medicine')">
                    💊
                    <span>
                        <strong>Medicine</strong>
                        <small>I need help with my medicine.</small>
                    </span>
                </button>

                <button class="help-option" onclick="helpResponse('routine')">
                    🕐
                    <span>
                        <strong>Daily Routine</strong>
                        <small>I'm not sure what I should do now.</small>
                    </span>
                </button>

                <button class="help-option" onclick="helpResponse('person')">
                    👩‍⚕️
                    <span>
                        <strong>Contact Someone</strong>
                        <small>I would like to contact my caregiver.</small>
                    </span>
                </button>

                <button class="help-option" onclick="helpResponse('other')">
                    🌸
                    <span>
                        <strong>Something Else</strong>
                        <small>I need help with something else.</small>
                    </span>
                </button>

                <p id="help-message" class="game-message"></p>

            </div>

        </main>
    `;
}

function helpResponse(type) {
    const message = document.getElementById("help-message");

    if (type === "medicine") {
        message.innerText = "Your medicine reminders are available on your dashboard.";
    } else if (type === "routine") {
        message.innerText = "Let's check what is next in your daily routine.";
    } else if (type === "person") {
        message.innerText = "Your caregiver can be contacted from here.";
    } else {
        message.innerText = "I'm here to help. Tell me what you need.";
    }

    message.className = "game-message correct";
}

function showRoutine() {
    document.getElementById("app").innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <button class="back-button" onclick="showPatientDashboard()">←</button>

                <div>
                    <div class="step-label">DAILY ROUTINE</div>
                    <h1>My Routine</h1>
                </div>
            </div>

            <div class="routine-full" id="routine-full">
                <p class="game-message">Loading your routine…</p>
            </div>

        </main>
    `;

    loadRoutine();
}

async function loadRoutine() {
    const container = document.getElementById("routine-full");
    if (!container) return;

    try {
        const reminders = await api(`/api/reminders/patient/${state.patientId}`);

        if (!reminders.length) {
            container.innerHTML = `
                <div class="routine-full-item">
                    <span>🌸</span>
                    <div>
                        <strong>No routine yet</strong>
                        <p>Set up your daily routine to see it here.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = reminders.map(r => `
            <div class="routine-full-item">
                <span>${r.reminder_type === "medication" ? "💊" : "⏰"}</span>
                <div>
                    <strong>${esc(r.title)}</strong>
                    <p>${esc(r.description || "")} · ${fmtReminderTime(r.scheduled_at)}${r.is_completed ? " · Done ✓" : ""}</p>
                </div>
            </div>
        `).join("");
    } catch (e) {
        container.innerHTML = `<p class="game-message wrong">${esc(e.message)}</p>`;
    }
}

function showMedicines() {
    document.getElementById("app").innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <button class="back-button" onclick="showPatientDashboard()">←</button>

                <div>
                    <div class="step-label">MEDICINE</div>
                    <h1>Medicine Reminders</h1>
                </div>
            </div>

            <div class="medicine-container" id="medicine-list">
                <p class="game-message">Loading reminders…</p>
            </div>

        </main>
    `;

    loadMedicines();
}

async function loadMedicines() {
    const list = document.getElementById("medicine-list");
    if (!list) return;

    try {
        const reminders = await api(`/api/reminders/patient/${state.patientId}`);
        const meds = reminders.filter(r => r.reminder_type === "medication");

        if (!meds.length) {
            list.innerHTML = `
                <div class="medicine-card">
                    <div class="medicine-icon">💊</div>
                    <div class="medicine-info">
                        <strong>No medicine reminders</strong>
                        <p>Save a routine with medicines to see them here.</p>
                    </div>
                </div>
            `;
            return;
        }

        list.innerHTML = meds.map(r => `
            <div class="medicine-card ${r.is_completed ? "medicine-taken" : ""}">
                <div class="medicine-icon">💊</div>
                <div class="medicine-info">
                    <strong>${esc(r.title)}</strong>
                    <p>${esc(r.description || "")}</p>
                    <span>${fmtReminderTime(r.scheduled_at)}</span>
                </div>
                ${r.is_completed
                    ? `<button disabled>Taken ✓</button>`
                    : `<button onclick="markMedicineTaken(${r.id}, this)">Take</button>`}
            </div>
        `).join("") + `<p id="medicine-message" class="game-message"></p>`;
    } catch (e) {
        list.innerHTML = `<p class="game-message wrong">${esc(e.message)}</p>`;
    }
}

async function markMedicineTaken(reminderId, button) {
    try {
        await api(`/api/reminders/${reminderId}/complete`, { method: "PUT" });
        button.innerText = "Taken ✓";
        button.disabled = true;
        button.parentElement.classList.add("medicine-taken");

        const msg = document.getElementById("medicine-message");
        if (msg) msg.innerText = "Medicine marked as taken. 🌸";
    } catch (e) {
        const msg = document.getElementById("medicine-message");
        if (msg) msg.innerText = e.message;
    }
}

function showSettings() {
    document.getElementById("app").innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <button class="back-button" onclick="showPatientDashboard()">←</button>

                <div>
                    <div class="step-label">SETTINGS</div>
                    <h1>Settings</h1>
                </div>
            </div>

            <div class="settings-container">

                <div class="settings-card">
                    <span>🌐</span>
                    <div>
                        <strong>Language</strong>
                        <p>English</p>
                    </div>
                </div>

                <div class="settings-card">
                    <span>💬</span>
                    <div>
                        <strong>Communication</strong>
                        <p>Voice + Text</p>
                    </div>
                </div>

                <div class="settings-card">
                    <span>🔔</span>
                    <div>
                        <strong>Notifications</strong>
                        <p>Medicine and routine reminders</p>
                    </div>

                    <label class="switch">
                        <input type="checkbox" checked>
                        <span class="slider"></span>
                    </label>
                </div>

            </div>

        </main>
    `;
}

function showNextActivity() {
    document.getElementById("app").innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <button class="back-button" onclick="showPatientDashboard()">←</button>

                <div>
                    <div class="step-label">YOUR NEXT ACTIVITY</div>
                    <h1>What do I do now?</h1>
                </div>
            </div>

            <div class="next-activity-card">

                <div class="next-activity-icon">
                    🧩
                </div>

                <h2>Time for a Brain Activity</h2>

                <p>
                    Let's spend a few minutes doing something fun
                    and engaging.
                </p>

                <button class="primary-button" onclick="showGames()">
                    Start Activity
                </button>

                <button class="routine-view-button"
                    onclick="showPatientDashboard()">
                    I'll do it later
                </button>

            </div>

        </main>
    `;
}

function showPatientProfile() {
    document.getElementById("app").innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <button class="back-button" onclick="showPatientDashboard()">←</button>

                <div>
                    <div class="step-label">MY PROFILE</div>
                    <h1>My Profile</h1>
                </div>
            </div>

            <div class="profile-container">

                <div class="profile-photo">
                    👤
                </div>

                <div class="profile-card">
                    <strong>Name</strong>
                    <p>Patient Name</p>
                </div>

                <div class="profile-card">
                    <strong>Age</strong>
                    <p>65 years</p>
                </div>

                <div class="profile-card">
                    <strong>Patient ID</strong>
                    <p>CP-48291</p>
                </div>

            </div>

        </main>
    `;
}

let whatDidYouSeeLevel = 1;
let whatDidYouSeeScore = 0;
let whatDidYouSeeQuestion = 0;

const whatDidYouSeeLevels = [
    {
        level: 1,
        image: "/static/what-did-you-see/level1_living_room.png",
        seconds: 8,
        questions: [
            {
                question: "What color was the sofa?",
                options: ["Blue", "Green", "Red", "Yellow"],
                answer: "Blue"
            },
            {
                question: "What color was the lamp?",
                options: ["Blue", "Red", "Green", "Yellow"],
                answer: "Red"
            },
            {
                question: "What was on the wall?",
                options: ["A picture", "A clock", "A mirror", "A TV"],
                answer: "A picture"
            }
        ]
    },

    {
        level: 2,
        image: "/static/what-did-you-see/level2_kitchen.png",
        seconds: 10,
        questions: [
            {
                question: "What color was the refrigerator?",
                options: ["Green", "Blue", "Red", "Yellow"],
                answer: "Green"
            },
            {
                question: "What color was the large pot?",
                options: ["Green", "Blue", "Red", "Yellow"],
                answer: "Green"
            },
            {
                question: "What color was the small cup?",
                options: ["Blue", "Red", "Green", "Yellow"],
                answer: "Blue"
            },
            {
                question: "What was hanging near the cabinet?",
                options: ["Fruit", "Keys", "Clothes", "Plates"],
                answer: "Fruit"
            },
            {
                question: "What color was the oven door?",
                options: ["Blue", "Green", "Red", "Yellow"],
                answer: "Blue"
            }
        ]
    },

    {
        level: 3,
        image: "/static/what-did-you-see/level3_park.png",
        seconds: 12,
        questions: [
            {
                question: "What animal was the woman walking?",
                options: ["Dog", "Cat", "Rabbit", "Bird"],
                answer: "Dog"
            },
            {
                question: "Who was sitting on the bench?",
                options: ["A man", "A woman", "A child", "Nobody"],
                answer: "A man"
            },
            {
                question: "What was the man on the grass riding?",
                options: ["A bicycle", "A scooter", "A skateboard", "A car"],
                answer: "A bicycle"
            },
            {
                question: "What was the boy playing with?",
                options: ["A football", "A kite", "A ball", "A bicycle"],
                answer: "A ball"
            },
            {
                question: "What was the child in the foreground eating?",
                options: ["Ice cream", "Cake", "Apple", "Candy"],
                answer: "Ice cream"
            },
            {
                question: "What color was the woman's jacket?",
                options: ["Pink", "Blue", "Green", "Yellow"],
                answer: "Pink"
            },
            {
                question: "What was the man on the bench reading?",
                options: ["A newspaper", "A book", "A magazine", "A letter"],
                answer: "A book"
            }
        ]
    }
];

function startWhatDidYouSee() {
    whatDidYouSeeLevel = 1;
    whatDidYouSeeScore = 0;
    showWhatDidYouSeeIntro();
}

function showWhatDidYouSeeIntro() {
    const level = whatDidYouSeeLevels[whatDidYouSeeLevel - 1];

    document.getElementById("app").innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <button class="back-button" onclick="showGames()">←</button>

                <div>
                    <div class="step-label">ATTENTION ACTIVITY</div>
                    <h1>What Did You See?</h1>
                </div>
            </div>

            <div class="memory-level-card">

                <div class="level-badge">
                    LEVEL ${level.level}
                </div>

                <h2>🧠 What Did You See?</h2>

                <p>
                    Look carefully at the picture and remember
                    what you see.
                </p>

                <p>
                    You will have <strong>${level.seconds} seconds</strong>
                    to look.
                </p>

                <p class="level-score">
                    ⭐ Points: ${whatDidYouSeeScore}
                </p>

                <button class="primary-button"
                    onclick="showWhatDidYouSeeImage()">
                    Start Level
                </button>

            </div>

        </main>
    `;
}

function showWhatDidYouSeeImage() {
    const level = whatDidYouSeeLevels[whatDidYouSeeLevel - 1];

    document.getElementById("app").innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <div>
                    <div class="step-label">LEVEL ${level.level}</div>
                    <h1>Look Carefully 👀</h1>
                </div>
            </div>

            <p class="game-instruction">
                Remember as much as you can.
            </p>

            <div class="what-see-image-container">
                <img
                    src="${level.image}"
                    class="what-see-image"
                >
            </div>

            <div class="what-see-timer">
                <span id="what-see-countdown">
                    ${level.seconds}
                </span> seconds
            </div>

        </main>
    `;

    let remaining = level.seconds;

    const timer = setInterval(() => {
        remaining--;

        const countdown =
            document.getElementById("what-see-countdown");

        if (countdown) {
            countdown.innerText = remaining;
        }

        if (remaining <= 0) {
            clearInterval(timer);
            showWhatDidYouSeeQuestion();
        }

    }, 1000);
}

function showWhatDidYouSeeQuestion() {
    const level = whatDidYouSeeLevels[whatDidYouSeeLevel - 1];
    const current = level.questions[whatDidYouSeeQuestion];

    document.getElementById("app").innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <button class="back-button"
                    onclick="showWhatDidYouSeeIntro()">←</button>

                <div>
                    <div class="step-label">
                        LEVEL ${level.level}
                    </div>
                    <h1>What Did You See?</h1>
                </div>
            </div>

            <div class="what-see-question">

                <p class="question-count">
                    Question ${whatDidYouSeeQuestion + 1}
                    / ${level.questions.length}
                </p>

                <h2>${current.question}</h2>

                <div class="what-see-options">

                    ${current.options.map(option => `
                        <button
                            onclick="answerWhatDidYouSee('${option.replace(/'/g, "\\'")}')">
                            ${option}
                        </button>
                    `).join("")}

                </div>

                <p id="what-see-message"
                    class="game-message">
                </p>

            </div>

        </main>
    `;
}

function answerWhatDidYouSee(selected) {
    const level = whatDidYouSeeLevels[whatDidYouSeeLevel - 1];
    const current = level.questions[whatDidYouSeeQuestion];
    const message = document.getElementById("what-see-message");

    if (selected === current.answer) {
        whatDidYouSeeScore += whatDidYouSeeLevel * 10;

        message.innerText = "Correct! 🌟";
        message.className = "game-message correct";

        setTimeout(() => {
            nextWhatDidYouSeeQuestion();
        }, 700);

    } else {
        message.innerText = "Not quite — let's keep going! 💛";
        message.className = "game-message wrong";

        setTimeout(() => {
            nextWhatDidYouSeeQuestion();
        }, 700);
    }
}

function nextWhatDidYouSeeQuestion() {
    const level = whatDidYouSeeLevels[whatDidYouSeeLevel - 1];

    whatDidYouSeeQuestion++;

    if (whatDidYouSeeQuestion >= level.questions.length) {
        completeWhatDidYouSeeLevel();
    } else {
        showWhatDidYouSeeQuestion();
    }
}

function completeWhatDidYouSeeLevel() {
    const level = whatDidYouSeeLevels[whatDidYouSeeLevel - 1];
    recordGameResult("What Did You See?", whatDidYouSeeScore, whatDidYouSeeLevel);

    if (whatDidYouSeeLevel < whatDidYouSeeLevels.length) {

        document.getElementById("app").innerHTML = `
            <main class="game-screen">

                <div class="memory-reward-screen">

                    <div class="reward-icon">🌟</div>

                    <h1>Level Complete!</h1>

                    <p>You finished all the questions.</p>

                    <h2>⭐ Great job!</h2>

                    <p>
                        Your score:
                        <strong>${whatDidYouSeeScore}</strong>
                    </p>

                    <button class="primary-button"
                        onclick="nextWhatDidYouSeeLevel()">
                        Next Level →
                    </button>

                </div>

            </main>
        `;

    } else {

        document.getElementById("app").innerHTML = `
            <main class="game-screen">

                <div class="memory-reward-screen">

                    <div class="reward-icon">🏆</div>

                    <h1>All Levels Complete!</h1>

                    <p>
                        You remembered so many details!
                    </p>

                    <h2>⭐⭐⭐</h2>

                    <p>
                        Total score:
                        <strong>${whatDidYouSeeScore}</strong>
                    </p>

                    <button class="primary-button"
                        onclick="showGames()">
                        Back to Activities
                    </button>

                </div>

            </main>
        `;
    }
}

function nextWhatDidYouSeeLevel() {
    whatDidYouSeeLevel++;
    whatDidYouSeeQuestion = 0;
    showWhatDidYouSeeIntro();
}

// ==================== READ & RESPOND ====================

let readRespondLevel = 1;
let readRespondScore = 0;
let readRespondQuestion = 0;

const readRespondLevels = [
    {
        title: "A Morning at the Park",
        passage: "Riya went to the park with her grandmother one sunny morning. They sat under a big tree and watched the birds. Riya saw a red kite flying high in the sky. After a while, they walked home together.",
        questions: [
            {
                question: "Who went to the park with Riya?",
                options: ["Her grandmother", "Her brother", "Her teacher"],
                answer: 0
            },
            {
                question: "What did they sit under?",
                options: ["A small house", "A big tree", "A bridge"],
                answer: 1
            },
            {
                question: "What color was the kite?",
                options: ["Blue", "Green", "Red"],
                answer: 2
            }
        ]
    },

    {
        title: "The Family Lunch",
        passage: "On Sunday, Arun's family had lunch together at home. His mother prepared rice, vegetables and dal. Arun helped set the table while his sister brought the glasses. After lunch, everyone sat together and talked about their week.",
        questions: [
            {
                question: "When did the family have lunch?",
                options: ["Monday", "Sunday", "Friday"],
                answer: 1
            },
            {
                question: "Where did the family have lunch?",
                options: ["At home", "At a restaurant", "At the park"],
                answer: 0
            },
            {
                question: "Who prepared the food?",
                options: ["Arun", "His sister", "His mother"],
                answer: 2
            },
            {
                question: "What did Arun help with?",
                options: ["Cooking", "Setting the table", "Washing clothes"],
                answer: 1
            },
            {
                question: "What did everyone do after lunch?",
                options: ["Went outside", "Talked together", "Went to sleep"],
                answer: 1
            }
        ]
    },

    {
        title: "A Visit to the Market",
        passage: "Meena visited the local market with her daughter in the evening. They bought fresh vegetables, apples and some flowers. The market was busy, and many people were walking from one shop to another. Before going home, Meena stopped at a small tea shop and had a cup of tea with her daughter.",
        questions: [
            {
                question: "Who went to the market with Meena?",
                options: ["Her daughter", "Her sister", "Her friend"],
                answer: 0
            },
            {
                question: "When did they visit the market?",
                options: ["In the morning", "At noon", "In the evening"],
                answer: 2
            },
            {
                question: "Which fruit did they buy?",
                options: ["Apples", "Bananas", "Mangoes"],
                answer: 0
            },
            {
                question: "What else did they buy?",
                options: ["Books", "Flowers", "Shoes"],
                answer: 1
            },
            {
                question: "How was the market?",
                options: ["Quiet", "Empty", "Busy"],
                answer: 2
            },
            {
                question: "Where did Meena stop before going home?",
                options: ["A tea shop", "A library", "A school"],
                answer: 0
            },
            {
                question: "Who had tea with Meena?",
                options: ["Her daughter", "Her friend", "Her neighbor"],
                answer: 0
            }
        ]
    }
];

function startReadRespond() {
    readRespondLevel = 1;
    readRespondScore = 0;
    readRespondQuestion = 0;

    showReadRespondIntro();
}

function showReadRespondIntro() {
    const level = readRespondLevels[readRespondLevel - 1];

    document.getElementById("app").innerHTML = `
        <main class="form-screen">

            <div class="screen-header">
                <button class="back-button" onclick="showGames()">←</button>

                <div>
                    <div class="step-label">READ & RESPOND</div>
                    <h1>${level.title}</h1>
                </div>
            </div>

            <div class="dashboard-card" style="margin-top: 40px; text-align: center;">

                <div style="font-size: 50px;">📖</div>

                <h2>Level ${readRespondLevel} of 3</h2>

                <p>
                    Read the passage carefully and answer the questions
                    that follow.
                </p>

                <button class="primary-button" onclick="startReadRespondLevel()">
                    Start Level
                </button>

            </div>

        </main>
    `;
}

function startReadRespondLevel() {
    readRespondQuestion = 0;
    showReadRespondPassage();
}

function showReadRespondPassage() {
    const level = readRespondLevels[readRespondLevel - 1];

    document.getElementById("app").innerHTML = `
        <main class="form-screen">

            <div class="screen-header">
                <button class="back-button" onclick="showGames()">←</button>

                <div>
                    <div class="step-label">LEVEL ${readRespondLevel}</div>
                    <h1>Read Carefully</h1>
                </div>
            </div>

            <div class="dashboard-card" style="margin-top: 40px;">

                <h2>${level.title}</h2>

                <div class="reading-passage">
                    ${level.passage}
                </div>

                <button class="primary-button"
                        onclick="showReadRespondQuestion()">
                    Continue
                </button>

            </div>

        </main>
    `;
}

function showReadRespondQuestion() {
    const level = readRespondLevels[readRespondLevel - 1];
    const question = level.questions[readRespondQuestion];

    document.getElementById("app").innerHTML = `
        <main class="form-screen">

            <div class="screen-header">
                <button class="back-button" onclick="showGames()">←</button>

                <div>
                    <div class="step-label">
                        QUESTION ${readRespondQuestion + 1}
                        OF ${level.questions.length}
                    </div>
                    <h1>Read & Respond</h1>
                </div>
            </div>

            <div class="dashboard-card" style="margin-top: 40px;">

                <div class="reading-question">
                    ${question.question}
                </div>

                <div class="reading-options">

                    ${question.options.map((option, index) => `
                        <button
                            class="reading-option"
                            onclick="answerReadRespond(${index})">
                            ${option}
                        </button>
                    `).join("")}

                </div>

            </div>

        </main>
    `;
}

function answerReadRespond(selectedAnswer) {
    const level = readRespondLevels[readRespondLevel - 1];
    const question = level.questions[readRespondQuestion];

    if (selectedAnswer === question.answer) {
        readRespondScore += 10;
    }

    readRespondQuestion++;

    if (readRespondQuestion < level.questions.length) {
        showReadRespondQuestion();
    } else {
        completeReadRespondLevel();
    }
}

function completeReadRespondLevel() {
    recordGameResult("Read & Respond", readRespondScore, readRespondLevel);
    document.getElementById("app").innerHTML = `
        <main class="form-screen">

            <div class="dashboard-card"
                 style="margin-top: 80px; text-align: center;">

                <div style="font-size: 60px;">⭐</div>

                <h1>Well Done!</h1>

                <p>
                    You completed Level ${readRespondLevel}.
                </p>

                <div class="score-card">
                    <strong>Your Score</strong>
                    <span>${readRespondScore}</span>
                </div>

                ${
                    readRespondLevel < 3
                    ? `
                        <p>Ready for the next level?</p>

                        <button class="primary-button"
                                onclick="nextReadRespondLevel()">
                            Next Level
                        </button>
                    `
                    : `
                        <p>You completed all three levels!</p>

                        <button class="primary-button"
                                onclick="showGames()">
                            Back to Activities
                        </button>
                    `
                }

            </div>

        </main>
    `;
}

function nextReadRespondLevel() {
    readRespondLevel++;
    showReadRespondIntro();
}

function showPatientStartChoice() {
    document.getElementById("app").innerHTML = `
        <main class="form-screen access-choice-screen">

            <div class="screen-header">
                <div>
                    <div class="step-label">COMPANIO</div>
                    <h1>What would you like to do?</h1>
                </div>
            </div>

            <div class="access-choice-content">

                <p class="access-choice-description">
                    Choose where you'd like to go.
                </p>

                <div class="access-choice-options">

                    <button class="access-choice-card"
                            onclick="showPatientDashboard()">
                        <div class="access-choice-icon">🏠</div>

                        <div>
                            <h2>Open Dashboard</h2>
                            <p>
                                View your routine, medicines, hydration,
                                memories and daily activities.
                            </p>
                        </div>

                        <span class="access-arrow">→</span>
                    </button>

                    <button class="access-choice-card"
                            onclick="showGames()">
                        <div class="access-choice-icon">🧠</div>

                        <div>
                            <h2>Play Games</h2>
                            <p>
                                Choose a brain activity and start playing.
                            </p>
                        </div>

                        <span class="access-arrow">→</span>
                    </button>

                </div>
            </div>

        </main>
    `;
}

function showAccessChoice() {
    document.getElementById("app").innerHTML = `
        <main class="form-screen access-choice-screen">

            <div class="screen-header">
                <div>
                    <div class="step-label">SETUP COMPLETE</div>
                    <h1>Who will be using Companio?</h1>
                </div>
            </div>

            <p class="setup-intro-description">
                Choose how you would like to use Companio.
            </p>

            <div class="access-choice-card patient-access"
                 onclick="openPatientAccess()">

                <div class="access-icon">👤</div>

                <div>
                    <h2>Patient</h2>
                    <p>
                        Play activities, manage your routine,
                        view memories and use your daily companion.
                    </p>
                </div>

                <span class="access-arrow">→</span>
            </div>

            <div class="access-choice-card caregiver-access"
                 onclick="openCaregiverAccess()">

                <div class="access-icon">👥</div>

                <div>
                    <h2>Caregiver</h2>
                    <p>
                        View activities, progress, routine,
                        medicines and updates.
                    </p>
                </div>

                <span class="access-arrow">→</span>
            </div>

        </main>
    `;
}

function openPatientAccess() {
    showPatientDashboard();
}

function openCaregiverAccess() {
    showCaregiverDashboard();
}