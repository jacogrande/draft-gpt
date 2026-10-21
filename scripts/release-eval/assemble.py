"""Keep baseline, interrupted and intervention outcomes together for review."""
import copy
import json
from pathlib import Path

out = Path('.artifacts/release-report-20261021')
out.mkdir(parents=True, exist_ok=True)
results = []
configs = {}
for version in ('v10', 'v11'):
    root = Path(f'.artifacts/release-eval-{version}')
    data = json.loads((root/'results.json').read_text())
    configs[version] = data['config']
    for saved in data['results']:
        result = copy.deepcopy(saved)
        original = result['trial']['id']
        result['originalTrialId'] = original
        result['trial']['id'] = version+'-'+original
        result['versions'] = data['config']['versions']
        link = out/result['trial']['id']
        if not link.exists(): link.symlink_to((root/original).resolve(), target_is_directory=True)
        results.append(result)
(out/'results.json').write_text(json.dumps({'config': configs, 'results': results}, indent=2))
print(out)
