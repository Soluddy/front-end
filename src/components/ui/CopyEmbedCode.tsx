'use client';

import {useState} from "react";
import Button from "@/components/ui/Button";

interface Props {
    code: string;
}

/**
 * Displays copyable embed code with visual feedback when the content is copied to the clipboard.
 *
 * @param props Embed code string to present.
 * @returns A copy-to-clipboard control.
 */
export default function CopyEmbedCode({code}: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <div className="flex items-center border-2 border-[#1f1e1a] bg-white px-4 py-3 rounded-full w-full">
            <code className="text-xs text-gray-500 truncate flex-grow">
                {code}
            </code>
            <div className="relative group ml-3 shrink-0">
                <Button
                    onClick={handleCopy}
                    icon={copied ? "/check-icon.svg" : "/copy-icon.svg"}
                    iconAlt={copied ? "Copied!" : "Copy"}
                    iconOnly
                    iconSize={20}
                    hideBorder
                    bgColor="squircle-[#fffffc]"
                    height = "h-[28px]"
                    hoverColor="hover:squircle-gray-100"
                />
                <span
                    className="absolute -top-8 right-1 text-xs px-2 py-1 bg-[#1f1e1a] text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {copied ? "Copied!" : "Copy"}
                </span>
            </div>
        </div>
    );
}
