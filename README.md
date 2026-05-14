# 🤖 AI Study Assistant

A professional AI-powered study assistant built with React (Vite), Firebase, and Gemini AI via OpenRouter.

---

## 🚀 Setup Instructions (Step by Step)

### Step 1 — Install Node.js
Download from https://nodejs.org (LTS version) and install it.
Verify: open terminal and run `node -v`

### Step 2 — Install dependencies
Open terminal in this folder and run:
```
npm install
```

### Step 3 — Set up Firebase
1. Go to https://console.firebase.google.com
2. Create a new project named `ai-study-assistant`
3. Enable **Authentication** → Email/Password + Google
4. Create **Firestore Database** (test mode)
5. Enable **Storage**
6. Go to Project Settings → Web App → copy the config

### Step 4 — Get OpenRouter API Key
1. Go to https://openrouter.ai
2. Sign up and create an API key
3. Add some credits (very cheap, ~$1 lasts a long time)

### Step 5 — Fill in .env file
Open the `.env` file and replace the placeholder values:
```
VITE_FIREBASE_API_KEY=your_actual_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_OPENROUTER_API_KEY=your_openrouter_key
```

### Step 6 — Run the app
```
npm run dev
```
Open http://localhost:5173 in your browser.

---

## 📁 Project Structure
```
src/
├── api/gemini.js          # OpenRouter/Gemini API calls
├── components/            # Reusable UI components
├── context/AuthContext.jsx # Auth state management
├── firebase/              # Firebase config & helpers
├── pages/                 # All page components
└── styles/index.css       # Complete design system
```

## ✨ Features
- 🔐 Auth (Email + Google OAuth)
- 💬 AI Chat (Ask Doubts)
- 📝 Notes with color labels
- 📄 PDF Upload + AI Summary
- 🧠 Quiz Generator (topic or PDF-based)
- 📊 Dashboard with stats
