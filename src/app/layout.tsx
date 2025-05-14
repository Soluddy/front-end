import React, {ReactNode} from 'react';
import type {Metadata} from 'next';
import {Quicksand} from "next/font/google";

import '@solana/wallet-adapter-react-ui/styles.css';
import './globals.css';
import {SolanaProviders} from "@/components/SolanaProviders";

const quicksand = Quicksand({
    subsets: ["latin"],
    variable: "--font-sans",
    weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: 'Soluddy',
    description: 'Decentralized donation pages on Solana',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${quicksand.variable} antialiased`}>
        <SolanaProviders>
            {children}
        </SolanaProviders>
        </body>
        </html>
    );
}
