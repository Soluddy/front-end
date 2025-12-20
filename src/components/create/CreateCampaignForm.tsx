'use client';

import {FormEvent, useMemo, useState} from 'react';
import {useConnection, useWallet} from '@solana/wallet-adapter-react';
import {PublicKey} from '@solana/web3.js';
import Button from "@/components/ui/Button";
import {buildCreateVaultTransaction, estimateVaultRentCost} from "@/lib/createVault";
import {addStoredCampaign, StoredCampaign} from "@/lib/campaignStorage";
import {useRuntimeConfig} from "@/config/RuntimeConfigContext";
import {CATEGORIES, getCategoryLabel} from "@/config/categories";
import {useRouter} from 'next/navigation';

interface Props {
    onCreated?: (campaign: StoredCampaign) => void;
}

const sanitizeSlug = (value: string) =>
    value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

const MAX_CATEGORIES = 5;
const FIXED_THRESHOLD = 1;
const RANDOM_SEGMENT_LENGTH = 6;

const generateRandomSegment = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID().replace(/-/g, '').slice(0, RANDOM_SEGMENT_LENGTH);
    }

    return Math.random().toString(36).slice(2, 2 + RANDOM_SEGMENT_LENGTH);
};

/**
 * Collects campaign metadata, validates Solana owner inputs, and submits the transaction that deploys a vault.
 *
 * @param props Optional callback invoked when the campaign record is stored locally.
 * @returns A campaign creation form.
 */
