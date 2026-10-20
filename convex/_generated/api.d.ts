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
import type * as deck_manaBase from "../deck/manaBase.js";
import type * as deck_owned from "../deck/owned.js";
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
import type * as draft_presentation from "../draft/presentation.js";
import type * as draft_prompts_pack from "../draft/prompts/pack.js";
import type * as draft_prompts_setting from "../draft/prompts/setting.js";
import type * as draft_retry from "../draft/retry.js";
import type * as draft_returning from "../draft/returning.js";
import type * as draft_rounds from "../draft/rounds.js";
import type * as draft_scheduling from "../draft/scheduling.js";
import type * as draft_seating from "../draft/seating.js";
import type * as draft_set_bustedCatalog from "../draft/set/bustedCatalog.js";
import type * as draft_set_bustedReferences from "../draft/set/bustedReferences.js";
import type * as draft_set_catalog_common from "../draft/set/catalog/common.js";
import type * as draft_set_catalog_mythic from "../draft/set/catalog/mythic.js";
import type * as draft_set_catalog_rare from "../draft/set/catalog/rare.js";
import type * as draft_set_catalog_uncommon from "../draft/set/catalog/uncommon.js";
import type * as draft_set_collation from "../draft/set/collation.js";
import type * as draft_set_contracts from "../draft/set/contracts.js";
import type * as draft_set_creative from "../draft/set/creative.js";
import type * as draft_set_creativeSeed from "../draft/set/creativeSeed.js";
import type * as draft_set_curve from "../draft/set/curve.js";
import type * as draft_set_execute from "../draft/set/execute.js";
import type * as draft_set_modelSettings from "../draft/set/modelSettings.js";
import type * as draft_set_parsing from "../draft/set/parsing.js";
import type * as draft_set_planning from "../draft/set/planning.js";
import type * as draft_set_powerPolicy from "../draft/set/powerPolicy.js";
import type * as draft_set_prompts from "../draft/set/prompts.js";
import type * as draft_set_referenceSelection from "../draft/set/referenceSelection.js";
import type * as draft_set_referenceTypes from "../draft/set/referenceTypes.js";
import type * as draft_set_references from "../draft/set/references.js";
import type * as draft_set_repair from "../draft/set/repair.js";
import type * as draft_set_requestContext from "../draft/set/requestContext.js";
import type * as draft_set_screening from "../draft/set/screening.js";
import type * as draft_set_setting from "../draft/set/setting.js";
import type * as draft_set_slots from "../draft/set/slots.js";
import type * as draft_set_stageInstructions from "../draft/set/stageInstructions.js";
import type * as draft_set_state from "../draft/set/state.js";
import type * as draft_set_support from "../draft/set/support.js";
import type * as draft_set_tables from "../draft/set/tables.js";
import type * as draft_set_types from "../draft/set/types.js";
import type * as draft_set_usage from "../draft/set/usage.js";
import type * as draft_set_worldDirection from "../draft/set/worldDirection.js";
import type * as draft_setAdvance from "../draft/setAdvance.js";
import type * as draft_setArt from "../draft/setArt.js";
import type * as draft_setJobs from "../draft/setJobs.js";
import type * as draft_setPacks from "../draft/setPacks.js";
import type * as draft_setQueue from "../draft/setQueue.js";
import type * as draft_setRuns from "../draft/setRuns.js";
import type * as draft_setWorker from "../draft/setWorker.js";
import type * as draft_settings from "../draft/settings.js";
import type * as draft_start from "../draft/start.js";
import type * as draft_tables from "../draft/tables.js";
import type * as errors from "../errors.js";
import type * as game_access from "../game/access.js";
import type * as game_cleanup from "../game/cleanup.js";
import type * as game_counters from "../game/counters.js";
import type * as game_extras from "../game/extras.js";
import type * as game_games from "../game/games.js";
import type * as game_log from "../game/log.js";
import type * as game_placement from "../game/placement.js";
import type * as game_play from "../game/play.js";
import type * as game_presence from "../game/presence.js";
import type * as game_seats from "../game/seats.js";
import type * as game_setup from "../game/setup.js";
import type * as game_table from "../game/table.js";
import type * as game_tables from "../game/tables.js";
import type * as game_tokens from "../game/tokens.js";
import type * as http from "../http.js";
import type * as identity_tables from "../identity/tables.js";
import type * as identity_username from "../identity/username.js";
import type * as identity_users from "../identity/users.js";
import type * as identity_viewer from "../identity/viewer.js";
import type * as lobby_access from "../lobby/access.js";
import type * as lobby_away from "../lobby/away.js";
import type * as lobby_cleanup from "../lobby/cleanup.js";
import type * as lobby_departure from "../lobby/departure.js";
import type * as lobby_ideas from "../lobby/ideas.js";
import type * as lobby_lifecycle from "../lobby/lifecycle.js";
import type * as lobby_lobbies from "../lobby/lobbies.js";
import type * as lobby_messages from "../lobby/messages.js";
import type * as lobby_presence from "../lobby/presence.js";
import type * as lobby_roster from "../lobby/roster.js";
import type * as lobby_sightings from "../lobby/sightings.js";
import type * as lobby_tables from "../lobby/tables.js";
import type * as mana from "../mana.js";
import type * as powerLevel from "../powerLevel.js";

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
  "deck/manaBase": typeof deck_manaBase;
  "deck/owned": typeof deck_owned;
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
  "draft/presentation": typeof draft_presentation;
  "draft/prompts/pack": typeof draft_prompts_pack;
  "draft/prompts/setting": typeof draft_prompts_setting;
  "draft/retry": typeof draft_retry;
  "draft/returning": typeof draft_returning;
  "draft/rounds": typeof draft_rounds;
  "draft/scheduling": typeof draft_scheduling;
  "draft/seating": typeof draft_seating;
  "draft/set/bustedCatalog": typeof draft_set_bustedCatalog;
  "draft/set/bustedReferences": typeof draft_set_bustedReferences;
  "draft/set/catalog/common": typeof draft_set_catalog_common;
  "draft/set/catalog/mythic": typeof draft_set_catalog_mythic;
  "draft/set/catalog/rare": typeof draft_set_catalog_rare;
  "draft/set/catalog/uncommon": typeof draft_set_catalog_uncommon;
  "draft/set/collation": typeof draft_set_collation;
  "draft/set/contracts": typeof draft_set_contracts;
  "draft/set/creative": typeof draft_set_creative;
  "draft/set/creativeSeed": typeof draft_set_creativeSeed;
  "draft/set/curve": typeof draft_set_curve;
  "draft/set/execute": typeof draft_set_execute;
  "draft/set/modelSettings": typeof draft_set_modelSettings;
  "draft/set/parsing": typeof draft_set_parsing;
  "draft/set/planning": typeof draft_set_planning;
  "draft/set/powerPolicy": typeof draft_set_powerPolicy;
  "draft/set/prompts": typeof draft_set_prompts;
  "draft/set/referenceSelection": typeof draft_set_referenceSelection;
  "draft/set/referenceTypes": typeof draft_set_referenceTypes;
  "draft/set/references": typeof draft_set_references;
  "draft/set/repair": typeof draft_set_repair;
  "draft/set/requestContext": typeof draft_set_requestContext;
  "draft/set/screening": typeof draft_set_screening;
  "draft/set/setting": typeof draft_set_setting;
  "draft/set/slots": typeof draft_set_slots;
  "draft/set/stageInstructions": typeof draft_set_stageInstructions;
  "draft/set/state": typeof draft_set_state;
  "draft/set/support": typeof draft_set_support;
  "draft/set/tables": typeof draft_set_tables;
  "draft/set/types": typeof draft_set_types;
  "draft/set/usage": typeof draft_set_usage;
  "draft/set/worldDirection": typeof draft_set_worldDirection;
  "draft/setAdvance": typeof draft_setAdvance;
  "draft/setArt": typeof draft_setArt;
  "draft/setJobs": typeof draft_setJobs;
  "draft/setPacks": typeof draft_setPacks;
  "draft/setQueue": typeof draft_setQueue;
  "draft/setRuns": typeof draft_setRuns;
  "draft/setWorker": typeof draft_setWorker;
  "draft/settings": typeof draft_settings;
  "draft/start": typeof draft_start;
  "draft/tables": typeof draft_tables;
  errors: typeof errors;
  "game/access": typeof game_access;
  "game/cleanup": typeof game_cleanup;
  "game/counters": typeof game_counters;
  "game/extras": typeof game_extras;
  "game/games": typeof game_games;
  "game/log": typeof game_log;
  "game/placement": typeof game_placement;
  "game/play": typeof game_play;
  "game/presence": typeof game_presence;
  "game/seats": typeof game_seats;
  "game/setup": typeof game_setup;
  "game/table": typeof game_table;
  "game/tables": typeof game_tables;
  "game/tokens": typeof game_tokens;
  http: typeof http;
  "identity/tables": typeof identity_tables;
  "identity/username": typeof identity_username;
  "identity/users": typeof identity_users;
  "identity/viewer": typeof identity_viewer;
  "lobby/access": typeof lobby_access;
  "lobby/away": typeof lobby_away;
  "lobby/cleanup": typeof lobby_cleanup;
  "lobby/departure": typeof lobby_departure;
  "lobby/ideas": typeof lobby_ideas;
  "lobby/lifecycle": typeof lobby_lifecycle;
  "lobby/lobbies": typeof lobby_lobbies;
  "lobby/messages": typeof lobby_messages;
  "lobby/presence": typeof lobby_presence;
  "lobby/roster": typeof lobby_roster;
  "lobby/sightings": typeof lobby_sightings;
  "lobby/tables": typeof lobby_tables;
  mana: typeof mana;
  powerLevel: typeof powerLevel;
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
