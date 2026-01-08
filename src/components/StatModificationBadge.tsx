'use client';

interface StatModificationBadgeProps {
    modification: number;
    stat: 'strength' | 'willpower' | 'lore';
    size?: 'sm' | 'md';
}

export default function StatModificationBadge({
    modification,
    stat,
    size = 'sm'
}: StatModificationBadgeProps) {
    if (modification === 0) return null;

    const isPositive = modification > 0;
    const displayValue = isPositive ? `+${modification}` : `${modification}`;

    // Size variants
    const sizeClasses = {
        sm: 'text-[8px] px-1 py-0.5 min-w-[14px]',
        md: 'text-[10px] px-1.5 py-0.5 min-w-[18px]'
    };

    // Color based on stat type and positive/negative
    const colorClasses = isPositive
        ? 'bg-green-600 text-white border-green-400'
        : 'bg-red-600 text-white border-red-400';

    // Icon for stat type
    const statIcons = {
        strength: '⚔️',
        willpower: '🛡️',
        lore: '◆'
    };

    return (
        <div
            className={`
                inline-flex items-center justify-center
                rounded-full font-bold
                border shadow-sm
                ${sizeClasses[size]}
                ${colorClasses}
            `}
            title={`${isPositive ? 'Buffed' : 'Debuffed'} ${stat}: ${displayValue}`}
        >
            {displayValue}
        </div>
    );
}
