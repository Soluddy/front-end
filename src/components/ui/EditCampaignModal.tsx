'use client';

import {useEffect, useMemo, useState} from 'react';
import {useConnection, useWallet} from '@solana/wallet-adapter-react';
import {Campaign} from '@/types/campaign';
import Button from '@/components/ui/Button';
import {buildUpdateVaultTransaction} from '@/lib/updateVault';
import {updateStoredCampaign} from '@/lib/campaignStorage';
import {useRuntimeConfig} from '@/config/RuntimeConfigContext';
import {CATEGORIES} from '@/config/categories';

interface EditCampaignModalProps {
    campaign: Campaign;
    onClose: () => void;
    onUpdated: (campaign: Campaign) => void;
}

const MAX_CATEGORIES = 5;

/**
 * Provides an authenticated editing surface for campaign owners to update metadata and categories.
 *
 * @param props Current campaign data and handlers for closing or persisting updates.
 * @returns A modal dialog for editing campaign details.
 */
export default function EditCampaignModal({campaign, onClose, onUpdated}: EditCampaignModalProps) {
    const {publicKey, sendTransaction} = useWallet();
    const {connection} = useConnection();
    const {reportEmail} = useRuntimeConfig();

    const initialCategories = useMemo(() => {
        if (campaign.categories?.length) {
            return campaign.categories;
        }
        return [];
    }, [campaign.categories]);

    const [name, setName] = useState(campaign.name);
    const [url, setUrl] = useState(campaign.url ?? '');
    const [description, setDescription] = useState(campaign.description ?? '');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    /**
     * Applies category selection changes with validation of the maximum allowed categories.
     *
     * @param value Category identifier to toggle.
     */
    const toggleCategory = (value: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(value)) {
                setError(null);
                return prev.filter(item => item !== value);
            }

            if (prev.length >= MAX_CATEGORIES) {
                setError(`You can select up to ${MAX_CATEGORIES} categories.`);
                return prev;
            }

            setError(null);
            return [...prev, value];
        });
    };

    const handleSubmit = async () => {
        setError(null);
        setSuccessMessage(null);

        if (!publicKey) {
            setError('Connect your wallet to update the campaign.');
            return;
        }

        const trimmedName = name.trim();
        const trimmedUrl = url.trim();
        const trimmedDescription = description.trim();

        const nameChanged = trimmedName && trimmedName !== campaign.name;
        const urlChanged = trimmedUrl !== (campaign.url ?? '');
        const descriptionChanged = trimmedDescription !== (campaign.description ?? '');

        const normalizedSelected = selectedCategories;
        const categoriesChanged = (() => {
            const current = campaign.categories ?? [];
            if (normalizedSelected.length !== current.length) return true;
            const set = new Set(normalizedSelected);
            return current.some(cat => !set.has(cat));
        })();

        if (!nameChanged && !urlChanged && !descriptionChanged && !categoriesChanged) {
            setError('No changes detected.');
            return;
        }

        if (categoriesChanged) {
            if (normalizedSelected.length === 0) {
                setError('Select at least one category.');
                return;
            }
            if (normalizedSelected.length > MAX_CATEGORIES) {
                setError(`Select at most ${MAX_CATEGORIES} categories.`);
                return;
            }
        }

        setIsSaving(true);

        try {
            const updatePayload = {
                owner: publicKey,
                slug: campaign.slug,
                name: nameChanged ? trimmedName : undefined,
                url: urlChanged ? trimmedUrl : undefined,
                description: descriptionChanged ? trimmedDescription : undefined,
                categories: categoriesChanged ? normalizedSelected : undefined,
            };

            const {transaction, error: buildError} = await buildUpdateVaultTransaction(updatePayload);
            if (buildError) {
                setError(buildError);
                setIsSaving(false);
                return;
            }

            if (!transaction.instructions.length) {
                setError('No changes to update.');
                setIsSaving(false);
                return;
            }

            const signature = await sendTransaction(transaction, connection, {skipPreflight: false});
            await connection.confirmTransaction(signature, 'confirmed');

            const updatedCampaign: Campaign = {
                ...campaign,
                name: nameChanged ? trimmedName : campaign.name,
                url: urlChanged ? trimmedUrl : campaign.url,
                description: descriptionChanged ? trimmedDescription : campaign.description,
                categories: categoriesChanged ? normalizedSelected : campaign.categories,
            };

            updateStoredCampaign(campaign.slug, {
                name: updatedCampaign.name,
                categories: updatedCampaign.categories,
            });

            setSuccessMessage(`Campaign updated successfully. Transaction: ${signature}`);
            onUpdated(updatedCampaign);
            onClose();
        } catch (err) {
            console.error('Failed to update campaign:', err);
            setError(err instanceof Error ? err.message : 'Failed to update campaign.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5]">
                    <h2 className="text-lg font-semibold text-[#333]">Edit Campaign</h2>
                    <Button
                        icon="/close.svg"
                        iconOnly
                        hideBorder
                        bgColor="bg-transparent"
                        hoverColor="hover:squircle-[#f4f4f4]"
                        onClick={onClose}
                    />
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[#333]">Campaign name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="w-full rounded-[10px] border-2 border-[#e5e5e5] px-4 py-2 focus:border-[#512da8] focus:outline-none"
                            placeholder="Campaign name"
                            disabled={isSaving}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[#333]">Public website</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(event) => setUrl(event.target.value)}
                            className="w-full rounded-[10px] border-2 border-[#e5e5e5] px-4 py-2 focus:border-[#512da8] focus:outline-none"
                            placeholder="https://example.org"
                            disabled={isSaving}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[#333]">Description</label>
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            className="w-full min-h-[100px] rounded-[10px] border-2 border-[#e5e5e5] px-4 py-2 focus:border-[#512da8] focus:outline-none"
                            placeholder="Share updates about your campaign..."
                            disabled={isSaving}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[#333]">Categories</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => {
                                const isSelected = selectedCategories.includes(cat.value);
                                return (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => toggleCategory(cat.value)}
                                        disabled={isSaving}
                                        className={`px-3 py-1 rounded-full border-2 text-sm font-semibold transition-colors ${
                                            isSelected
                                                ? 'bg-[#512da8] border-[#512da8] text-white'
                                                : 'bg-white border-[#d1d1d1] text-[#333] hover:border-[#512da8]'
                                        } ${
                                            !isSelected && selectedCategories.length >= MAX_CATEGORIES ? 'opacity-60' : ''
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-[#555]">
                            Select up to {MAX_CATEGORIES} categories. Need a new category? Email {reportEmail}.
                        </p>
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
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e5e5]">
                    <Button
                        onClick={onClose}
                        bgColor="squircle-[#f4f4f4]"
                        textColor="text-[#333]"
                        hoverColor="hover:squircle-[#e5e5e5]"
                        hideBorder
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        bgColor="squircle-[#512da8]"
                        textColor="text-white"
                        hoverColor="hover:squircle-[#3d2180]"
                        icon="/arrow-right-white.svg"
                        iconPosition="right"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
