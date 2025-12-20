'use client';

import {ReactNode, useEffect, useMemo, useState} from 'react';
import {ConnectionProvider, WalletProvider} from '@solana/wallet-adapter-react';
import type {WalletAdapter} from '@solana/wallet-adapter-base';
import {WalletModalProvider} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import {useRuntimeConfig} from "@/config/RuntimeConfigContext";

const FALLBACK_RPC = 'https://api.devnet.solana.com';

export const SolanaProviders = ({children}: { children: ReactNode }) => {
    const {rpcUrl} = useRuntimeConfig();
    const endpoint = useMemo(() => rpcUrl || FALLBACK_RPC, [rpcUrl]);
    const [walletAdapters, setWalletAdapters] = useState<WalletAdapter[]>([]);

    useEffect(() => {
        let isMounted = true;

        const loadWalletAdapters = async () => {
            const [{PhantomWalletAdapter}, {SolflareWalletAdapter}] = await Promise.all([
                import('@solana/wallet-adapter-phantom'),
                import('@solana/wallet-adapter-solflare'),
            ]);

            if (!isMounted) return;

            setWalletAdapters([
                new PhantomWalletAdapter(),
                new SolflareWalletAdapter(),
            ]);
        };

        loadWalletAdapters().catch((error) => {
            console.error('Failed to load wallet adapters', error);
        });

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={walletAdapters} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
