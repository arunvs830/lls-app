#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Starting LLS Application Servers                   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Kill any existing servers
echo -e "${YELLOW}Stopping any existing servers...${NC}"
lsof -ti:6000 | xargs kill -9 2>/dev/null
lsof -ti:6001 | xargs kill -9 2>/dev/null
sleep 2

# Start backend
echo -e "${GREEN}Starting Backend Server (Port 6000)...${NC}"
cd backend
PORT=6000 python3 app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 3

# Check if backend started
if lsof -ti:6000 > /dev/null; then
    echo -e "${GREEN}✅ Backend server started successfully (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend failed to start. Check backend.log for errors.${NC}"
    exit 1
fi

# Start frontend
echo -e "${GREEN}Starting Frontend Server (Port 6001)...${NC}"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 5

# Check if frontend started
if lsof -ti:6001 > /dev/null; then
    echo -e "${GREEN}✅ Frontend server started successfully (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Frontend failed to start. Check frontend.log for errors.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           ✅ All Servers Running Successfully! ✅            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Backend:  http://127.0.0.1:6000${NC} (PID: $BACKEND_PID)"
echo -e "${GREEN}Frontend: http://localhost:6001${NC} (PID: $FRONTEND_PID)"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo -e "  Backend:  tail -f backend.log"
echo -e "  Frontend: tail -f frontend.log"
echo ""
echo -e "${YELLOW}To stop servers:${NC}"
echo -e "  ./stop-servers.sh"
echo -e "  or"
echo -e "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo -e "${GREEN}Open: http://localhost:6001 in your browser${NC}"
echo ""
