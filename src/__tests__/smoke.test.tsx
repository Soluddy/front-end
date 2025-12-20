/// <reference types="vitest/globals" />

import React, {Suspense} from 'react';
import {render, screen} from '@testing-library/react';
import Home from '@/app/page';
import ExplorePage from '@/app/explore/page';
import Campaign from '@/app/[slug]/page';
import EmbedPage from '@/app/embed/[slug]/page';
import {vi} from 'vitest';

type FetchMock = ReturnType<typeof vi.fn>;

const runtimeConfigMock = {
    rpcUrl: 'https://api.devnet.solana.com',
    appBaseUrl: 'https://soluddy.test',
    configPda: 'HCJDvoVrye24txi3hex5V4UMSaNVDd7wKP5VogDLkhsC',
    featuredSlugs: [] as string[],
    bannedSlugs: [] as string[],
    reportEmail: 'support@soluddy.test',
    googleAnalyticsMeasurementId: null as string | null,
    loaded: true,
    isSlugFeatured: vi.fn((slug?: string | null) => slug === 'featured-slug'),
    isSlugBanned: vi.fn(() => false),
    isSlugBaseBanned: vi.fn(() => false),
};

const mockUseParams = vi.fn(() => ({}));
const mockUseSearchParams = vi.fn(() => new URLSearchParams());

vi.mock('@/config/RuntimeConfigContext', () => ({
    RuntimeConfigProvider: ({children}: { children: React.ReactNode }) => <>{children}</>,
    useRuntimeConfig: () => runtimeConfigMock,
}));

vi.mock('next/image', () => ({
    __esModule: true,
    default: ({alt = '', ...props}: { alt?: string }) => (
        // eslint-disable-next-line @next/next/no-img-element -- Tests mock next/image with a plain img element.
        <img alt={alt} {...props} />
    ),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '/',
    useParams: () => mockUseParams(),
    useSearchParams: () => mockUseSearchParams(),
}));

