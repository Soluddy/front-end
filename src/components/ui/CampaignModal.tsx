'use client';

import {useEffect, useState} from 'react';
import Button from "@/components/ui/Button";

interface Campaign {
    name: string;
    description: string;
    url: string;
    wallets: string[];
    slug: string;
    created_at: string;
    embed_code: string;
    module: string;
}

interface Props {
    onClose: () => void;
    onDeploy: (campaign: Campaign) => void;
}

export default function CampaignModal({onClose, onDeploy}: Props) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [wallets, setWallets] = useState<string[]>(['']);

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

    const handleWalletChange = (index: number, value: string) => {
        const updated = [...wallets];
        updated[index] = value;
        setWallets(updated);
    };

    const addWalletField = () => {
        setWallets([...wallets, '']);
    };

    const handleDeploy = () => {
        const filteredWallets = wallets.filter(w => w.trim() !== '');
        if (!name || filteredWallets.length === 0) {
            alert("Name and at least one wallet are required.");
            return;
        }

        const slugBase = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        const timestamp = Date.now().toString();
        const slug = `${slugBase}-${timestamp}`;

        const campaign: Campaign = {
            name,
            description,
            url,
            wallets: filteredWallets,
            slug,
            created_at: new Date().toISOString(),
            embed_code: `<iframe src="https://soluddy.com/${slug}" width="100%" height="140" frameborder="0"></iframe>`,
            module: "ContributorModule"
        };

        onDeploy(campaign);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-[#ffffff] rounded-[20px] shadow-lg w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-[#512ea8] h-[64px] px-6 py-4">
                    <h2 className="text-xl font-black text-white">Create New Campaign</h2>
                </div>
                {/* Body */}
                <div className="p-6">
                    <input
                        type="text"
                        className="w-full bg-white text-[#333333] rounded-[10px] px-4 py-2 mb-3 border-[2px] border-gray-200"
                        placeholder="Project or Individual Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <textarea
                        className="w-full bg-white text-[#333333] rounded-[10px] px-4 py-3 mb-2 border-[2px] border-gray-200"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />
                    <input
                        type="text"
                        className="w-full bg-white text-[#333333] rounded-[10px] px-4 py-2 mb-3 border-[2px] border-gray-200"
                        placeholder="URL (optional)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <div className="mb-3">
                        <label className="text-[#333333] font-bold mb-1 block">Wallets:</label>
                        {wallets.map((wallet, index) => (
                            <input
                                key={index}
                                type="text"
                                className="w-full bg-white text-[#333333] rounded-[10px] px-4 py-2 mb-2 border-[2px] border-gray-200"
                                placeholder={`Wallet address ${index + 1}`}
                                value={wallet}
                                onChange={(e) => handleWalletChange(index, e.target.value)}
                            />
                        ))}
                        <button
                            type="button"
                            onClick={addWalletField}
                            className="text-sm text-[#512ea8] underline mt-1 cursor-pointer"
                        >
                            + Add another wallet
                        </button>
                    </div>
                </div>
                {/* Footer */}
                <div className="bg-[#333333] h-[64px] flex">
                    <Button
                        onClick={onClose}
                        className="w-1/2 h-full rounded-none rounded-bl-[20px] p-0 border-none"
                        bgColor="bg-[#333333]"
                        textColor="text-white"
                        hoverColor="text-[#333333]"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeploy}
                        className="w-1/2 h-full rounded-none rounded-br-[20px] p-0 border-none"
                        bgColor="bg-[#fce77d]"
                        hoverColor="hover:bg-[#aeffde]"
                        textColor="text-[#333333]"
                        icon="/arrow-right.svg"
                        iconPosition="right"
                    >
                        Deploy Vault
                    </Button>
                </div>
            </div>
        </div>
    );
}