export default function CreateCampaignForm({onCreated}: Props) {
    const {publicKey, sendTransaction} = useWallet();
    const {connection} = useConnection();
    const router = useRouter();
    const {
        isSlugBanned,
        isSlugBaseBanned,
        reportEmail,
    } = useRuntimeConfig();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [wallets, setWallets] = useState<string[]>(['']);
    const [isDeploying, setIsDeploying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [categoryError, setCategoryError] = useState<string | null>(null);

    const {generatedSlug, reservedWarning} = useMemo(() => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            return {
                generatedSlug: null,
                reservedWarning: null,
            };
        }

        const slugBase = sanitizeSlug(trimmedName);
        if (!slugBase) {
            return {
                generatedSlug: null,
                reservedWarning: null,
            };
        }

        if (isSlugBaseBanned(slugBase)) {
            return {
                generatedSlug: null,
                reservedWarning: `This campaign name is reserved. If you represent this organization, reach out to ${reportEmail}.`,
            };
        }

        const randomSegment = generateRandomSegment();
        const maxBaseLength = Math.max(1, 32 - 1 - randomSegment.length);
        const slugBaseTrimmed = slugBase.slice(0, maxBaseLength);
        const slugCandidate = `${slugBaseTrimmed}-${randomSegment}`;
        if (isSlugBanned(slugCandidate)) {
            return {
                generatedSlug: null,
                reservedWarning: `Generated slug conflicts with a blocked campaign. If you represent this organization, reach out to ${reportEmail}.`,
            };
        }

        return {
            generatedSlug: slugCandidate,
            reservedWarning: null,
        };
    }, [name, isSlugBaseBanned, isSlugBanned, reportEmail]);

    /**
     * Adds or removes a category selection while enforcing the maximum selection rule.
     *
     * @param value Category identifier to toggle.
     */
    const toggleCategory = (value: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(value)) {
                const next = prev.filter(item => item !== value);
                if (next.length === 0) {
                    setCategoryError("Select at least one category.");
                } else {
                    setCategoryError(null);
                }
                return next;
            }

            if (prev.length >= MAX_CATEGORIES) {
                setCategoryError(`You can select up to ${MAX_CATEGORIES} categories.`);
                return prev;
            }

            const next = [...prev, value];
            setCategoryError(null);
            return next;
        });
    };

    const handleWalletChange = (index: number, value: string) => {
        const updated = [...wallets];
        updated[index] = value;
        setWallets(updated);
    };

    const addWalletField = () => {
        setWallets(prev => [...prev, '']);
    };

    const removeWalletField = (index: number) => {
        if (wallets.length === 1) return;
        setWallets(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setCategoryError(null);

        if (!publicKey) {
            setError("Please connect your wallet before deploying.");
            return;
        }

        const trimmedName = name.trim();
        const filteredWallets = wallets.map(w => w.trim()).filter(Boolean);

        if (trimmedName.length === 0) {
            setError("Campaign name is required.");
            return;
        }

        if (filteredWallets.length === 0) {
            setError("Add at least one owner wallet address.");
            return;
        }

        if (reservedWarning) {
            setError(reservedWarning);
            return;
        }

        if (!generatedSlug) {
            setError("Unable to generate a slug for this campaign. Please adjust the name.");
            return;
        }

        if (selectedCategories.length === 0) {
            const message = "Select at least one category.";
            setCategoryError(message);
            setError(message);
            return;
        }

        if (selectedCategories.length > MAX_CATEGORIES) {
            const message = `Select at most ${MAX_CATEGORIES} categories.`;
            setCategoryError(message);
            setError(message);
            return;
        }

        let ownerPubkeys: PublicKey[];
        try {
            ownerPubkeys = filteredWallets.map(addr => new PublicKey(addr));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid wallet address provided.");
            return;
        }

        setIsDeploying(true);

        try {
            const {transaction, vaultPda, error: buildError} = await buildCreateVaultTransaction({
                payer: publicKey,
                owners: ownerPubkeys,
                threshold: FIXED_THRESHOLD,
                name: trimmedName,
                slug: generatedSlug,
                url: url.trim(),
                description: description.trim(),
                categories: selectedCategories,
            });

            if (buildError) {
                setError(buildError);
                return;
            }

            const estimatedCost = estimateVaultRentCost();
            const formattedCategories = selectedCategories.map(cat => getCategoryLabel(cat)).join(', ');
            const confirmMessage = [
                `Deploy campaign on Solana devnet?`,
                ``,
                `Campaign: ${trimmedName}`,
                `Slug (auto-generated): ${generatedSlug}`,
                `Owners: ${filteredWallets.length}`,
                `Approvals required to close: ${FIXED_THRESHOLD} (multisig coming soon)`,
                `Categories: ${formattedCategories}`,
                ``,
                `Estimated rent deposit: ~${estimatedCost} SOL`,
                `Reminder: deployments are currently on devnet only.`,
            ].join('\n');

            if (typeof window !== 'undefined' && !window.confirm(confirmMessage)) {
                return;
            }

            const signature = await sendTransaction(transaction, connection, {
                skipPreflight: false,
            });
            await connection.confirmTransaction(signature, 'confirmed');

            const campaign: StoredCampaign = {
                slug: generatedSlug,
                name: trimmedName,
                createdAt: new Date().toISOString(),
                pda: vaultPda.toBase58(),
                categories: selectedCategories,
            };

            addStoredCampaign(campaign);
            onCreated?.(campaign);

            setSuccessMessage(
                `Campaign deployed! Transaction: ${signature}. Vault PDA: ${vaultPda.toBase58()}.`
            );
            setName('');
            setDescription('');
            setUrl('');
            setSelectedCategories([]);
            setWallets(['']);
            setCategoryError(null);

            if (typeof window !== 'undefined') {
                router.push(`/${generatedSlug}`);
            }
        } catch (err) {
            console.error('Deployment error:', err);
            setError(err instanceof Error ? err.message : 'Failed to deploy campaign.');
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[#1f1e1a]">Campaign name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Mutual aid fund"
                        className="squircle squircle-xl squircle-[#FFFFFC] w-full text-[#1f1e1a] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#512da8]"
                        disabled={isDeploying}
                        required
                    />
                    {reservedWarning && (
                        <p className="text-xs text-red-600 font-semibold">
                            {reservedWarning}
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[#1f1e1a]">Public website (optional)</label>
                    <input
                        type="url"
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                        placeholder="https://example.org"
                        className="squircle squircle-xl squircle-[#FFFFFC] w-full text-[#1f1e1a] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#512da8]"
                        disabled={isDeploying}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#1f1e1a]">Description</label>
                <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Share the story behind your campaign and how donations will be used."
                    className="squircle squircle-xl squircle-[#FFFFFC] w-full text-[#1f1e1a] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#512da8] min-h-[120px]"
                    disabled={isDeploying}
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#1f1e1a]">Categories</label>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => {
                        const isSelected = selectedCategories.includes(cat.value);
                        return (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => toggleCategory(cat.value)}
                                disabled={isDeploying}
                                className={`px-4 py-2 rounded-full border-2 text-sm font-semibold transition-colors cursor-pointer ${
                                    isSelected
                                        ? 'bg-[#512da8] border-[#512da8] text-white'
                                        : 'bg-white border-[#d1d1d1] text-[#333] hover:border-[#512da8]'
                                } ${!isSelected && selectedCategories.length >= MAX_CATEGORIES ? 'opacity-60' : ''}`}
                            >
                                {cat.label}
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs text-[#555]">
                    Select up to {MAX_CATEGORIES} categories that describe your campaign.
                </p>
                {categoryError && (
                    <p className="text-xs text-red-600 font-semibold">{categoryError}</p>
                )}
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-[#1f1e1a]">Owner wallets</h3>
                        <p className="text-xs text-[#555]">Each valid Solana address receives donations when the vault pays out.</p>
                    </div>
                    <Button
                        type="button"
                        onClick={addWalletField}
                        icon="/icon-add.svg"
                        iconPosition="left"
                        bgColor="bg-transparent"
                        textColor="text-[#512da8]"
                        hoverColor="hover:squircle-[#fbd30c]"
                        hideBorder
                        disabled={isDeploying}
                    >
                        Add wallet
                    </Button>
                </div>
                <div className="space-y-3">
                    {wallets.map((wallet, index) => (
                        <div key={index} className="flex gap-3 items-center">
                            <input
                                type="text"
                                value={wallet}
                                onChange={(event) => handleWalletChange(index, event.target.value)}
                                placeholder="Wallet address"
                                className="squircle squircle-xl squircle-[#FFFFFC] flex-1 text-[#1f1e1a] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#512da8]"
                                disabled={isDeploying}
                            />
                            <Button
                                type="button"
                                onClick={() => removeWalletField(index)}
                                bgColor="squircle-[#eee]"
                                hoverColor="hover:squircle-[#ddd]"
                                textColor="text-[#333]"
                                hideBorder
                                disabled={isDeploying || wallets.length === 1}
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[#1f1e1a]">Signature approvals</label>
                    <p className="text-xs text-[#555]">
                        Vault closures currently require one owner signature. Multisig approvals are on the roadmap, so the threshold is fixed at 1 for now.
                    </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                    <label className="text-sm font-semibold text-[#1f1e1a] text-right">Estimated rent deposit</label>
                    <div className="flex items-center justify-end">
                        <span className="text-2xl font-bold text-[#512da8]">~{estimateVaultRentCost()} SOL</span>
                    </div>
                    <p className="text-xs text-[#555] text-right max-w-[300px]">
                        This deposit keeps the vault account alive. When you close the vault, it returns to the closing wallet.
                    </p>
                </div>
            </div>
            {error && (
                <div className="rounded-[10px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="rounded-[10px] border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {successMessage}
                </div>
            )}
            <Button
                type="submit"
                bgColor="squircle-[#512da8]"
                textColor="text-white"
                hoverColor="hover:squircle-[#3d2180]"
                icon="/arrow-right-white.svg"
                iconPosition="right"
                disabled={isDeploying || !!reservedWarning}
            >
                {isDeploying ? 'Deploying...' : 'Deploy campaign to devnet'}
            </Button>
        </form>
    );
}
