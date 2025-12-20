'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionTitle from "@/components/ui/SectionTitle";
import Button from "@/components/ui/Button";
import Image from "next/image";
import {useDocumentTitle} from "@/hooks/useDocumentTitle";

const STEPS = [
    {
        title: "Connect Wallet",
        description: "Connect your Phantom or Solflare wallet to sign the transaction that creates your vault on-chain.",
        icon: "/icon-wallet.svg",
    },
    {
        title: "Create Campaign",
        description: "Fill out your campaign details, add owner wallets (1-10), and deploy your vault to Solana blockchain for ~0.006 SOL.",
        icon: "/icon-add.svg",
    },
    {
        title: "Share & Receive",
        description: "Share your unique campaign URL or embed widget. Donations are split automatically among owners with no platform cut.",
        icon: "/icon-receive.svg",
    },
];

const FEATURES = [
    {
        title: "Multi-owner distribution",
        copy: "Donations are automatically split equally among all configured wallet owners, with any remainder going to the first owner."
    },
    {
        title: "Fee-free donations",
        copy: "Every lamport donated goes straight to campaign owners. Soluddy takes no cut, making it a public-good protocol."
    },
    {
        title: "Customizable embed widget",
        copy: "Generate iframe code with customizable colors and styling. Embed your donation widget anywhere without technical setup."
    },
    {
        title: "On-chain verification",
        copy: "All vault data is stored on Solana blockchain. Donors can verify campaign owners and configuration before contributing."
    },
];

/**
 * Explains the Soluddy campaign lifecycle and features for prospective creators.
 *
 * @returns Informational How It Works page.
 */
export default function HowItWorksPage() {
    useDocumentTitle('How It Works | Soluddy');

    return (
        <div className="min-h-screen bg-[#fffffc] text-[#1f1e1a] font-sans">
            <Header/>
            <main className="pb-24">
                <section className="mt-[40px] md:mt-[10px] text-center space-y-3">
                    <div className="flex flex-col items-center gap-2">
                        <SectionTitle text="How It Works"/>
                    </div>
                    <p className="max-w-3xl mx-auto px-6 text-lg leading-relaxed text-[#1f1e1a]">
                        Soluddy simplifies blockchain donations on Solana. Create a campaign in minutes, share your unique link,
                        and receive contributions directly to multiple wallets with automatic splitting. You don&#39;t need technical
                        knowledge; just connect your wallet and deploy.
                    </p>
                </section>

                <section className="max-w-5xl mx-auto mt-16 px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
                    {STEPS.map((step) => (
                        <article key={step.title}
                                 className="squircle squircle-4xl squircle-gray-200 p-6 transition delay-20 duration-300 ease-in-out hover:-translate-y-1 hover:scale-115">
                            <div className="flex flex-col items-center space-y-3">
                                <Image src={step.icon} alt={step.title} width={64} height={64}/>
                                <h3 className="text-xl font-black">{step.title}</h3>
                                <p className="text-base text-[#1f1e1a]/80 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </article>
                    ))}
                </section>

                <section className="max-w-5xl mx-auto mt-24 px-6">
                    <div className="bg-[#fbd30c] rounded-[28px] squircle squircle-4xl squircle-[#fbd30c] p-8 md:p-12 shadow-lg">
                        <h3 className="text-[32px] md:text-[40px] font-semibold mb-6 text-[#1f1e1a]">
                            Transparent, secure, and easy to use
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 squircle squircle-2xl squircle-[#fbd30c] text-[#1f1e1a]">
                            {FEATURES.map((feature) => (
                                <div key={feature.title}
                                     className="squircle squircle-2xl squircle-[#fff3b8] p-6 transition delay-20 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105">
                                    <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                                    <p className="text-sm leading-relaxed">{feature.copy}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <p className="text-base md:text-lg font-medium text-[#1f1e1a]/80">
                                Ready to launch? Start by exploring campaigns already live on Soluddy.
                            </p>
                            <Button
                                onNavigate="/explore"
                                bgColor="squircle-[#1f1e1a]"
                                textColor="text-white"
                                hoverColor="hover:squircle-[#512da8]"
                                icon="/arrow-right-white.svg"
                                iconPosition="right"
                            >
                                View Campaigns
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
            <Footer/>
        </div>
    );
}
