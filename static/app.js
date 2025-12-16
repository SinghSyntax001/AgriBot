// --- 0. Initialize Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyCWUjqUS2S4AUcVOt0GKIWVKmiz_DGxfVU",
    authDomain: "agridoc-1a82e.firebaseapp.com",
    projectId: "agridoc-1a82e",
    storageBucket: "agridoc-1a82e.firebasestorage.app",
    messagingSenderId: "120730500147",
    appId: "1:120730500147:web:8f8e8dbf3338b08fe5f746",
    measurementId: "G-ZJT68CFLRB"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- 1. Language Translations ---
const translations = {
    en: {
        loginTitle: "Login to AgriDoc",
        loginButton: "Login",
        loginSwitch: "Don't have an account? <a href='#' id='show-signup'>Sign Up</a>",
        signupTitle: "Create Account",
        signupButton: "Sign Up",
        signupSwitch: "Already have an account? <a href='#' id='show-login'>Login</a>",
        logout: "Logout",
        historyTitle: "Chat History",
        welcomeMessage: "Hello! I am AgriDoc. How can I help you today? (e.g., 'My tomato plants have spots')",
        inputPlaceholder: "Type your question here...",
        sendButton: "Send",
        toggleLang: "🌍 Hindi (हिंदी)"
    },
    hi: {
        loginTitle: "एग्रीडॉक में लॉग इन करें",
        loginButton: "लॉग इन करें",
        loginSwitch: "खाता नहीं है? <a href='#' id='show-signup'>साइन अप करें</a>",
        signupTitle: "खाता बनाएं",
        signupButton: "साइन अप करें",
        signupSwitch: "पहले से ही एक खाता है? <a href='#' id='show-login'>लॉग इन करें</a>",
        logout: "लॉग आउट",
        historyTitle: "चैट इतिहास",
        welcomeMessage: "नमस्ते! मैं एग्रीडॉक हूं। मैं आज आपकी कैसे मदद कर सकता हूँ? (जैसे, 'मेरे टमाटर के पौधों पर धब्बे हैं')",
        inputPlaceholder: "अपना प्रश्न यहाँ लिखें...",
        sendButton: "भेजें",
        toggleLang: "🌍 English (अंग्रेज़ी)"
    }
};

let currentLanguage = "en";

// Language setter
function setLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll("[data-key]").forEach(el => {
        const key = el.getAttribute("data-key");
        if (translations[lang][key]) {
            if (el.tagName === "INPUT") el.placeholder = translations[lang][key];
            else el.innerHTML = translations[lang][key];
        }
    });
    document.getElementById("language-toggle").textContent = translations[lang].toggleLang;
}

// --- 2. Select DOM Elements ---
const authOverlay = document.getElementById("auth-overlay");
const appWrapper = document.getElementById("app-wrapper");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const authError = document.getElementById("auth-error");
const logoutButton = document.getElementById("logout-button");
const languageToggle = document.getElementById("language-toggle");

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const micButton = document.getElementById("mic-button"); // 🎤 Add this button in HTML
const historyList = document.getElementById("history-list");

let currentUser = null;
let currentChatHistory = [];
let currentChatId = null;

// --- 3. Firebase Auth Logic ---
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        authOverlay.classList.add("hidden");
        appWrapper.classList.remove("hidden");
        loadUserHistory();
        startNewChat();
    } else {
        currentUser = null;
        authOverlay.classList.remove("hidden");
        appWrapper.classList.add("hidden");
    }
});

document.addEventListener("click", e => {
    if (e.target.id === "show-signup") {
        e.preventDefault();
        loginForm.classList.add("hidden");
        signupForm.classList.remove("hidden");
    }
    if (e.target.id === "show-login") {
        e.preventDefault();
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
    }
});

signupForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => (authError.textContent = ""))
        .catch(error => (authError.textContent = error.message));
});

loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => (authError.textContent = ""))
        .catch(error => (authError.textContent = error.message));
});

logoutButton.addEventListener("click", () => auth.signOut());

// --- 4. Language Toggle ---
languageToggle.addEventListener("click", () => {
    const newLang = currentLanguage === "en" ? "hi" : "en";
    setLanguage(newLang);
});

// --- 5. Chat Logic (LLM + RAG via Flask) ---
sendButton.addEventListener("click", handleSendMessage);
userInput.addEventListener("keypress", e => {
    if (e.key === "Enter") handleSendMessage();
});

