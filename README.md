# ScanSense AI 🧿

Welcome to **ScanSense AI**! This is a specialized, AI-powered medical assistant. It helps users analyze medical reports (PDFs) and medical images (X-rays, MRIs, etc.) using the powerful Llama 4 Scout model, intelligently orchestrated by **LangChain** and **LangGraph**, serving JSON endpoints via a high-performance **FastAPI** backend, and displayed on an ultra-responsive **React (Vite)** frontend.

This document will guide you step-by-step on how to run this project on your own computer, even if you are a complete beginner!

If you want to understand how every single file in the code works line-by-line, please read the [ARCHITECTURE.md](ARCHITECTURE.md) file!

---

## 🚀 How to Run the App (Step-by-Step)

### Step 1: Install Python & Node.js
You need to have Python and Node.js installed on your computer. 
- **Python:** Go to [python.org](https://www.python.org/downloads/) and download the latest version for your operating system (Windows, Mac, or Linux).
- **Important for Windows users:** When installing Python, make sure to check the box that says **"Add Python to PATH"**.
- **Node.js:** Go to [nodejs.org](https://nodejs.org/) and download the current LTS version. You need this because our new architecture uses React!

### Step 2: Get a Free AI API Key
This app uses an AI brain from a company called Groq. You need a free key to connect to it.
1. Go to [Groq Console](https://console.groq.com/keys).
2. Create a free account.
3. Click on "Create API Key" and copy the long string of text. Keep it absolutely secret!

### Step 3: Set Up the Project Environment
1. Open up your terminal (or Command Prompt / PowerShell on Windows) and navigate to the folder where this project is saved.
2. Go into the `backend/` folder (`cd backend`).
3. Inside the `backend/` folder, create a new file named exactly `.env` (don't forget the dot at the beginning).
4. Open the `.env` file in notepad or any text editor and paste your API key exactly like this:
   ```env
   GROQ_API_KEY=your_copied_api_key_here
   ```
5. Save the file.

### Step 4: Simple One-Click Start (Automated Script)
Because this project now uses a **Unified Architecture**, you only need to run one script! The FastAPI backend will automatically build the React frontend and serve both simultaneously on a single port.

Go back to the main `ScanSense AI` folder in your terminal, and run:

**(Windows)**:
```cmd
.\run.bat
```

**(Mac / Linux)**:
```bash
./run.sh
```

**What the script does automatically:**
1. Triggers the creation of your Python virtual environment (`venv`).
2. Installs all required Python backend dependencies.
3. Automatically builds the React frontend for production.
4. **Starts the Unified Server** on Port 8000.

Your browser will automatically be directed to **`http://localhost:8000`**, where you can start chatting with your AI!

---

## ✨ Features
- **Unified Connection:** A seamless, single-port architecture where FastAPI serves both the high-performance logic engine and the ultra-responsive React UI.
- **Strictly Medical:** The AI validates every file you upload and refuses to answer non-medical questions using robust **LangChain** guards.
- **Image & PDF Support:** Upload your medical PDFs or X-rays directly into the visual chat!
- **History Saving:** Every chat you have is automatically saved inside the `chat.db` database.
- **Workflow Orchestration:** Advanced local routing built on **LangGraph**, giving it smooth, real-time streaming capabilities.
