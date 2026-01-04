#!/bin/bash
# Launch Chrome with remote debugging for Claude DevTools MCP
# Note: Uses separate profile because Chrome requires non-default data dir for debugging

PORT=9222
DEBUG_PROFILE="/tmp/chrome-debug-profile"

# Check if Chrome is already running on debug port
if lsof -i :$PORT > /dev/null 2>&1; then
  echo "Chrome already running on port $PORT"
  echo "Connect URL: http://127.0.0.1:$PORT"
  exit 0
fi

# Kill any existing Chrome instances (required for debug port to work)
echo "Stopping any existing Chrome instances..."
pkill -9 "Google Chrome" 2>/dev/null
sleep 2

# Create debug profile directory
mkdir -p "$DEBUG_PROFILE"

echo "Starting Chrome with remote debugging on port $PORT..."
echo "(Using separate debug profile at $DEBUG_PROFILE)"

# macOS Chrome path - MUST use separate user-data-dir for remote debugging
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=$PORT \
  --user-data-dir="$DEBUG_PROFILE" \
  > /dev/null 2>&1 &

sleep 3

if lsof -i :$PORT > /dev/null 2>&1; then
  echo ""
  echo "✓ Chrome started successfully!"
  echo "  Debug URL: http://127.0.0.1:$PORT"
  echo ""
  echo "Note: This is a fresh Chrome profile. Sign in to Google if needed."
else
  echo "Failed to start Chrome. Try manually:"
  echo "/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug-profile"
fi
