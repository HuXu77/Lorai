'use client';

import React from 'react';

export type KeywordType =
    | 'resist'
    | 'evasive'
    | 'ward'
    | 'challenger'
    | 'bodyguard'
    | 'rush'
    | 'reckless'
    | 'singer'
    | 'shift'
    | 'support';

interface AbilityBadgeProps {
    keyword: KeywordType;
    value?: number;
    size?: 'sm' | 'md';
}

const keywordConfig: Record<KeywordType, { icon: string; color: string; label: string }> = {
    resist: { icon: '🛡️', color: 'bg-blue-600', label: 'Resist' },
    evasive: { icon: '💨', color: 'bg-purple-600', label: 'Evasive' },
    ward: { icon: '✨', color: 'bg-yellow-600', label: 'Ward' },
    challenger: { icon: '⚔️', color: 'bg-red-600', label: 'Challenger' },
    bodyguard: { icon: '🛡️', color: 'bg-orange-600', label: 'Bodyguard' },
    rush: { icon: '⚡', color: 'bg-yellow-500', label: 'Rush' },
    reckless: { icon: '💢', color: 'bg-red-500', label: 'Reckless' },
    singer: { icon: '🎵', color: 'bg-pink-600', label: 'Singer' },
    shift: { icon: '⬆️', color: 'bg-cyan-600', label: 'Shift' },
    support: { icon: '🤝', color: 'bg-green-600', label: 'Support' },
};

export default function AbilityBadge({ keyword, value, size = 'sm' }: AbilityBadgeProps) {
    const config = keywordConfig[keyword];
    if (!config) return null;

    const sizeClasses = size === 'sm'
        ? 'text-[10px] px-1 py-0.5'
        : 'text-xs px-1.5 py-0.5';

    return (
        <span
            className={`${config.color} ${sizeClasses} rounded font-bold text-white inline-flex items-center gap-0.5 shadow-sm`}
            title={`${config.label}${value ? ` +${value}` : ''}`}
        >
            <span>{config.icon}</span>
            {value !== undefined && <span>+{value}</span>}
        </span>
    );
}

/**
 * Extract keywords from a card's parsedEffects
 */
export function extractKeywords(parsedEffects: any[]): Array<{ keyword: KeywordType; value?: number }> {
    const keywords: Array<{ keyword: KeywordType; value?: number }> = [];

    if (!parsedEffects) return keywords;

    for (const effect of parsedEffects) {
        // Check for keyword actions like 'keyword_resist', 'keyword_evasive'
        if (effect.action?.startsWith('keyword_')) {
            const keywordName = effect.action.replace('keyword_', '').toLowerCase() as KeywordType;
            if (keywordConfig[keywordName]) {
                keywords.push({
                    keyword: keywordName,
                    value: effect.amount
                });
            }
        }

        // Check for keyword field (from raw ability data)
        if (effect.keyword) {
            const keywordName = effect.keyword.toLowerCase() as KeywordType;
            if (keywordConfig[keywordName]) {
                keywords.push({
                    keyword: keywordName,
                    value: effect.amount || effect.keywordValueNumber
                });
            }
        }
    }

    return keywords;
}
