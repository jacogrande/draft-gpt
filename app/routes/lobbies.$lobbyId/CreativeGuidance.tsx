import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";

const CreativeGuidance = ({ lobbyId }: { lobbyId: Id<"lobbies"> }) => {
  const guidance = useQuery(api.draft.guidance.forLobby, { lobbyId });
  if (!guidance) return null;
  return <details className="w-full max-w-2xl rounded-box border border-base-300 bg-base-100 p-3 text-left">
    <summary className="cursor-pointer font-semibold text-sm">Your ideas in this set</summary>
    {!guidance.preferences.length && <p className="mt-2 text-sm">The conversation contained no specific world preferences. We’re inventing a new setting.</p>}
    <ul className="mt-3 space-y-3">
      {guidance.preferences.map(preference => <li key={preference.id} className="text-sm break-words">
        <p><span className="badge badge-ghost badge-sm mr-2">{preference.kind}</span>{preference.text}</p>
        <p className="mt-1 opacity-70">{preference.plan
          ? `${preference.plan.disposition === "incorporated" ? "Included" : preference.plan.disposition === "adapted" ? "Adapted" : "Not included"}: ${preference.plan.expression || preference.plan.reason}`
          : preference.status === "active" ? "Considering for this world" : preference.reason}</p>
        {preference.plan && preference.plan.disposition !== "incorporated" && preference.plan.expression && <p className="opacity-70">{preference.plan.reason}</p>}
        <details className="mt-1">
          <summary className="cursor-pointer text-xs opacity-70">Source messages · {preference.supportCount} supporting</summary>
          {preference.sources.map(source => <blockquote key={source.id} className="my-1 border-l-2 border-base-300 pl-2 whitespace-pre-wrap">{source.text}</blockquote>)}
        </details>
      </li>)}
    </ul>
    {guidance.conflicts.map((conflict, index) => <p className="mt-3 text-sm" key={index}><strong>Different preferences:</strong> {conflict.explanation}</p>)}
    {!!guidance.ignored.length && <details className="mt-3 text-sm">
      <summary className="cursor-pointer">Other conversation</summary>
      {guidance.ignored.map((item, i) => <div key={i} className="mt-2"><p>{item.reason}</p>{item.sources.map(source => <blockquote key={source.id} className="opacity-70 break-words">{source.text}</blockquote>)}</div>)}
    </details>}
    <p className="mt-3 text-xs opacity-60">This is the design plan, not a promise that every card uses every idea. The draft’s power level and supported format stay fixed.</p>
  </details>;
};
export default CreativeGuidance;
