"""Research-only fetcher; never imported by the application or used in a game."""

import datetime
import json
from pathlib import Path
import time
import urllib.error
import urllib.request


def fetch(identifiers):
    request = urllib.request.Request(
        "https://api.scryfall.com/cards/collection",
        data=json.dumps({"identifiers": identifiers}).encode(),
        headers={
            "User-Agent": "DraftGPT-Power-Research/1.0",
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=40) as response:
                result = json.load(response)
            if result.get("not_found"):
                raise ValueError(f"Missing printings: {result['not_found']}")
            return result["data"]
        except urllib.error.HTTPError as error:
            if error.code != 429 or attempt == 2:
                raise
            delay = int(error.headers.get("Retry-After", "30"))
            if delay > 60:
                raise RuntimeError(f"Rate limited: retry after {delay} seconds") from error
            print(f"Rate limited; waiting {max(1, delay)} seconds.", flush=True)
            time.sleep(max(1, delay))
    raise RuntimeError("Fetch did not complete")


def main():
    directory = Path(__file__).resolve().parent
    library = json.loads((directory / "cards.json").read_text())
    entries = library["entries"] + library["supplemental"]
    ids = list(dict.fromkeys(entry["printing"]["scryfall_id"] for entry in entries))
    fetched = {}
    for start in range(0, len(ids), 75):
        batch = fetch([{"id": card_id} for card_id in ids[start : start + 75]])
        fetched.update({card["id"]: card for card in batch})
        if start + 75 < len(ids):
            time.sleep(0.25)
    for entry in entries:
        card = fetched[entry["printing"]["scryfall_id"]]
        if card["rarity"] != entry["rarity"] or entry["category"] not in card["type_line"]:
            raise ValueError(f"Printing contract changed: {entry['id']}")
    destination = directory.parents[3] / ".artifacts/mh-power-reference/refreshed-card-facts.json"
    destination.parent.mkdir(parents=True, exist_ok=True)
    snapshot = {
        "retrieved_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "provider": "Scryfall API",
        "cards": fetched,
    }
    destination.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n")
    print(f"Verified {len(entries)} references across {len(fetched)} printings: {destination}")


if __name__ == "__main__":
    main()
