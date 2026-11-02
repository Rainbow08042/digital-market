#!/bin/bash
# Initial installation only. Existing web servers and configurations are untouched.
set -euo pipefail

if [[ "$(id -u)" != 0 ]]; then
  printf 'Run with sudo.\n' >&2
  exit 1
fi
if [[ $# != 3 ]]; then
  printf 'Usage: install-isolated.sh ARCHIVE SHA256 RELEASE_ID\n' >&2
  exit 1
fi
archive="$(realpath "$1")"
expected_hash="$2"
release_id="$3"
script_dir="$(cd -- "$(dirname -- "$0")" && pwd)"
[[ "$release_id" =~ ^[0-9]{14}$ ]] || { printf 'Invalid release ID.\n' >&2; exit 1; }
[[ "$expected_hash" =~ ^[a-f0-9]{64}$ ]] || { printf 'Invalid checksum.\n' >&2; exit 1; }
printf '%s  %s\n' "$expected_hash" "$archive" | sha256sum -c -
for destination in /srv/digital-market /etc/digital-market /etc/systemd/system/digital-market.service; do
  if [[ -e "$destination" || -L "$destination" ]]; then
    printf 'Refusing to overwrite existing path: %s\n' "$destination" >&2
    exit 1
  fi
done
if ss -ltnH 'sport = :8088' | grep -q .; then
  printf 'Port 8088 is already in use; stopping before changes.\n' >&2
  exit 1
fi
[[ -x /usr/sbin/nginx && -f /etc/nginx/mime.types ]]
for filename in nginx.conf digital-market.service; do
  [[ -f "$script_dir/$filename" ]]
done
if [[ "$(systemctl show digital-market.service -p LoadState --value)" != "not-found" ]]; then
  printf 'A service with this name already exists; stopping before changes.\n' >&2
  exit 1
fi

release_dir="/srv/digital-market/releases/$release_id"
install -d -m 0755 "$release_dir" /etc/digital-market
tar --no-same-owner --no-same-permissions -xzf "$archive" -C "$release_dir"
[[ -s "$release_dir/index.html" ]]
find "$release_dir" -type d -exec chmod 0755 {} +
find "$release_dir" -type f -exec chmod 0644 {} +
ln -s "$release_dir" /srv/digital-market/current
install -m 0644 "$script_dir/nginx.conf" /etc/digital-market/nginx.conf
install -m 0644 /etc/nginx/mime.types /etc/digital-market/mime.types
install -m 0644 "$script_dir/digital-market.service" /etc/systemd/system/digital-market.service
systemctl daemon-reload
systemctl enable --now digital-market.service
for attempt in {1..10}; do
  if curl -fsS --max-time 2 http://127.0.0.1:8088/ -o /dev/null; then
    systemctl show digital-market.service -p ActiveState -p SubState -p MainPID -p MemoryCurrent
    printf 'DIGITAL_MARKET_LOCAL_HEALTH_OK\n'
    exit 0
  fi
  sleep 1
done
journalctl -u digital-market.service -n 30 --no-pager >&2
exit 1
