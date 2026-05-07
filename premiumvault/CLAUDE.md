@AGENTS.md

## Running the app

When the user says "run it" or "start the app", execute `dev-start.sh`:

```bash
bash /home/aleksander/scrap/premiumvault/dev-start.sh
```

This script:
1. Starts PostgreSQL via Docker (`docker compose up -d`)
2. Starts Next.js dev server on port 3000
3. Starts the Stripe CLI webhook listener (forwards to localhost:3000/api/webhooks/stripe)

App runs at http://100.64.132.90:3000 (Tailscale IP). Admin at http://100.64.132.90:3000/admin.

## Changing the app URL
When moving to production or a new IP, update these two values in `.env`:
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
Both must have no trailing slash on `NEXT_PUBLIC_APP_URL`.

If any service is already running (e.g. Docker is up, or dev server is already on port 3000), skip that step and only start what's missing. Check with `docker ps` and `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` and `pgrep stripe` before starting each service.
