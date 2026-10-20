"""Offline research importer. Cache sources and verify card facts with Scryfall."""
import datetime
import hashlib
import json
from pathlib import Path
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / '.artifacts/busted-references'
DEST = ROOT / 'convex/draft/set/catalog/busted.json'
POWER_NINE = ['Black Lotus', 'Ancestral Recall', 'Time Walk', 'Timetwister',
              'Mox Pearl', 'Mox Sapphire', 'Mox Jet', 'Mox Ruby', 'Mox Emerald']
CUBES = {
    'vintage-cube': 'https://www.mtgo.com/vintage-cube-cardlist',
    'vintage-2023': 'https://www.mtgo.com/news/mtgo-vintage-cube-12142023',
    'vintage-spring24': 'https://www.mtgo.com/news/spring-2024-vintage-cube-update',
    'vintage-may24': 'https://www.mtgo.com/news/vintage-cube-update-may-2024',
    'vintage-winter24': 'https://www.mtgo.com/news/winter-24-vintage-cube-update',
}
SOURCES = {**CUBES, **{
    f'{fmt}-{kind}': f'https://www.mtggoldfish.com/format-staples/{fmt}/full/{kind}'
    for fmt in ['modern', 'legacy', 'vintage']
    for kind in ['all', 'creatures', 'spells', 'lands']
}}


def fetch(url, body=None):
    request = urllib.request.Request(url, data=json.dumps(body).encode() if body else None,
        headers={'User-Agent': 'DraftGPT-Reference-Research/1.0',
                 'Accept': 'application/json,text/html', 'Content-Type': 'application/json'})
    for attempt in range(4):
        time.sleep(.25)
        try:
            with urllib.request.urlopen(request, timeout=40) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            if error.code != 429 or attempt == 3:
                raise
            delay = int(error.headers.get('Retry-After', '30'))
            if delay > 60:
                raise RuntimeError(f'Rate limited; resume after {delay} seconds') from error
            print(f'Rate limited; waiting {max(1, delay)} seconds', flush=True)
            time.sleep(max(1, delay))
    raise RuntimeError('Fetch failed')


def cached(label, url, body=None):
    path = CACHE / label
    if not path.exists():
        path.write_bytes(fetch(url, body))
    return path.read_bytes()


