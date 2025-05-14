'use client';

import {useEffect, useState} from "react";
import {useWallet} from '@solana/wallet-adapter-react';
import Header from "@/components/Header";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import Button from "@/components/ui/Button";
import Image from "next/image";
import CampaignModal from "@/components/ui/CampaignModal";
import Footer from "@/components/Footer";

interface Campaign {
    name: string;
    description: string;
    url: string;
    wallets: string[];
    slug: string;
    created_at: string;
    embed_code: string;
    module: string;
}

export default function Home() {
    const [showModal, setShowModal] = useState(false);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const {wallet, connect, connected} = useWallet();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (wallet && wallet.readyState === 'Installed' && !connected) {
            connect().catch(() => console.warn('Auto connect failed'));
        }
    }, [wallet, connected, connect]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#fff] text-[#333333] font-sans">
            <Header/>
            <section className="max-w-5xl mx-auto mt-[60px] px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col items-center text-center md:items-start md:text-left space-y-6">
                    <h1 className="text-[32px] md:text-[40px] leading-tight font-semibold text-[#333333]">
                        Decentralized donations<br/>
                        <AnimatedHeading/>
                    </h1>
                    <p className="text-[#333333] text-[24px] leading-relaxed max-w-md">
                        Soluddy helps individuals and communities receive support directly<br/> through
                        wallet-native donation pages on Solana.
                    </p>
                    <Button
                        as="a"
                        target="_blank"
                        rel="noopener noreferrer"
                        bgColor="bg-[#fce77d]"
                        height="h-[42px]"
                        icon="/arrow-right.svg"
                        iconPosition="right"
                        onClick={() => setShowModal(true)}
                    >
                        Get Soluddied
                    </Button>
                    {showModal && (
                        <CampaignModal
                            onClose={() => setShowModal(false)}
                            onDeploy={(campaign: Campaign) => {
                                setCampaigns(prev => [...prev, campaign]);
                            }}
                        />
                    )}
                </div>
                <div className="flex justify-center md:justify-end">
                    <Image
                        src="/hero-illustration.svg"
                        alt="Hero Illustration"
                        width={400}
                        height={400}
                        priority
                        className={`transition-all duration-700 ease-out transform ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
                    />
                </div>
            </section>
            <section className="max-w-full bg-[#fce77d] mx-auto px-6 py-8 mt-20 gap-10 text-center">
                <h2
                    className={`text-[36px] font-semibold text-[#333333] w-full sm:w-auto text-center  transition-all transform duration-700 ease-out`}
                >
                    How It Works
                </h2>
                <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <Image src="/icon-wallet.svg" alt="Connect Wallet" width={64} height={64}/>
                        <h3 className="text-xl font-black">Connect Wallet</h3>
                        <p className="text-gray-700 text-base font-bold">
                            Use Phantom or Solflare to get started
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                        <Image src="/icon-add.svg" alt="Create Page" width={64} height={64}/>
                        <h3 className="text-xl font-black">Create Campaign</h3>
                        <p className="text-gray-700 text-base font-bold">
                            Fill out name, description, and deploy your vault
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                        <Image src="/icon-receive.svg" alt="Receive SOL" width={64} height={64}/>
                        <h3 className="text-xl font-black">Receive SOL</h3>
                        <p className="text-gray-700 text-base font-bold">
                            Share your public URL and get funded directly
                        </p>
                    </div>
                </div>
            </section>
            {campaigns.length > 0 && (
                <section className="max-w-4xl mx-auto mt-12 bg-white p-6 rounded shadow space-y-4">
                    <h3 className="text-2xl font-semibold mb-4">Mock Deployed Campaigns</h3>
                    {campaigns.map((c, i) => (
                        <div key={i} className="p-4 border rounded bg-gray-50 space-y-2">
                            <div><strong>Name:</strong> {c.name}</div>
                            <div><strong>Slug:</strong> {c.slug}</div>
                            <div><strong>Wallets:</strong> {c.wallets.join(', ')}</div>
                            <div><strong>Created At:</strong> {c.created_at}</div>
                            <div><strong>Module:</strong> {c.module}</div>
                            <div><strong>Public URL:</strong> <code>{`https://soluddy.com/${c.slug}`}</code></div>
                            <div><strong>Embed Snippet:</strong></div>
                            <pre className="bg-gray-200 text-sm p-2 rounded">{c.embed_code}</pre>
                            <div dangerouslySetInnerHTML={{__html: c.embed_code}}/>
                        </div>
                    ))}
                </section>
            )}
            <Footer/>
        </div>
    );
}
