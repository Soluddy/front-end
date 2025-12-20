import {PublicKey, SystemProgram, Transaction, TransactionInstruction} from '@solana/web3.js';
import {Buffer} from 'buffer';
import {soluddyProgramPublicKey} from '@/config/program';

const VAULT_SEED_PREFIX = Buffer.from("vault");

const CLOSE_VAULT_DISCRIMINATOR = Buffer.from([
  141, 103, 17, 126, 72, 75, 29, 29
]);

export interface CloseVaultParams {
  owner: PublicKey;
  slug: string;
}

/**
 * Derives the Vault PDA from a slug
 */
export function getVaultPDA(slug: string): [PublicKey, number] {
  const slugBytes = Buffer.from(slug, 'utf8');
  return PublicKey.findProgramAddressSync(
    [VAULT_SEED_PREFIX, slugBytes],
    soluddyProgramPublicKey
  );
}

/**
 * Creates a transaction to close a vault
 */
export async function buildCloseVaultTransaction(
  params: CloseVaultParams
): Promise<{ transaction: Transaction; vaultPda: PublicKey }> {
  const { owner, slug } = params;

  const [vaultPda] = getVaultPDA(slug);

  const data = CLOSE_VAULT_DISCRIMINATOR;

  const instruction = new TransactionInstruction({
    programId: soluddyProgramPublicKey,
    keys: [
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = owner;

  return { transaction, vaultPda };
}

/**
 * Check if a public key is one of the vault owners
 */
export function isVaultOwner(walletAddress: string, vaultOwners: string[]): boolean {
  return vaultOwners.some(owner => owner === walletAddress);
}
