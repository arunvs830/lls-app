#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping LLS Application Servers...${NC}"

# Stop backend (port 6000)
if lsof -ti:6000 > /dev/null 2>&1; then
    lsof -ti:6000 | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✅ Backend server stopped (port 6000)${NC}"
else
    echo -e "${YELLOW}Backend server was not running${NC}"
fi

# Stop frontend (port 6001)
if lsof -ti:6001 > /dev/null 2>&1; then
    lsof -ti:6001 | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✅ Frontend server stopped (port 6001)${NC}"
else
    echo -e "${YELLOW}Frontend server was not running${NC}"
fi

echo -e "${GREEN}All servers stopped.${NC}"
