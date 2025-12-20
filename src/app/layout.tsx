import React, {ReactNode} from 'react';
import type {Metadata} from 'next';

import '@solana/wallet-adapter-react-ui/styles.css';
import './globals.css';
import {SolanaProviders} from '@/components/SolanaProviders';
import EnvironmentBanner from '@/components/EnvironmentBanner';
import SquircleProvider from '@/components/ui/SquircleProvider';
import {RuntimeConfigProvider} from '@/config/RuntimeConfigContext';
import loadRuntimeConfig from '@/config/runtimeConfig';
import localFont from 'next/font/local';
import {GoogleAnalytics} from '@next/third-parties/google';

const runtimeConfig = loadRuntimeConfig();
const siteUrl = runtimeConfig.appBaseUrl.length > 0 ? runtimeConfig.appBaseUrl : 'https://soluddy.com';

const lufga = localFont({
    variable: '--font-lufga',
    display: 'swap',
    src: [
        { path: '../fonts/lufga/LufgaThin.woff', weight: '100', style: 'normal' },
        { path: '../fonts/lufga/LufgaThinItalic.woff', weight: '100', style: 'italic' },
        { path: '../fonts/lufga/LufgaExtraLight.woff', weight: '200', style: 'normal' },
        { path: '../fonts/lufga/LufgaExtraLightItalic.woff', weight: '200', style: 'italic' },
        { path: '../fonts/lufga/LufgaLight.woff', weight: '300', style: 'normal' },
        { path: '../fonts/lufga/LufgaLightItalic.woff', weight: '300', style: 'italic' },
        { path: '../fonts/lufga/LufgaRegular.woff', weight: '400', style: 'normal' },
        { path: '../fonts/lufga/LufgaItalic.woff', weight: '400', style: 'italic' },
        { path: '../fonts/lufga/LufgaMedium.woff', weight: '500', style: 'normal' },
        { path: '../fonts/lufga/LufgaMediumItalic.woff', weight: '500', style: 'italic' },
        { path: '../fonts/lufga/LufgaSemiBold.woff', weight: '600', style: 'normal' },
        { path: '../fonts/lufga/LufgaSemiBoldItalic.woff', weight: '600', style: 'italic' },
        { path: '../fonts/lufga/LufgaBold.woff', weight: '700', style: 'normal' },
        { path: '../fonts/lufga/LufgaBoldItalic.woff', weight: '700', style: 'italic' },
        { path: '../fonts/lufga/LufgaExtraBold.woff', weight: '800', style: 'normal' },
        { path: '../fonts/lufga/LufgaExtraBoldItalic.woff', weight: '800', style: 'italic' },
        { path: '../fonts/lufga/LufgaBlack.woff', weight: '900', style: 'normal' },
        { path: '../fonts/lufga/LufgaBlackItalic.woff', weight: '900', style: 'italic' },
    ]
});

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: 'Soluddy | Decentralized Donations on Solana',
        template: '%s | Soluddy',
    },
    description: 'Create multi-owner donation vaults on Solana with automatic split payouts, transparent crypto donations for up to 10 co-owners, and instant on-chain distribution.',
    keywords: ['Solana', 'donations', 'cryptocurrency', 'blockchain', 'Web3', 'decentralized', 'multi-signature', 'vault'],
    authors: [{name: 'Soluddy'}],
    creator: 'Soluddy',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: siteUrl,
        siteName: 'Soluddy',
        title: 'Soluddy | Decentralized Donations on Solana',
        description: 'Create multi-owner donation vaults on Solana with automatic split payouts, transparent crypto donations for up to 10 co-owners, and instant on-chain distribution.',
        images: [
            {
                url: `${siteUrl}/og.jpg`,
                width: 1200,
                height: 630,
                alt: 'Soluddy - Decentralized Donations on Solana',
                type: 'image/jpeg',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@soluddy',
        creator: '@soluddy',
        title: 'Soluddy | Decentralized Donations on Solana',
        description: 'Create multi-owner donation vaults on Solana with automatic split payouts, transparent crypto donations for up to 10 co-owners, and instant on-chain distribution.',
        images: [
            {
                url: `${siteUrl}/og.jpg`,
                alt: 'Soluddy - Decentralized Donations on Solana',
            }
        ],
    },
    other: {
        'og:logo': `${siteUrl}/logo.svg`,
        author: 'Soluddy',
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: ReactNode;
}>) {
    const gaId = runtimeConfig.googleAnalyticsMeasurementId;

    return (
        <html lang="en" className={lufga.variable}>
        <body className="antialiased font-sans">
        <RuntimeConfigProvider>
            <SquircleProvider>
                <SolanaProviders>
                    <EnvironmentBanner/>
                    {children}
                </SolanaProviders>
            </SquircleProvider>
        </RuntimeConfigProvider>
        </body>
        {gaId ? <GoogleAnalytics gaId={gaId}/> : null}
        </html>
    );
}
