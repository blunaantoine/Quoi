#!/bin/bash
# Persistent Next.js server with auto-restart
cd /home/z/my-project

while true; do
    echo "[$(date)] Starting Next.js server..."
    node node_modules/.bin/next dev -p 3000 > dev.log 2>&1
    EXIT_CODE=$?
    echo "[$(date)] Server exited with code $EXIT_CODE. Restarting in 3s..."
    sleep 3
done
