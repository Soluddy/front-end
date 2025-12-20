export interface Campaign {
    name: string;
    slug: string;
    description: string;
    owners: string[];
    createdAt: string;
    pda: string;
    url: string;
    threshold: number;
    categories: string[];
}
