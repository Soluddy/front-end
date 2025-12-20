import {Connection, PublicKey} from '@solana/web3.js';
import {NextResponse} from 'next/server';
import loadRuntimeConfig from '@/config/runtimeConfig';
import {ACCOUNT_DISCRIMINATOR_LENGTH, parseVaultAccount, VaultAccountData} from '@/lib/solana/parsers';
import {soluddyProgramPublicKey} from '@/config/program';

export const runtime = 'nodejs';

const VAULT_DISCRIMINATOR = Buffer.from([211, 8, 232, 43, 2, 152, 117, 119]);

const findVaultBySlug = async (
    connection: Connection,
    slug: string,
): Promise<(VaultAccountData & {pda: string}) | null> => {
    const accounts = await connection.getProgramAccounts(soluddyProgramPublicKey, {});

    for (const {pubkey, account} of accounts) {
        const data = Buffer.from(account.data);
        if (data.length < ACCOUNT_DISCRIMINATOR_LENGTH) continue;

        const discriminator = data.subarray(0, ACCOUNT_DISCRIMINATOR_LENGTH);
        if (!discriminator.equals(VAULT_DISCRIMINATOR)) continue;

        const parsed = parseVaultAccount(data);
        if (parsed && parsed.slug.toLowerCase() === slug) {
            return {
                ...parsed,
                pda: pubkey.toBase58(),
            };
        }
    }

    return null;
};

export async function GET(
    _req: Request,
    {params}: { params: Promise<{ slug: string }> }
) {
    const {slug: rawSlug} = await params;

    if (!rawSlug) {
        return NextResponse.json({error: 'Missing slug parameter'}, {status: 400});
    }

    try {
        const runtimeConfig = loadRuntimeConfig();
        const slug = rawSlug.toString().toLowerCase();
        const connection = new Connection(runtimeConfig.rpcUrl, 'confirmed');
        const slugBytes = Buffer.from(slug);
        const [vaultPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('vault'), slugBytes],
            soluddyProgramPublicKey,
        );

        const accountInfo = await connection.getAccountInfo(vaultPda);
        if (!accountInfo) {
            const fallback = await findVaultBySlug(connection, slug);
            if (fallback) {
                return NextResponse.json(fallback);
            }
            return NextResponse.json({error: 'Campaign not found'}, {status: 404});
        }

        if (!accountInfo.owner.equals(soluddyProgramPublicKey)) {
            const fallback = await findVaultBySlug(connection, slug);
            if (fallback) {
                return NextResponse.json(fallback);
            }
            return NextResponse.json({error: 'Account owned by a different program'}, {status: 404});
        }

        const vault = parseVaultAccount(Buffer.from(accountInfo.data));
        if (!vault) {
            console.error('Failed to parse vault account for slug:', slug);
            return NextResponse.json(
                {error: 'Failed to parse campaign data'},
                {status: 500},
            );
        }

        const response: VaultAccountData & {pda: string} = {
            ...vault,
            pda: vaultPda.toBase58(),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Failed to fetch campaign:', error);
        return NextResponse.json(
            {error: 'Failed to fetch campaign data'},
            {status: 500}
        );
    }
}
