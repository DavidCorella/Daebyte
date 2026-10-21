#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export IMAGE_TAG="${1:-prod}"
docker compose pull
docker compose up -d --remove-orphans
docker image prune -f
echo ">> Deploy $IMAGE_TAG listo"