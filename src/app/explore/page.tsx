'use client';

import {useCallback, useDeferredValue, useEffect, useMemo, useState} from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionTitle from "@/components/ui/SectionTitle";
import Button from "@/components/ui/Button";
import {useRuntimeConfig} from "@/config/RuntimeConfigContext";
import {Campaign} from "@/types/campaign";
import {CATEGORIES, getCategoryLabel} from "@/config/categories";
import {useDocumentTitle} from "@/hooks/useDocumentTitle";

/**
 * Presents the campaign explorer with search, filtering, and pagination driven by runtime configuration.
 *
 * @returns The Explore page UI.
 */
export default function ExplorePage() {
    useDocumentTitle('Explore Campaigns | Soluddy');
    const {
        isSlugFeatured,
        isSlugBanned,
        loaded: configLoaded,
    } = useRuntimeConfig();

    const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
    const [minOwners, setMinOwners] = useState<number>(0);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Use React's built-in deferred value instead of manual debouncing
    const deferredSearch = useDeferredValue(searchQuery);

    useEffect(() => {
        let cancelled = false;

        if (!configLoaded) {
            return () => {
                cancelled = true;
            };
        }

        const loadAllCampaigns = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/vaults/all');
                if (!response.ok) {
                    if (!cancelled) {
                        setError('Failed to fetch campaigns');
                        setAllCampaigns([]);
                    }
                    return;
                }

                const data = await response.json();
                if (cancelled) return;

                setAllCampaigns(data.vaults as Campaign[]);
                setCurrentPage(1);
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to load campaigns:', err);
                    setError(err instanceof Error ? err.message : 'Failed to load campaigns');
                    setAllCampaigns([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadAllCampaigns();

        return () => {
            cancelled = true;
        };
    }, [configLoaded]);

    const availableCampaigns = useMemo(() => {
        return allCampaigns.filter(c => !isSlugBanned(c.slug));
    }, [allCampaigns, isSlugBanned]);

    const featuredCampaigns = useMemo(() => {
        return availableCampaigns.filter(c => isSlugFeatured(c.slug));
    }, [availableCampaigns, isSlugFeatured]);

    const filteredCampaigns = useMemo(() => {
        let regular = availableCampaigns.filter(c => !isSlugFeatured(c.slug));

        const query = deferredSearch.trim().toLowerCase();
        if (query) {
            regular = regular.filter(c => {
                const description = c.description?.toLowerCase() ?? '';
                return (
                    c.name.toLowerCase().includes(query) ||
                    c.slug.toLowerCase().includes(query) ||
                    description.includes(query)
                );
            });
        }

        if (minOwners > 0) {
            regular = regular.filter(c => c.owners.length >= minOwners);
        }

        if (selectedCategories.length > 0) {
            regular = regular.filter(c => {
                const campaignCategories = c.categories ?? [];
                return selectedCategories.some(selected => campaignCategories.includes(selected));
            });
        }

        regular.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

        return regular;
    }, [availableCampaigns, isSlugFeatured, deferredSearch, minOwners, selectedCategories, sortBy]);

    const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
    const currentPageClamped = Math.min(currentPage, Math.max(totalPages, 1));
    const startIndex = (currentPageClamped - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

    const toggleCategory = useCallback((value: string) => {
        setSelectedCategories(prev => (
            prev.includes(value)
                ? prev.filter(item => item !== value)
                : [...prev, value]
        ));
        setCurrentPage(1);
    }, []);

    /**
     * Provides a shimmering placeholder while campaign data loads from the API.
     *
     * @returns JSX skeleton grid.
     */
    const renderLoadingSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {Array.from({length: 6}).map((_, idx) => (
                <div
                    key={idx}
                    className="squircle squircle-4xl squircle-gray-200 p-6 animate-pulse"
                >
                    <div className="h-6 bg-[#1f1e1a]/10 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-[#1f1e1a]/10 rounded w-full mb-2"></div>
                    <div className="h-4 bg-[#1f1e1a]/10 rounded w-5/6 mb-4"></div>
                    <div className="h-4 bg-[#1f1e1a]/10 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-[#1f1e1a]/10 rounded w-1/2 mb-4"></div>
                    <div className="h-10 bg-[#1f1e1a]/10 rounded-full w-full"></div>
                </div>
            ))}
        </div>
    );

    /**
     * Renders a campaign card with metadata and navigation.
     *
     * @param campaign The campaign to display.
     * @param isFeatured Flag indicating whether the campaign is featured.
     * @returns JSX element for a single campaign card.
     */
    const renderCampaignCard = (campaign: Campaign, isFeatured = false) => {
        return (
            <article
                key={campaign.slug}
                className={`${
                    isFeatured
                        ? 'bg-[#fbd30c] squircle-border-[#1f1e1a]/20 squircle-border-2'
                        : 'squircle-border-[#1f1e1a]/12 squircle-border-2'
                } squircle squircle-4xl squircle-gray-100 p-6 flex flex-col gap-4 transition-all duration-300 ease-out hover:-translate-y-1`}
            >
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold truncate">{campaign.name}</h3>
                    {isFeatured && (
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#1f1e1a] text-white flex-shrink-0">
                            Featured
                        </span>
                    )}
                </div>
                <p className="text-sm text-[#1f1e1a]/80 leading-relaxed line-clamp-3">
                    {campaign.description || "This campaign has not provided a description yet."}
                </p>
                <div className="text-sm text-[#1f1e1a]/70 space-y-1">
                    <div><strong>Slug:</strong> {campaign.slug}</div>
                    <div><strong>Owners:</strong> {campaign.owners.length}</div>
                    <div><strong>Created:</strong> {new Date(campaign.createdAt).toLocaleDateString()}</div>
                    <div className="truncate"><strong>PDA:</strong> {campaign.pda}</div>
                </div>
                <Button
                    onNavigate={`/${campaign.slug}`}
                    bgColor="squircle-[#1f1e1a]"
                    textColor="text-white"
                    hoverColor="hover:squircle-[#512da8]"
                    icon="/arrow-right-white.svg"
                    iconPosition="right"
                >
                    View Campaign
                </Button>
                {campaign.categories?.length ? (
                    <div className="border-t border-[#1f1e1a]/10 pt-3 mt-1 flex flex-wrap gap-2">
                        {campaign.categories.map(category => (
                            <span
                                key={category}
                                className="squircle squircle-lg squircle-border-[#1f1e1a]/20 squircle-border-1 squircle-gray-200 px-3 py-1 text-xs font-semibold text-[#1f1e1a]"
                            >
                                {getCategoryLabel(category)}
                            </span>
                        ))}
                    </div>
                ) : null}
            </article>
        );
    };

    return (
        <div className="min-h-screen bg-[#fffffc] text-[#1f1e1a] font-sans">
            <Header/>
            <main className="pb-24">
                <section className="mt-[40px] md:mt-[20px] text-center space-y-3">
                    <div className="flex flex-col items-center gap-2">
                        <SectionTitle text="Explore Campaigns"/>
                        <p className="max-w-3xl mx-auto px-6 text-lg leading-relaxed text-[#1f1e1a]">
                            Discover all campaigns deployed on Soluddy. Every vault is verified on-chain and distributes donations transparently.
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto px-6 mt-8 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-3">
                            <div className="w-full md:flex-1 relative">
                                <input
                                    type="search"
                                    placeholder="Search campaigns by name, slug, or description..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="squircle squircle-xl squircle-gray-100 w-full px-5 py-3 text-[#1f1e1a] focus:outline-none focus:ring-2 focus:ring-[#1f1e1a]/40"
                                    aria-label="Search campaigns"
                                />
                                {searchQuery !== deferredSearch && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#999]">
                                        Filtering...
                                    </span>
                                )}
                            </div>
                            <div className="relative w-full md:w-auto md:min-w-[180px]">
                                <select
                                    value={minOwners}
                                    onChange={(e) => {
                                        setMinOwners(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="squircle squircle-xl squircle-gray-100 w-full px-4 py-3 pr-10 text-[#1f1e1a] focus:outline-none focus:ring-2 focus:ring-[#1f1e1a]/40 transition-shadow appearance-none"
                                    aria-label="Filter by owner count"
                                >
                                    <option value="0">All owner counts</option>
                                    <option value="1">1+ owners</option>
                                    <option value="2">2+ owners</option>
                                    <option value="3">3+ owners</option>
                                    <option value="5">5+ owners</option>
                                </select>
                                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#1f1e1a]/60" aria-hidden="true">
                                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            </div>
                            <div className="relative w-full md:w-auto md:min-w-[180px]">
                                <select
                                    value={sortBy}
                                    onChange={(e) => {
                                        setSortBy(e.target.value as 'newest' | 'oldest' | 'name');
                                        setCurrentPage(1);
                                    }}
                                    className="squircle squircle-xl squircle-gray-100 w-full px-4 py-3 pr-10 text-[#1f1e1a] focus:outline-none focus:ring-2 focus:ring-[#1f1e1a]/40 transition-shadow appearance-none"
                                    aria-label="Sort campaigns"
                                >
                                    <option value="newest">Newest first</option>
                                    <option value="oldest">Oldest first</option>
                                    <option value="name">Name (A-Z)</option>
                                </select>
                                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#1f1e1a]/60" aria-hidden="true">
                                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => {
                                const isSelected = selectedCategories.includes(cat.value);
                                return (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => toggleCategory(cat.value)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border cursor-pointer ${
                                            isSelected
                                                ? 'bg-[#1f1e1a] text-white border-[#1f1e1a]'
                                                : 'bg-white text-[#1f1e1a] border-[#d9d9d9] hover:border-[#1f1e1a]'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-[#555]">
                            <span className="text-[#1f1e1a] font-semibold">
                                Showing {filteredCampaigns.length + featuredCampaigns.length} of {allCampaigns.length} campaigns
                            </span>
                            <div className="flex items-center gap-3">
                                {selectedCategories.length > 0 && (
                                    <span className="text-xs px-2 py-1 bg-[#1f1e1a]/10 rounded-full text-[#1f1e1a]">
                                        {selectedCategories.length} category{selectedCategories.length > 1 ? 'ies' : ''} selected
                                    </span>
                                )}
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setMinOwners(0);
                                        setSortBy('newest');
                                        setSelectedCategories([]);
                                        setCurrentPage(1);
                                    }}
                                    className="text-[#1f1e1a] font-semibold hover:underline cursor-pointer"
                                >
                                    Reset filters
                                </button>
                            </div>
                        </div>
                    </div>

                </section>

                {loading && (
                    <section className="max-w-6xl mx-auto mt-12 px-6">
                        <h2 className="text-2xl font-semibold mb-6 text-[#1f1e1a]">Loading Campaigns</h2>
                        {renderLoadingSkeleton()}
                    </section>
                )}

                {error && (
                    <div className="max-w-3xl mx-auto mt-10 px-6 text-center">
                        <div className="rounded-[16px] border border-red-300 bg-red-50 px-6 py-4 text-red-700">
                            <p className="font-semibold mb-2">Failed to load campaigns</p>
                            <p className="text-sm mb-4">{error}</p>
                            <Button
                                onClick={() => window.location.reload()}
                                bgColor="bg-red-600"
                                textColor="text-white"
                                hoverColor="hover:bg-red-700"
                                className="mx-auto"
                            >
                                Retry
                            </Button>
                        </div>
                    </div>
                )}

                {/* Featured Campaigns */}
                {!loading && featuredCampaigns.length > 0 && (
                    <section className="max-w-6xl mx-auto mt-12 px-6">
                        <h2 className="text-2xl font-semibold mb-6 text-[#1f1e1a]">Featured Campaigns</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {featuredCampaigns.map((campaign) => renderCampaignCard(campaign, true))}
                        </div>
                    </section>
                )}

                {/* All Campaigns */}
                {!loading && filteredCampaigns.length > 0 && (
                    <section className="max-w-6xl mx-auto mt-12 px-6">
                        <h2 className="text-2xl font-semibold mb-6 text-[#1f1e1a]">
                            {searchQuery ? 'Search Results' : 'All Campaigns'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {paginatedCampaigns.map((campaign) => renderCampaignCard(campaign, false))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPageClamped - 1))}
                                        disabled={currentPageClamped === 1}
                                        className="px-4 py-2 rounded-lg bg-[#1f1e1a] text-white disabled:bg-[#1f1e1a]/30 disabled:cursor-not-allowed hover:bg-[#1f1f1f] transition-colors"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                            // Show first page, last page, current page, and pages around current
                                            const showPage =
                                                page === 1 ||
                                                page === totalPages ||
                                                Math.abs(page - currentPage) <= 1;

                                            if (!showPage && page === 2) {
                                                return <span key={page} className="px-2 text-[#1f1e1a]/50">...</span>;
                                            }
                                            if (!showPage && page === totalPages - 1) {
                                                return <span key={page} className="px-2 text-[#1f1e1a]/50">...</span>;
                                            }
                                            if (!showPage) {
                                                return null;
                                            }

                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-3 py-2 rounded-lg transition-colors ${
                                                        currentPageClamped === page
                                                            ? 'bg-[#fbd30c] text-[#1f1e1a] font-semibold'
                                                            : 'bg-white border-2 border-[#1f1e1a]/10 text-[#1f1e1a] hover:border-[#1f1e1a]/30'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPageClamped + 1))}
                                        disabled={currentPageClamped === totalPages}
                                        className="px-4 py-2 rounded-lg bg-[#1f1e1a] text-white disabled:bg-[#1f1e1a]/30 disabled:cursor-not-allowed hover:bg-[#1f1f1f] transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>

                                <div className="text-sm text-[#555]">
                                    Page {currentPageClamped} of {totalPages} ({filteredCampaigns.length} campaigns)
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* No results */}
                {!loading && !error && filteredCampaigns.length === 0 && featuredCampaigns.length === 0 && (
                    <div className="max-w-3xl mx-auto mt-10 px-6 text-center">
                        <p className="text-lg text-[#555] mb-4">
                            {searchQuery ? 'No campaigns found matching your search.' : 'No campaigns deployed yet.'}
                        </p>
                        {!searchQuery && (
                            <Button
                                onNavigate="/"
                                bgColor="squircle-[#fbd30c]"
                                textColor="text-[#1f1e1a]"
                                hoverColor="hover:squircle-[#ffd93b]"
                                icon="/arrow-right.svg"
                                iconPosition="right"
                            >
                                Create First Campaign
                            </Button>
                        )}
                    </div>
                )}

                {/* CTA Section */}
                <section className="max-w-4xl mx-auto mt-20 px-6 text-center">
                    <div className="squircle squircle-4xl squircle-[#1f1e1a]  text-white rounded-[26px] py-10 px-6 shadow-lg space-y-4">
                        <h3 className="text-[28px] md:text-[36px] font-semibold">Create Your Campaign</h3>
                        <p className="text-sm md:text-base leading-relaxed text-white/80">
                            <span className="block">Join the Soluddy community and start receiving donations on Solana.</span>
                            <span className="block">Deploy your campaign in minutes with full blockchain transparency.</span>
                        </p>
                        <Button
                            onNavigate="/"
                            bgColor="squircle-[#fbd30c]"
                            textColor="text-[#1f1e1a]"
                            hoverColor="hover:squircle-[#ffd93b]"
                            icon="/arrow-right.svg"
                            iconPosition="right"
                        >
                            Get Started
                        </Button>
                    </div>
                </section>
            </main>
            <Footer/>
        </div>
    );
}
