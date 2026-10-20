import { Blueprint, Design, Review } from "../convex/draft/set/types";
import { POWER_LEVELS, PowerLevel, powerLevelOf } from "../convex/powerLevel";

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ]!)
  );
export const renderPreview = (preview: {
  powerLevel?: PowerLevel;
  blueprint: Blueprint;
  pack: Design[];
  ready: boolean;
  revised: string[];
  finalReview: Review;
}) => {
  const { blueprint, pack } = preview;
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(
    blueprint.world.name
  )} — DraftGPT pack review</title>
<style>body{margin:0;background:#171b20;color:#eee;font:16px/1.5 system-ui}main{max-width:1300px;margin:auto;padding:32px}h1{font-family:Georgia;font-size:44px;margin-bottom:8px}.lede{max-width:850px;color:#d0d6dc}.meta{color:#afb9c4;font-size:14px}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;margin:32px 0}.card{border:7px solid var(--frame);background:#eee6d6;color:#161a1f;border-radius:16px;overflow:hidden;box-shadow:0 5px 16px #0007}.card header{padding:10px;display:flex;justify-content:space-between;gap:12px;font-weight:bold}.card img,.placeholder{width:100%;aspect-ratio:1.536;object-fit:cover;background:#26343b}.type{padding:8px 12px;border-bottom:1px solid #a3947b;font-size:14px}.rules{white-space:pre-wrap;padding:12px;min-height:85px}.flavor{font:italic 14px Georgia;padding:0 12px 12px;color:#594e40}.stats{text-align:right;padding:5px 12px;font-weight:bold}.foot{font-size:12px;padding:8px 12px;color:#59544b}details{padding:15px;border:1px solid #45515e;border-radius:8px;margin:14px 0}summary{cursor:pointer}a{color:#add5ff}.pairs{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}.pairs p{margin:8px 0;color:#bbc6d0}</style>
<main><div class="meta">DRAFTGPT · FIFTEEN-CARD VALIDATION PACK · LUNA · ${POWER_LEVELS[powerLevelOf(preview.powerLevel)].label.toUpperCase()} POWER</div><h1>${escape(
    blueprint.world.name
  )}</h1><p class="lede">${escape(
    blueprint.world.premise
  )}</p><p class="lede">${escape(
    blueprint.world.description
  )}</p><p class="meta">Collated from 135 unique designs · 10 commons / 4 uncommons / 1 rare or mythic · ${
    preview.ready
      ? "Passed automated checks; awaiting your judgment"
      : "Automated review found unresolved issues"
  }</p><p><a href="pack.json">Pack and review JSON</a> · <a href="set.json">Complete design inventory</a></p>
<details><summary>Setting and archetype guide</summary><div class="pairs">${blueprint.archetypes
    .map(
      (a) =>
        `<section><h3>${escape(a.id)} — ${escape(a.name)}</h3><p>${escape(
          a.earlyGame
        )} ${escape(a.engine)}</p><p>${escape(
          a.winCondition
        )}</p><p>Weakness: ${escape(a.weaknesses)}</p></section>`
    )
    .join("")}</div>${blueprint.mechanics
    .map((m) => `<p><strong>${escape(m.name)}</strong>: ${escape(m.rules)}</p>`)
    .join("")}</details>
<div class="cards">${pack
    .map((c) => {
      const f = c.face;
      const colors = ["W", "U", "B", "R", "G"].filter((x) =>
        f.mana_cost.includes(`{${x}}`)
      );
      const color =
        colors.length > 1
          ? "#b2934f"
          : {
              W: "#d5cdb2",
              U: "#4e8bb5",
              B: "#6b6272",
              R: "#b26a4c",
              G: "#5e8864",
            }[colors[0]] ?? "#969c9d";
      return `<article class="card" style="--frame:${color}"><header><span>${escape(
        f.name
      )}</span><span>${escape(f.mana_cost)}</span></header>${
        f.image_url
          ? `<img src="${escape(f.image_url)}" alt="${escape(
              f.art_direction
            )}">`
          : '<div class="placeholder"></div>'
      }<div class="type">${escape(f.type)}${
        f.subtype ? ` — ${escape(f.subtype)}` : ""
      } · ${escape(f.rarity)}</div><div class="rules">${escape(
        f.rules_text
      )}</div><div class="flavor">${escape(f.flavor_text)}</div>${
        c.tokens.length
          ? `<div class="foot">${c.tokens.map(escape).join("<br>")}</div>`
          : ""
      }${
        f.type.includes("Creature")
          ? `<div class="stats">${f.power}/${f.toughness}</div>`
          : ""
      }<div class="foot">${escape(c.slotId)}${
        preview.revised.includes(c.slotId) ? " · revised after review" : ""
      }</div></article>`;
    })
    .join("")}</div><details><summary>Final reviewer notes</summary><p>${escape(
    preview.finalReview.summary
  )}</p>${preview.finalReview.issues
    .map(
      (i) =>
        `<p>${escape(i.severity)} · ${escape(i.slots.join(", "))}: ${escape(
          i.evidence
        )}</p>`
    )
    .join(
      ""
    )}</details><p class="meta">Review gameplay, clarity, power, and world cohesion. Automated review is not a substitute for playing the cards.</p></main></html>`;
};
