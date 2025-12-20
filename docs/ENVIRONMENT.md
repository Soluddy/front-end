# Environment Configuration

The Soluddy front-end reads runtime settings from `.env.local` (all `NEXT_PUBLIC_*` variables) and the banned slug catalog in `src/config/banned-slugs.json`. Update these assets to change cluster endpoints, featured campaigns, analytics IDs, or moderation rules. Restart the dev server or rebuild production artifacts after editing them.

## Update Steps

1. Copy `.env.local.example` to `.env.local` if you have not already.
2. Fill in each environment variable. All values must be plain strings (no quotes needed).
3. If you need to moderate campaigns, edit `src/config/banned-slugs.json` and add lowercase slugs.
4. Restart the development server (`npm run dev`) or rebuild the production bundle (`npm run build`).
5. Verify changes on the relevant pages (for example, `/explore` for featured slugs).

## Sample `.env.local`

```bash
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_APP_BASE_URL=https://soluddy.com
NEXT_PUBLIC_FEATURED_SLUGS=soluddy
NEXT_PUBLIC_REPORT_EMAIL=support@soluddy.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXX
```

## Current Devnet Values

* Program ID: `EiiFy4VHSHHA7iMV4x8zsuXi6Bsiqx3QzfmoRdPXpmRs` (see `front-end/src/config/program.ts`)
* Config PDA (hardcoded): `HCJDvoVrye24txi3hex5V4UMSaNVDd7wKP5VogDLkhsC`

## Environment Variable Reference

| Variable                        | Description                                                                                       |
|---------------------------------|---------------------------------------------------------------------------------------------------|
| `NEXT_PUBLIC_RPC_URL`           | Solana RPC endpoint used by the application (devnet or mainnet).                                  |
| `NEXT_PUBLIC_APP_BASE_URL`      | Base URL used when generating public campaign links and embed URLs.                               |
| `NEXT_PUBLIC_FEATURED_SLUGS`    | Comma-separated list of campaign slugs highlighted on the Explore page.                           |
| `NEXT_PUBLIC_REPORT_EMAIL`      | Email address used by “Report this campaign” links.                                               |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID (omit or leave blank to disable tracking).                      |

### Banned Slug Catalog

The moderation list lives in `src/config/banned-slugs.json`:

```json
[
  "unicef",
  "kizilay",
  "world-food-programme"
]
```

Keep all entries lowercase and hyphenated so they match normalized slugs.

## Validation Checklist

* Confirm `.env.local` is present and contains the required variables.
* Ensure `NEXT_PUBLIC_RPC_URL` matches the cluster served by the backend program.
* Maintain the banned slug list in `src/config/banned-slugs.json` and keep it in sync with moderation decisions.
* Use a monitored inbox for `NEXT_PUBLIC_REPORT_EMAIL` so user reports receive attention.
