#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

COMPOSE_FILE="$ROOT_DIR/compose.yaml"
HEALTH_URL="${HEALTH_URL:-http://localhost/health}"

usage() {
  echo "Usage:"
  echo "  $0 deploy"
  echo "  $0 status"
  echo "  $0 health"
  echo "  $0 logs <service>"
  echo "  $0 restart <service>"
  echo "  $0 stop"
}

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Error: required command '$command_name' is not installed." >&2
    exit 1
  fi
}

validate_service() {
  local service="${1:-}"

  case "$service" in
    backend|frontend|postgres)
      ;;
    *)
      echo "Error: service must be backend, frontend or postgres." >&2
      exit 1
      ;;
  esac
}

show_status() {
  docker compose -f "$COMPOSE_FILE" ps
}

health_check() {
  echo "Checking application health at $HEALTH_URL..."

  if curl --fail --silent --show-error "$HEALTH_URL"; then
    echo
    echo "Health check passed."
  else
    echo
    echo "Health check failed." >&2
    return 1
  fi
}

deploy() {
  echo "Validating Compose configuration..."
  docker compose -f "$COMPOSE_FILE" config >/dev/null

  echo "Building and starting services..."
  docker compose -f "$COMPOSE_FILE" up -d --build

  echo "Waiting for application health..."

  local attempt

  for attempt in {1..12}; do
    if curl --fail --silent "$HEALTH_URL" >/dev/null 2>&1; then
      echo "Application is healthy."
      show_status
      return 0
    fi

    echo "Attempt $attempt/12 failed; retrying in 5 seconds..."
    sleep 5
  done

  echo "Deployment failed health check." >&2
  docker compose -f "$COMPOSE_FILE" ps >&2
  docker compose -f "$COMPOSE_FILE" logs --tail=50 backend >&2

  return 1
}

show_logs() {
  local service="${1:-}"
  validate_service "$service"

  docker compose -f "$COMPOSE_FILE" logs -f "$service"
}

restart_service() {
  local service="${1:-}"
  validate_service "$service"

  echo "Restarting $service..."
  docker compose -f "$COMPOSE_FILE" restart "$service"
}

stop_stack() {
  docker compose -f "$COMPOSE_FILE" down
}

main() {
  require_command docker
  require_command curl

  local action="${1:-}"

  case "$action" in
    deploy)
      deploy
      ;;
    status)
      show_status
      ;;
    health)
      health_check
      ;;
    logs)
      show_logs "${2:-}"
      ;;
    restart)
      restart_service "${2:-}"
      ;;
    stop)
      stop_stack
      ;;
    *)
      usage
      exit 1
      ;;
  esac
}

main "$@"
