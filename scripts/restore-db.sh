#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

COMPOSE_FILE="$ROOT_DIR/compose.yaml"

DB_SERVICE="${DB_SERVICE:-postgres}"
DB_NAME="${DB_NAME:-si_platform}"
DB_USER="${DB_USER:-si_user}"

usage() {
  echo "Usage:"
  echo "  $0 <backup.sql.gz>"
}

if [[ $# -ne 1 ]]; then
  usage
  exit 1
fi

BACKUP_FILE="$1"

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "Error: backup file does not exist: $BACKUP_FILE" >&2
  exit 1
fi

if ! gzip -t "$BACKUP_FILE"; then
  echo "Error: backup file is not a valid gzip archive." >&2
  exit 1
fi

echo "WARNING: this will replace database objects in '$DB_NAME'."

if [[ "${FORCE_RESTORE:-false}" != "true" ]]; then
  read -r -p "Continue? [y/N] " answer

  case "$answer" in
    y|Y|yes|YES)
      ;;
    *)
      echo "Restore cancelled."
      exit 0
      ;;
  esac
fi

echo "Stopping backend to avoid writes during restore..."
docker compose -f "$COMPOSE_FILE" stop backend

restart_backend() {
  echo "Starting backend..."
  docker compose -f "$COMPOSE_FILE" start backend
}

trap restart_backend EXIT

echo "Restoring database from:"
echo "$BACKUP_FILE"

gzip -dc "$BACKUP_FILE" \
  | docker compose -f "$COMPOSE_FILE" exec -T "$DB_SERVICE" \
      psql \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --set=ON_ERROR_STOP=1

echo "Database restore completed successfully."
