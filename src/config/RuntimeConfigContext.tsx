'use client';

import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';
import {normalizeSlug, stripNumericSuffix} from '@/config/bannedSlugs';
import loadRuntimeConfig, {RuntimeConfigData} from '@/config/runtimeConfig';

interface RuntimeConfigState extends RuntimeConfigData {
    loaded: boolean;
    error?: string;
}

export interface RuntimeConfigValue extends RuntimeConfigState {
    isSlugFeatured: (slug: string | undefined | null) => boolean;
    isSlugBanned: (slug: string | undefined | null) => boolean;
    isSlugBaseBanned: (slug: string | undefined | null) => boolean;
}

const normalizeList = (list: string[]) =>
    list.map(normalizeSlug).filter((entry) => entry.length > 0);

const ensureString = (value: unknown, fallback: string): string =>
    typeof value === 'string' && value.trim().length > 0 ? value : fallback;

const ensureNullableString = (value: unknown): string | null =>
    typeof value === 'string' && value.trim().length > 0 ? value : null;

const ensureStringArray = (value: unknown, fallback: string[]): string[] => {
    if (!Array.isArray(value)) return fallback;
    const cleaned = value
        .map(entry => (typeof entry === 'string' ? entry.trim() : ''))
        .filter(Boolean);
    return cleaned.length > 0 ? cleaned : fallback;
};

const toState = (data: RuntimeConfigData, loaded: boolean): RuntimeConfigState => ({
    rpcUrl: ensureString(data.rpcUrl, 'https://api.devnet.solana.com'),
    appBaseUrl: ensureString(data.appBaseUrl, 'https://soluddy.com'),
    configPda: ensureString(data.configPda, 'HCJDvoVrye24txi3hex5V4UMSaNVDd7wKP5VogDLkhsC'),
    featuredSlugs: normalizeList(
        ensureStringArray(data.featuredSlugs, ['soluddy'])
    ),
    bannedSlugs: normalizeList(
        ensureStringArray(data.bannedSlugs, [])
    ),
    reportEmail: ensureString(data.reportEmail, 'support@soluddy.com'),
    googleAnalyticsMeasurementId: ensureNullableString(data.googleAnalyticsMeasurementId),
    loaded,
});

const defaultState: RuntimeConfigState = toState(loadRuntimeConfig(), false);

const RuntimeConfigContext = createContext<RuntimeConfigValue>({
    ...defaultState,
    isSlugFeatured: () => false,
    isSlugBanned: () => false,
    isSlugBaseBanned: () => false,
});

/**
 * Supplies runtime configuration values and helpers to client components.
 *
 * @param children React subtree that requires runtime configuration.
 * @returns Provider element that loads configuration on mount.
 */
export function RuntimeConfigProvider({
                                          children,
                                          initialConfig,
                                      }: {
    children: ReactNode;
    initialConfig?: RuntimeConfigData;
}) {
    const [config, setConfig] = useState<RuntimeConfigState>(() =>
        initialConfig ? toState(initialConfig, true) : defaultState
    );

    useEffect(() => {
        let active = true;

        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/runtime-config');
                if (!response.ok) {
                    console.error('Failed to fetch runtime config', response.status);
                    if (!active) return;
                    setConfig(prev => ({
                        ...prev,
                        loaded: true,
                        error: `Failed to load config: ${response.status}`,
                    }));
                    return;
                }
                const data: RuntimeConfigData = await response.json();
                if (!active) return;
                setConfig(toState(data, true));
            } catch (error) {
                console.error('Failed to fetch runtime config', error);
                if (!active) return;
                setConfig(prev => ({
                    ...prev,
                    loaded: true,
                    error: error instanceof Error ? error.message : 'Failed to load config',
                }));
            }
        };

        if (typeof window === 'undefined') {
            return () => {
                active = false;
            };
        }

        if (initialConfig) {
            const timer = window.setTimeout(() => void fetchConfig(), 1500);

            return () => {
                active = false;
                clearTimeout(timer);
            };
        }

        fetchConfig();

        return () => {
            active = false;
        };
    }, [initialConfig]);

    const helpers = useMemo(() => {
        const featured = new Set(config.featuredSlugs);
        const banned = new Set(config.bannedSlugs);

        return {
            isSlugFeatured: (slug: string | undefined | null) => {
                if (!slug) return false;
                return featured.has(normalizeSlug(slug));
            },
            isSlugBanned: (slug: string | undefined | null) => {
                if (!slug) return false;
                const normalized = normalizeSlug(slug);
                const withoutSuffix = stripNumericSuffix(normalized);
                return banned.has(normalized) || banned.has(withoutSuffix);
            },
            isSlugBaseBanned: (slugBase: string | undefined | null) => {
                if (!slugBase) return false;
                return banned.has(normalizeSlug(slugBase));
            },
        };
    }, [config.featuredSlugs, config.bannedSlugs]);

    const value: RuntimeConfigValue = useMemo(() => ({
        ...config,
        ...helpers,
    }), [config, helpers]);

    return (
        <RuntimeConfigContext.Provider value={value}>
            {children}
        </RuntimeConfigContext.Provider>
    );
}

/**
 * Retrieves runtime configuration values from context.
 *
 * @returns Runtime configuration and helper functions.
 */
export function useRuntimeConfig() {
    return useContext(RuntimeConfigContext);
}
