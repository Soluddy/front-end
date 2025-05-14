'use client';

import {useEffect, useState} from "react";
import Button from "@/components/ui/Button";

interface Props {
    code: string;
}

export default function CopyEmbedCode({code}: Props) {
    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    useEffect(() => {
        const timeout = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div
            className={`flex items-center border-2 border-[#333333] bg-white px-4 py-3 rounded-full w-full transition-all duration-700 ease-out transform ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
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
                    bgColor="bg-transparent"
                    hoverColor="hover:bg-gray-100"
                />
                <span
                    className="absolute -top-8 right-1 text-xs px-2 py-1 bg-[#333333] text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {copied ? "Copied!" : "Copy"}
                </span>
            </div>
        </div>
    );
}
