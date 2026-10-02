#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="compose.bluegreen.yaml"
PROD_ENV=".env.production"

DEPLOY_DIR="deploy"
NGINX_DIR="$DEPLOY_DIR/nginx"

ACTIVE_FILE="$DEPLOY_DIR/active-color"
PREVIOUS_FILE="$DEPLOY_DIR/previous-color"
RELEASE_ENV="$DEPLOY_DIR/releases.env"

COMPOSE=(
  docker compose
  --env-file "$PROD_ENV"
  --env-file "$RELEASE_ENV"
  -f "$COMPOSE_FILE"
)

usage() {
  echo "Usage:"
  echo "  $0 deploy <image-tag>"
  echo "  $0 rollback"
  echo "  $0 status"
}

other_color() {
  if [[ "$1" == "blue" ]]; then
    echo "green"
  else
    echo "blue"
  fi
}

set_release_tag() {
  local color="$1"
  local tag="$2"

  local variable
  variable="$(echo "$color" | tr '[:lower:]' '[:upper:]')_IMAGE_TAG"

  if grep -q "^${variable}=" "$RELEASE_ENV"; then
    sed -i "s/^${variable}=.*/${variable}=${tag}/" "$RELEASE_ENV"
  else
    echo "${variable}=${tag}" >> "$RELEASE_ENV"
  fi
}

get_release_tag() {
  local color="$1"

  local variable
  variable="$(echo "$color" | tr '[:lower:]' '[:upper:]')_IMAGE_TAG"

  grep "^${variable}=" "$RELEASE_ENV" | cut -d= -f2-
}

wait_for_color() {
  local color="$1"

  echo "Waiting for ${color} environment..."

  for attempt in {1..30}; do
    if "${COMPOSE[@]}" exec -T \
      "frontend-${color}" \
      wget -qO- http://127.0.0.1/health >/dev/null 2>&1; then

      echo "${color} environment is healthy."
      return 0
    fi

    echo "Health check ${attempt}/30..."
    sleep 2
  done

  echo "${color} environment failed health checks."

  "${COMPOSE[@]}" logs \
    --tail=100 \
    "backend-${color}" \
    "frontend-${color}"

  return 1
}

switch_traffic() {
  local color="$1"

  echo "Switching traffic to ${color}..."

  cat "$NGINX_DIR/${color}.conf" > "$NGINX_DIR/active.conf"

  "${COMPOSE[@]}" up -d gateway

  "${COMPOSE[@]}" exec -T gateway nginx -t
  "${COMPOSE[@]}" exec -T gateway nginx -s reload
}

check_public_health() {
  for attempt in {1..15}; do
    if curl \
      --fail \
      --silent \
      --show-error \
      http://localhost/health >/dev/null; then

      echo "Public health check passed."
      return 0
    fi

    sleep 2
  done

  return 1
}

bootstrap() {
  local tag="$1"

  echo "Performing initial blue-green bootstrap..."

  mkdir -p "$NGINX_DIR"

  cat > "$RELEASE_ENV" <<EOF
BLUE_IMAGE_TAG=${tag}
GREEN_IMAGE_TAG=${tag}
EOF

  echo "Starting BLUE environment..."

  "${COMPOSE[@]}" pull postgres backend-blue frontend-blue

  "${COMPOSE[@]}" up -d \
    postgres \
    backend-blue \
    frontend-blue

  wait_for_color blue

  #
  # Remove old single-environment frontend/backend.
  # PostgreSQL data volume is preserved.
  #
  if [[ -f compose.prod.yaml ]]; then
    echo "Stopping previous single-environment application..."

    docker compose \
      --env-file "$PROD_ENV" \
      -f compose.prod.yaml \
      stop frontend backend || true

    docker compose \
      --env-file "$PROD_ENV" \
      -f compose.prod.yaml \
      rm -f frontend backend || true
  fi

  switch_traffic blue

  if ! check_public_health; then
    echo "Bootstrap failed: public health check failed."
    exit 1
  fi

  echo "blue" > "$ACTIVE_FILE"
  rm -f "$PREVIOUS_FILE"

  echo
  echo "Blue-green bootstrap complete."
  echo "Active environment: BLUE"
}

deploy() {
  local tag="$1"

  if [[ ! -f "$ACTIVE_FILE" ]]; then
    bootstrap "$tag"
    return
  fi

  local active
  local target

  active="$(cat "$ACTIVE_FILE")"
  target="$(other_color "$active")"

  echo "Current environment: ${active}"
  echo "Deployment target:   ${target}"
  echo "Image tag:           ${tag}"

  set_release_tag "$target" "$tag"

  echo "Pulling ${target} images..."

  "${COMPOSE[@]}" pull \
    "backend-${target}" \
    "frontend-${target}"

  echo "Starting ${target} environment..."

  "${COMPOSE[@]}" up \
    -d \
    --force-recreate \
    "backend-${target}" \
    "frontend-${target}"

  #
  # Traffic still goes to the old environment here.
  #
  wait_for_color "$target"

  #
  # Only after the new environment is healthy
  # do we switch user traffic.
  #
  switch_traffic "$target"

  if ! check_public_health; then
    echo "New environment failed after traffic switch."
    echo "Rolling traffic back to ${active}..."

    switch_traffic "$active"

    if check_public_health; then
      echo "Rollback successful."
    else
      echo "WARNING: rollback health check also failed."
    fi

    exit 1
  fi

  echo "$active" > "$PREVIOUS_FILE"
  echo "$target" > "$ACTIVE_FILE"

  echo
  echo "Deployment successful."
  echo "Active environment:   ${target}"
  echo "Previous environment: ${active}"
}

rollback() {
  if [[ ! -f "$ACTIVE_FILE" || ! -f "$PREVIOUS_FILE" ]]; then
    echo "No previous release available for rollback."
    exit 1
  fi

  local active
  local previous

  active="$(cat "$ACTIVE_FILE")"
  previous="$(cat "$PREVIOUS_FILE")"

  echo "Active environment:   ${active}"
  echo "Rollback environment: ${previous}"

  wait_for_color "$previous"

  switch_traffic "$previous"

  if ! check_public_health; then
    echo "Rollback failed. Restoring traffic to ${active}..."
    switch_traffic "$active"
    exit 1
  fi

  echo "$active" > "$PREVIOUS_FILE"
  echo "$previous" > "$ACTIVE_FILE"

  echo
  echo "Rollback successful."
  echo "Active environment: ${previous}"
}

status() {
  echo

  if [[ -f "$ACTIVE_FILE" ]]; then
    echo "Active environment: $(cat "$ACTIVE_FILE")"
  else
    echo "Active environment: not initialized"
  fi

  if [[ -f "$PREVIOUS_FILE" ]]; then
    echo "Previous environment: $(cat "$PREVIOUS_FILE")"
  else
    echo "Previous environment: none"
  fi

  echo

  if [[ -f "$RELEASE_ENV" ]]; then
    cat "$RELEASE_ENV"
  fi

  echo
  "${COMPOSE[@]}" ps
}

COMMAND="${1:-}"

case "$COMMAND" in
  deploy)
    [[ $# -eq 2 ]] || {
      usage
      exit 1
    }

    deploy "$2"
    ;;

  rollback)
    rollback
    ;;

  status)
    status
    ;;

  *)
    usage
    exit 1
    ;;
esac
