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
                <span></span>
                <span></span>
                <span class="active"></span>
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
                <span class="active"></span>
                <span></span>
                <span></span>
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

                    <button onclick="selectLanguage('kha')">
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


function saveRoutine() {
    showPatientDashboard();
}  

function showPatientDashboard() {
    app.innerHTML = `
        <main class="dashboard-screen">

            <div class="dashboard-header">
                <p>Good Morning</p>
                <h1>Hello, ${patientName} 👋</h1>
                <p>Age: ${patientAge}</p>
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
                        <button class="routine-view-button" onclick="showMedicines()">
                            View Medicine Reminders
                        </button>
                    </div>
                </div>
            </section>

            <section class="dashboard-card">
                <h2>What do I do now?</h2>
            <button class="routine-view-button" onclick="showNextActivity()">
                ✨ Show My Next Activity
            </button>

            <button class="routine-view-button" onclick="showRoutine()">
                View My Full Routine
            </button>


                <div class="dashboard-actions">
                    <button onclick="showGames()">🎮<br>Play a Game</button>
                    <button onclick="showTalkToMe()">💬<br>Talk to Me</button>
                    <button onclick="showProgress()">🧠<br>My Progress</button>
                    <button onclick="showMemories()">❤️<br>My Memories</button>
                </div>
            </section>

            <button class="help-button" onclick="showHelp()">
                🆘 I Need Help
            </button>

                <div class="bottom-nav">
                    <button onclick="showPatientDashboard()">⌂<span>Home</span></button>
                    <button onclick="showGames()">♡<span>Activities</span></button>
                    <button onclick="showSettings()">⚙<span>Settings</span></button>
                 </div>

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
                <h2>🧠 Familiar People</h2>
                <p>Look at familiar people and remember who they are.</p>
                <button class="primary-button" onclick="startPeopleActivity()">
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

let sequenceLevel = 1;
let sequenceScore = 0;
let sequence = [];
let sequenceAnswer = [];
let sequenceIndex = 0;

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

function startPeopleActivity() {
    document.getElementById("app").innerHTML = `
        <main class="game-screen">

            <div class="game-header">
                <button class="back-button" onclick="showGames()">←</button>

                <div>
                    <div class="step-label">MEMORY ACTIVITY</div>
                    <h1>Familiar People</h1>
                </div>
            </div>

            <div class="people-activity">

                <p class="game-instruction">
                    Who is this person?
                </p>

                <div class="person-placeholder">
                    👩
                </div>

                <div class="people-options">

                    <button onclick="checkPersonAnswer(this, true)">
                        Family Member
                    </button>

                    <button onclick="checkPersonAnswer(this, false)">
                        Friend
                    </button>

                    <button onclick="checkPersonAnswer(this, false)">
                        Doctor
                    </button>

                </div>

                <p id="people-message" class="game-message"></p>

            </div>

        </main>
    `;
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

            <div class="progress-container">

                <div class="progress-card">
                    <span>🧩</span>
                    <div>
                        <strong>Brain Activities</strong>
                        <p>4 activities completed</p>
                    </div>
                </div>

                <div class="progress-card">
                    <span>💊</span>
                    <div>
                        <strong>Medicine Routine</strong>
                        <p>All reminders followed today</p>
                    </div>
                </div>

                <div class="progress-card">
                    <span>🕐</span>
                    <div>
                        <strong>Daily Routine</strong>
                        <p>3 of 4 activities completed</p>
                    </div>
                </div>

                <div class="progress-card">
                    <span>🌸</span>
                    <div>
                        <strong>Overall Progress</strong>
                        <p>You're doing great today!</p>
                    </div>
                </div>

            </div>

        </main>
    `;
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

            <div class="routine-full">

                <div class="routine-full-item">
                    <span>🌅</span>
                    <div>
                        <strong>Morning</strong>
                        <p>Wake up, freshen up and have breakfast.</p>
                    </div>
                </div>

                <div class="routine-full-item">
                    <span>💊</span>
                    <div>
                        <strong>Medicine</strong>
                        <p>Take your morning medicine.</p>
                    </div>
                </div>

                <div class="routine-full-item">
                    <span>🧩</span>
                    <div>
                        <strong>Brain Activity</strong>
                        <p>Spend some time on a memory activity.</p>
                    </div>
                </div>

                <div class="routine-full-item">
                    <span>🍽️</span>
                    <div>
                        <strong>Lunch</strong>
                        <p>Have your lunch and take some rest.</p>
                    </div>
                </div>

                <div class="routine-full-item">
                    <span>🌙</span>
                    <div>
                        <strong>Evening</strong>
                        <p>Relax, talk to Companio or enjoy a familiar activity.</p>
                    </div>
                </div>

            </div>

        </main>
    `;
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

            <div class="medicine-container">

                <div class="medicine-card">
                    <div class="medicine-icon">💊</div>

                    <div class="medicine-info">
                        <strong>Morning Medicine</strong>
                        <p>After breakfast</p>
                        <span>8:00 AM</span>
                    </div>

                    <button onclick="markMedicineTaken(this)">
                        Take
                    </button>
                </div>

                <div class="medicine-card">
                    <div class="medicine-icon">💊</div>

                    <div class="medicine-info">
                        <strong>Evening Medicine</strong>
                        <p>After dinner</p>
                        <span>8:00 PM</span>
                    </div>

                    <button onclick="markMedicineTaken(this)">
                        Take
                    </button>
                </div>

                <p id="medicine-message" class="game-message"></p>

            </div>

        </main>
    `;
}

function markMedicineTaken(button) {
    button.innerText = "Taken ✓";
    button.disabled = true;

    button.parentElement.classList.add("medicine-taken");

    document.getElementById("medicine-message").innerText =
        "Medicine marked as taken. 🌸";
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

            <div class="medicine-container">

                <div class="medicine-card">
                    <div class="medicine-icon">💊</div>

                    <div class="medicine-info">
                        <strong>Morning Medicine</strong>
                        <p>After breakfast</p>
                        <span>10:00 AM</span>
                    </div>

                    <button onclick="markMedicineTaken(this)">
                        Take
                    </button>
                </div>

                <div class="medicine-card">
                    <div class="medicine-icon">💊</div>

                    <div class="medicine-info">
                        <strong>Evening Medicine</strong>
                        <p>After dinner</p>
                        <span>8:00 PM</span>
                    </div>

                    <button onclick="markMedicineTaken(this)">
                        Take
                    </button>
                </div>

                <p id="medicine-message" class="game-message"></p>

            </div>

        </main>
    `;
}

function markMedicineTaken(button) {
    button.innerText = "Taken ✓";
    button.disabled = true;

    button.parentElement.classList.add("medicine-taken");

    document.getElementById("medicine-message").innerText =
        "Medicine marked as taken. 🌸";
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