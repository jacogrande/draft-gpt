/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as card from "../card.js";
import type * as crons from "../crons.js";
import type * as deck_decks from "../deck/decks.js";
import type * as deck_drafted from "../deck/drafted.js";
import type * as deck_tables from "../deck/tables.js";
import type * as deck_zones from "../deck/zones.js";
import type * as draft_absence from "../draft/absence.js";
import type * as draft_absences from "../draft/absences.js";
import type * as draft_absent from "../draft/absent.js";
import type * as draft_artPrompt from "../draft/artPrompt.js";
import type * as draft_artSchools from "../draft/artSchools.js";
import type * as draft_autopilot from "../draft/autopilot.js";
import type * as draft_failures from "../draft/failures.js";
import type * as draft_generated from "../draft/generated.js";
import type * as draft_generation from "../draft/generation.js";
import type * as draft_images from "../draft/images.js";
import type * as draft_openai from "../draft/openai.js";
import type * as draft_parsing from "../draft/parsing.js";
import type * as draft_passing from "../draft/passing.js";
import type * as draft_picking from "../draft/picking.js";
import type * as draft_picks from "../draft/picks.js";
import type * as draft_prompts_pack from "../draft/prompts/pack.js";
import type * as draft_prompts_setting from "../draft/prompts/setting.js";
import type * as draft_retry from "../draft/retry.js";
import type * as draft_returning from "../draft/returning.js";
import type * as draft_rounds from "../draft/rounds.js";
import type * as draft_scheduling from "../draft/scheduling.js";
import type * as draft_seating from "../draft/seating.js";
import type * as draft_settings from "../draft/settings.js";
import type * as draft_start from "../draft/start.js";
import type * as draft_tables from "../draft/tables.js";
import type * as errors from "../errors.js";
import type * as http from "../http.js";
import type * as identity_tables from "../identity/tables.js";
import type * as identity_username from "../identity/username.js";
import type * as identity_users from "../identity/users.js";
import type * as identity_viewer from "../identity/viewer.js";
import type * as lobby_access from "../lobby/access.js";
import type * as lobby_away from "../lobby/away.js";
import type * as lobby_cleanup from "../lobby/cleanup.js";
import type * as lobby_departure from "../lobby/departure.js";
import type * as lobby_lobbies from "../lobby/lobbies.js";
import type * as lobby_messages from "../lobby/messages.js";
import type * as lobby_presence from "../lobby/presence.js";
import type * as lobby_roster from "../lobby/roster.js";
import type * as lobby_sightings from "../lobby/sightings.js";
import type * as lobby_tables from "../lobby/tables.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  card: typeof card;
  crons: typeof crons;
  "deck/decks": typeof deck_decks;
  "deck/drafted": typeof deck_drafted;
  "deck/tables": typeof deck_tables;
  "deck/zones": typeof deck_zones;
  "draft/absence": typeof draft_absence;
  "draft/absences": typeof draft_absences;
  "draft/absent": typeof draft_absent;
  "draft/artPrompt": typeof draft_artPrompt;
  "draft/artSchools": typeof draft_artSchools;
  "draft/autopilot": typeof draft_autopilot;
  "draft/failures": typeof draft_failures;
  "draft/generated": typeof draft_generated;
  "draft/generation": typeof draft_generation;
  "draft/images": typeof draft_images;
  "draft/openai": typeof draft_openai;
  "draft/parsing": typeof draft_parsing;
  "draft/passing": typeof draft_passing;
  "draft/picking": typeof draft_picking;
  "draft/picks": typeof draft_picks;
  "draft/prompts/pack": typeof draft_prompts_pack;
  "draft/prompts/setting": typeof draft_prompts_setting;
  "draft/retry": typeof draft_retry;
  "draft/returning": typeof draft_returning;
  "draft/rounds": typeof draft_rounds;
  "draft/scheduling": typeof draft_scheduling;
  "draft/seating": typeof draft_seating;
  "draft/settings": typeof draft_settings;
  "draft/start": typeof draft_start;
  "draft/tables": typeof draft_tables;
  errors: typeof errors;
  http: typeof http;
  "identity/tables": typeof identity_tables;
  "identity/username": typeof identity_username;
  "identity/users": typeof identity_users;
  "identity/viewer": typeof identity_viewer;
  "lobby/access": typeof lobby_access;
  "lobby/away": typeof lobby_away;
  "lobby/cleanup": typeof lobby_cleanup;
  "lobby/departure": typeof lobby_departure;
  "lobby/lobbies": typeof lobby_lobbies;
  "lobby/messages": typeof lobby_messages;
  "lobby/presence": typeof lobby_presence;
  "lobby/roster": typeof lobby_roster;
  "lobby/sightings": typeof lobby_sightings;
  "lobby/tables": typeof lobby_tables;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
