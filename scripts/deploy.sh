#!/usr/bin/env bash
set -euo pipefail

export CONVEX_DEPLOYMENT="dev:zany-beagle-193"
production_url="https://fleet-albatross-186.convex.cloud"

if [ -n "$(./node_modules/.bin/convex env get AUTH_TEST_LOGIN --prod 2>/dev/null || true)" ]; then
  echo "AUTH_TEST_LOGIN is set on the production deployment. Unset it before deploying." >&2
  exit 1
fi

bun run test
bun run typecheck
bun run lint
./node_modules/.bin/convex deploy --yes
VITE_CONVEX_URL="$production_url" VITE_TEST_LOGIN=false bun run build
firebase deploy --only hosting
