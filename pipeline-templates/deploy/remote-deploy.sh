#!/usr/bin/env bash
# Release activation for a Laravel app on a plain Linux VPS.
#
#   remote-deploy.sh deploy <release-id> <archive>
#   remote-deploy.sh rollback
#
# Layout under $APP_ROOT:
#   releases/<release-id>/   one directory per deploy
#   shared/.env              environment, never shipped in the artifact
#   shared/storage/          uploads, logs, sessions, framework cache
#   current -> releases/...  what nginx, PHP-FPM and Supervisor point at
#
# Requirements on the server:
#   - nginx `root` is $APP_ROOT/current/public and uses $realpath_root for
#     SCRIPT_FILENAME, so a PHP-FPM reload picks up the new release.
#   - Supervisor programs run `php $APP_ROOT/current/artisan ...`.
#   - The deploy user may run exactly `systemctl reload <FPM_SERVICE>` via sudo.
set -Eeuo pipefail

APP_ROOT=${APP_ROOT:?APP_ROOT is required}
PHP_BIN=${PHP_BIN:-php}
FPM_SERVICE=${FPM_SERVICE:-php8.4-fpm}
WORKERS=${WORKERS:-horizon} # horizon | queue | none
KEEP_RELEASES=${KEEP_RELEASES:-5}

RELEASES="$APP_ROOT/releases"
SHARED="$APP_ROOT/shared"
CURRENT="$APP_ROOT/current"
PREVIOUS_FILE="$APP_ROOT/.previous_release"

log() { printf '▶ %s\n' "$*"; }
die() { printf '✖ %s\n' "$*" >&2; exit 1; }

switch_to() {
  # Atomic: create the new link beside the old one, then rename over it.
  ln -sfn "$1" "$APP_ROOT/.current.tmp"
  mv -Tf "$APP_ROOT/.current.tmp" "$CURRENT"
}

reload_runtime() {
  sudo systemctl reload "$FPM_SERVICE"
  case "$WORKERS" in
    # Workers are long-running and keep old code in memory until told to stop.
    # Supervisor restarts them from `current`, i.e. the new release.
    horizon) "$PHP_BIN" "$CURRENT/artisan" horizon:terminate ;;
    queue) "$PHP_BIN" "$CURRENT/artisan" queue:restart ;;
    none) ;;
    *) die "unknown WORKERS=$WORKERS" ;;
  esac
}

rollback() {
  [ -f "$PREVIOUS_FILE" ] || die "no previous release recorded"
  local previous
  previous=$(cat "$PREVIOUS_FILE")
  [ -d "$previous" ] || die "previous release $previous no longer exists"
  log "rolling back to $(basename "$previous")"
  switch_to "$previous"
  reload_runtime
  log "rolled back (database migrations were not reverted)"
}

deploy() {
  local release_id=${1:?release id required}
  local archive=${2:?archive path required}
  local new="$RELEASES/$release_id"
  local previous=""

  [ -f "$SHARED/.env" ] || die "missing $SHARED/.env"
  [ -f "$archive" ] || die "missing archive $archive"
  [ -L "$CURRENT" ] && previous=$(readlink -f "$CURRENT")

  log "preparing shared state"
  mkdir -p "$RELEASES" \
    "$SHARED/storage/app/public" \
    "$SHARED/storage/framework/cache" \
    "$SHARED/storage/framework/sessions" \
    "$SHARED/storage/framework/views" \
    "$SHARED/storage/logs"

  log "unpacking $release_id"
  rm -rf "$new"
  mkdir -p "$new"
  tar -xzf "$archive" -C "$new" --no-same-owner

  # Permissions are set on every deploy instead of being fixed by hand later.
  rm -rf "$new/storage"
  ln -sfn "$SHARED/storage" "$new/storage"
  ln -sfn "$SHARED/.env" "$new/.env"
  mkdir -p "$new/bootstrap/cache"
  chmod -R ug+rwX "$SHARED/storage" "$new/bootstrap/cache"

  log "building caches"
  "$PHP_BIN" "$new/artisan" optimize
  "$PHP_BIN" "$new/artisan" storage:link --force >/dev/null

  # Migrations must be backward compatible with the release still serving
  # traffic (expand/contract), because a rollback does not undo them.
  log "running migrations"
  "$PHP_BIN" "$new/artisan" migrate --force

  log "switching current -> $release_id"
  [ -n "$previous" ] && printf '%s\n' "$previous" > "$PREVIOUS_FILE"
  switch_to "$new"

  # From here on, any failure puts the previous release back.
  if [ -n "$previous" ]; then
    trap 'log "activation failed, restoring previous release"; switch_to "$previous"; reload_runtime || true' ERR
  fi
  reload_runtime
  trap - ERR

  log "pruning old releases (keeping $KEEP_RELEASES)"
  find "$RELEASES" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
    | sort -rn \
    | tail -n +"$((KEEP_RELEASES + 1))" \
    | cut -d' ' -f2- \
    | while read -r old; do
        [ "$old" = "$(readlink -f "$CURRENT")" ] || [ "$old" = "$previous" ] || rm -rf "$old"
      done

  log "release $release_id is live"
}

case "${1:-}" in
  deploy) shift; deploy "$@" ;;
  rollback) rollback ;;
  *) die "usage: $0 deploy <release-id> <archive> | rollback" ;;
esac
