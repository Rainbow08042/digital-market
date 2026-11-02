#!/bin/sh
set -eu
release=/srv/digital-market/releases/20261019234338
previous=$(readlink -f /srv/digital-market/current)
test -d "$previous"
test ! -e "$release"
printf '%s  %s\n' 7c0cd988ec79377b951c1cef44c1b45e1d11a426cbc12d05ecc990023d422af1 /tmp/digital-market-site.tar.gz | sha256sum -c -
mkdir "$release"
tar -xzf /tmp/digital-market-site.tar.gz -C "$release"
python3 - "$release" <<'PY'
import hashlib, json, pathlib, sys
root = pathlib.Path(sys.argv[1])
manifest = json.loads(pathlib.Path('/tmp/manifest.json').read_text())
for entry in manifest['files']:
    file = (root / entry['path']).resolve()
    assert root in file.parents
    assert hashlib.sha256(file.read_bytes()).hexdigest() == entry['sha256'], entry['path']
print('Verified', len(manifest['files']), 'files')
PY
chmod -R a+rX "$release"
ln -s "$release" /srv/digital-market/current-20261019234338
mv -Tf /srv/digital-market/current-20261019234338 /srv/digital-market/current
if ! curl -fsS http://127.0.0.1:8088/ | cmp - "$release/index.html"; then
    ln -s "$previous" /srv/digital-market/rollback-20261019234338
    mv -Tf /srv/digital-market/rollback-20261019234338 /srv/digital-market/current
    exit 1
fi
printf 'Previous: %s\nCurrent: %s\n' "$previous" "$(readlink -f /srv/digital-market/current)"
systemctl is-active digital-market nginx
