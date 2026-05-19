#!/bin/bash
cd /home/z/my-project
while true; do
  NODE_OPTIONS="--max-old-space-size=512" npx next start -p 3000
  echo "Server died, restarting in 2s..." >> /home/z/my-project/dev.log
  sleep 2
done
