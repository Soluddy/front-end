export const normalizeSlug = (slug: string): string => slug.toLowerCase();

export const stripNumericSuffix = (slug: string): string => slug.replace(/-\d+$/, '');

export const matchesBannedSlug = (
    slug: string | undefined | null,
    bannedList: string[],
): boolean => {
    if (!slug) return false;
    const normalized = normalizeSlug(slug);
    const withoutSuffix = stripNumericSuffix(normalized);
    return bannedList.includes(normalized) || bannedList.includes(withoutSuffix);
};

export const matchesBannedSlugBase = (
    slugBase: string | undefined | null,
    bannedList: string[],
): boolean => {
    if (!slugBase) return false;
    const normalized = normalizeSlug(slugBase);
    return bannedList.includes(normalized);
};
