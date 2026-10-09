#!/usr/bin/env bash
set -euo pipefail

state=".test-stack"
export CONVEX_AGENT_MODE=anonymous

launch() {
  local name="$1"
  shift
  nohup "$@" >"$state/$name.log" 2>&1 &
  echo $! >"$state/$name.pid"
}

wait_for() {
  local url="$1"
  for _ in $(seq 1 60); do
    if curl -s -o /dev/null "$url"; then return 0; fi
    sleep 1
  done
  echo "Timed out waiting for $url (see $state/*.log)" >&2
  exit 1
}

start() {
  mkdir -p "$state"
  launch convex ./node_modules/.bin/convex dev
  launch fakes bun scripts/fake-services.ts
  wait_for http://127.0.0.1:3210/version
  if [ "$(./node_modules/.bin/convex env get AUTH_TEST_LOGIN 2>/dev/null)" != "true" ]; then
    node scripts/setup-local.mjs
  fi
  launch app bun run dev
  wait_for http://localhost:5173/join
  echo "App on http://localhost:5173 with test sign-in and fake AI services"
}

stop() {
  for pidfile in "$state"/*.pid; do
    [ -e "$pidfile" ] || continue
    pkill -P "$(cat "$pidfile")" 2>/dev/null || true
    kill "$(cat "$pidfile")" 2>/dev/null || true
    rm "$pidfile"
  done
  pkill -f "[c]onvex-local-backend" 2>/dev/null || true
  ./node_modules/.bin/agent-browser close --all >/dev/null 2>&1 || true
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  *) echo "usage: $0 start|stop" >&2; exit 2 ;;
esac
