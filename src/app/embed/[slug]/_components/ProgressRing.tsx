import React from 'react';

interface ProgressRingProps {
    size: number;
    strokeWidth: number;
    percentage: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({size, strokeWidth, percentage}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.min(100, Math.max(0, percentage));
    const dashOffset = circumference - (clamped / 100) * circumference;

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
                fill="transparent"
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#512da8"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
            />
        </svg>
    );
};
