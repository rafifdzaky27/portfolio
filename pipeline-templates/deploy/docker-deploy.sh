#!/usr/bin/env bash
# Image-based release on a single Docker host.
#
#   docker-deploy.sh deploy <tag>
#   docker-deploy.sh rollback
#
# $STACK_DIR holds compose.production.yml, laravel.env and deploy.env.
# deploy.env pins APP_IMAGE / WEB_IMAGE / APP_TAG, so `docker compose up`
# is always reproducible from what is on disk.
set -Eeuo pipefail

STACK_DIR=${STACK_DIR:?STACK_DIR is required}
cd "$STACK_DIR"

COMPOSE=(docker compose -f compose.production.yml --env-file deploy.env)
log() { printf '▶ %s\n' "$*"; }
die() { printf '✖ %s\n' "$*" >&2; exit 1; }

[ -f deploy.env ] || die "missing $STACK_DIR/deploy.env"
[ -f laravel.env ] || die "missing $STACK_DIR/laravel.env"

current_tag() { sed -n 's/^APP_TAG=//p' deploy.env; }

set_tag() {
  if grep -q '^APP_TAG=' deploy.env; then
    sed -i "s/^APP_TAG=.*/APP_TAG=$1/" deploy.env
  else
    printf 'APP_TAG=%s\n' "$1" >> deploy.env
  fi
}

up() {
  # --wait blocks until every service with a healthcheck reports healthy.
  "${COMPOSE[@]}" up -d --remove-orphans --wait --wait-timeout 120
}

deploy() {
  local tag=${1:?tag required}
  local previous
  previous=$(current_tag)

  set_tag "$tag"
  log "pulling $tag"
  "${COMPOSE[@]}" pull --quiet app web

  log "running migrations with the new image"
  "${COMPOSE[@]}" run --rm --no-deps -e SKIP_OPTIMIZE=1 app php artisan migrate --force

  log "starting $tag"
  if ! up; then
    log "services did not become healthy; restoring $previous"
    [ -n "$previous" ] && set_tag "$previous" && up
    die "deploy of $tag failed"
  fi

  [ -n "$previous" ] && printf '%s\n' "$previous" > .previous_tag
  docker image prune -f --filter "until=168h" >/dev/null
  log "$tag is live"
}

rollback() {
  [ -f .previous_tag ] || die "no previous tag recorded"
  local previous
  previous=$(cat .previous_tag)
  log "rolling back to $previous"
  set_tag "$previous"
  up
  log "rolled back (database migrations were not reverted)"
}

case "${1:-}" in
  deploy) shift; deploy "$@" ;;
  rollback) rollback ;;
  *) die "usage: $0 deploy <tag> | rollback" ;;
esac
