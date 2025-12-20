import React from 'react';

interface LabelValueProps {
    label: string;
    value: React.ReactNode;
}

export const LabelValue: React.FC<LabelValueProps> = ({label, value}) => (
    <div className="text-[10px] sm:text-xs text-[#1f1e1a]/80">
        <span className="font-semibold uppercase tracking-wide">{label}: </span>
        <span className="font-medium break-all">{value}</span>
    </div>
);
