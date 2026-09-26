# Security notes

How this site is deployed and hardened. This repository is **public**, so this
file deliberately contains no addresses, hostnames or account details.

```
visitor ──HTTPS──▶ Cloudflare edge ──Cloudflare Tunnel──▶ cloudflared ──HTTP, localhost──▶ Caddy ──▶ /…/current (static files)
GitHub Actions ──Tailscale (tag:ci)──▶ deploy host :22 (deploy user) ──rsync──▶ /…/releases/<id>
```

The site is fully static: no server code, no database, no forms, no cookies.
The realistic risks are **(1)** someone abusing the deploy path to reach the
home network, and **(2)** misconfiguration exposing other homelab services.
The web page itself has very little attack surface.

## In this repo

| Control | Where |
|---|---|
| Content-Security-Policy on every page: scripts limited to same-origin + SHA-256 of each inline script, no `eval`, no plugins, no foreign scripts | `scripts/csp.mjs` (runs in `npm run build`) |
| Deploy host / user / path kept in **secrets**, so they're masked in public Actions logs | `.github/workflows/deploy.yml` |
| Third-party actions pinned to commit SHAs (they handle the SSH key and Tailscale secret) | `deploy.yml` |
| Secrets passed through `env:`, not spliced into shell source | `deploy.yml` |
| Deploy key deleted at the end of every run | `deploy.yml` |
| Post-deploy check that security headers and CSP are present | `deploy.yml` |
| Workflow token is read-only; no `pull_request_target`, so forks never see secrets | `deploy.yml` |

### Required repository secrets

`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_ROOT`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`,
`TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET`.

## Caddy (reference config)

```caddyfile
{
	admin localhost:2019
	# TLS is terminated at Cloudflare; the tunnel reaches Caddy over plain HTTP
	# on localhost. Without this Caddy opens :80/:443 on every interface and
	# keeps trying (and failing) to get certificates.
	auto_https off
}

http://rafifdzaky.com:8081, http://www.rafifdzaky.com:8081 {
	bind 127.0.0.1 ::1

	@www host www.rafifdzaky.com
	redir @www https://rafifdzaky.com{uri} permanent

	root * {$SITE_ROOT}/current
	encode zstd gzip
	file_server

	header {
		Strict-Transport-Security "max-age=31536000; includeSubDomains"
		X-Content-Type-Options "nosniff"
		X-Frame-Options "DENY"
		Referrer-Policy "strict-origin-when-cross-origin"
		Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
		Cross-Origin-Opener-Policy "same-origin"
		Cross-Origin-Resource-Policy "same-origin"
		-Server
	}

	@hashed path /_astro/*
	header @hashed Cache-Control "public, max-age=31536000, immutable"

	# never serve dotfiles, even if one ends up in a release by accident
	@dotfiles path */.*
	respond @dotfiles 404

	handle_errors {
		rewrite * /404.html
		file_server
	}
}
```

`SITE_ROOT` is an environment variable for the Caddy service (the same
directory as the `DEPLOY_ROOT` secret). Validate with `caddy validate --config /etc/caddy/Caddyfile`
before `systemctl reload caddy`.

## Cloudflare Tunnel (`config.yml`)

```yaml
ingress:
  - hostname: rafifdzaky.com
    service: http://localhost:8081
  - hostname: www.rafifdzaky.com
    service: http://localhost:8081
  - service: http_status:404   # everything else is refused
```

- Only the portfolio hostnames. No wildcard (`*.rafifdzaky.com`) rule, and no
  Proxmox, AdGuard, Jellyfin or SSH hostnames on this tunnel. If those ever need
  remote access, use Tailscale or put them behind **Cloudflare Access**.
- Dashboard: **SSL/TLS → Edge Certificates**: *Always Use HTTPS* on,
  *Minimum TLS Version* 1.2. **Security**: free managed WAF rules on.

## Tailscale ACL for CI

The CI runner joins the tailnet as `tag:ci`. The home LAN is advertised by a
subnet router, so without a tight rule a leaked CI credential would reach
**every device at home**. Allow exactly one host, one port:

```jsonc
"tagOwners": { "tag:ci": ["autogroup:admin"] },
"grants": [
  { "src": ["tag:ci"], "dst": ["<deploy-host>/32"], "ip": ["tcp:22"] }
]
// and no other rule that matches tag:ci
```

Use an OAuth client scoped to `tag:ci` only; its nodes are ephemeral and
disappear after the run.

## Deploy host

- `sshd`: `PasswordAuthentication no`, `PermitRootLogin no`, `KbdInteractiveAuthentication no`.
- Deploy key in `authorized_keys` with the `restrict` option (no forwarding, no PTY, no agent):
  `restrict ssh-ed25519 AAAA… github-actions-portfolio`
- The deploy user has no `sudo` and owns only the site directory. Caddy reads it
  but can't write it.
- Rotate `DEPLOY_SSH_KEY` if the repo or its Actions logs ever looked wrong.

## Quick self-check

```bash
curl -sI https://rafifdzaky.com | grep -iE 'strict-transport|x-frame|content-type-options|server'
curl -s -o /dev/null -w '%{http_code}\n' http://rafifdzaky.com/        # expect 301/308
curl -s -o /dev/null -w '%{http_code}\n' https://rafifdzaky.com/.git/HEAD   # expect 404
curl -s --tlsv1.1 --tls-max 1.1 https://rafifdzaky.com/ -o /dev/null && echo "TLS 1.1 still accepted"
```
