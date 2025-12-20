'use client';

import {useEffect, useMemo, useState} from 'react';
import Header from '@/components/Header';
import Button from '@/components/ui/Button';
import {useConnection, useWallet} from '@solana/wallet-adapter-react';
import {Buffer} from 'buffer';
import {
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction
} from '@solana/web3.js';
import Footer from "@/components/Footer";
import CopyEmbedCode from "@/components/ui/CopyEmbedCode";
import EditCampaignModal from "@/components/ui/EditCampaignModal";
import DeleteCampaignModal from "@/components/ui/DeleteCampaignModal";
import {useParams, useRouter} from 'next/navigation';
import {buildCloseVaultTransaction, isVaultOwner} from "@/lib/closeVault";
import {getCategoryLabel} from "@/config/categories";
import {useRuntimeConfig} from "@/config/RuntimeConfigContext";
import type {Campaign as CampaignSummary} from "@/types/campaign";
import {soluddyProgramPublicKey} from '@/config/program';

interface CampaignDetail extends CampaignSummary {
    embedCode: string;
    module: string;
}

const VAULT_SEED_PREFIX = new TextEncoder().encode("vault");
const DONATE_DISCRIMINATOR = Buffer.from([0x79, 0xba, 0xda, 0xd3, 0x49, 0x46, 0xc4, 0xb4]);
const LAMPORTS_PER_SOL_BIGINT = BigInt(LAMPORTS_PER_SOL);
/**
 * Converts a SOL amount (string) into lamports while validating precision up to nine decimals.
 *
 * @param value SOL amount entered by the user.
 * @returns Amount expressed in lamports.
 */
const parseSolToLamports = (value: string): bigint => {
    const trimmed = value.trim();
    if (!trimmed) {
        return 0n;
    }

    if (!/^\d+(\.\d{0,9})?$/.test(trimmed)) {
        throw new Error("Amount must be a valid SOL value (up to 9 decimal places).");
    }

    const [wholePart, fractionalPart = ""] = trimmed.split(".");
    const fractionalPadded = (fractionalPart + "000000000").slice(0, 9);

    const wholeLamports = BigInt(wholePart) * LAMPORTS_PER_SOL_BIGINT;
    const fractionalLamports = BigInt(fractionalPadded);

    return wholeLamports + fractionalLamports;
};

/**
 * Formats a lamport balance into a SOL string trimmed of trailing zeros.
 *
 * @param lamports Amount in lamports.
 * @returns Readable SOL value.
 */
const formatLamportsToSol = (lamports: bigint): string => {
    const whole = lamports / LAMPORTS_PER_SOL_BIGINT;
    const fractional = lamports % LAMPORTS_PER_SOL_BIGINT;
    const fractionalStr = fractional
        .toString()
        .padStart(9, "0")
        .replace(/0+$/, "");

    return fractionalStr ? `${whole.toString()}.${fractionalStr}` : whole.toString();
};

/**
 * Builds the Solana transaction instruction that splits donations across owners.
 *
 * @param lamports Donation amount in lamports.
 * @param payer Public key of the donor.
 * @param owners Array of campaign owner public keys.
 * @param slug Campaign slug used to derive the vault PDA.
 * @returns TransactionInstruction configured for the donate operation.
 */
