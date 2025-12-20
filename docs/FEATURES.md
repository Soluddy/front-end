# Front-End Features

The Soluddy front-end delivers the following capabilities:

* Campaign discovery at `/explore`, including featured placements, search, category filters, and pagination.
* Detailed campaign pages at `/[slug]` with donation controls, owner actions, moderation messaging, and on-chain data validation.
* A donation flow that validates balances, confirms owner lists, and pauses when configuration issues are detected.
* An embed experience at `/embed/[slug]` for iframe integrations, with query parameters for color and radius adjustments.
* Runtime moderation through the `NEXT_PUBLIC_FEATURED_SLUGS` environment variable and the banned slug catalog in `src/config/banned-slugs.json`.
* Client-side validation that ensures vault PDAs resolve correctly before enabling donations.
* Exposure of PDAs, owner wallets, and transaction signatures to support compliance and audit requirements.
* A TypeScript 5 codebase with React 19 and Solana wallet adapters for Phantom, Solflare, and WalletConnect.
* Tailwind CSS 4 styling with Squircle utilities for consistent rounded shapes.
* API routes such as `/api/vault/[slug]` and `/api/vaults/all` that support integration testing, plus `npm run lint` for code quality enforcement.
