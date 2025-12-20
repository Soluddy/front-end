import type {MetadataRoute} from 'next';
import loadRuntimeConfig from '@/config/runtimeConfig';
import bannedSlugsConfig from '@/config/banned-slugs.json';

export const dynamic = 'force-dynamic';

const STATIC_ROUTES: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
}> = [
    {path: '/', changeFrequency: 'weekly', priority: 1},
    {path: '/explore', changeFrequency: 'daily', priority: 0.8},
    {path: '/create-campaign', changeFrequency: 'monthly', priority: 0.6},
    {path: '/how-it-works', changeFrequency: 'yearly', priority: 0.5},
];

type VaultJson = {
    slug?: string;
    createdAt?: string;
};

const joinUrl = (baseUrl: string, path: string): string => {
    if (!path || path === '/') {
        return baseUrl;
    }
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

const parseLastModified = (value?: string): Date => {
    if (!value) {
        return new Date();
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const runtimeConfig = loadRuntimeConfig();
    const rawBaseUrl = runtimeConfig.appBaseUrl.trim();
    const baseUrl = (rawBaseUrl.length > 0 ? rawBaseUrl : 'https://soluddy.com').replace(/\/$/, '');
    const bannedSlugs = new Set(
        Array.isArray(bannedSlugsConfig)
            ? bannedSlugsConfig.map(slug => slug.toLowerCase())
            : [],
    );

    const seenPaths = new Set<string>();

    const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(route => {
        const url = joinUrl(baseUrl, route.path);
        seenPaths.add(url);
        return {
            url,
            lastModified: new Date(),
            changeFrequency: route.changeFrequency,
            priority: route.priority,
        };
    });

    try {
        const response = await fetch(joinUrl(baseUrl, '/api/vaults/all'), {
            headers: {accept: 'application/json'},
            next: {revalidate: 3600},
        });

        if (response.ok) {
            const payload = await response.json();
            if (Array.isArray(payload?.vaults)) {
                for (const vault of payload.vaults as VaultJson[]) {
                    if (typeof vault.slug !== 'string') {
                        continue;
                    }

                    const slug = vault.slug.toLowerCase();
                    if (bannedSlugs.has(slug)) {
                        continue;
                    }

                    const lastModified = parseLastModified(vault.createdAt);
                    const canonicalUrl = joinUrl(baseUrl, `/${slug}`);
                    const embedUrl = joinUrl(baseUrl, `/embed/${slug}`);

                    if (!seenPaths.has(canonicalUrl)) {
                        entries.push({
                            url: canonicalUrl,
                            lastModified,
                            changeFrequency: 'weekly',
                            priority: 0.8,
                        });
                        seenPaths.add(canonicalUrl);
                    }

                    if (!seenPaths.has(embedUrl)) {
                        entries.push({
                            url: embedUrl,
                            lastModified,
                            changeFrequency: 'monthly',
                            priority: 0.4,
                        });
                        seenPaths.add(embedUrl);
                    }
                }
            }
        }
    } catch (error) {
        console.error('[sitemap] Failed to load vaults for sitemap generation', error);
    }

    return entries;
}
