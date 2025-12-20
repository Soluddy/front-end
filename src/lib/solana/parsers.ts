import {Buffer} from 'node:buffer';
import {PublicKey} from '@solana/web3.js';

export interface ParsedString {
    value: string;
    offset: number;
}

export interface ParsedStringVec {
    values: string[];
    offset: number;
}

export interface VaultAccountData {
    owners: string[];
    threshold: number;
    name: string;
    slug: string;
    url: string;
    description: string;
    categories: string[];
    createdAt: string;
    bump: number;
}

export const ACCOUNT_DISCRIMINATOR_LENGTH = 8;

/**
 * Reads a UTF-8 string prefixed with a little-endian u32 length.
 */
export const readString = (buffer: Buffer, offset: number): ParsedString => {
    const length = buffer.readUInt32LE(offset);
    const start = offset + 4;
    const end = start + length;
    const value = buffer.subarray(start, end).toString('utf8');
    return {value, offset: end};
};

/**
 * Reads a vector of UTF-8 strings prefixed with a little-endian u32 length.
 * Falls back to a single string read if vector metadata is malformed.
 */
export const readStringVec = (buffer: Buffer, offset: number): ParsedStringVec => {
    const fallback = () => {
        const single = readString(buffer, offset);
        const values = single.value ? [single.value] : [];
        return {values, offset: single.offset};
    };

    let current = offset;

    if (current + 4 > buffer.length) {
        return fallback();
    }

    const count = buffer.readUInt32LE(current);
    current += 4;

    const values: string[] = [];
    for (let i = 0; i < count; i += 1) {
        if (current + 4 > buffer.length) {
            return fallback();
        }

        const length = buffer.readUInt32LE(current);
        current += 4;

        const end = current + length;
        if (end > buffer.length) {
            return fallback();
        }

        const value = buffer.subarray(current, end).toString('utf8');
        values.push(value);
        current = end;
    }

    return {values, offset: current};
};

/**
 * Parses a Vault account buffer into structured data.
 */
export const parseVaultAccount = (data: Buffer): VaultAccountData | null => {
    try {
        let offset = ACCOUNT_DISCRIMINATOR_LENGTH;

        const ownersLen = data.readUInt32LE(offset);
        offset += 4;

        const owners: string[] = [];
        for (let i = 0; i < ownersLen; i += 1) {
            const owner = new PublicKey(data.subarray(offset, offset + 32));
            owners.push(owner.toBase58());
            offset += 32;
        }

        const threshold = data.readUInt8(offset);
        offset += 1;

        const nameResult = readString(data, offset);
        const name = nameResult.value;
        offset = nameResult.offset;

        const slugResult = readString(data, offset);
        const slug = slugResult.value;
        offset = slugResult.offset;

        const urlResult = readString(data, offset);
        const url = urlResult.value;
        offset = urlResult.offset;

        const descriptionResult = readString(data, offset);
        const description = descriptionResult.value;
        offset = descriptionResult.offset;

        const categoriesResult = readStringVec(data, offset);
        const categories = categoriesResult.values.length > 0
            ? categoriesResult.values
            : ['non-profit'];
        offset = categoriesResult.offset;

        if (offset + 9 > data.length) {
            return null;
        }

        const createdAtSeconds = Number(data.readBigInt64LE(offset));
        offset += 8;
        const bump = data.readUInt8(offset);

        return {
            owners,
            threshold,
            name,
            slug,
            url,
            description,
            categories,
            createdAt: new Date(createdAtSeconds * 1000).toISOString(),
            bump,
        };
    } catch {
        return null;
    }
};
