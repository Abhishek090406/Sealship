#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

PYTHON_BIN=$(which /opt/homebrew/bin/python3.11 python3.11 python3 | head -n 1)

if [ ! -d ".venv" ] || [ ! -f ".venv/bin/uvicorn" ]; then
  echo "🐍 Creating Python 3.11 virtualenv for SealShip Backend using ${PYTHON_BIN}..."
  rm -rf .venv
  "${PYTHON_BIN}" -m venv .venv
  source .venv/bin/activate
  pip install --no-cache-dir -r requirements.txt
else
  source .venv/bin/activate
fi

echo "🚀 Starting SealShip FastAPI Backend on http://0.0.0.0:8000..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
