'use client';

/**
 * Announces the active Solana environment so users connect the correct wallet cluster.
 */
export default function EnvironmentBanner() {
        return (
        <div className="bg-[#111] text-white text-xs sm:text-sm">
            <div className="max-w-5xl mx-auto px-6 py-2 text-center font-semibold flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
                <span className="inline-flex items-center gap-2 justify-center text-[0.75rem] sm:text-[0.85rem]">
                    <span className="inline-block rounded-full bg-[#fbd30c] text-[#111] px-3 py-1 text-[0.65rem] font-black uppercase tracking-wide">
                        Devnet
                    </span>
                    Soluddy currently runs on the Solana devnet only.
                </span>
                <span className="text-[0.7rem] sm:text-[0.8rem] font-medium text-white/80">
                    Switch your wallet to devnet to try it out. Mainnet payments are not live yet.
                </span>
            </div>
        </div>
    );
}
