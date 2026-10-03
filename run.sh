#!/bin/bash
# ==============================================================================
# Movie Review Platform - Full-Stack Execution Runner
# Case Study No. 118: Movie Review Platform
# Author: Aaroh Wankhade (Student ID: 150096726175)
# Degree: B.Tech Computer Science Engineering (2025-29)
# Institution: School of FutureTech, ITM Skills University
# ==============================================================================

# Formatting styles
BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Ensure Node.js is in PATH
export PATH="$HOME/.local/node/bin:$PATH"

clear
echo -e "${CYAN}${BOLD}"
echo "=============================================================================="
echo "    MOVIE REVIEW PLATFORM: FULL-STACK REST API & AGGREGATION SYSTEM          "
echo "    ITM Skills University | School of FutureTech (B.Tech CSE 2025-29)        "
echo "=============================================================================="
echo -e "${NC}"
echo -e "Student Name : ${BOLD}Aaroh Wankhade${NC}"
echo -e "Student ID   : ${BOLD}150096726175${NC}"
echo -e "Course       : ${BOLD}Backend Development (Node.js, Express, MongoDB) - Sem III${NC}"
echo -e "Case Study   : ${BOLD}No. 118 - Movie Review Platform${NC}"
echo "------------------------------------------------------------------------------"

# Step 1: Check Node & NPM environment
echo -e "\n${BLUE}[1/4] Checking Node.js runtime environment...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed or not in PATH.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) and npm $(npm -v) detected.${NC}"

# Step 2: Verify Dependencies
echo -e "\n${BLUE}[2/4] Verifying project dependencies...${NC}"
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    (cd backend && npm install)
fi
echo -e "${GREEN}✓ All Express, Mongoose, JWT & Bcrypt packages ready.${NC}"

# Step 3: Run Automated Test Suite
echo -e "\n${BLUE}[3/4] Running Comprehensive Verification Test Suite...${NC}"
(cd backend && node utils/testSuite.js)
if [ $? -ne 0 ]; then
    echo -e "${RED}Test Suite Failed! Check logs.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ All 12 integration tests verified successfully.${NC}"

# Step 4: Launch Live Application Server
echo -e "\n${BLUE}[4/4] Starting Movie Review Platform Server...${NC}"
echo -e "${YELLOW}Access URLs:${NC}"
echo -e "  🌐 Web Console / Catalog: ${BOLD}http://localhost:5001${NC}"
echo -e "  📡 REST API Base         : ${BOLD}http://localhost:5001/api${NC}"
echo -e "  📊 Aggregation Endpoint  : ${BOLD}http://localhost:5001/api/movies/:id/average-rating${NC}"
echo -e "\n${CYAN}Press Ctrl+C to stop the server.${NC}\n"

# Open frontend in default browser
open "http://localhost:5001" 2>/dev/null || true

# Start backend server
cd backend && npm start
