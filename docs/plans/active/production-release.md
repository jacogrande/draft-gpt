# Production release handoff — 2026-10-21

This is a deployment checklist, not a claim that the pending changes are live. `AGENTS.md` requires explicit approval before `scripts/deploy.sh`. The script checks for production test login, runs tests/typecheck/lint, deploys Convex, builds for the production URL with test login disabled, and deploys Firebase Hosting.

**Hold:** the [completed evaluation](../../research/limited-set-design/17-release-validation.md) recorded four blocked candidates and two interruptions. Local engineering passes do not establish model-quality acceptance. Do not describe this release as quality-approved. Obtain explicit deployment approval only after presenting these results and the exact tested revision.

## Observed configuration

- Remote `main` was `f0c115c` when this release audit began. The shared-set pipeline commit `5c5d325` was local only. Release commit/push status belongs in the final validation record.
- Production Convex has `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `JWKS`, `JWT_PRIVATE_KEY`, `OPENAI_API_KEY`, and `SITE_URL`. No `AUTH_TEST_LOGIN`, `OPENAI_BASE_URL`, or rollback switch is configured. Only variable names were recorded; credentials were not exported.
- On October 21, read-only model lookups using the existing production key returned HTTP 200 for `gpt-6-luna` and `gpt-image-2.5-flare`. No production generation request was made.
- Firebase Hosting site `draft-gpt-81aaa` exists at `https://draft-gpt-81aaa.web.app`.
- The legacy Firestore export exists: `gs://draft-gpt-81aaa.appspot.com/firestore-backup-2026-10-11`. A read-only listing found 20 objects totaling 6,089,227 bytes, including export metadata. This confirms preservation, not a restore test.

## Custom domain

`draftgpt.hasslebad.com` initially had no DNS answer and was absent from Firebase Hosting. The domain is now registered to the existing Firebase site, pending DNS verification and certificate issuance. This did not deploy application code or change `SITE_URL`.

Firebase's returned required record is:

| Type | Name in hasslebad.com | Target | Proxy |
| --- | --- | --- | --- |
| CNAME | `draftgpt` | `draft-gpt-81aaa.web.app` | DNS only while validating |

Firebase also returned a temporary ACME TXT challenge under `_acme-challenge.draftgpt`. The exact current response is saved locally in `.artifacts/release-infrastructure/custom-domain.json`; refresh it before applying a stale challenge. The authoritative nameservers are Cloudflare's `ada.ns.cloudflare.com` and `tate.ns.cloudflare.com`. No Cloudflare credential or connected DNS capability was available during inspection. A zone-scoped token can finish these records; do not place tokens in this document.

After DNS changes, wait for ownership, host and certificate status to be active; verify HTTPS and Google sign-in before changing Convex `SITE_URL` to the custom origin. Keep the working Firebase URL until that check succeeds. The API's [custom-domain resource](https://firebase.google.com/docs/reference/hosting/rest/v1beta1/projects.sites.customDomains) reports the required DNS changes and certificate state.

## Legacy decks

An import is a separate data migration decision. Current decks require valid Convex user and lobby IDs; old Firebase IDs are not interchangeable. Preserve the export. If importing, inventory and normalize the export, map verified Google identities, create an explicit legacy-lobby ownership policy, dry-run all records, and make the import idempotent before any write. Never map users by display name or assign unidentified decks to the current user.

## After approval

1. Deploy the exact tested release revision with `./scripts/deploy.sh`; record both deployment outputs.
2. Open the production URL and check signed-out routing, app assets and absence of test login.
3. Use an existing authenticated real-user session to create a draft, observe generation and complete picks into a deck, then open a game with another authenticated user. Google authentication requires the user's participation if no authorized session is available. Do not enable production test login to automate this.
4. Record real generation, distribution, deck and game results separately from local fake-service tests and offline paid model evaluations. Human format playtesting remains excluded from this request.
