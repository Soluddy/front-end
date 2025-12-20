import Image from "next/image";
import Header from "@/components/Header";
import Button from "@/components/ui/Button";
import Footer from "@/components/Footer";
import AnimatedHeading from "@/components/ui/AnimatedHeading";

export const dynamic = 'force-static';

/**
 * Renders the public landing page with hero messaging and navigation shortcuts for campaign creation and discovery.
 *
 * @returns The Soluddy home page layout.
 */
export default function Home() {
    return (
        <div className="min-h-screen bg-[#fffffc] font-sans text-[#1f1e1a]">
            <Header/>
            <main>
                <section className="mt-12 grid w-full max-w-5xl grid-cols-1 gap-10 px-4 sm:px-6 md:mx-auto md:mt-[60px] md:grid-cols-2 md:gap-12">
                    <div className="flex flex-col items-center space-y-4 text-center md:items-start md:space-y-6 md:text-left">
                        <h1 className="text-[32px] font-semibold leading-tight text-[#1f1e1a] md:text-[36px]">
                            Decentralized donations
                            <br/>
                            <AnimatedHeading/>
                        </h1>
                       <p className="max-w-md text-[24px] leading-relaxed text-[#1f1e1a]">
                            Soluddy helps individuals and communities receive support directly through wallet-native
                            donation pages on Solana.
                        </p>
                        <p className="text-sm font-semibold uppercase tracking-wide text-[#512da8] md:hidden">
                            Fund campaigns on-chain in minutes
                        </p>
                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center md:w-auto md:justify-start">
                            <Button
                                onNavigate="/create-campaign"
                                bgColor="squircle-[#fbd30c]"
                                height="h-[42px]"
                                icon="/arrow-right.svg"
                                iconPosition="right"
                                className="justify-center"
                            >
                                Create a Campaign
                            </Button>
                            <Button
                                onNavigate="/explore"
                                bgColor="squircle-[#1f1e1a]"
                                textColor="text-white"
                                hoverColor="hover:squircle-[#512da8]"
                                icon="/binocular.svg"
                                iconAlt="Explore campaigns"
                                iconPosition="left"
                                iconSize={18}
                                height="h-[42px]"
                                className="justify-center"
                            >
                                Explore Campaigns
                            </Button>
                        </div>
                    </div>
                    <div className="hidden justify-center lg:flex md:flex md:justify-end">
                        <Image
                            src="/hero-illustration.svg"
                            alt="Soluddy decentralized donation platform illustration"
                            width={400}
                            height={400}
                            sizes="(min-width: 1024px) 400px, (min-width: 768px) 400px"
                            className="h-auto w-full max-w-[400px]"
                        />
                    </div>
                </section>

                <section className="mt-20 max-w-full bg-[#fbd30c] px-6 py-8 text-center">
                    <h2 className="text-[36px] font-semibold text-[#1f1e1a] transition-all duration-700 ease-out">
                        How It Works
                    </h2>
                    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 py-6 md:grid-cols-3">
                        <div className="flex flex-col items-center space-y-3">
                            <Image src="/icon-wallet.svg" alt="Connect Wallet" width={70} height={190}/>
                            <h3 className="text-xl font-black">Connect Wallet</h3>
                            <p className="text-base font-bold text-gray-700">
                                Connect Phantom or Solflare to sign blockchain transactions.
                            </p>
                        </div>
                      <div className="flex flex-col items-center space-y-3">
                            <Image src="/icon-add.svg" alt="Create Campaign" width={70} height={190}/>
                            <h3 className="text-xl font-black">Create Campaign</h3>
                            <p className="text-base font-bold text-gray-700">
                                Collect campaign details, add owners, and deploy to Solana in minutes.
                            </p>
                        </div>
                      <div className="flex flex-col items-center space-y-1">
                            <Image src="/icon-receive.svg" alt="Receive SOL" width={70} height={190}/>
                            <h3 className="text-xl font-black">Receive Donations</h3>
                            <p className="text-base font-bold text-gray-700 mt-2">
                                Share your campaign link and let Soluddy split donations on-chain.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer/>
        </div>
    );
}
