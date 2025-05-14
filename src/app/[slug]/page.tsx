'use client';

import {useState} from 'react';
import Header from '@/components/Header';
import Button from '@/components/ui/Button';
import {useConnection, useWallet} from '@solana/wallet-adapter-react';
import {PublicKey, SystemProgram, Transaction} from '@solana/web3.js';
import Footer from "@/components/Footer";
import CopyEmbedCode from "@/components/ui/CopyEmbedCode";

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

const MOCK_CAMPAIGN: Campaign = {
    name: "Soluddy",
    description: "Don't Be Muddy – Support a Creator Buddy",
    url: "https://github.com/doguabaris/soluddy",
    wallets: [
        "87DeAtQvEZEyzdks3sXcBjkS8FALd3QErYT7E25m2mQn",
        "9Tz6uxQsbBzMuWb3cVPZCu2nhWyShHeUymDxWCrMQBLT"
    ],
    slug: "soluddy-00123",
    created_at: "2025-05-13T14:20:00Z",
    embed_code: `<iframe src="https://soluddy.com/soluddy-00123" width="100%" height="140" frameborder="0"></iframe>`,
    module: "ContributorModule"
};

export default function Campaign() {
    const [amount, setAmount] = useState('');
    const {publicKey, sendTransaction} = useWallet();
    const {connection} = useConnection();

    const handleDonate = async () => {
        if (!publicKey) {
            alert('Connect your wallet first');
            return;
        }

        const totalLamports = parseFloat(amount) * 1_000_000_000;
        if (isNaN(totalLamports) || totalLamports <= 0) {
            alert('Enter a valid amount');
            return;
        }

        const splitLamports = Math.floor(totalLamports / MOCK_CAMPAIGN.wallets.length);

        const tx = new Transaction();
        for (const addr of MOCK_CAMPAIGN.wallets) {
            tx.add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(addr),
                    lamports: splitLamports,
                })
            );
        }

        try {
            const signature = await sendTransaction(tx, connection);
            alert(`Success! Transaction sent: ${signature}`);
            console.log('Tx Hash:', signature);
        } catch (err) {
            console.error('Transaction error:', err);
            alert('Transaction failed');
        }
    };

    return (
        <div className="min-h-screen bg-[#fff] text-[#333333] font-sans">
            <Header/>
            <div className="text-center space-y-4 w-full max-w-2xl mx-auto mt-[60px] mb-[200px] px-6 gap-10">
                <h1 className="text-[32px] md:text-[40px] leading-tight font-semibold">
                    {MOCK_CAMPAIGN.name}
                </h1>
                <p className="text-lg">{MOCK_CAMPAIGN.description}</p>
                <a
                    href={MOCK_CAMPAIGN.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[#111] underline font-medium hover:text-black transition"
                >
                    Visit page ↗
                </a>

                <div className="space-y-4">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-3 bg-[#333333] text-white rounded-[50px] text-center placeholder:text-gray-300"
                        placeholder="Enter amount in SOL"
                    />
                    <Button
                        onClick={handleDonate}
                        bgColor="bg-[#fff]"
                        textColor="text-black"
                        height="h-[42px]"
                        icon="/arrow-right.svg"
                        iconPosition="right"
                    >
                        Donate
                    </Button>
                </div>
            </div>
            <div className="text-center space-y-4 w-full max-w-4xl mx-auto mt-[60px] mb-[20px] px-6 gap-10">
                <div className="pt-6 border-t border-[#333333]/30 text-sm text-[#333]">
                    <p className="mb-2 font-semibold">Share / Embed</p>
                    <CopyEmbedCode code={MOCK_CAMPAIGN.embed_code}/>
                </div>
            </div>
            <Footer/>
        </div>
    );
}
