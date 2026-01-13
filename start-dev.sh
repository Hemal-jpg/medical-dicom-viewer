#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting Medical DICOM Viewer Development Environment${NC}\n"

# Start backend
echo -e "${GREEN}Starting Backend (FastAPI)...${NC}"
cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

python main.py &
BACKEND_PID=$!

cd ..

# Start frontend
echo -e "\n${GREEN}Starting Frontend (React + Vite)...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!

cd ..

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Development servers started!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Backend:  http://localhost:8000"
echo -e "Frontend: http://localhost:5173"
echo -e "\nBackend PID: $BACKEND_PID"
echo -e "Frontend PID: $FRONTEND_PID"
echo -e "\n${BLUE}Press Ctrl+C to stop all servers${NC}\n"

# Trap SIGINT and SIGTERM to cleanup
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Wait for both processes
wait
