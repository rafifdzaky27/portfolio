# syntax=docker/dockerfile:1.7
#
# Multi-stage image for a Laravel + Vite app.
#   target `app` — PHP-FPM, also used for queue workers and the scheduler
#   target `web` — unprivileged nginx serving public/ and proxying PHP to `app`
# One commit produces both images with the same tag.

ARG PHP_VERSION=8.4
ARG NODE_VERSION=22

# ---- Composer dependencies (no dev packages, no scripts yet) ---------------
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/tmp/cache \
    composer install --no-dev --no-interaction --no-progress --prefer-dist \
      --no-scripts --no-autoloader --ignore-platform-reqs
COPY . .
RUN composer dump-autoload --no-dev --optimize --classmap-authoritative --no-scripts

# ---- Frontend assets -------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS assets
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
# Some Vite plugins read files from vendor/ (e.g. Ziggy). If yours runs
# `php artisan ...` during the build (e.g. Wayfinder), generate those files
# before this stage and COPY them in instead.
COPY --from=vendor /app/vendor ./vendor
RUN npm run build

# ---- PHP runtime base ------------------------------------------------------
FROM php:${PHP_VERSION}-fpm-alpine AS base
COPY --from=ghcr.io/mlocati/php-extension-installer:2 /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions pdo_pgsql pdo_mysql redis intl bcmath gd zip pcntl opcache \
 && apk add --no-cache fcgi
COPY docker/php/app.ini "$PHP_INI_DIR/conf.d/zz-app.ini"
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/zz-www.conf
COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/app-entrypoint
WORKDIR /var/www/html

# ---- App (PHP-FPM / worker / scheduler) ------------------------------------
FROM base AS app
COPY --chown=www-data:www-data . .
COPY --from=vendor --chown=www-data:www-data /app/vendor ./vendor
COPY --from=assets --chown=www-data:www-data /app/public/build ./public/build
RUN php artisan package:discover --ansi \
 && mkdir -p storage/app/public storage/framework/cache storage/framework/sessions \
      storage/framework/views storage/logs bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache
USER www-data
EXPOSE 9000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD SCRIPT_NAME=/ping SCRIPT_FILENAME=/ping REQUEST_METHOD=GET \
      cgi-fcgi -bind -connect 127.0.0.1:9000 | grep -q pong || exit 1
ENTRYPOINT ["app-entrypoint"]
CMD ["php-fpm"]

# ---- Web (nginx, non-root) -------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS web
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=app /var/www/html/public /var/www/html/public
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/nginx-health >/dev/null || exit 1