def source_names(key, raw):
    soup = BeautifulSoup(raw, 'html.parser')
    for removed in soup.select('s, del, [style*="line-through"]'):
        removed.decompose()
    if key in CUBES:
        for table in soup.select('table'):
            rows = table.select('tr')
            if len(rows) < 500:
                continue
            headers = [c.get_text(' ', strip=True) for c in rows[0].select('th,td')]
            col = next(i for i, name in enumerate(headers) if 'Card' in name)
            names = [r.select('td')[col].get_text(' ', strip=True)
                     for r in rows[1:] if len(r.select('td')) > col]
            names = [n for n in names if n not in ('Card Name', 'Card')]
            if len(set(names)) != 540:
                raise ValueError(f'{key}: expected 540 distinct cards, got {len(set(names))}')
            return names
        raise ValueError(f'No full cube list in {key}')
    names = [a.get_text(' ', strip=True) for row in soup.select('table tr')
             if (a := row.select_one('a[href^="/price/"]'))]
    if len(names) != 50:
        raise ValueError(f'{key}: expected 50 staples, got {len(names)}')
    return names


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    evidence, sources = {}, []
    def add(name, source):
        evidence.setdefault(name, set()).add(source)
    for key, url in SOURCES.items():
        raw = cached(key + '.html', url)
        names = source_names(key, raw)
        sources.append({'id': key, 'url': url, 'count': len(set(names)),
                        'sha256': hashlib.sha256(raw).hexdigest()})
        for name in names:
            add(name, key)
    query = '(restricted:vintage or banned:modern) game:paper'
    url = 'https://api.scryfall.com/cards/search?' + urllib.parse.urlencode({'q': query})
    page = json.loads(cached('restricted-modern-bans.json', url))
    if page.get('has_more'):
        raise ValueError('Ban query now paginates; update importer before refreshing')
    sources.append({'id': 'restricted-modern-bans', 'url': url, 'count': len(page['data']),
                    'sha256': hashlib.sha256(json.dumps(page, sort_keys=True).encode()).hexdigest()})
    for card in page['data']:
        add(card['name'], 'restricted-modern-bans')
    for name in POWER_NINE:
        add(name, 'power-nine')
    facts = {}
    names = sorted(evidence)
    for start in range(0, len(names), 75):
        batch = names[start:start+75]
        key = hashlib.sha256(json.dumps(batch).encode()).hexdigest()[:20]
        reply = json.loads(cached(f'cards-{key}.json', 'https://api.scryfall.com/cards/collection',
                                 {'identifiers': [{'name': name} for name in batch]}))
        resolved = list(reply['data'])
        for missing in reply.get('not_found', []):
            name = missing['name']
            key = hashlib.sha256(name.encode()).hexdigest()[:20]
            url = 'https://api.scryfall.com/cards/named?' + urllib.parse.urlencode({'exact': name})
            card = json.loads(cached(f'exact-{key}.json', url))
            if card.get('object') != 'card':
                raise ValueError(f'Unresolved name: {name}')
            resolved.append(card)
        for card in resolved:
            facts[card['oracle_id']] = card
        print(f'Verified {min(start+75, len(names))}/{len(names)} names', flush=True)
    records = []
    originals = json.loads(cached('power-nine-lea.json', 'https://api.scryfall.com/cards/collection',
        {'identifiers': [{'name': name, 'set': 'lea'} for name in POWER_NINE]}))
    if originals.get('not_found') or len(originals['data']) != 9:
        raise ValueError('Could not verify all nine Alpha printings')
    for card in originals['data']:
        facts[card['oracle_id']] = card
    def normalized(name):
        return ''.join(c for c in unicodedata.normalize('NFKD', name)
                       if not unicodedata.combining(c)).casefold().replace('’', "'")
    normalized_evidence = {}
    for name, labels in evidence.items():
        normalized_evidence.setdefault(normalized(name), set()).update(labels)
    for card in facts.values():
        if 'Basic' in card['type_line']:
            continue
        aliases = [card['name']] + [face['name'] for face in card.get('card_faces', [])[:1]]
        matches = sorted(set().union(*(normalized_evidence.get(normalized(name), set()) for name in aliases)))
        if not matches:
            raise ValueError(f"No source match: {card['name']}")
        priority = (10000 if 'power-nine' in matches else 0) + (1000 if 'vintage-cube' in matches else 0)
        priority += 500 * len({s.split('-')[0] for s in matches if s not in CUBES and s in SOURCES})
        priority += 400 if 'restricted-modern-bans' in matches else 0
        priority += 50 * len([s for s in matches if s in CUBES and s != 'vintage-cube'])
        fields = ['oracle_id', 'id', 'name', 'layout', 'mana_cost', 'cmc', 'type_line',
                  'oracle_text', 'power', 'toughness', 'color_identity', 'rarity', 'set',
                  'collector_number', 'scryfall_uri', 'digital']
        record = {k: card.get(k) for k in fields}
        if 'card_faces' in card:
            record['faces'] = [{k: face.get(k) for k in ['name', 'mana_cost', 'type_line', 'oracle_text', 'power', 'toughness']}
                               for face in card['card_faces']]
        record.update(sources=matches, selection_score=priority)
        records.append(record)
    records.sort(key=lambda c: (-c['selection_score'], c['name']))
    if len(records) < 1000:
        raise ValueError(f'Only {len(records)} unique candidates; do not pad with duplicates')
    selected = records[:1000]
    assert set(POWER_NINE) <= {c['name'] for c in selected}
    result = {'version': 1, 'retrieved_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'method': 'Evidence-prioritized high-power pool, not an objective all-time strength ranking. Power Nine; current MTGO Vintage Cube; constructed staple lists; Vintage restrictions/Modern bans; historical MTGO cubes. Distinct Oracle identities; basics excluded. Power Nine use Alpha printings; other references use the returned Scryfall printing (which may be a digital reprint). Ties by name.',
              'candidate_count': len(records), 'sources': sources, 'cards': selected}
    DEST.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(f'Wrote {len(selected)} of {len(records)} distinct candidates to {DEST}', flush=True)


if __name__ == '__main__':
    main()
