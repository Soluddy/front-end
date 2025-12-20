import Image from "next/image";

/**
 * Displays consistent branding, copyright, and social presence across the site footer.
 *
 * @returns The global footer component.
 */
export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className="mx-auto mt-0 md:mt-[20px] mb-0 md:mb-[20px] max-w-5xl h-auto md:h-[65px] px-6 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 py-6 md:py-0">
            <div className="flex justify-center md:justify-start">
                <Image
                    src="/logo.svg"
                    alt="Soluddy logo"
                    width={120}
                    height={32}
                    priority
                />
            </div>
            <div className="text-[14px] text-[#1f1e1a] text-center">
                <p>
                    Built for builders and communities on Solana. Copyright {currentYear} Soluddy. All rights reserved.
                </p>
            </div>
            <div className="flex justify-center md:justify-end">
                <a href="https://x.com/usesoluddy" target="_blank" rel="noopener noreferrer">
                    <Image src="/x-icon.svg" alt="X" width={34} height={34}/>
                </a>
            </div>
        </footer>
    );
}
