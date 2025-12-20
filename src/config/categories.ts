/**
 * Campaign categories based on category.md
 */

export const CATEGORIES = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'ai', label: 'AI' },
  { value: 'consumer', label: 'Consumer' },
  { value: 'defi', label: 'DeFi' },
  { value: 'depin', label: 'DePin' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'stablecoins', label: 'Stablecoins' },
  { value: 'rwas', label: 'RWAs' },
  { value: 'non-profit', label: 'Non-Profit' },
  { value: 'public-good', label: 'Public Good' },
  { value: 'open-source', label: 'Open-Source' },
  { value: 'other', label: 'Other' },
] as const;

export type CategoryValue = typeof CATEGORIES[number]['value'];

export function getCategoryLabel(value: string): string {
  const category = CATEGORIES.find(c => c.value === value);
  return category?.label || value;
}

export function isValidCategory(value: string): boolean {
  return CATEGORIES.some(c => c.value === value);
}
