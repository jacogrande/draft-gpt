#!/usr/bin/env bash
set -euo pipefail

session="$1"
name="$2"
base_url="${APP_URL:-http://localhost:5173}"
browser="./node_modules/.bin/agent-browser"

"$browser" --session "$session" open "$base_url/join" >/dev/null
"$browser" --session "$session" wait 'input[name="test-user"]' >/dev/null
"$browser" --session "$session" fill 'input[name="test-user"]' "$name" >/dev/null
"$browser" --session "$session" find text "Sign in as test user" click >/dev/null
"$browser" --session "$session" wait 'input[name="username"], nav' >/dev/null
if [ "$("$browser" --session "$session" get count 'input[name="username"]')" != "0" ]; then
  "$browser" --session "$session" find text "Continue" click >/dev/null
  "$browser" --session "$session" wait nav >/dev/null
fi
echo "Signed in as $name in session $session"
