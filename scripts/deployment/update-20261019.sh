#!/bin/sh
set -eu
release=/srv/digital-market/releases/20261019210902
archive=/tmp/digital-market-site.tar.gz
expected=80425becef3aefe0de44c95e2dea892e1d3b43984a9b19951ed3f172d6bc7cd4
printf '%s  %s\n' "$expected" "$archive" | sha256sum -c -
test ! -e "$release"
previous=$(readlink -f /srv/digital-market/current)
test -d "$previous"
systemctl show nginx -p MainPID -p ActiveEnterTimestamp > /tmp/digital-market-existing-before.txt
mkdir "$release"
tar -xzf "$archive" -C "$release"
python3 - "$release" /tmp/manifest.json <<'PY'
import hashlib, json, pathlib, sys
root = pathlib.Path(sys.argv[1])
manifest = json.loads(pathlib.Path(sys.argv[2]).read_text())
for entry in manifest["files"]:
    file = (root / entry["path"]).resolve()
    assert root in file.parents, entry["path"]
    assert hashlib.sha256(file.read_bytes()).hexdigest() == entry["sha256"], entry["path"]
print("Verified", len(manifest["files"]), "release files")
PY
chmod -R a+rX "$release"
ln -s "$release" /srv/digital-market/current-20261019210902
mv -Tf /srv/digital-market/current-20261019210902 /srv/digital-market/current
if ! curl -fsS http://127.0.0.1:8088/ | cmp - "$release/index.html"; then
    ln -s "$previous" /srv/digital-market/rollback-20261019210902
    mv -Tf /srv/digital-market/rollback-20261019210902 /srv/digital-market/current
    echo "Health check failed; restored previous release" >&2
    exit 1
fi
systemctl show nginx -p MainPID -p ActiveEnterTimestamp > /tmp/digital-market-existing-after.txt
cmp /tmp/digital-market-existing-before.txt /tmp/digital-market-existing-after.txt
curl -fsS http://127.0.0.1/experience/v0.3.0/ | sha256sum
printf 'Previous: %s\nCurrent: %s\n' "$previous" "$(readlink -f /srv/digital-market/current)"
systemctl is-active digital-market nginx
