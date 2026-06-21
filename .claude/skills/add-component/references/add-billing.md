# Add a billing page

A polished, provider-agnostic billing screen: a current-plan card with usage
meters, a plan picker (`PlanCard` per tier with a feature list and a
current/switch CTA), a payment-method row, and an invoices table. The page and
its two factored components (`PlanCard`, `UsageMeter`) are **bundled** under
`templates/` — copy, don't paste.

## Add it

```bash
cp .claude/skills/add-component/templates/PlanCard.tsx src/components/billing/PlanCard.tsx
cp .claude/skills/add-component/templates/UsageMeter.tsx src/components/billing/UsageMeter.tsx
cp .claude/skills/add-component/templates/billing.tsx src/routes/_app/billing.tsx
```

In this substrate repo the demo lives at `src/routes/_app/gallery/billing.tsx`; in
a scaffolded product copy it to a real route under `src/routes/_app/` and add a
sidebar entry.

Then in the copied page:
1. Set the `createFileRoute("/_app/...")` path to match the file path.
2. Replace the `PLANS`, usage figures, payment method, and `INVOICES` constants
   with your real values. `PlanCard` and `UsageMeter` take fully-formed props.

## Make it live with Stripe (keep this layout)

The mock data is the only thing that changes — the layout stays. Back it with a
few server fns (all `requireUser()` first):

1. **Checkout / upgrade** — a `createServerFn` that creates a Stripe Checkout
   Session (or a Subscription update) for the chosen `priceId` and returns its
   URL; the plan-picker CTA calls it and redirects. (See the `stripe`
   plugin's `stripe-best-practices` skill.)
2. **Manage subscription / payment method** — a server fn that creates a Billing
   Portal session and returns its URL; the "Manage subscription" / "Update
   payment method" buttons redirect there.
3. **Current plan + invoices** — read the customer's subscription and invoices
   from Stripe in a `list*`/`get*` server fn (behind a `Repository` if you want
   it swappable) and feed them in instead of the constants.
4. **Status** — handle Stripe webhooks (`checkout.session.completed`,
   `customer.subscription.updated`, `invoice.paid`) in an
   `api/stripe/webhook.ts` route to persist plan/invoice status; the page just
   reflects it.

Never put the Stripe secret key in a client-reachable module — keep it in server
fns / API routes only, like the data adapters.

(Only open a template if you need to customise it — copying it costs no context.)

## Foundation it assumes

`@/components/ui/{button,card,table}`, `@/infra/ui` (`StatusChip`), `@/lib/toast`,
`@phosphor-icons/react`, `cn`, and theme tokens — all in the base.

## Invariants

- Presentational components (`PlanCard`, `UsageMeter`) take fully-formed props —
  no fetching. Theme tokens + `StatusChip` colours only; no hardcoded colours.
- The active plan's CTA is disabled ("Current plan"); others upgrade/switch.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — switch plans and
confirm the current-plan CTA and toast update.
