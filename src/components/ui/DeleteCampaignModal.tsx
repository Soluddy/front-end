'use client';

import Button from '@/components/ui/Button';

interface DeleteCampaignModalProps {
    campaignName?: string;
    slug?: string;
    onConfirm: () => Promise<void> | void;
    onClose: () => void;
    loading?: boolean;
    error?: string | null;
}

export default function DeleteCampaignModal({
    campaignName,
    slug,
    onConfirm,
    onClose,
    loading = false,
    error,
}: DeleteCampaignModalProps) {
    const handleBackdropClick = () => {
        if (!loading) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={handleBackdropClick}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="px-6 py-5 border-b border-[#f1f1f1]">
                    <h2 className="text-lg font-semibold text-[#111]">Close campaign?</h2>
                </div>
                <div className="px-6 py-5 space-y-4 text-sm text-[#333]">
                    <p>
                        Closing <span className="font-semibold">{campaignName ?? slug ?? 'this campaign'}</span> will:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-[#555]">
                        <li>Stop accepting new donations immediately.</li>
                        <li>Return the rent deposit to your connected wallet.</li>
                        <li>Remove the campaign page from Soluddy.</li>
                    </ul>
                    <p className="text-xs text-[#999]">
                        This action cannot be undone. You can always create a new campaign later if needed.
                    </p>
                    {error && (
                        <div className="rounded-[10px] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2 px-6 py-4 border-t border-[#f1f1f1]">
                    <Button
                        onClick={onClose}
                        bgColor="squircle-[#f4f4f4]"
                        textColor="text-[#333]"
                        hoverColor="hover:squircle-[#e8e8e8]"
                        hideBorder
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        bgColor="bg-red-600"
                        textColor="text-white"
                        hoverColor="hover:bg-red-700"
                        hideBorder
                        disabled={loading}
                    >
                        {loading ? 'Closing...' : 'Yes, close campaign'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