const buildDonateInstruction = (
    lamports: bigint,
    payer: PublicKey,
    owners: PublicKey[],
    slug: string,
) => {
    const encoder = new TextEncoder();
    const slugSeed = encoder.encode(slug);

    const [vaultPda] = PublicKey.findProgramAddressSync(
        [VAULT_SEED_PREFIX, slugSeed],
        soluddyProgramPublicKey,
    );

    const data = Buffer.alloc(16);
    DONATE_DISCRIMINATOR.copy(data, 0);
    data.writeBigUInt64LE(lamports, 8);

    return new TransactionInstruction({
        programId: soluddyProgramPublicKey,
        keys: [
            {pubkey: vaultPda, isSigner: false, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
            ...owners.map(owner => ({
                pubkey: owner,
                isSigner: false,
                isWritable: true,
            })),
        ],
        data,
    });
};

/**
 * Displays a single campaign with donation capabilities, owner controls, and moderation messaging.
 *
 * @returns Campaign detail page for the requested slug.
 */
export default function Campaign() {
    const params = useParams<{ slug?: string | string[] }>();
    const slugValue = params?.slug;
    const slug = Array.isArray(slugValue)
        ? slugValue[0]?.toLowerCase()
        : slugValue?.toLowerCase();
    const {
        appBaseUrl,
        reportEmail,
        isSlugBanned,
    } = useRuntimeConfig();
    const router = useRouter();
    const bannedSlug = isSlugBanned(slug);

    const [amount, setAmount] = useState('');
    const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
    const [campaignLoading, setCampaignLoading] = useState(true);
    const [campaignError, setCampaignError] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [donationStatus, setDonationStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({type: null, message: ''});
    const [donating, setDonating] = useState(false);
    const {publicKey, sendTransaction} = useWallet();
    const {connection} = useConnection();
    const isOwner = publicKey && campaign
        ? isVaultOwner(publicKey.toBase58(), campaign.owners)
        : false;
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const reportLink = useMemo(() => {
        if (!campaign) return null;
        const subject = encodeURIComponent(`Report Soluddy campaign: ${campaign.slug}`);
        const body = encodeURIComponent([
            `Campaign slug: ${campaign.slug}`,
            `Campaign name: ${campaign.name}`,
            ``,
            `Please describe the issue you noticed:`,
            ``,
            ``,
            `---`,
            `This report was generated from the campaign page.`,
        ].join('\n'));
        return `mailto:${reportEmail}?subject=${subject}&body=${body}`;
    }, [campaign, reportEmail]);

    const contactHref = useMemo(() => {
        if (!campaign) return null;
        const subject = encodeURIComponent(`Update Soluddy campaign: ${campaign.name}`);
        return `mailto:${reportEmail}?subject=${subject}`;
    }, [campaign, reportEmail]);

    useEffect(() => {
        let cancelled = false;

        if (bannedSlug) {
            setCampaign(null);
            setCampaignError('This campaign has been blocked by Soluddy moderators.');
            setDeleteError(null);
            setDeleteLoading(false);
            setCampaignLoading(false);
            return () => {
                cancelled = true;
            };
        }

        const loadCampaign = async (retryCount = 0) => {
            if (!slug) {
                setCampaignLoading(false);
                setCampaignError('Missing slug parameter.');
                setDeleteError(null);
                setDeleteLoading(false);
                return;
            }

            setCampaignLoading(true);
            try {
                const response = await fetch(`/api/vault/${slug}`);
                if (!response.ok) {
                    const {error} = await response.json().catch(() => ({error: 'Unknown error'}));

                    if (error === 'Campaign not found' && retryCount < 3) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        if (!cancelled) {
                            return loadCampaign(retryCount + 1);
                        }
                        return;
                    }

                    if (!cancelled) {
                        console.error('Failed to load campaign:', error);
                        setCampaign(null);
                        setCampaignError(error || 'Failed to load campaign.');
                        setDeleteError(null);
                        setDeleteLoading(false);
                    }
                    return;
                }

                const data = await response.json();
                if (cancelled) return;

                const owners: string[] = data.owners ?? [];
                const embedCode = `<iframe src="${appBaseUrl}/embed/${data.slug}" width="100%" height="140" style="border:0;"></iframe>`;

                setCampaign({
                    name: data.name,
                    description: data.description,
                    url: data.url,
                    owners,
                    slug: data.slug,
                    createdAt: data.createdAt,
                    embedCode,
                    module: 'ContributorModule',
                    pda: data.pda,
                    threshold: data.threshold,
                    categories: Array.isArray(data.categories)
                        ? data.categories
                        : (data.category ? [data.category] : []),
                });
                setDeleteError(null);
                setDeleteLoading(false);
                setCampaignError(null);
            } catch (error) {
                if (!cancelled) {
                    setCampaign(null);
                    setCampaignError(
                        error instanceof Error ? error.message : 'Failed to load campaign.'
                    );
                    setDeleteError(null);
                    setDeleteLoading(false);
                }
            } finally {
                if (!cancelled) {
                    setCampaignLoading(false);
                }
            }
        };

        void loadCampaign();

        return () => {
            cancelled = true;
        };
    }, [slug, bannedSlug, appBaseUrl]);

    const handleDonate = async () => {
        setDonationStatus({type: null, message: ''});

        if (!publicKey) {
            setDonationStatus({type: 'error', message: 'Please connect your wallet first.'});
            return;
        }

        if (bannedSlug) {
            setDonationStatus({type: 'error', message: 'This campaign is no longer available.'});
            return;
        }

        let lamports: bigint;
        try {
            lamports = parseSolToLamports(amount);
        } catch (error) {
            setDonationStatus({
                type: 'error',
                message: error instanceof Error ? error.message : 'Invalid amount'
            });
            return;
        }

        if (lamports <= 0) {
            setDonationStatus({type: 'error', message: 'Please enter an amount greater than zero.'});
            return;
        }

        if (lamports > BigInt("18446744073709551615")) {
            setDonationStatus({type: 'error', message: 'Amount exceeds the maximum allowed.'});
            return;
        }

        if (!campaign) {
            setDonationStatus({type: 'error', message: 'Campaign data is not available yet.'});
            return;
        }

        const ownerPubkeys = campaign.owners.map(addr => new PublicKey(addr));
        if (ownerPubkeys.length === 0) {
            setDonationStatus({
                type: 'error',
                message: 'This campaign does not have any owners configured yet.',
            });
            return;
        }

        const ownerCountBigInt = BigInt(ownerPubkeys.length);
        const perOwnerLamports = lamports / ownerCountBigInt;
        const remainderLamports = lamports % ownerCountBigInt;

        const summaryLines: string[] = [
            `Total donation: ${formatLamportsToSol(lamports)} SOL`,
            `Owners receiving funds: ${ownerPubkeys.length}`,
            `Each owner receives at least ${formatLamportsToSol(perOwnerLamports)} SOL`,
        ];

        if (remainderLamports > 0n) {
            summaryLines.push(
                `First owner receives an extra ${formatLamportsToSol(remainderLamports)} SOL to cover the remainder.`
            );
        }

        const summary = summaryLines.join('\n');

        if (typeof window !== 'undefined' && !window.confirm(`${summary}\n\nProceed with donation?`)) {
            return;
        }

        const instruction = buildDonateInstruction(
            lamports,
            publicKey,
            ownerPubkeys,
            campaign.slug,
        );
        const tx = new Transaction().add(instruction);
        tx.feePayer = publicKey;

        setDonating(true);
        try {
            const signature = await sendTransaction(tx, connection, {skipPreflight: false});
            await connection.confirmTransaction(signature, 'confirmed');
            setDonationStatus({
                type: 'success',
                message: `Success! Transaction confirmed: ${signature.substring(0, 8)}...${signature.substring(signature.length - 8)}`
            });
            setAmount('');
            console.log('Tx Hash:', signature);
        } catch (err) {
            console.error('Transaction error:', err);
            setDonationStatus({
                type: 'error',
                message: err instanceof Error ? err.message : 'Transaction failed. Please try again.'
            });
        } finally {
            setDonating(false);
        }
    };

    const handleDeleteCampaign = async () => {
        if (!campaign) {
            setDeleteError('Campaign data is not available yet.');
            return;
        }

        if (!publicKey) {
            setDeleteError('Connect your wallet first.');
            return;
        }

        if (!isOwner) {
            setDeleteError('Only campaign owners can delete this campaign.');
            return;
        }

        setDeleteError(null);
        setDeleteLoading(true);

        try {
            const {transaction} = await buildCloseVaultTransaction({
                owner: publicKey,
                slug: campaign.slug,
            });

            const signature = await sendTransaction(transaction, connection, {skipPreflight: false});
            await connection.confirmTransaction(signature, 'confirmed');

            setShowDeleteModal(false);
            router.push('/explore');
        } catch (err) {
            console.error('Failed to close vault:', err);
            const message = err instanceof Error ? err.message : 'Failed to close campaign.';
            setDeleteError(message);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleCampaignUpdated = (updated: CampaignSummary) => {
        setCampaign(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                ...updated,
            };
        });
    };

    return (
        <div className="min-h-screen bg-[#fffffc] text-[#1f1e1a] font-sans">
            <Header/>
            <div className="text-center space-y-4 w-full max-w-2xl mx-auto mt-[60px] mb-[30px] px-6 gap-10">
                <h1 className="text-[32px] md:text-[40px] leading-tight font-semibold">
                    {campaign?.name ?? (campaignLoading ? 'Loading campaign...' : slug ?? 'Campaign')}
                </h1>
                {campaign && (
                    <>
                        <p className="text-lg">{campaign.description}</p>
                        {campaign.url && (
                            <a
                                href={campaign.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-[#111] underline font-medium hover:text-black transition"
                            >
                                Visit website
                            </a>
                        )}
                        {campaign.categories?.length ? (
                            <div className="flex flex-wrap justify-center gap-2 mt-2">
                                {campaign.categories.map(category => (
                                    <span
                                        key={category}
                                        className="px-3 py-1 text-xs font-bold rounded-full bg-[#1f1e1a]/10 text-[#1f1e1a]"
                                    >
                                        {getCategoryLabel(category)}
                                    </span>
                                ))}
                            </div>
                        ) : null}
                    </>
                )}
                {campaignError && (
                    <p className="text-sm text-red-600 font-semibold">{campaignError}</p>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <input
                            type="text"
                            inputMode="decimal"
                            pattern="^\\d*(?:\\.\\d{0,9})?$"
                            value={amount}
                            onChange={(event) => {
                                const { value } = event.target;
                                if (value === '' || /^\d*(?:\.\d{0,9})?$/.test(value)) {
                                    setAmount(value);
                                }
                            }}
                            className="w-full px-5 py-3 bg-[#1f1e1a] text-white rounded-[50px] text-center placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fbd30c]"
                            placeholder="Enter amount in SOL"
                            aria-label="Donation amount in SOL"
                        />
                        <p className="text-xs text-[#bbb]">
                            Enter up to 9 decimal places. Example: <span className="font-mono">0.125</span> SOL.
                        </p>
                    </div>
                    <Button
                        onClick={handleDonate}
                        bgColor="squircle-[#fbd30c]"
                        textColor="text-black"
                        height="h-[42px]"
                        icon="/arrow-right.svg"
                        iconPosition="right"
                        disabled={
                            donating ||
                            campaignLoading ||
                            !campaign ||
                            bannedSlug
                        }
                    >
                        {donating ? 'Processing...' : 'Donate'}
                    </Button>
                    {donationStatus.type && (
                        <div className={`rounded-[12px] px-4 py-3 text-sm font-medium ${
                            donationStatus.type === 'success'
                                ? 'bg-green-50 border border-green-300 text-green-700'
                                : 'bg-red-50 border border-red-300 text-red-700'
                        }`}>
                            {donationStatus.message}
                        </div>
                    )}
                    {campaignLoading && (
                        <p className="text-sm text-[#333]">Loading campaign data...</p>
                    )}
                    {bannedSlug && (
                        <p className="text-sm text-red-600 font-semibold">
                            This campaign has been blocked and can no longer receive donations.
                        </p>
                    )}
                    {campaign && (
                        <p className="text-xs text-[#555]">
                            Vault PDA: {campaign.pda}
                        </p>
                    )}
                    {isOwner && (
                        <div className="pt-4 border-t border-[#1f1e1a]/20 space-y-3">
                            <p className="text-sm font-semibold text-[#333]">Owner actions</p>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-center sm:items-center sm:gap-3 gap-2">
                                <Button
                                    onClick={() => setShowEditModal(true)}
                                    bgColor="squircle-[#512da8]"
                                    textColor="text-white"
                                    hoverColor="hover:squircle-[#3d2180]"
                                    hideBorder
                                >
                                    Edit Campaign
                                </Button>
                                <Button
                                    onClick={() => {
                                        setDeleteError(null);
                                        setShowDeleteModal(true);
                                    }}
                                    bgColor="squircle-red-600"
                                    textColor="text-white"
                                    hoverColor="hover:squircle-red-700"
                                    hideBorder
                                    disabled={deleteLoading}
                                >
                                    {deleteLoading ? 'Deleting...' : 'Delete Campaign'}
                                </Button>
                                {contactHref && (
                                    <Button
                                        bgColor="squircle-[#fbd30c]"
                                        height="h-[48px]"
                                        onPrimaryAction={() => window.location.href = contactHref}
                                        icon="/arrow-right.svg"
                                        iconPosition="right"
                                    >
                                        Contact support
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-[#555]">
                                Closing refunds the rent deposit to your wallet and removes this campaign permanently.
                            </p>
                            {deleteError && (
                                <p className="text-xs text-red-600 font-semibold">{deleteError}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="text-center space-y-4 w-full max-w-4xl mx-auto mb-[20px] px-6 gap-10">
                {campaign && !bannedSlug ? (
                    <div className="pt-6 border-t border-[#1f1e1a]/30 text-sm text-[#333]">
                        <p className="mb-2 font-semibold">Share / Embed</p>
                        <CopyEmbedCode code={campaign.embedCode}/>
                        <p className="mt-3 text-xs text-[#555]">
                            Donations are streamed directly to the configured owners, so live totals are not aggregated on-chain yet.
                        </p>
                        {reportLink && (
                            <div className="mt-6 flex justify-center">
                                <Button
                                    onPrimaryAction={() => window.location.href = reportLink}
                                    bgColor="squircle-[#eee]"
                                    textColor="text-[#333]"
                                    hoverColor="hover:squircle-[#ddd]"
                                    hideBorder
                                >
                                    Report this campaign
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="pt-6 border-t border-[#1f1e1a]/30 text-sm text-[#333]">
                        <p className="mb-2 font-semibold">
                            {bannedSlug ? 'This campaign has been blocked.' : 'Campaign details unavailable.'}
                        </p>
                    </div>
                )}
            </div>
            <Footer/>
            {campaign && showEditModal && (
                <EditCampaignModal
                    campaign={campaign}
                    onClose={() => setShowEditModal(false)}
                    onUpdated={handleCampaignUpdated}
                />
            )}
            {campaign && showDeleteModal && (
                <DeleteCampaignModal
                    campaignName={campaign.name}
                    slug={campaign.slug}
                    loading={deleteLoading}
                    error={deleteError}
                    onConfirm={handleDeleteCampaign}
                    onClose={() => {
                        if (!deleteLoading) {
                            setDeleteError(null);
                            setShowDeleteModal(false);
                        }
                    }}
                />
            )}
        </div>
    );
}
