@echo off
echo 💎 Starting ScanSense AI Unified Connection...

:: 1. Setup Backend & Frontend
if not exist venv (
    echo 🏗️ Creating virtual environment...
    python -m venv venv
)

:: 2. Build Frontend
echo 🚀 Building Frontend (React)...
cd frontend
if not exist node_modules (
    echo 📦 Installing frontend dependencies...
    call npm install
)
call npm run build
cd ..

:: 3. Start Backend
echo 🌐 Starting ScanSense AI (Port 8000)...
cd backend
python -m uvicorn main:app --reload --port 8000
