import {Connection} from '@solana/web3.js';
import {NextResponse} from 'next/server';
import loadRuntimeConfig from '@/config/runtimeConfig';
import {soluddyProgramPublicKey} from '@/config/program';
import {ACCOUNT_DISCRIMINATOR_LENGTH, parseVaultAccount, VaultAccountData} from '@/lib/solana/parsers';

export const runtime = 'nodejs';

type VaultAccount = VaultAccountData & {pda: string};

const VAULT_DISCRIMINATOR = Buffer.from([211, 8, 232, 43, 2, 152, 117, 119]);

export async function GET() {
    try {
        const runtimeConfig = loadRuntimeConfig();
        console.log('[API /vaults/all] Starting fetch from RPC:', runtimeConfig.rpcUrl);
        const connection = new Connection(runtimeConfig.rpcUrl, 'confirmed');

        console.log('[API /vaults/all] Fetching program accounts for:', soluddyProgramPublicKey.toBase58());
        const accounts = await connection.getProgramAccounts(soluddyProgramPublicKey, {});

        console.log('[API /vaults/all] Found', accounts.length, 'total accounts');

        const vaults: VaultAccount[] = [];
        for (const {pubkey, account} of accounts) {
            const data = Buffer.from(account.data);

            if (data.length < ACCOUNT_DISCRIMINATOR_LENGTH) continue;

            const discriminator = data.subarray(0, ACCOUNT_DISCRIMINATOR_LENGTH);
            if (!discriminator.equals(VAULT_DISCRIMINATOR)) {
                continue;
            }

            const parsed = parseVaultAccount(data);
            if (parsed) {
                vaults.push({
                    ...parsed,
                    pda: pubkey.toBase58(),
                });
            }
        }

        vaults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        console.log('[API /vaults/all] Successfully parsed', vaults.length, 'vaults');

        return NextResponse.json({
            vaults,
            count: vaults.length,
        });
    } catch (error) {
        console.error('Failed to fetch vaults:', error);
        return NextResponse.json(
            {error: 'Failed to fetch vaults'},
            {status: 500}
        );
    }
}
