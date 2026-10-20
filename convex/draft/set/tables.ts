import { defineTable } from "convex/server";
import { v } from "convex/values";
import { cardFace } from "../../card";
import { powerLevel } from "../../powerLevel";

export const setTables = {
  setRuns: defineTable({
    lobbyId: v.id("lobbies"),
    key: v.string(),
    revision: v.number(),
    total: v.number(),
    powerLevel: v.optional(powerLevel),
    phase: v.string(),
    wakePending: v.optional(v.boolean()),
    ideas: v.array(v.string()),
    versions: v.string(),
    seed: v.number(),
    worldDirection: v.optional(v.string()),
    blueprint: v.optional(v.string()),
    spent: v.number(),
    reserved: v.number(),
    budget: v.number(),
    error: v.optional(v.string()),
    restartRequired: v.optional(v.boolean()),
    artDeadline: v.optional(v.number()),
    frozen: v.optional(v.boolean()),
  }).index("by_lobby", ["lobbyId"]),
  setDesigns: defineTable({
    runId: v.id("setRuns"),
    slotId: v.string(),
    slot: v.string(),
    card: v.optional(v.object(cardFace)),
    tokens: v.array(v.string()),
    revision: v.number(),
    imageId: v.optional(v.id("_storage")),
    artPrompt: v.optional(v.string()),
  })
    .index("by_run", ["runId"])
    .index("by_run_slot", ["runId", "slotId"]),
  setJobs: defineTable({
    runId: v.id("setRuns"),
    runKey: v.string(),
    revision: v.number(),
    stage: v.string(),
    key: v.string(),
    status: v.string(),
    attempt: v.number(),
    repairs: v.number(),
    task: v.string(),
    result: v.optional(v.string()),
    usage: v.optional(v.string()),
    usageHistory: v.optional(v.array(v.string())),
    error: v.optional(v.string()),
    reservation: v.number(),
    jobId: v.optional(v.id("_scheduled_functions")),
    startedAt: v.optional(v.number()),
    finishedAt: v.optional(v.number()),
  })
    .index("by_run", ["runId"])
    .index("by_status", ["status"]),
  setManifests: defineTable({
    runId: v.id("setRuns"),
    round: v.number(),
    seat: v.number(),
    designs: v.array(v.id("setDesigns")),
    published: v.boolean(),
  }).index("by_run_round", ["runId", "round"]),
};
