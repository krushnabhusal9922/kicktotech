@echo off
title Vyapar AI - Smart Business Co-Pilot
echo ===================================================
echo Starting Vyapar AI Server...
echo ===================================================
node server.js
if %errorlevel% neq 0 (
    echo Node.js not detected, falling back to Python...
    python server.py
)
pause

