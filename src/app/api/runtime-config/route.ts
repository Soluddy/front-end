import {NextResponse} from 'next/server';
import loadRuntimeConfig from '@/config/runtimeConfig';

const normalizeList = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value
        .map(entry => (typeof entry === 'string' ? entry.trim().toLowerCase() : ''))
        .filter(Boolean);
};

export async function GET() {
    const runtimeConfig = loadRuntimeConfig();

    const featuredSlugs = normalizeList(runtimeConfig.featuredSlugs);
    const bannedSlugs = normalizeList(runtimeConfig.bannedSlugs);
    const googleAnalyticsMeasurementId = runtimeConfig.googleAnalyticsMeasurementId;

    return NextResponse.json(
        {
            rpcUrl: runtimeConfig.rpcUrl,
            appBaseUrl: runtimeConfig.appBaseUrl,
            configPda: runtimeConfig.configPda,
            featuredSlugs,
            bannedSlugs,
            reportEmail: runtimeConfig.reportEmail,
            googleAnalyticsMeasurementId,
        },
        {
            headers: {
                'cache-control': 'public, max-age=900, s-maxage=900',
            },
        }
    );
}
