#!/bin/bash
# Keep-alive script for OPPY production server
cd /home/z/my-project
while true; do
  NODE_OPTIONS="--max-old-space-size=512" npx next start -p 3000 2>&1 | tee -a /home/z/my-project/dev.log
  echo "$(date): Server crashed, restarting in 3s..." >> /home/z/my-project/dev.log
  sleep 3
done
