#!/bin/sh
# Laravel's config cache captures environment variables, so it has to be built
# when the container starts (with the runtime env), not when the image is built.
set -e

if [ "${APP_ENV:-production}" = "production" ] && [ "${SKIP_OPTIMIZE:-0}" != "1" ]; then
  php artisan optimize --no-interaction >/dev/null
fi

exec "$@"
