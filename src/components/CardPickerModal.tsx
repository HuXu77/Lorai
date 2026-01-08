'use client';

/**
 * CardPickerModal - Search and select cards from the full card database
 */

import React, { useState, useMemo, useCallback } from 'react';
import { CardInstance, CardType, InkColor } from '../engine/models';

// Import allCards for searching
const allCards = require('../../allCards.json');

export interface CardPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCard: (card: any) => void;
    title?: string;
    subtitle?: string;
}

const CARD_TYPES = ['Character', 'Action', 'Item', 'Location'];
const INK_COLORS = ['Amber', 'Amethyst', 'Emerald', 'Ruby', 'Sapphire', 'Steel'];

export function CardPickerModal({
    isOpen,
    onClose,
    onSelectCard,
    title = 'Select a Card',
    subtitle
}: CardPickerModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [colorFilter, setColorFilter] = useState<string>('');
    const [costMin, setCostMin] = useState<string>('');
    const [costMax, setCostMax] = useState<string>('');
    const [hoveredCard, setHoveredCard] = useState<any>(null);

    // Filter cards based on search and filters
    const filteredCards = useMemo(() => {
        if (!searchQuery && !typeFilter && !colorFilter && !costMin && !costMax) {
            return []; // Don't show all cards by default - require some filter
        }

        const query = searchQuery.toLowerCase().trim();
        const results: any[] = [];
        const seen = new Set<string>(); // Dedupe by fullName

        for (const card of allCards.cards) {
            // Skip duplicates
            if (seen.has(card.fullName)) continue;
            seen.add(card.fullName);

            // Name match
            if (query && !card.fullName.toLowerCase().includes(query) &&
                !card.name.toLowerCase().includes(query)) {
                continue;
            }

            // Type filter
            if (typeFilter && card.type !== typeFilter) continue;

            // Color filter
            if (colorFilter && card.color !== colorFilter) continue;

            // Cost filters
            if (costMin && card.cost < parseInt(costMin)) continue;
            if (costMax && card.cost > parseInt(costMax)) continue;

            results.push(card);

            // Limit results
            if (results.length >= 100) break;
        }

        return results;
    }, [searchQuery, typeFilter, colorFilter, costMin, costMax]);

    const handleSelect = useCallback((card: any) => {
        onSelectCard(card);
        setSearchQuery('');
        setHoveredCard(null);
    }, [onSelectCard]);

    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setTypeFilter('');
        setColorFilter('');
        setCostMin('');
        setCostMax('');
    }, []);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h2 className="text-xl font-bold text-white">{title}</h2>
                            {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* Search */}
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by card name..."
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        autoFocus
                    />

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-sm text-white"
                        >
                            <option value="">All Types</option>
                            {CARD_TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>

                        <select
                            value={colorFilter}
                            onChange={(e) => setColorFilter(e.target.value)}
                            className="px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-sm text-white"
                        >
                            <option value="">All Colors</option>
                            {INK_COLORS.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                value={costMin}
                                onChange={(e) => setCostMin(e.target.value)}
                                placeholder="Min"
                                min="0"
                                max="15"
                                className="w-16 px-2 py-1.5 bg-gray-800 border border-gray-600 rounded text-sm text-white"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                                type="number"
                                value={costMax}
                                onChange={(e) => setCostMax(e.target.value)}
                                placeholder="Max"
                                min="0"
                                max="15"
                                className="w-16 px-2 py-1.5 bg-gray-800 border border-gray-600 rounded text-sm text-white"
                            />
                            <span className="text-gray-500 text-sm">◆</span>
                        </div>

                        {(searchQuery || typeFilter || colorFilter || costMin || costMax) && (
                            <button
                                onClick={clearFilters}
                                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Card List */}
                <div className="flex-1 overflow-auto p-4">
                    {filteredCards.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            {searchQuery || typeFilter || colorFilter ?
                                'No cards found matching your search.' :
                                'Start typing to search for cards...'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {filteredCards.map((card, index) => (
                                <div
                                    key={`${card.fullName}-${index}`}
                                    className="relative"
                                    onMouseEnter={() => setHoveredCard(card)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <button
                                        onClick={() => handleSelect(card)}
                                        className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-lg transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            {/* Cost Badge */}
                                            <span className={`
                                                flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm
                                                ${getColorClass(card.color)}
                                            `}>
                                                {card.cost}
                                            </span>

                                            {/* Card Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-white truncate">
                                                    {card.fullName}
                                                </div>
                                                <div className="text-xs text-gray-400 truncate">
                                                    {card.type}
                                                    {card.strength !== undefined && ` • ${card.strength}/${card.willpower}`}
                                                    {card.lore !== undefined && ` • ◊${card.lore}`}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Card Preview Tooltip */}
                {hoveredCard && (
                    <div className="fixed bottom-4 right-4 w-64 p-4 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-60">
                        <div className="font-bold text-white mb-1">{hoveredCard.fullName}</div>
                        <div className="text-sm text-gray-400 mb-2">
                            {hoveredCard.type} • {hoveredCard.color} • Cost {hoveredCard.cost}
                        </div>
                        {hoveredCard.strength !== undefined && (
                            <div className="text-sm text-gray-300">
                                Strength: {hoveredCard.strength} | Willpower: {hoveredCard.willpower}
                            </div>
                        )}
                        {hoveredCard.lore !== undefined && (
                            <div className="text-sm text-gray-300">
                                Lore: {hoveredCard.lore}
                            </div>
                        )}
                        {hoveredCard.abilities && hoveredCard.abilities.length > 0 && (
                            <div className="mt-2 text-xs text-gray-400 line-clamp-3">
                                {hoveredCard.abilities[0]?.fullText || 'No ability text'}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-gray-700 text-sm text-gray-500">
                    {filteredCards.length > 0 ? (
                        `Showing ${filteredCards.length} cards${filteredCards.length >= 100 ? ' (limit reached)' : ''}`
                    ) : (
                        'Type a name or apply filters to search'
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper to get Tailwind color class for ink color
function getColorClass(color: string): string {
    switch (color) {
        case 'Amber': return 'bg-amber-500 text-white';
        case 'Amethyst': return 'bg-purple-500 text-white';
        case 'Emerald': return 'bg-emerald-500 text-white';
        case 'Ruby': return 'bg-red-500 text-white';
        case 'Sapphire': return 'bg-blue-500 text-white';
        case 'Steel': return 'bg-gray-500 text-white';
        default: return 'bg-gray-600 text-white';
    }
}
