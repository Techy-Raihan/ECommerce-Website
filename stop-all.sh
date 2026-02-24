#!/bin/bash
# ================================================================
#   ShopNest — Stop All Services (Bash)
# ================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT_DIR/logs"

echo "Stopping all ShopNest services..."

for pidfile in "$PID_DIR"/*.pid; do
  [ -f "$pidfile" ] || continue
  pid=$(cat "$pidfile")
  name=$(basename "$pidfile" .pid)
  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null
    echo "  Stopped $name (PID $pid)"
  else
    echo "  $name already stopped."
  fi
  rm -f "$pidfile"
done

echo "Stopping Docker infrastructure..."
docker-compose -f "$ROOT_DIR/docker-compose.infra.yml" down

echo ""
echo "✔ All ShopNest services stopped."
