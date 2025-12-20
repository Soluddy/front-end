/**
 * Local storage utility for tracking created campaigns
 * Temporary solution until proper event indexing is available
 */

const STORAGE_KEY = 'soluddy_campaigns';

export interface StoredCampaign {
  slug: string;
  name: string;
  createdAt: string;
  pda: string;
  categories?: string[];
}

/**
 * Get all stored campaign slugs
 */
export function getStoredCampaigns(): StoredCampaign[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    return JSON.parse(stored) as StoredCampaign[];
  } catch (error) {
    console.error('Failed to load stored campaigns:', error);
    return [];
  }
}

/**
 * Add a newly created campaign to storage
 */
export function addStoredCampaign(campaign: StoredCampaign): void {
  if (typeof window === 'undefined') return;

  try {
    const campaigns = getStoredCampaigns();

    const exists = campaigns.some(c => c.slug === campaign.slug);
    if (exists) return;

    campaigns.unshift(campaign);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  } catch (error) {
    console.error('Failed to save campaign:', error);
  }
}

/**
 * Remove a campaign from storage
 */
export function removeStoredCampaign(slug: string): void {
  if (typeof window === 'undefined') return;

  try {
    const campaigns = getStoredCampaigns();
    const filtered = campaigns.filter(c => c.slug !== slug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove campaign:', error);
  }
}

/**
 * Update an existing campaign in storage
 */
export function updateStoredCampaign(slug: string, updates: Partial<StoredCampaign>): void {
  if (typeof window === 'undefined') return;

  try {
    const campaigns = getStoredCampaigns();
    const index = campaigns.findIndex(c => c.slug === slug);
    if (index === -1) return;

    campaigns[index] = {
      ...campaigns[index],
      ...updates,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  } catch (error) {
    console.error('Failed to update campaign:', error);
  }
}

/**
 * Clear all stored campaigns
 */
export function clearStoredCampaigns(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear campaigns:', error);
  }
}

/**
 * Get all unique slugs (stored + featured)
 */
export function getAllCampaignSlugs(featuredSlugs: string[]): string[] {
  const stored = getStoredCampaigns().map(c => c.slug);
  return [...new Set([...featuredSlugs, ...stored])];
}
