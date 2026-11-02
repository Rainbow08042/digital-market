#!/bin/sh
# Read-only inventory. Does not install, restart, stop, or modify anything.
set -u

printf '\n=== Identity and operating system ===\n'
id
hostname
uname -r
if [ -r /etc/os-release ]; then
  sed -n '/^PRETTY_NAME=/p' /etc/os-release
fi

printf '\n=== Resources ===\n'
df -h / /srv /var /opt 2>/dev/null || true
free -m 2>/dev/null || true
uptime

printf '\n=== Listening TCP ports ===\n'
ss -ltnp 2>/dev/null || true

printf '\n=== Existing web runtimes ===\n'
for program in nginx caddy apache2 docker node python3; do
  command -v "$program" 2>/dev/null || true
done

printf '\n=== Service names and state ===\n'
systemctl list-units --type=service --state=running --no-pager 2>/dev/null || true

printf '\n=== Existing project directory names ===\n'
for directory in /srv /var/www /opt /etc/nginx/sites-enabled /etc/nginx/conf.d; do
  if [ -d "$directory" ]; then
    ls -ld "$directory"
    ls -1 "$directory"
  fi
done

printf '\n=== Existing containers (no environment variables) ===\n'
if command -v docker >/dev/null 2>&1; then
  docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null || true
fi

printf '\n=== Non-interactive administrative access ===\n'
if [ "$(id -u)" -eq 0 ]; then
  printf 'root\n'
elif command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
  printf 'sudo available\n'
else
  printf 'unprivileged account\n'
fi
