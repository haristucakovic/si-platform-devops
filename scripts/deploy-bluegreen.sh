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
  case "$1" in
    blue)
      echo "green"
      ;;
    green)
      echo "blue"
      ;;
    *)
      echo "Invalid deployment color: $1" >&2
      return 1
      ;;
  esac
}

set_release_tag() {
  local component="$1"
  local tag="$2"

  local variable
  variable="$(echo "$component" | tr '[:lower:]' '[:upper:]')_IMAGE_TAG"

  if grep -q "^${variable}=" "$RELEASE_ENV"; then
    sed -i "s/^${variable}=.*/${variable}=${tag}/" "$RELEASE_ENV"
  else
    echo "${variable}=${tag}" >> "$RELEASE_ENV"
  fi
}

get_release_tag() {
  local component="$1"

  local variable
  variable="$(echo "$component" | tr '[:lower:]' '[:upper:]')_IMAGE_TAG"

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

wait_for_worker() {
  echo "Waiting for background worker..."

  for attempt in {1..15}; do
    local container_id
    container_id="$("${COMPOSE[@]}" ps -q worker 2>/dev/null || true)"

    if [[ -n "$container_id" ]]; then
      local running
      running="$(
        docker inspect \
          -f '{{.State.Running}}' \
          "$container_id" \
          2>/dev/null || true
      )"

      if [[ "$running" == "true" ]]; then
        echo "Background worker is running."
        return 0
      fi
    fi

    echo "Worker check ${attempt}/15..."
    sleep 2
  done

  echo "Background worker failed to start."

  "${COMPOSE[@]}" logs \
    --tail=100 \
    worker || true

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
  echo "Checking public application health..."

  for attempt in {1..15}; do
    if curl \
      --fail \
      --silent \
      --show-error \
      http://localhost/health >/dev/null; then

      echo "Public health check passed."
      return 0
    fi

    echo "Public health check ${attempt}/15..."
    sleep 2
  done

  echo "Public health check failed."
  return 1
}

update_worker() {
  local tag="$1"

  echo "Updating background worker to ${tag}..."

  set_release_tag worker "$tag"

  if ! "${COMPOSE[@]}" pull worker; then
    echo "Failed to pull worker image."
    return 1
  fi

  if ! "${COMPOSE[@]}" up -d --force-recreate worker; then
    echo "Failed to start worker."
    return 1
  fi

  wait_for_worker
}

bootstrap() {
  local tag="$1"

  echo "Performing initial blue-green bootstrap..."

  mkdir -p "$NGINX_DIR"

  cat > "$RELEASE_ENV" <<EOF
BLUE_IMAGE_TAG=${tag}
GREEN_IMAGE_TAG=${tag}
WORKER_IMAGE_TAG=${tag}
EOF

  echo "Starting BLUE environment..."

  "${COMPOSE[@]}" pull \
    postgres \
    backend-blue \
    frontend-blue \
    worker

  "${COMPOSE[@]}" up -d \
    postgres \
    backend-blue \
    frontend-blue

  wait_for_color blue

  #
  # The old application remains live until BLUE has passed
  # its health check.
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

  #
  # Web traffic is now safely running on BLUE.
  #
  echo "blue" > "$ACTIVE_FILE"
  rm -f "$PREVIOUS_FILE"

  #
  # Start the single background worker only after the old
  # backend has been stopped.
  #
  if ! update_worker "$tag"; then
    echo "BLUE is live, but the background worker failed to start."
    exit 1
  fi

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
  local active_tag

  active="$(cat "$ACTIVE_FILE")"
  target="$(other_color "$active")"
  active_tag="$(get_release_tag "$active")"

  echo "Current environment: ${active}"
  echo "Deployment target:   ${target}"
  echo "Image tag:           ${tag}"

  #
  # The inactive slot is about to be overwritten, so the
  # previously stored rollback target is no longer guaranteed
  # to exist.
  #
  rm -f "$PREVIOUS_FILE"

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
  # Users are still using the old environment here.
  #
  if ! wait_for_color "$target"; then
    echo
    echo "Deployment aborted."
    echo "Traffic remains on ${active}."
    exit 1
  fi

  #
  # The new release passed its internal health check.
  #
  switch_traffic "$target"

  if ! check_public_health; then
    echo "New environment failed after traffic switch."
    echo "Returning traffic to ${active}..."

    switch_traffic "$active"

    if check_public_health; then
      echo "Traffic successfully restored to ${active}."
    else
      echo "WARNING: health check also failed after restoring traffic."
    fi

    exit 1
  fi

  #
  # Only update the background worker after the web application
  # has successfully received production traffic.
  #
  if ! update_worker "$tag"; then
    echo "Worker update failed."
    echo "Returning traffic to ${active}..."

    switch_traffic "$active"

    if ! check_public_health; then
      echo "WARNING: old environment failed its health check."
    fi

    echo "Restoring worker to ${active_tag}..."

    if ! update_worker "$active_tag"; then
      echo "WARNING: failed to restore previous worker."
    fi

    exit 1
  fi

  #
  # Deployment is now fully successful.
  #
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
  local active_tag
  local previous_tag

  active="$(cat "$ACTIVE_FILE")"
  previous="$(cat "$PREVIOUS_FILE")"

  active_tag="$(get_release_tag "$active")"
  previous_tag="$(get_release_tag "$previous")"

  echo "Active environment:   ${active}"
  echo "Rollback environment: ${previous}"
  echo "Rollback image tag:   ${previous_tag}"

  if ! wait_for_color "$previous"; then
    echo "Rollback environment is not healthy."
    echo "Traffic remains on ${active}."
    exit 1
  fi

  switch_traffic "$previous"

  if ! check_public_health; then
    echo "Rollback failed."
    echo "Restoring traffic to ${active}..."

    switch_traffic "$active"
    exit 1
  fi

  #
  # Keep the worker on the same release as the web application.
  #
  if ! update_worker "$previous_tag"; then
    echo "Worker rollback failed."
    echo "Restoring traffic to ${active}..."

    switch_traffic "$active"

    if ! check_public_health; then
      echo "WARNING: active environment failed its health check."
    fi

    echo "Restoring worker to ${active_tag}..."

    if ! update_worker "$active_tag"; then
      echo "WARNING: failed to restore active worker."
    fi

    exit 1
  fi

  echo "$active" > "$PREVIOUS_FILE"
  echo "$previous" > "$ACTIVE_FILE"

  echo
  echo "Rollback successful."
  echo "Active environment:   ${previous}"
  echo "Previous environment: ${active}"
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
    echo "Release tags:"
    cat "$RELEASE_ENV"

    echo
    "${COMPOSE[@]}" ps
  else
    echo "Release environment has not been initialized."
  fi
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
    [[ $# -eq 1 ]] || {
      usage
      exit 1
    }

    rollback
    ;;

  status)
    [[ $# -eq 1 ]] || {
      usage
      exit 1
    }

    status
    ;;

  *)
    usage
    exit 1
    ;;
esac
