"""Illustrative API budget, not measured usage. Run with Python 3; no API calls."""

import json
import math


RATES = {"luna": (0.10, 0.50), "sonnet": (2.00, 10.00)}


def estimate(cards):
    batches = math.ceil(cards / 15)
    edited = math.ceil(cards * 0.25)
    edit_batches = math.ceil(edited / 15)
    stages = {
        "brief": (12_000, 8_000),
        "slots": (12_000, 100 * cards + 2_000),
        "generation": (8_000 * batches, 500 * cards + 3_000 * batches),
        "two_global_reviews": (2 * (8_000 + 350 * cards), 20_000),
        "ten_archetype_reviews": (120_000, 30_000),
        "revision": (12_000 * edit_batches, 500 * edited + 3_000 * edit_batches),
    }

    def stage_cost(stage, model):
        inputs, outputs = stages[stage]
        input_rate, output_rate = RATES[model]
        return (inputs * input_rate + outputs * output_rate) / 1_000_000

    decisions_input = cards / 270 * 1_000_000
    decisions_cost = decisions_input * 0.10 / 1_000_000
    art = cards * 0.0052
    text = {
        model: sum(stage_cost(stage, model) for stage in stages) + decisions_cost
        for model in RATES
    }
    text["hybrid"] = sum(
        stage_cost(stage, "luna" if stage == "generation" else "sonnet")
        for stage in stages
    ) + decisions_cost
    return {
        "cards": cards,
        "generation_batches": batches,
        "edited_cards": edited,
        "revision_batches": edit_batches,
        "stage_tokens_input_output": stages,
        "generative_input_tokens": sum(value[0] for value in stages.values()),
        "generative_output_tokens_including_reasoning": sum(value[1] for value in stages.values()),
        "decisions_input_tokens": decisions_input,
        "decisions_usd": decisions_cost,
        "text_usd": text,
        "art_usd": art,
        "text_and_art_usd": {key: value + art for key, value in text.items()},
        "double_text_budget_plus_art_usd": {key: 2 * value + art for key, value in text.items()},
    }


if __name__ == "__main__":
    print(json.dumps([estimate(135), estimate(270)], indent=2))
