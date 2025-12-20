'use client';

import {ReactNode} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import clsx from "clsx";

type NavLinkProps = {
    href: string;
    children: ReactNode;
};

/**
 * Wraps Next.js Link to provide active styling for navigation items.
 *
 * @param props Destination href and link label.
 * @returns A link with active-state styling.
 */
export default function NavLink({href, children}: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/' && pathname?.startsWith(`${href}/`));

    return (
        <Link
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={clsx(
                "transition-colors hover:underline",
                isActive ? "font-black text-[#512da8]" : "font-medium text-[#1f1e1a]"
            )}
        >
            {children}
        </Link>
    );
}
