'use client';

const HEADING_CLASS = "text-[36px] font-semibold text-[#1f1e1a] w-full sm:w-auto text-center sm:text-left";

interface SectionTitleProps {
    text: string,
    id?: string
}

/**
 * Renders a standardized section heading with optional anchor id.
 *
 * @param props Heading text and optional anchor id.
 * @returns A styled heading element.
 */
export default function SectionTitle({text, id}: SectionTitleProps) {
    return (
        <div id={id} className="max-w-5xl mx-auto mt-[60px] px-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h2
                    className={HEADING_CLASS}
                >
                    {text}
                </h2>
            </div>
        </div>
    );
}
