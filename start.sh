#!/bin/bash
cd /home/z/my-project
while true; do
  NODE_OPTIONS="--max-old-space-size=1024" node node_modules/.bin/next start -p 3000 -H 0.0.0.0 2>&1
  sleep 2
done
