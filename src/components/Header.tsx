'use client';

import {useEffect, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import NavLink from "@/components/navigation/NavLink";
import WalletButton from "@/components/wallet/WalletButton";
import clsx from "clsx";

const NAV_LINKS = [
    {href: '/', label: 'Home'},
    {href: '/create-campaign', label: 'Create'},
    {href: '/how-it-works', label: 'How It Works'},
    {href: '/explore', label: 'Explore'},
];

/**
 * Renders the global header with navigation links and wallet connectivity.
 *
 * @returns The site header component.
 */
export default function Header() {
    const [openPath, setOpenPath] = useState<string | null>(null);
    const pathname = usePathname();
    const menuOpen = openPath === pathname;

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        if (menuOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }

        document.body.style.overflow = '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    const toggleMenu = () => {
        setOpenPath(prev => (prev === pathname ? null : pathname));
    };

    const closeMenu = () => setOpenPath(null);

    return (
        <>
            <header className="mx-auto mt-0 md:mt-[20px] flex h-[72px] md:h-[83px] w-full max-w-5xl items-center justify-between px-4 md:px-6">
                <Link href="/" aria-label="Soluddy home" className="flex items-center gap-2">
                    <Image
                        src="/logo.svg"
                        alt="Soluddy logo"
                        width={150}
                        height={32}
                        priority
                    />
                </Link>
                <nav className="hidden items-center space-x-4 text-[18px] md:flex">
                    {NAV_LINKS.map(({href, label}, index) => (
                        <div key={href} className="flex items-center gap-4">
                            <NavLink href={href}>{label}</NavLink>
                            {index < NAV_LINKS.length - 1 && (
                                <Image src="/slash-icon.svg" alt="/" width={32} height={32}/>
                            )}
                        </div>
                    ))}
                </nav>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex">
                        <WalletButton/>
                    </div>
                    <button
                        type="button"
                        className="squircle squircle-2xl squircle-[#1f1e1a] inline-flex h-10 w-10 items-center justify-center text-[#fffffc] transition-colors md:hidden"
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        onClick={toggleMenu}
                    >
                        <span className="sr-only">{menuOpen ? 'Close navigation menu' : 'Open navigation menu'}</span>
                        <span
                            className={clsx(
                                "block h-4 w-4",
                                menuOpen ? "relative" : "relative"
                            )}
                            aria-hidden="true"
                        >
                            <span
                                className={clsx(
                                    "absolute left-0 right-0 h-[2px] bg-current transition-transform",
                                    menuOpen ? "top-1/2 rotate-45" : "top-0"
                                )}
                            />
                            <span
                                className={clsx(
                                    "absolute left-0 right-0 h-[2px] bg-current transition-opacity",
                                    menuOpen ? "top-1/2 opacity-0" : "top-1/2 -translate-y-1/2 opacity-100"
                                )}
                            />
                            <span
                                className={clsx(
                                    "absolute left-0 right-0 h-[2px] bg-current transition-transform",
                                    menuOpen ? "top-1/2 -rotate-45" : "bottom-0"
                                )}
                            />
                        </span>
                    </button>
                </div>
            </header>

            <div
                className={clsx(
                    "md:hidden fixed inset-0 z-40 bg-[#fffffc] transition-opacity duration-200",
                    menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                )}
            >
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <Link href="/" aria-label="Soluddy home" onClick={closeMenu}>
                            <Image src="/logo.svg" alt="Soluddy logo" width={120} height={28} priority/>
                        </Link>
                        <button
                            type="button"
                            className="squircle squircle-2xl squircle-[#1f1e1a] inline-flex h-10 w-10 items-center justify-center text-[#fffffc]"
                            aria-label="Close menu"
                            onClick={closeMenu}
                        >
                            <span className="sr-only">Close navigation menu</span>
                            <span aria-hidden="true" className="relative block h-4 w-4">
                                <span className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rotate-45 bg-current"/>
                                <span className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 -rotate-45 bg-current"/>
                            </span>
                        </button>
                    </div>
                    <nav className="flex flex-1 flex-col gap-4 px-4 py-6 text-lg font-semibold text-[#1f1e1a]">
                        {NAV_LINKS.map(({href, label}) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={closeMenu}
                                className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-[#1f1e1a]/10"
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                    <div className="px-4 pb-8">
                        <WalletButton/>
                    </div>
                </div>
            </div>
        </>
    );
}
