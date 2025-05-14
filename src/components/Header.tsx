'use client';

import Image from "next/image";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";

export default function Header() {
    const handleScroll = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({behavior: "smooth", block: "start"});
        }
    };

    return (
        <header
            className="mx-auto mt-0 md:mt-[20px] max-w-5xl h-[83px] px-6 flex justify-between items-center">
            <Image
                src="/logo.svg"
                alt="Soluddy logo"
                width={150}
                height={32}
                priority
            />
            <nav className="hidden md:flex items-center space-x-4 text-[#333333] text-[18px]">
                <a href="#" className="font-bold">Home</a>
                <Image src="/slash-icon.svg" alt="/" width={32} height={32}/>
                <a href="#" onClick={handleScroll("how")} className="hover:underline">How It Works</a>
                <Image src="/slash-icon.svg" alt="/" width={32} height={32}/>
                <a href="#/" target="_blank"
                   className="hover:underline">Explore</a>
            </nav>
            <div className="flex gap-4 items-center">
                <WalletMultiButton/>
            </div>
        </header>
    );
}
