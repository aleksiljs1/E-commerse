# Git Workflow — PremiumVault

## Rule: Always pull before you push.

```bash
git pull origin master --rebase
# resolve any conflicts
git push origin master
```

## Branch Strategy

Everyone works on `master` directly. No feature branches — this is a fast-moving collaborative build.

## Daily Workflow

```bash
# 1. Start of session — always pull first
git pull origin master --rebase

# 2. Work on your files only (see ownership table in 00-MASTER.md)

# 3. Stage and commit often (small, frequent commits)
git add .
git commit -m "team-X: short description of what you did"

# 4. Before every push — pull first to get others' changes
git pull origin master --rebase

# 5. Push
git push origin master
```

## Conflict Prevention Rules

- **Only touch files listed under your team in 00-MASTER.md**. Never edit another team's files.
- `prisma/schema.prisma` is READ ONLY for Teams B, C, D, E. Only Team A touches it.
- If you need a change to shared files (types, schema), ping Team A.

## Commit Message Format

```
team-a: bootstrap Next.js project and Prisma schema
team-b: add Navbar and CartSheet components
team-c: add Stripe webhook handler
team-d: add purchase confirmation email template
team-e: add admin orders table with credential view
```

## File Ownership Quick Reference

| Team | Files |
|------|-------|
| A — Foundation | docker-compose.yml, middleware.ts, prisma/*, src/lib/auth.ts, src/lib/db.ts, src/types/index.ts, src/app/layout.tsx, src/app/api/auth/*, src/app/api/products/* |
| B — Store UI | src/store/cart.ts, src/lib/api.ts, src/components/store/*, src/app/(store)/layout.tsx, src/app/(store)/page.tsx, src/app/(store)/products/* |
| C — Checkout | src/lib/stripe.ts, src/lib/paypal.ts, src/app/(store)/checkout/*, src/app/api/orders/*, src/app/api/webhooks/*, src/components/store/PaymentMethodSelector.tsx, src/components/store/OrderSummary.tsx |
| D — Email | src/lib/email/*, src/app/submit-credentials/*, src/app/api/credentials/*, src/components/credentials/* |
| E — Admin | src/app/admin/*, src/app/api/admin/*, src/components/admin/* |
