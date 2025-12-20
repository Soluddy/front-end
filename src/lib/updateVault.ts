import {PublicKey, Transaction, TransactionInstruction} from '@solana/web3.js';
import {Buffer} from 'buffer';
import {getVaultPDA} from './createVault';
import {soluddyProgramPublicKey} from '@/config/program';

const MAX_CATEGORIES = 5;

const UPDATE_VAULT_DISCRIMINATOR = Buffer.from([
  67, 229, 185, 188, 226, 11, 210, 60
]);

export interface UpdateVaultParams {
  owner: PublicKey;
  slug: string;
  name?: string;
  url?: string;
  description?: string;
  categories?: string[];
}

/**
 * Serializes an Option<String> to Anchor's format
 * Option::None = 0x00
 * Option::Some(str) = 0x01 + u32 length + bytes
 */
function serializeOptionString(str?: string): Buffer {
  if (str === undefined || str === null) {
    return Buffer.from([0]); // None
  }

  const strBytes = Buffer.from(str, 'utf8');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32LE(strBytes.length, 0);

  return Buffer.concat([
    Buffer.from([1]), // Some
    lengthBuffer,
    strBytes
  ]);
}

function serializeStringValue(str: string): Buffer {
  const strBytes = Buffer.from(str, 'utf8');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32LE(strBytes.length, 0);
  return Buffer.concat([lengthBuffer, strBytes]);
}

/**
 * Serializes a Vec<String> to Anchor's format (u32 length prefix)
 */
function serializeStringVec(values: string[]): Buffer {
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32LE(values.length, 0);
  const entries = values.map(value => serializeStringValue(value));
  return Buffer.concat([lengthBuffer, ...entries]);
}

/**
 * Serializes an Option<Vec<String>> to Anchor's format
 */
function serializeOptionStringVec(values?: string[]): Buffer {
  if (!values) {
    return Buffer.from([0]);
  }

  return Buffer.concat([
    Buffer.from([1]),
    serializeStringVec(values),
  ]);
}

/**
 * Builds the update_vault instruction data
 */
function buildUpdateVaultData(params: Omit<UpdateVaultParams, 'owner' | 'slug'>): Buffer {
  const { name, url, description, categories } = params;

  const nameSerialized = serializeOptionString(name);
  const urlSerialized = serializeOptionString(url);
  const descriptionSerialized = serializeOptionString(description);
  const categoriesSerialized = serializeOptionStringVec(categories);

  return Buffer.concat([
    UPDATE_VAULT_DISCRIMINATOR,
    nameSerialized,
    urlSerialized,
    descriptionSerialized,
    categoriesSerialized,
  ]);
}

/**
 * Creates a transaction to update a vault
 * Only vault owners can update the vault
 */
export async function buildUpdateVaultTransaction(
  params: UpdateVaultParams
): Promise<{ transaction: Transaction; error?: string }> {
  const { owner, slug, name, url, description, categories } = params;

  if (!name && !url && !description && !categories) {
    return {
      transaction: new Transaction(),
      error: 'At least one field must be updated',
    };
  }

  if (categories) {
    if (categories.length === 0) {
      return {
        transaction: new Transaction(),
        error: 'Select at least one category',
      };
    }

    if (categories.length > MAX_CATEGORIES) {
      return {
        transaction: new Transaction(),
        error: `Select at most ${MAX_CATEGORIES} categories`,
      };
    }

    const unique = new Set(categories);
    if (unique.size !== categories.length) {
      return {
        transaction: new Transaction(),
        error: 'Duplicate categories are not allowed',
      };
    }

    for (const category of categories) {
      if (!category || category.trim().length === 0 || Buffer.from(category).length > 32) {
        return {
          transaction: new Transaction(),
          error: 'Category values must be non-empty and 32 bytes or less',
        };
      }
    }
  }

  const [vaultPda] = getVaultPDA(slug);

  const data = buildUpdateVaultData({ name, url, description, categories });

  const instruction = new TransactionInstruction({
    programId: soluddyProgramPublicKey,
    keys: [
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ],
    data,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = owner;

  return { transaction };
}
