#!/bin/sh
set -eu
stamp=${1:?Release timestamp required}
expected=${2:?Archive SHA-256 required}
case "$stamp" in ''|*[!0-9]*) exit 1 ;; esac
test "${#stamp}" -eq 14
release="/srv/digital-market/releases/$stamp"
previous=$(readlink -f /srv/digital-market/current)
test -d "$previous"
test ! -e "$release"
printf '%s  %s\n' "$expected" /tmp/digital-market-site.tar.gz | sha256sum -c -
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
ln -s "$release" "/srv/digital-market/current-$stamp"
mv -Tf "/srv/digital-market/current-$stamp" /srv/digital-market/current
if ! curl -fsS http://127.0.0.1:8088/ | cmp - "$release/index.html"; then
    ln -s "$previous" "/srv/digital-market/rollback-$stamp"
    mv -Tf "/srv/digital-market/rollback-$stamp" /srv/digital-market/current
    exit 1
fi
printf 'Previous: %s\nCurrent: %s\n' "$previous" "$(readlink -f /srv/digital-market/current)"
systemctl is-active digital-market nginx
