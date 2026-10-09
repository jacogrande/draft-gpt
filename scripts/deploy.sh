#!/usr/bin/env bash
set -euo pipefail

export CONVEX_DEPLOYMENT="dev:zany-beagle-193"
production_url="https://fleet-albatross-186.convex.cloud"

bun run test
bun run typecheck
./node_modules/.bin/convex deploy --yes
VITE_CONVEX_URL="$production_url" VITE_TEST_LOGIN=false bun run build
firebase deploy --only hosting
