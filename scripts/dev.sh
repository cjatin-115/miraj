#!/usr/bin/env bash
set -e

echo "============================================================"
echo " Starting Miraaj Development Stack..."
echo "============================================================"

# Check Redis
if ! redis-cli ping &>/dev/null; then
    echo "[1/3] Starting Redis server..."
    redis-server --daemonize yes || true
else
    echo "[1/3] Redis is already active."
fi

# Launch API
echo "[2/3] Launching FastAPI API server..."
python -m uvicorn apps.api.src.main:app --host 0.0.0.0 --port 8000 --reload &
API_PID=$!

# Launch Frontend
echo "[3/3] Launching Next.js frontend..."
npm run dev --workspace=apps/web &
WEB_PID=$!

trap "kill $API_PID $WEB_PID 2>/dev/null || true" EXIT

echo "============================================================"
echo " Miraaj V1 Stack is live!"
echo " Web UI     : http://localhost:3000"
echo " API Docs   : http://localhost:8000/docs"
echo " API Health : http://localhost:8000/api/v1/health"
echo "============================================================"

wait
