#!/bin/bash
# PremiumVault dev startup script

cd "$(dirname "$0")"

echo "Starting PostgreSQL..."
docker compose up -d

echo "Starting Next.js dev server..."
npx next dev --port 3000 --hostname 0.0.0.0 &

echo "Starting Stripe webhook listener..."
stripe listen --forward-to localhost:3000/api/webhooks/stripe &

echo "Starting Tailscale Funnel (public HTTPS)..."
sudo tailscale funnel --bg 3000

echo "All services started. App running at http://localhost:3000"
echo "Public URL: https://desktop-35mtkeg.tailaf7658.ts.net"
