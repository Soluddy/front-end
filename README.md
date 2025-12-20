# Soluddy Front-End

This App Router project is the public web client for Soluddy. It renders public discovery, owner tooling, and the embeddable donation widget against the Soluddy Vault program and related APIs.

## Snapshot

* Built on Next.js 15 with React 19, TypeScript, and Tailwind CSS.
* Runtime settings come from `.env.local` (`NEXT_PUBLIC_*` variables) plus `src/config/banned-slugs.json`.
* Solana wallet integrations rely on the Solana Wallet Adapter stack.
* `/embed/[slug]` serves the iframe widget consumed by partner sites.

## Prerequisites

* Node.js 18.18 LTS or later (Node.js 20 LTS recommended).
* npm 9 or later.
* Access to a Solana devnet RPC endpoint for local development.
* Program IDs, PDAs, and fee settings from the Soluddy backend.

## Quick Start

1. `cd front-end` inside the monorepo checkout.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and set the required values (see [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)).
4. Launch the dev server:
   ```bash
   npm run dev
   ```
5. Visit <http://localhost:3000> and connect a Solana devnet wallet.

> \[!NOTE]
> The runtime configuration is read synchronously at boot. Restart the dev server (or rebuild) after editing `.env.local`.

## Key Configuration Files

| File                                 | Purpose                                                                             |
|--------------------------------------|-------------------------------------------------------------------------------------|
| `.env.local`                         | Stores public runtime settings (RPC endpoint, base URL, config PDA, feature flags). |
| `src/config/banned-slugs.json`       | Moderation list that hides campaigns from search, embeds, and sitemaps.             |
| `src/config/categories.ts`           | Defines the campaign category taxonomy and helper utilities.                        |
| `src/app/embed/[slug]/colorUtils.ts` | Sanitises color and radius query parameters for the embed widget.                   |

## NPM Scripts

| Script          | Description                                             |
|-----------------|---------------------------------------------------------|
| `npm run dev`   | Starts the Next.js development server with hot reload.  |
| `npm run build` | Creates an optimized production build.                  |
| `npm run start` | Serves the production build. Run `npm run build` first. |
| `npm run lint`  | Runs ESLint using the Next.js configuration.            |

## Deployment Checklist

1. Confirm the Soluddy Vault program is deployed and configured for the target cluster.
2. Refresh `.env.local` with the correct RPC URL, config PDA, GA measurement ID, and slug lists.
3. Run `npm run build` to generate the production output.
4. Deploy the `.next` artifacts to the approved hosting surface (for example, Vercel or Cloud Run).
5. Smoke test `/`, `/explore`, `/[slug]`, and `/embed/[slug]` to validate runtime wiring.

## Docs

* [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) (Frontend release workflow and hosting notes)
* [docs/EMBED.md](docs/EMBED.md) (Embed widget contract and customization options)
* [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) (Runtime configuration schema and examples)
* [docs/FEATURES.md](docs/FEATURES.md) (Feature inventory and UX flags)

## License

The Soluddy Front-End is distributed under the MIT License. See `LICENSE` for the full terms.
