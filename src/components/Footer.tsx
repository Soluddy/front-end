'use client';

import Image from "next/image";

export default function Footer() {
    return (
        <footer
            className="mx-auto mt-0 md:mt-[20px] mb-0 md:mb-[20px] max-w-5xl h-auto md:h-[65px] bg-white px-6 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 py-6 md:py-0">
            <div className="flex justify-center md:justify-start">
                <Image
                    src="/logo.svg"
                    alt="Soluddy logo"
                    width={120}
                    height={32}
                    priority
                />
            </div>
            <div className="text-[14px] text-[#333333] text-center">
                <p>Made for builders and communities. Running on Solana.
                    © {new Date().getFullYear()} Soluddy — All rights reserved.</p>
            </div>
            <div className="flex justify-center md:justify-end">
                <a href="#" target="_blank" rel="noopener noreferrer">
                    <Image src="/x-icon.svg" alt="X" width={34} height={34}/>
                </a>
            </div>
        </footer>
    );
}
