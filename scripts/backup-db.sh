#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

COMPOSE_FILE="$ROOT_DIR/compose.yaml"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"

DB_SERVICE="${DB_SERVICE:-postgres}"
DB_NAME="${DB_NAME:-si_platform}"
DB_USER="${DB_USER:-si_user}"

TIMESTAMP="$(date -u +"%Y-%m-%d_%H-%M-%S")"
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "Creating database backup..."
echo "Database: $DB_NAME"
echo "Output:   $BACKUP_FILE"

docker compose -f "$COMPOSE_FILE" exec -T "$DB_SERVICE" \
  pg_dump \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --clean \
    --if-exists \
  | gzip > "$BACKUP_FILE"

if [[ ! -s "$BACKUP_FILE" ]]; then
  echo "Error: backup file is empty." >&2
  rm -f "$BACKUP_FILE"
  exit 1
fi

gzip -t "$BACKUP_FILE"

echo "Backup completed successfully:"
echo "$BACKUP_FILE"