async function handleSendMessage() {
    const messageText = userInput.value.trim();
    if (!messageText) return;

    addMessageToChat("user", messageText);
    userInput.value = "";
    currentChatHistory.push({ role: "user", content: messageText });
    showTypingIndicator();

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: messageText, lang: currentLanguage })
        });
        removeTypingIndicator();

        if (!response.ok) throw new Error("Network response not ok");
        const data = await response.json();

        const botReply = data.answer || "Sorry, no response.";
        addMessageToChat("bot", botReply);
        currentChatHistory.push({ role: "bot", content: botReply });
        saveChatHistory();
    } catch (err) {
        console.error("Error:", err);
        removeTypingIndicator();
        addMessageToChat("bot", "⚠️ Server error. Please try again later.");
    }
}

// --- 6. Voice Input (Groq Whisper API) ---
if (micButton) {
    micButton.addEventListener("click", async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];
            micButton.textContent = "🎙️ Recording...";
            recorder.start();

            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = async () => {
                micButton.textContent = "🎤";
                const blob = new Blob(chunks, { type: "audio/webm" });
                const form = new FormData();
                form.append("audio", blob, "speech.webm");

                const res = await fetch("/api/transcribe", { method: "POST", body: form });
                const data = await res.json();

                if (data.text) {
                    userInput.value = data.text;
                    handleSendMessage();
                } else {
                    alert("Couldn't transcribe audio.");
                }
            };

            setTimeout(() => {
                recorder.stop();
                stream.getTracks().forEach(t => t.stop());
            }, 6000); // 6s max record time
        } catch (err) {
            console.error("Mic error:", err);
            alert("Microphone not accessible.");
        }
    });
}

// --- 7. Chat UI Helpers ---
function addMessageToChat(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);

    // ✅ Convert markdown (e.g., **bold**, *italic*, numbered lists, etc.) into HTML
    const formatted = marked.parse(text);
    messageElement.innerHTML = formatted;

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}


function showTypingIndicator() {
    const div = document.createElement("div");
    div.classList.add("message", "bot", "typing");
    div.id = "typing";
    div.innerHTML = "<span>...</span>";
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
    const el = document.getElementById("typing");
    if (el) el.remove();
}

// --- 8. Firestore History Management ---
async function saveChatHistory() {
    if (!currentUser || currentChatHistory.length === 0) return;

    const chatData = {
        messages: currentChatHistory,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        title: currentChatHistory[0].content.substring(0, 40) + "..."
    };

    const ref = db.collection("users").doc(currentUser.uid).collection("history");

    try {
        if (currentChatId) {
            await ref.doc(currentChatId).set(chatData, { merge: true });
        } else {
            const docRef = await ref.add(chatData);
            currentChatId = docRef.id;
        }
        loadUserHistory();
    } catch (err) {
        console.error("Save history error:", err);
    }
}

function loadUserHistory() {
    if (!currentUser) return;
    const ref = db.collection("users").doc(currentUser.uid).collection("history");
    ref.orderBy("timestamp", "desc").limit(20).get().then(snapshot => {
        historyList.innerHTML = "";
        const newChatBtn = document.createElement("div");
        newChatBtn.textContent = "➕ New Chat";
        newChatBtn.classList.add("history-item", "new-chat-btn");
        newChatBtn.onclick = startNewChat;
        historyList.appendChild(newChatBtn);

        snapshot.forEach(doc => {
            const chat = doc.data();
            const item = document.createElement("div");
            item.classList.add("history-item");
            item.textContent = chat.title || "Chat";
            item.dataset.chatId = doc.id;

            if (doc.id === currentChatId) item.classList.add("active");

            item.onclick = () => loadChat(doc.id, chat.messages);
            historyList.appendChild(item);
        });
    });
}

function startNewChat() {
    currentChatId = null;
    currentChatHistory = [];
    chatBox.innerHTML = "";
    addMessageToChat("bot", translations[currentLanguage].welcomeMessage);
}

function loadChat(chatId, messages) {
    currentChatId = chatId;
    currentChatHistory = messages;
    chatBox.innerHTML = "";
    messages.forEach(msg => addMessageToChat(msg.role, msg.content));
}

setLanguage(currentLanguage);
