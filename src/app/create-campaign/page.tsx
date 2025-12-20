'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CreateCampaignForm from "@/components/create/CreateCampaignForm";
import Button from "@/components/ui/Button";
import {useHydrated} from "@/hooks/useHydrated";
import {useDocumentTitle} from "@/hooks/useDocumentTitle";

/**
 * Hosts the guided campaign creation experience and surfaces prerequisites before deployment.
 *
 * @returns The Create Campaign page content.
 */
export default function CreateCampaignPage() {
    const isHydrated = useHydrated();
    useDocumentTitle('Create Campaign | Soluddy');

    if (!isHydrated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#fafafa] text-[#1f1f1f] font-sans">
            <Header/>
            <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
                <section className="space-y-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-[#512da8] font-semibold">
                        Launch on-chain
                    </p>
                    <h1 className="text-[36px] md:text-[48px] font-black leading-tight">
                        Deploy your Soluddy campaign
                    </h1>
                    <p className="text-lg md:text-xl text-[#333] leading-relaxed max-w-3xl">
                        Deploy a collaborative donation vault. Transparent, automatic, on-chain.
                    </p>
                    <div className="grid gap-4 md:grid-cols-3 text-sm md:text-base">
                        <div className="squircle squircle-2xl squircle-gray-200 px-5 py-4 transition delay-50 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105">
                            <h3 className="text-lg font-semibold mb-2">Wallet required</h3>
                            <p className="text-[#555]">
                                Connect a Solana wallet in devnet mode to sign the deployment.
                            </p>
                        </div>
                       <div className="squircle squircle-2xl squircle-gray-200 px-5 py-4 transition delay-50 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105">
                            <h3 className="text-lg font-semibold mb-2">Rent deposit</h3>
                            <p className="text-[#555]">
                                Small rent-exempt deposit required (refundable when vault is closed).
                            </p>
                        </div>
                        <div className="squircle squircle-2xl squircle-gray-200 px-5 py-4 transition delay-50 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105">
                            <h3 className="text-lg font-semibold mb-2">Devnet only</h3>
                            <p className="text-[#555]">
                                Currently testing on devnet. Mainnet support coming soon.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold">Deploy your campaign</h2>
                            <p className="text-[#555]">
                                Fill in the details below to get started.
                            </p>
                        </div>
                        <Button
                            onNavigate="/how-it-works"
                            bgColor="squircle-[#fbd30c]"
                            textColor="text-[#111]"
                            hoverColor="hover:squircle-[#f7d94a]"
                            className="px-6 py-3 min-w-[220px] justify-center"
                            icon="/arrow-right.svg"
                            iconPosition="right"
                        >
                            How it works?
                        </Button>
                    </div>
                    <div className="squircle squircle-3xl squircle-gray-200 px-6 py-8">
                        <CreateCampaignForm/>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">Frequently asked</h2>
                    <div className="space-y-3">
                        <div className="squircle squircle-xl squircle-[#fffffc] hover:squircle-gray-200 px-5 py-4 transition delay-20 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105">
                            <h3 className="text-[#512da8] text-lg font-semibold">Can I edit a campaign after deploying?</h3>
                            <p className="text-[#555]">
                                Yes. Campaign owners can edit name, URL, description, and categories anytime. Changes require a transaction signature.
                            </p>
                        </div>
                        <div className="squircle squircle-xl squircle-[#fffffc] hover:squircle-gray-200 px-5 py-4 transition delay-20 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105">
                            <h3 className="text-[#512da8] text-lg font-semibold">Can I change the owners or approval threshold?</h3>
                            <p className="text-[#555]">
                                Owner lists are final once deployed, and the approval threshold is fixed at 1 until multisig support launches. To make changes, close the vault and deploy a new campaign.
                            </p>
                        </div>
                        <div className="squircle squircle-xl squircle-[#fffffc] hover:squircle-gray-200 px-5 py-4 transition delay-20 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105">
                            <h3 className="text-[#512da8] text-lg font-semibold">Can I close a campaign and get my rent deposit back?</h3>
                            <p className="text-[#555]">
                                Yes. Any owner can close the vault anytime to refund the rent deposit and remove the campaign.
                            </p>
                        </div>
                        <div className="squircle squircle-xl squircle-[#fffffc] hover:squircle-gray-200 px-5 py-4 transition delay-20 duration-300 ease-in-out hover:-translate-y-1 hover:scale-105">
                            <h3 className="text-[#512da8] text-lg font-semibold">Will this work on mainnet later?</h3>
                            <p className="text-[#555]">
                                Yes. Mainnet support will launch once the protocol is audited.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer/>
        </div>
    );
}
