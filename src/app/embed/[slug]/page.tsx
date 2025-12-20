'use client';

import {use, useEffect, useMemo, useState} from 'react';
import Image from 'next/image';
import {useSearchParams} from 'next/navigation';
import {formatColor, formatRadius} from './colorUtils';
import {ThemeConfig} from './types';
import {useRuntimeConfig} from "@/config/RuntimeConfigContext";

interface CampaignDetails {
    name: string;
    description: string;
    url: string;
    owners: string[];
    slug: string;
    createdAt: string;
}

/**
 * Serves the iframe-ready embed experience with optional theming driven by query parameters.
 *
 * @param params Route parameters containing the campaign slug promise.
 * @returns The embed widget for a specific campaign.
 */
export default function EmbedPage({params}: { params: Promise<{ slug?: string | string[] }> }) {
    const {slug: slugParam} = use(params);
    const slug = useMemo(() => (
        Array.isArray(slugParam) ? slugParam[0]?.toLowerCase() : slugParam?.toLowerCase()
    ), [slugParam]);
    const {appBaseUrl} = useRuntimeConfig();

    const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();

    const theme: ThemeConfig = {
        bg: searchParams.get('bg') || undefined,
        border: searchParams.get('border') || undefined,
        titleColor: searchParams.get('titleColor') || undefined,
        textColor: searchParams.get('textColor') || undefined,
        buttonColor: searchParams.get('buttonColor') || undefined,
        buttonTextColor: searchParams.get('buttonTextColor') || undefined,
        iconBg: searchParams.get('iconBg') || undefined,
        radius: searchParams.get('radius') || undefined,
    };

    const bgColor = formatColor(theme.bg ?? null, '#fffffc');
    const borderColor = formatColor(theme.border ?? null, '#ebe6ff');
    const titleColor = formatColor(theme.titleColor ?? null, '#312062');
    const textColor = formatColor(theme.textColor ?? null, '#625599');
    const buttonBg = formatColor(theme.buttonColor ?? null, '#512da8');
    const buttonTextColor = formatColor(theme.buttonTextColor ?? null, '#fffffc');
    const iconBg = formatColor(theme.iconBg ?? null, '#fffffc');
    const borderRadius = formatRadius(theme.radius ?? null, '18px');

    useEffect(() => {
        if (!slug) {
            setCampaign(null);
            setError('Missing slug');
            setLoading(false);
            return;
        }

        let cancelled = false;
        const loadCampaign = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/vault/${slug}`);
                if (!response.ok) {
                    if (!cancelled) {
                        setCampaign(null);
                        setError('Campaign not found');
                    }
                    return;
                }

                const data = await response.json();
                if (cancelled) return;

                setCampaign({
                    name: data.name,
                    description: data.description,
                    url: data.url,
                    owners: data.owners ?? [],
                    slug: data.slug,
                    createdAt: data.createdAt,
                });
                setError(null);
            } catch (err) {
                if (!cancelled) {
                    setCampaign(null);
                    setError(err instanceof Error ? err.message : 'Failed to load campaign');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadCampaign();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    if (!campaign && loading) {
        return (
            <div className="w-full h-[140px] flex items-center justify-center rounded-[18px] bg-white border border-[#ece8ff]">
                <span className="text-xs text-[#7f75b3]">Loading campaign...</span>
            </div>
        );
    }

    if (!campaign || error) {
        return (
            <div className="w-full h-[140px] flex items-center justify-center rounded-[18px] bg-white border border-[#f5c2d6]">
                <span className="text-xs text-[#c94a5f]">{error ?? 'Campaign not found'}</span>
            </div>
        );
    }

    return (
        <div
            className="w-full shadow-[0_8px_20px_rgba(84,61,168,0.08)] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border"
            style={{backgroundColor: bgColor, borderColor, borderRadius}}
        >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-sm font-semibold leading-tight" style={{color: titleColor}}>
                    {campaign.name}
                </h2>
                <p className="text-xs leading-snug line-clamp-2" style={{color: textColor}}>
                    {campaign.description || 'Collect donations on Solana in one click.'}
                </p>
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
                <a
                    href={`${appBaseUrl}/${campaign.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full font-semibold px-4 py-2 text-sm transition-colors"
                    style={{backgroundColor: buttonBg, color: buttonTextColor}}
                >
                    <span className="h-6 w-6 flex items-center justify-center rounded-full" style={{backgroundColor: iconBg}}>
                        <Image src="/soluddy-icon.svg" alt="Soluddy logo" width={16} height={16}/>
                    </span>
                    Donate
                </a>
            </div>
        </div>
    );
}
