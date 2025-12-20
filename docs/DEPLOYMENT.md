# Deployment Guide

This guide explains how to deploy the Soluddy front-end to devnet for validation and to mainnet for production. Complete each set of steps in order and confirm the Soluddy backend program is available on the target cluster.

## Prerequisites

* Access to the Soluddy backend repository and toolchain.
* Solana CLI configured with the wallet that should sign transactions on the target cluster.
* Updated values for `.env.local`, including RPC URL, config PDA, featured slugs, and the support email address.
* Hosting platform that serves the Next.js `.next` production output.

## Deploy to Devnet

1. Deploy or update the backend program on devnet. Run the backend initialization script to create the config PDA and a test vault.
2. Update `.env.local` with the devnet RPC URL, config PDA, featured slugs, and report email.
3. Verify the application locally:
   ```bash
   npm run dev
   ```
4. After local validation succeeds, build the production bundle:
   ```bash
   npm run build
   ```
5. Publish the `.next` directory to your hosting platform and include the environment variables in the hosting configuration.
6. Smoke test `/`, `/explore`, `/[slug]` for a known devnet campaign, and `/embed/[slug]` in the hosted environment.

## Deploy to Mainnet

1. Deploy the backend program to mainnet-beta and initialize configuration:
   ```bash
   ANCHOR_PROVIDER_URL=https://api.mainnet-beta.solana.com \
   ANCHOR_WALLET=~/.config/solana/id.json \
   yarn initialize:config
   ```
2. Create the production vault:
   ```bash
   VAULT_SLUG=soluddy \
   VAULT_NAME="Soluddy" \
   VAULT_URL="https://soluddy.com" \
   VAULT_DESCRIPTION="Describe the campaign" \
   VAULT_OWNERS="Owner1Pubkey,Owner2Pubkey" \
   VAULT_THRESHOLD=1 \
   yarn create:vault
   ```
3. Replace devnet values in `.env.local` (or your hosting environment variables) with the mainnet RPC URL, config PDA, featured slugs, and support email address.
4. Build and serve the production bundle:
   ```bash
   npm run build
   npm run start
   ```
   Use the host-specific deployment workflow to publish the application.
5. Validate `/explore`, `/embed/[slug]`, and campaign detail pages against mainnet data. Perform a low-value donation to confirm routing.

## After Deployment

* Monitor logs for RPC errors or wallet adapter warnings.
* Confirm featured campaigns appear as expected.
* Verify external sites can load the embed without mixed-content issues.
* Update runbooks or change logs with deployment details.
