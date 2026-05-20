#!/bin/bash
cd /home/z/my-project
COUNT=0
while true; do
  COUNT=$((COUNT + 1))
  echo "$(date): Starting server (attempt $COUNT)..." >> /home/z/my-project/server-restart.log
  NODE_OPTIONS="--max-old-space-size=1024" node node_modules/.bin/next start -p 3000
  EXIT_CODE=$?
  echo "$(date): Server exited with code $EXIT_CODE, restarting in 2s..." >> /home/z/my-project/server-restart.log
  sleep 2
done
