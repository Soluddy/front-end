'use client';

import dynamic from "next/dynamic";

const FALLBACK = (
    <span className="inline-flex h-[42px] items-center rounded-full border-2 border-[#1f1e1a] px-5 text-sm font-bold text-[#1f1e1a]">
        Loading...
    </span>
);

const WalletMultiButton = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    {ssr: false, loading: () => FALLBACK}
);

/**
 * Lazily loads the Solana wallet multi-button to reduce the initial bundle.
 *
 * @returns Wallet connection control for the header or mobile drawer.
 */
export default function WalletButton() {
    return <WalletMultiButton/>;
}
