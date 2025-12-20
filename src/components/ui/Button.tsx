'use client';

import {ReactNode} from "react";
import Image from "next/image";
import clsx from "clsx";
import {useRouter} from "next/navigation";

/**
 * Describes the styling and behavior options for the reusable pill-shaped Button component.
 */
interface ButtonProps {
    children?: ReactNode;
    className?: string;
    onClick?: () => void;
    onNavigate?: string;
    onPrimaryAction?: () => void;
    type?: "button" | "submit" | "reset";
    bgColor?: string;
    textColor?: string;
    hoverColor?: string;
    height?: string;
    icon?: string;
    iconPosition?: "left" | "right";
    iconAlt?: string;
    iconSize?: number;
    iconWidth?: number;
    iconHeight?: number;
    iconOnly?: boolean;
    hideBorder?: boolean;
    disabled?: boolean;
}

/**
 * Renders a configurable pill-shaped button that supports icons, links, and disabled states.
 *
 * @param props Visual and behavioral parameters for the button.
 * @returns A button or anchor element styled with the Soluddy design system.
 */
export default function Button({
                                   children,
                                   className,
                                   onClick,
                                   onNavigate,
                                   onPrimaryAction,
                                   type = "button",
                                   bgColor = "squircle-[#fffffc]",
                                   textColor = "#1f1e1a",
                                   hoverColor = "",
                                   height = "h-[48px]",
                                   icon,
                                   iconPosition = "right",
                                   iconAlt = "Icon",
                                   iconSize = 16,
                                   iconWidth,
                                   iconHeight,
                                   iconOnly = false,
                                   disabled = false,
                               }: ButtonProps) {
    const router = useRouter();
    const iconW = iconWidth || iconSize;
    const iconH = iconHeight || iconSize;

    const iconLeft = icon && iconPosition === "left" && (
        <Image src={icon} alt={iconAlt} width={iconW} height={iconH}/>
    );

    const iconRight = icon && iconPosition === "right" && (
        <Image src={icon} alt={iconAlt} width={iconW} height={iconH}/>
    );

    const handleClick = () => {
        if (disabled) return;

        if (onPrimaryAction) {
            onPrimaryAction();
        } else if (onNavigate) {
            router.push(onNavigate);
        } else if (onClick) {
            onClick();
        }
    };

    return (
        <button
            type={type}
            onClick={handleClick}
            className={clsx(
                `squircle squircle-xl inline-flex items-center justify-center gap-2 text-sm font-bold transition-colors cursor-pointer`,
                iconOnly ? "p-2 w-[42px] h-[42px]" : "px-5 py-2",
                textColor,
                bgColor,
                hoverColor,
                height,
                disabled ? "opacity-60 cursor-not-allowed" : null,
                className
            )}
            disabled={disabled}
        >
            {iconLeft}
            {!iconOnly && children}
            {iconRight}
        </button>
    );
}
