'use client';

import React from 'react';

interface ContinuousEffect {
    type: string;
    restrictionType?: string;
    targetCardIds?: string[];
    targetPlayerId?: string;
    sourceCardId?: string;
    duration?: string;
    expiresAt?: number;
}

interface ActiveEffectsPanelProps {
    activeEffects: ContinuousEffect[];
    currentTurn?: number;
}

/**
 * Display active temporary effects from the game state
 * Shows restrictions (can't play actions, can't ready, etc.)
 * and stat modifications with duration
 */
export default function ActiveEffectsPanel({ activeEffects, currentTurn }: ActiveEffectsPanelProps) {
    if (!activeEffects || activeEffects.length === 0) return null;

    // Group effects by type for display
    const restrictions = activeEffects.filter(e => e.type === 'restriction');
    const statMods = activeEffects.filter(e => e.type === 'stat_modification' || e.type === 'modify_stats');
    const abilityGrants = activeEffects.filter(e => e.type === 'ability_grant');
    const other = activeEffects.filter(e =>
        !['restriction', 'stat_modification', 'modify_stats', 'ability_grant'].includes(e.type)
    );

    const formatRestriction = (effect: ContinuousEffect) => {
        const icon = getRestrictionIcon(effect.restrictionType || '');
        const text = getRestrictionText(effect.restrictionType || effect.type);
        const duration = effect.duration ? formatDuration(effect.duration) : '';

        return (
            <div key={`${effect.type}-${effect.restrictionType}-${effect.sourceCardId}`}
                className="flex items-center gap-2 text-sm">
                <span className="text-lg">{icon}</span>
                <span className="text-yellow-200">{text}</span>
                {duration && <span className="text-gray-400 text-xs">({duration})</span>}
            </div>
        );
    };

    const formatOther = (effect: ContinuousEffect) => (
        <div key={`${effect.type}-${effect.sourceCardId}`}
            className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-lg">✨</span>
            <span>{effect.type.replace(/_/g, ' ')}</span>
        </div>
    );

    return (
        <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-600">
            <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                Active Effects
            </div>
            <div className="space-y-1">
                {restrictions.map(formatRestriction)}
                {abilityGrants.map(formatOther)}
                {statMods.map(formatOther)}
                {other.slice(0, 3).map(formatOther)}
                {other.length > 3 && (
                    <div className="text-xs text-gray-500">+{other.length - 3} more effects</div>
                )}
            </div>
        </div>
    );
}

function getRestrictionIcon(restrictionType: string): string {
    switch (restrictionType) {
        case 'cant_play_actions':
            return '🚫';
        case 'cant_ready':
            return '💤';
        case 'cant_quest':
            return '🛑';
        case 'cant_challenge':
            return '⛔';
        case 'cant_sing':
            return '🔇';
        default:
            return '⚠️';
    }
}

function getRestrictionText(restrictionType: string): string {
    switch (restrictionType) {
        case 'cant_play_actions':
            return "Opponents can't play actions";
        case 'cant_ready':
            return "Character can't ready";
        case 'cant_quest':
            return "Character can't quest";
        case 'cant_challenge':
            return "Character can't challenge";
        case 'cant_sing':
            return "Character can't sing songs";
        default:
            return restrictionType.replace(/_/g, ' ');
    }
}

function formatDuration(duration: string): string {
    switch (duration) {
        case 'next_turn_start':
            return 'until your next turn';
        case 'end_of_turn':
            return 'this turn';
        case 'while_active':
            return 'while in play';
        default:
            return duration.replace(/_/g, ' ');
    }
}
