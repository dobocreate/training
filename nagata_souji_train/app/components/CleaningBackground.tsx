import React from 'react';

interface CleaningBackgroundProps {
    opacity?: number;
    className?: string;
    zIndex?: number;
}

export const CleaningBackground: React.FC<CleaningBackgroundProps> = ({
    opacity = 0.05,
    className = "",
    zIndex = 0
}) => {
    return (
        <div
            className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
            style={{ opacity, zIndex }}
        >
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="cleaning-pattern-v2" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
                        {/* Broom */}
                        <g transform="translate(30, 20) scale(1.2)" className="text-gray-400 dark:text-zinc-500">
                            <path d="M5 2 L10 25 M0 25 H20 M3 25 L1 32 M7 25 L6 32 M13 25 L14 32 M17 25 L19 32" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinecap="round" />
                        </g>
                        {/* Spray Bottle */}
                        <g transform="translate(100, 30) scale(1.1)" className="text-gray-400 dark:text-zinc-500">
                            <path d="M5 0 H15 L14 8 H6 L5 0 M6 8 V25 H14 V8 M11 0 V-4 H15" stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinejoin="round" />
                        </g>
                        {/* Bucket */}
                        <g transform="translate(35, 100) scale(1.3)" className="text-gray-400 dark:text-zinc-500">
                            <path d="M0 0 L-4 22 H24 L20 0 M-4 0 Q10 -10 24 0" stroke="currentColor" fill="none" strokeWidth="1.8" />
                        </g>
                        {/* Bubbles / Sponges */}
                        <g transform="translate(110, 110)" className="text-gray-400 dark:text-zinc-500">
                            <circle cx="0" cy="0" r="10" stroke="currentColor" fill="none" strokeWidth="1.8" />
                            <circle cx="-12" cy="-10" r="4" stroke="currentColor" fill="none" strokeWidth="1.2" />
                            <circle cx="15" cy="5" r="3" stroke="currentColor" fill="none" strokeWidth="1" />
                        </g>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cleaning-pattern-v2)" />
            </svg>
        </div>
    );
};
