# Laravel delivery templates (v2)

The next iteration of the production pipelines I run for Laravel services.
**Status: draft, not yet in production.** The plan is to prove it in my
homelab (roadmap P06 + P11) before moving a real service onto it.

Two deploy targets share one CI workflow:

| File | Purpose |
|---|---|
| `.github/workflows/ci.yml` | Quality gates, dependency audit, asset build, tests against PostgreSQL. Reusable; optionally packages a release tarball. |
| `.github/workflows/deploy-vps.yml` | Plain VPS (PHP-FPM + Supervisor): release directories, atomic `current` switch, automatic rollback on failed health check. |
| `deploy/remote-deploy.sh` | Server-side half of the VPS deploy (`deploy` / `rollback`). |
| `.github/workflows/deploy-docker.yml` | Containerized: build once, Trivy scan, push to GHCR by commit SHA, deploy that exact tag, roll back to the previous tag. |
| `Dockerfile` | Multi-stage: Composer deps → Vite assets → PHP-FPM `app` target + unprivileged nginx `web` target. |
| `compose.production.yml` | app, worker (queue or Horizon), scheduler, web, redis — with healthchecks, memory limits, log rotation. |
| `deploy/docker-deploy.sh` | Server-side half of the Docker deploy (`deploy` / `rollback`). |

## What changed from v1, and why

| v1 behaviour | Problem | v2 |
|---|---|---|
| Operator types `DEPLOY` into a workflow input | Anyone who can run workflows can type it; it's a speed bump, not an approval | GitHub Environment `production` with required reviewers; deploy secrets are environment-scoped |
| Build and deploy in one job; some pipelines skip tests | Production can receive untested code | `ci.yml` runs on every PR and gates the deploy; only its artifact ships |
| Tests on in-memory SQLite | Engine differences hide bugs | PostgreSQL service container |
| Extract tarball over the live directory | Half-updated app during deploy; no clean rollback | New `releases/<id>/` directory, `current` symlink switched with an atomic rename |
| Many steps end in `\|\| true` | Real failures are silently ignored | `set -Eeuo pipefail`; failures stop the deploy |
| Failed health check fails the job, broken release stays live | Outage until someone intervenes | Failed check triggers automatic rollback |
| `ssh-keyscan` on every run | Trusts whatever host answers | Host key pinned in `DEPLOY_KNOWN_HOSTS` |
| Backup of `vendor/` + `public/build` only | Not a full rollback target | Last 5 full releases kept |
| Permissions fixed with broad `chmod`/`chown` + `sudo rm` | Permission drift reappears; wide sudo | Shared `storage/` + `.env`, permissions set per release; sudo only for `systemctl reload php-fpm` |

## One-time setup

### GitHub

1. Settings → Environments → `production`: add required reviewers, restrict to `main` if appropriate.
2. Environment secrets: `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS` (output of `ssh-keyscan -H <host>`, checked once by hand), `DEPLOY_HOST`, `DEPLOY_USER`.
3. Environment variables: `PRODUCTION_URL`, and either `APP_ROOT` (VPS) or `STACK_DIR` (Docker). Optional: `DEPLOY_PORT`, `FPM_SERVICE`, `WORKERS`.
4. Pin third-party actions to full commit SHAs before using this on a real service.

### VPS target

```
$APP_ROOT/shared/.env        # production environment
$APP_ROOT/shared/storage/    # created on first deploy
```

- nginx: `root $APP_ROOT/current/public;` and `fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;`
- Supervisor: `command=php $APP_ROOT/current/artisan horizon` (or `queue:work`)
- sudoers: `deploy ALL=(root) NOPASSWD: /usr/bin/systemctl reload php8.4-fpm`

### Docker target

```
$STACK_DIR/deploy.env    # APP_IMAGE=ghcr.io/<owner>/<repo>/app
                         # WEB_IMAGE=ghcr.io/<owner>/<repo>/web
                         # APP_TAG=<current tag>
                         # WORKER_COMMAND="php artisan horizon"   (optional)
$STACK_DIR/laravel.env   # Laravel environment (APP_KEY, DB_*, REDIS_HOST=redis, ...)
```

- `docker login ghcr.io` once on the host with a read-only (`read:packages`) token.
- A host reverse proxy (Caddy/nginx) terminates TLS and forwards to `127.0.0.1:8080`.

## Known limits

- Rollback restores code, not the database. Migrations must be backward compatible
  with the previous release (expand → migrate → contract across two deploys).
- Single host: this is safer deploys, not high availability.
- `pm.max_children` and container memory limits are placeholders; size them from
  observed worker memory in Grafana.
