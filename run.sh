#!/bin/bash

# Navigate to the project root
cd "$(dirname "$0")"

# 1. Setup Backend Environment (Python)
if [ ! -d "venv" ]; then
    echo "🏗️ Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "📦 Installing backend dependencies..."
    pip install -r backend/requirements.txt
else
    source venv/bin/activate
fi

# 2. Setup Frontend Environment & Build (Node.js)
echo "🚀 Building Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi
npm run build
cd ..

# 3. Start the Unified Server (FastAPI)
echo "💎 Starting ScanSense AI (Unified Server)..."
echo "🌐 Your app will be available at http://localhost:8000"
cd backend
python -m uvicorn main:app --reload --port 8000
