import {PublicKey, SystemProgram, Transaction, TransactionInstruction} from '@solana/web3.js';
import {Buffer} from 'buffer';
import {soluddyProgramPublicKey} from '@/config/program';

const VAULT_SEED_PREFIX = Buffer.from("vault");
const MAX_CATEGORIES = 5;

const CREATE_VAULT_DISCRIMINATOR = Buffer.from([
  29, 237, 247, 208, 193, 82, 54, 135
]);

export interface CreateVaultParams {
  payer: PublicKey;
  owners: PublicKey[];
  threshold: number;
  name: string;
  slug: string;
  url: string;
  description: string;
  categories: string[];
}

/**
 * Validates vault creation parameters
 */
export function validateVaultParams(params: CreateVaultParams): { valid: boolean; error?: string } {
  const { owners, threshold, name, slug, url, description, categories } = params;

  if (owners.length === 0) {
    return { valid: false, error: "At least one owner is required" };
  }
  if (owners.length > 10) {
    return { valid: false, error: "Maximum 10 owners allowed" };
  }

  const uniqueOwners = new Set(owners.map(o => o.toBase58()));
  if (uniqueOwners.size !== owners.length) {
    return { valid: false, error: "Duplicate owners are not allowed" };
  }

  if (threshold !== 1) {
    return { valid: false, error: "Threshold is fixed at 1 until multisig support launches" };
  }

  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Name is required" };
  }
  if (Buffer.from(name).length > 32) {
    return { valid: false, error: "Name must be 32 bytes or less" };
  }

  if (!slug || slug.trim().length === 0) {
    return { valid: false, error: "Slug is required" };
  }
  if (Buffer.from(slug).length > 32) {
    return { valid: false, error: "Slug must be 32 bytes or less" };
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { valid: false, error: "Slug must contain only lowercase letters, numbers, and hyphens" };
  }

  if (Buffer.from(url).length > 128) {
    return { valid: false, error: "URL must be 128 bytes or less" };
  }

  if (Buffer.from(description).length > 280) {
    return { valid: false, error: "Description must be 280 bytes or less" };
  }

  if (!categories || categories.length === 0) {
    return { valid: false, error: "Select at least one category" };
  }
  if (categories.length > MAX_CATEGORIES) {
    return { valid: false, error: `Select at most ${MAX_CATEGORIES} categories` };
  }

  const uniqueCategories = new Set<string>();
  for (const category of categories) {
    if (!category || category.trim().length === 0) {
      return { valid: false, error: "Category values cannot be empty" };
    }
    if (Buffer.from(category).length > 32) {
      return { valid: false, error: "Category values must be 32 bytes or less" };
    }
    uniqueCategories.add(category);
  }

  if (uniqueCategories.size !== categories.length) {
    return { valid: false, error: "Duplicate categories are not allowed" };
  }

  return { valid: true };
}

/**
 * Serializes a string to Anchor's format (u32 length prefix + bytes)
 */
function serializeString(str: string): Buffer {
  const strBytes = Buffer.from(str, 'utf8');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32LE(strBytes.length, 0);
  return Buffer.concat([lengthBuffer, strBytes]);
}

/**
 * Serializes a Vec<String> to Anchor's format (u32 length + repeated strings)
 */
function serializeStringVec(values: string[]): Buffer {
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32LE(values.length, 0);
  const stringBuffers = values.map(value => serializeString(value));
  return Buffer.concat([lengthBuffer, ...stringBuffers]);
}

/**
 * Serializes a Vec<Pubkey> to Anchor's format (u32 length + pubkeys)
 */
function serializePubkeyVec(pubkeys: PublicKey[]): Buffer {
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32LE(pubkeys.length, 0);
  const pubkeyBuffers = pubkeys.map(pk => pk.toBuffer());
  return Buffer.concat([lengthBuffer, ...pubkeyBuffers]);
}

/**
 * Builds the create_vault instruction data
 */
function buildCreateVaultData(params: CreateVaultParams): Buffer {
  const { owners, threshold, name, slug, url, description, categories } = params;

  const ownersSerialized = serializePubkeyVec(owners);
  const thresholdByte = Buffer.from([threshold]);
  const nameSerialized = serializeString(name);
  const slugSerialized = serializeString(slug);
  const urlSerialized = serializeString(url);
  const descriptionSerialized = serializeString(description);
  const categoriesSerialized = serializeStringVec(categories);

  return Buffer.concat([
    CREATE_VAULT_DISCRIMINATOR,
    ownersSerialized,
    thresholdByte,
    nameSerialized,
    slugSerialized,
    urlSerialized,
    descriptionSerialized,
    categoriesSerialized,
  ]);
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
 * Creates a transaction to create a new vault
 */
export async function buildCreateVaultTransaction(
  params: CreateVaultParams
): Promise<{ transaction: Transaction; vaultPda: PublicKey; error?: string }> {
  const validation = validateVaultParams(params);
  if (!validation.valid) {
    return {
      transaction: new Transaction(),
      vaultPda: PublicKey.default,
      error: validation.error,
    };
  }

  const { payer, slug } = params;

  const [vaultPda] = getVaultPDA(slug);

  const data = buildCreateVaultData(params);

  const instruction = new TransactionInstruction({
    programId: soluddyProgramPublicKey,
    keys: [
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = payer;

  return { transaction, vaultPda };
}

/**
 * Estimates the rent cost for creating a vault
 * This is approximate - actual cost may vary slightly
 */
export function estimateVaultRentCost(): number {
  // Vault account size: 8 (discriminator) + 730 (MAX_SIZE) = 738 bytes
  // Approximate rent-exempt minimum for 738 bytes on Solana
  // This is roughly 0.0055 SOL on mainnet
  return 0.006; // SOL
}