vi.mock('@/components/Header', () => ({
    __esModule: true,
    default: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/components/Footer', () => ({
    __esModule: true,
    default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('@/components/ui/Button', () => ({
    __esModule: true,
    default: ({
                  children,
                  onClick,
                  disabled,
                  className,
                  type,
              }: React.PropsWithChildren<{
        onClick?: () => void;
        disabled?: boolean;
        className?: string;
        type?: 'button' | 'submit' | 'reset';
    }>) => (
        <button
            type={type ?? 'button'}
            onClick={onClick}
            disabled={disabled}
            className={className}
        >
            {children}
        </button>
    ),
}));

vi.mock('@/components/ui/AnimatedHeading', () => ({
    __esModule: true,
    default: () => <span>on Solana</span>,
}));

vi.mock('@/components/ui/SectionTitle', () => ({
    __esModule: true,
    default: ({text}: { text: string }) => <h2>{text}</h2>,
}));

vi.mock('@/components/ui/CopyEmbedCode', () => ({
    __esModule: true,
    default: ({code}: { code: string }) => <div data-testid="copy-embed">{code}</div>,
}));

vi.mock('@/components/ui/EditCampaignModal', () => ({
    __esModule: true,
    default: () => null,
}));

vi.mock('@/components/ui/DeleteCampaignModal', () => ({
    __esModule: true,
    default: () => null,
}));

vi.mock('@/components/navigation/NavLink', () => ({
    __esModule: true,
    default: ({children}: React.PropsWithChildren) => <a>{children}</a>,
}));

vi.mock('@/components/wallet/WalletButton', () => ({
    __esModule: true,
    default: () => <button type="button">Connect Wallet</button>,
}));

vi.mock('@/lib/closeVault', () => ({
    buildCloseVaultTransaction: vi.fn(async () => ({
        transaction: {},
    })),
    isVaultOwner: vi.fn(() => false),
}));

const mockWallet = {
    publicKey: null,
    sendTransaction: vi.fn(),
};

const mockConnection = {
    getAccountInfo: vi.fn(),
    confirmTransaction: vi.fn(),
};

vi.mock('@solana/wallet-adapter-react', () => ({
    useWallet: () => mockWallet,
    useConnection: () => ({connection: mockConnection}),
}));

vi.mock('@solana/web3.js', () => {
    class PublicKey {
        private value: string;
        constructor(value: string) {
            this.value = value;
        }
        toBase58() {
            return this.value;
        }
        static findProgramAddressSync() {
            return [new PublicKey('mock-pda'), 0];
        }
    }

    class Transaction {}

    class TransactionInstruction {
        constructor(public args: unknown) {}
    }

    const SystemProgram = {programId: 'system-program'};
    const LAMPORTS_PER_SOL = 1_000_000_000;

    return {
        PublicKey,
        SystemProgram,
        Transaction,
        TransactionInstruction,
        LAMPORTS_PER_SOL,
    };
});

const originalFetch = globalThis.fetch;
const fetchMock: FetchMock = vi.fn();

beforeEach(() => {
    runtimeConfigMock.appBaseUrl = 'https://soluddy.test';
    runtimeConfigMock.configPda = 'HCJDvoVrye24txi3hex5V4UMSaNVDd7wKP5VogDLkhsC';
    runtimeConfigMock.isSlugFeatured.mockReturnValue(false);
    runtimeConfigMock.isSlugBanned.mockReturnValue(false);
    runtimeConfigMock.isSlugBaseBanned.mockReturnValue(false);
    mockUseParams.mockReturnValue({});
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterAll(() => {
    globalThis.fetch = originalFetch;
});

describe('Front-end smoke tests', () => {
    test('Home page renders hero content', () => {
        render(<Home/>);

        expect(screen.getByRole('heading', {name: /Decentralized donations/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /Create a Campaign/i})).toBeInTheDocument();
    });

    test('Explore page lists campaigns from API response', async () => {
        const campaigns = [
            {
                name: 'Featured Campaign',
                slug: 'featured-slug',
                description: 'A highlighted effort',
                owners: ['owner1'],
                createdAt: new Date().toISOString(),
                categories: ['ai'],
            },
        ];

        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({vaults: campaigns}),
        } as unknown as Response);

        render(<ExplorePage/>);

        expect(screen.getByText(/Explore Campaigns/i)).toBeInTheDocument();
        expect(await screen.findByText('Featured Campaign')).toBeInTheDocument();
    });

    test('Campaign page renders campaign details after load', async () => {
        mockUseParams.mockReturnValue({slug: 'test-campaign'});

        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                name: 'Test Campaign',
                description: 'Support community initiatives.',
                url: 'https://example.com',
                owners: ['owner1', 'owner2'],
                slug: 'test-campaign',
                createdAt: new Date().toISOString(),
                pda: 'campaign-pda',
                threshold: 1,
                categories: ['non-profit'],
            }),
        } as unknown as Response);

        render(<Campaign/>);

        expect(await screen.findByRole('heading', {name: 'Test Campaign'})).toBeInTheDocument();

        expect(screen.getByText('Support community initiatives.')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /Donate/i})).toBeInTheDocument();
    });

    test('Embed page displays donate link for campaign', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                name: 'Embed Campaign',
                description: 'Embed description',
                url: 'https://example.com',
                owners: [],
                slug: 'embed-campaign',
                createdAt: new Date().toISOString(),
            }),
        } as unknown as Response);

        const paramsPromise = Promise.resolve({slug: 'embed-campaign'}) as Promise<{ slug?: string | string[] }> & {
            status?: 'fulfilled';
            value?: { slug?: string | string[] };
        };
        paramsPromise.status = 'fulfilled';
        paramsPromise.value = {slug: 'embed-campaign'};

        render(
            <Suspense fallback={<div>Loading...</div>}>
                <EmbedPage params={paramsPromise}/>
            </Suspense>
        );

        const donateLink = await screen.findByRole('link', {name: /Donate/i});
        expect(donateLink).toHaveAttribute('href', 'https://soluddy.test/embed-campaign');
    });
});
