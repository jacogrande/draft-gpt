import type { ConversationMessage } from "../../lobby/worldbuilding";
import { arr, choice, nonempty as s, obj, str, validate } from "./schema";

export type Preference = {
  id: string;
  kind: "premise" | "subject" | "tone" | "avoid" | "gameplay";
  text: string;
  sourceMessages: string[];
  status: "active" | "superseded" | "unsupported";
  reason: string;
};
export type CreativeIntent = {
  preferences: Preference[];
  signals?: { preferenceId: string; supporters: string[]; contributors: string[] }[];
  conflicts: { preferences: string[]; explanation: string }[];
  ignoredMessages: { sourceMessages: string[]; reason: string }[];
};
export type PreferencePlan = {
  preferenceId: string;
  disposition: "incorporated" | "adapted" | "omitted";
  expression: string;
  reason: string;
  cardGuidance: string;
};
export const intentSchema = obj({
  preferences: arr(obj({
    id: s(40), kind: choice(["premise", "subject", "tone", "avoid", "gameplay"]), text: s(500),
    sourceMessages: arr(s(20), 1, 200), status: choice(["active", "superseded", "unsupported"]), reason: str(500),
  }), 0, 40),
  conflicts: arr(obj({ preferences: arr(s(40), 2, 40), explanation: s(500) }), 0, 20),
  ignoredMessages: arr(obj({ sourceMessages: arr(s(20), 1, 200), reason: s(300) }), 0, 200),
});
export const preferencePlanSchema = arr(obj({
  preferenceId: s(40), disposition: choice(["incorporated", "adapted", "omitted"]),
  expression: str(500), reason: s(500), cardGuidance: str(500),
}), 0, 40);

export const parseIntent = (raw: unknown, messages: ConversationMessage[]): CreativeIntent => {
  validate(raw, intentSchema);
  const result = raw as CreativeIntent;
  const ids = new Set(result.preferences.map(p => p.id));
  if (ids.size !== result.preferences.length) throw new Error("Repeated preference ID");
  const sources = new Set(messages.map(m => m.id));
  const accounted = new Set<string>();
  for (const item of [...result.preferences, ...result.ignoredMessages]) {
    if (new Set(item.sourceMessages).size !== item.sourceMessages.length) throw new Error("Repeated source reference");
    for (const id of item.sourceMessages) {
      if (!sources.has(id)) throw new Error(`Unknown source ${id}`);
      accounted.add(id);
    }
  }
  if (accounted.size !== sources.size) throw new Error("Every message needs a preference or an explicit ignored-message reason");
  for (const conflict of result.conflicts)
    if (new Set(conflict.preferences).size !== conflict.preferences.length || conflict.preferences.some(id =>
      !result.preferences.some(p => p.id === id && p.status === "active"))) throw new Error("Conflict must refer to distinct active preferences");
  for (const preference of result.preferences)
    if (preference.status !== "active" && !preference.reason.trim()) throw new Error("Excluded preference needs a reason");
  return { ...result, signals: result.preferences.map(preference => {
    const sources = messages.filter(message => preference.sourceMessages.includes(message.id));
    return { preferenceId: preference.id,
      supporters: [...new Set(sources.flatMap(message => message.supportedBy))],
      contributors: [...new Set(sources.map(message => message.participant))],
    };
  }) };
};

export const validatePreferencePlan = (plan: PreferencePlan[], intent: CreativeIntent) => {
  if (plan.length !== intent.preferences.length || new Set(plan.map(p => p.preferenceId)).size !== plan.length)
    throw new Error("Account for every preference exactly once");
  for (const item of plan) {
    const preference = intent.preferences.find(p => p.id === item.preferenceId);
    if (!preference) throw new Error(`Unknown preference ${item.preferenceId}`);
    if (preference.status !== "active" && item.disposition !== "omitted") throw new Error(`Do not revive ${preference.status} preference ${preference.id}`);
    if (item.disposition !== "omitted" && (!item.expression.trim() || !item.cardGuidance.trim())) throw new Error(`Explain world and card expression for ${preference.id}`);
  }
};
