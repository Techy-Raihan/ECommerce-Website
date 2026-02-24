#!/bin/bash
# ================================================================
#   ShopNest — Start All Services Script (Bash / WSL / Git Bash)
# ================================================================
# Usage:
#   chmod +x start-all.sh
#   ./start-all.sh
#
# Prerequisites:
#   - Java 21 installed  (java -version)
#   - Maven 3.9+ installed  (mvn -version)
#   - Docker Desktop running (for MySQL, Redis, Kafka)
# ================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT_DIR/logs"
BACKEND_DIR="$ROOT_DIR/backend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

mkdir -p "$LOG_DIR"

print_banner() {
  echo -e "${CYAN}"
  echo "  ╔═══════════════════════════════════════╗"
  echo "  ║    🛍  ShopNest — Service Launcher    ║"
  echo "  ╚═══════════════════════════════════════╝"
  echo -e "${NC}"
}

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠ $1${NC}"; }
error() { echo -e "${RED}[$(date '+%H:%M:%S')] ✗ $1${NC}"; }

wait_for_port() {
  local service=$1
  local port=$2
  local retries=30
  echo -n "  Waiting for $service on port $port"
  while ! nc -z localhost "$port" 2>/dev/null; do
    echo -n "."
    sleep 2
    ((retries--))
    if [ $retries -le 0 ]; then
      error "\n  $service on port $port did not start in time!"
      return 1
    fi
  done
  echo -e " ${GREEN}✔${NC}"
}

start_service() {
  local name=$1
  local dir=$2
  local port=$3
  log "Starting $name (port $port)..."
  cd "$dir"
  nohup mvn spring-boot:run \
    -Dspring-boot.run.jvmArguments="-Xmx256m" \
    > "$LOG_DIR/${name}.log" 2>&1 &
  echo $! > "$LOG_DIR/${name}.pid"
  log "$name started (PID: $!, log: logs/${name}.log)"
  wait_for_port "$name" "$port"
  cd "$ROOT_DIR"
}

# ── MAIN ──────────────────────────────────────────────────────────

print_banner

# Step 1 — Infrastructure via Docker
log "Step 1: Starting infrastructure (MySQL, Redis, Kafka)..."
docker-compose -f docker-compose.infra.yml up -d
log "Waiting 20s for infrastructure to be ready..."
sleep 20

# Step 2 — Build all services once (faster than building per-service)
log "Step 2: Building all backend services (this takes 2-5 mins first time)..."
for svc in eureka-server api-gateway auth-service user-service product-service cart-service order-service payment-service inventory-service notification-service admin-service; do
  log "  Building $svc..."
  cd "$BACKEND_DIR/$svc"
  mvn clean package -DskipTests -q
  cd "$ROOT_DIR"
done
log "All services built successfully ✔"

# Step 3 — Start services in order
echo ""
log "Step 3: Starting microservices in order..."

start_service "eureka-server"       "$BACKEND_DIR/eureka-server"       8761
sleep 5

start_service "api-gateway"         "$BACKEND_DIR/api-gateway"         8080
sleep 3

start_service "auth-service"        "$BACKEND_DIR/auth-service"        8081
start_service "user-service"        "$BACKEND_DIR/user-service"        8082
start_service "product-service"     "$BACKEND_DIR/product-service"     8083
start_service "cart-service"        "$BACKEND_DIR/cart-service"        8084
start_service "order-service"       "$BACKEND_DIR/order-service"       8085
start_service "payment-service"     "$BACKEND_DIR/payment-service"     8086
start_service "inventory-service"   "$BACKEND_DIR/inventory-service"   8087
start_service "notification-service" "$BACKEND_DIR/notification-service" 8088
start_service "admin-service"       "$BACKEND_DIR/admin-service"       8089

# Step 4 — Frontend
echo ""
log "Step 4: Starting React frontend..."
cd "$ROOT_DIR/frontend"
npm install --silent
nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
echo $! > "$LOG_DIR/frontend.pid"
wait_for_port "frontend" 3000
cd "$ROOT_DIR"

# ── DONE ──────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🎉  All services are running!                  ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Frontend      →  http://localhost:3000          ║${NC}"
echo -e "${GREEN}║  API Gateway   →  http://localhost:8080          ║${NC}"
echo -e "${GREEN}║  Eureka        →  http://localhost:8761          ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Logs in: ./logs/<service-name>.log              ║${NC}"
echo -e "${GREEN}║  Stop:    ./stop-all.sh                          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
