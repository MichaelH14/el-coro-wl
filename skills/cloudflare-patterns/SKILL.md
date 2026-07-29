---
name: cloudflare-patterns
description: Use when configuring Cloudflare Tunnels, DNS, Workers, Pages, or caching. Trigger whenever Cloudflare setup or tunnel management is needed
---

# Cloudflare Patterns

Cloudflare integration for tunnels, DNS, and edge services. REMOTE API only for tunnel config.

## Preconditions

- Cloudflare account with domain(s) configured
- cloudflared installed on VPS
- API token with appropriate permissions
- Tunnel created and authenticated

## Steps

### 1. Tunnel Configuration (REMOTE ONLY)

CRITICAL: VPS uses Cloudflare Tunnel configured via REMOTE dashboard/API. NEVER edit local config.yml.

Configure routes via Cloudflare API or dashboard:
```bash
# List existing tunnels
cloudflared tunnel list

# Route traffic (via dashboard or API, NOT local config)
# Dashboard: Zero Trust > Access > Tunnels > Configure
```

Why remote only:
- Local config.yml gets overwritten by remote config
- Remote config is the source of truth
- Avoids sync conflicts between local and remote

(See feedback-cloudflare-tunnel-deploy)

### 2. DNS Management

- Use Cloudflare as DNS provider for all domains
- Proxy (orange cloud) enabled for web traffic
- DNS-only (grey cloud) for non-HTTP services (SSH, SMTP)
- TTL: "Auto" for proxied records, 300s for DNS-only

Adding records via API:
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"CNAME","name":"subdomain","content":"tunnel-id.cfargotunnel.com","proxied":true}'
```

### 3. Caching

Cache rules for static assets:
- Images, CSS, JS: cache 1 month (`Cache-Control: public, max-age=2592000`)
- HTML: no cache or short TTL (5 minutes)
- API responses: no cache (`Cache-Control: no-store`)

Use Page Rules or Cache Rules in dashboard for per-path control.
Purge cache after deploy: `curl -X POST .../purge_cache` with API token.

### 4. Workers (Edge Functions)

Use for:
- Redirects and rewrites
- A/B test routing
- Geo-based content
- Request/response transformation

Keep Workers simple (< 100 lines). Heavy logic stays on origin server.

### 5. Pages (Static Sites)

For static frontends:
- Connect GitHub repo to Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist` or `out`
- Environment variables configured in Pages dashboard
- Preview deployments on every PR

## Verification / Exit Criteria

- Tunnel configured via remote API/dashboard (no local config.yml edits)
- DNS records proxied where appropriate
- Cache rules set per content type
- API endpoints explicitly excluded from caching
- Cache purged after every deploy
- Workers kept minimal, complex logic on origin
