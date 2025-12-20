import bannedSlugsConfig from '@/config/banned-slugs.json';

export interface RuntimeConfigData {
    rpcUrl: string;
    appBaseUrl: string;
    configPda: string;
    featuredSlugs: string[];
    bannedSlugs: string[];
    reportEmail: string;
    googleAnalyticsMeasurementId: string | null;
}

const DEFAULT_RPC_URL = 'https://api.devnet.solana.com';
const DEFAULT_APP_BASE_URL = 'https://soluddy.com';
const DEFAULT_CONFIG_PDA = 'HCJDvoVrye24txi3hex5V4UMSaNVDd7wKP5VogDLkhsC';
const DEFAULT_FEATURED_SLUGS = ['soluddy'];
const DEFAULT_REPORT_EMAIL = 'support@soluddy.com';

const readEnvString = (key: string): string | undefined => {
    const raw = process.env[key];
    if (typeof raw !== 'string') return undefined;
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

const readEnvList = (key: string): string[] => {
    const value = readEnvString(key);
    if (!value) return [];
    return value
        .split(',')
        .map(entry => entry.trim())
        .filter(entry => entry.length > 0);
};

const sanitizeStringArray = (input: unknown): string[] => {
    if (!Array.isArray(input)) return [];
    return input
        .map(entry => (typeof entry === 'string' ? entry.trim().toLowerCase() : ''))
        .filter(entry => entry.length > 0);
};

export const loadRuntimeConfig = (): RuntimeConfigData => {
    const featuredSlugs = readEnvList('NEXT_PUBLIC_FEATURED_SLUGS');
    const bannedSlugs = sanitizeStringArray(bannedSlugsConfig);

    return {
        rpcUrl: readEnvString('NEXT_PUBLIC_RPC_URL') ?? DEFAULT_RPC_URL,
        appBaseUrl: readEnvString('NEXT_PUBLIC_APP_BASE_URL') ?? DEFAULT_APP_BASE_URL,
        configPda: DEFAULT_CONFIG_PDA,
        featuredSlugs: featuredSlugs.length > 0 ? featuredSlugs : DEFAULT_FEATURED_SLUGS,
        bannedSlugs,
        reportEmail: readEnvString('NEXT_PUBLIC_REPORT_EMAIL') ?? DEFAULT_REPORT_EMAIL,
        googleAnalyticsMeasurementId: readEnvString('NEXT_PUBLIC_GA_MEASUREMENT_ID') ?? null,
    };
};

export default loadRuntimeConfig;
