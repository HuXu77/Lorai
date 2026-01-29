'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CardInstance } from '../engine/models';
import Card from './Card';
import AbilityBadge, { extractKeywords } from './AbilityBadge';

// Standard card sizes used throughout the app
// Cards have a 5:7 aspect ratio (width:height)
export const CARD_SIZES = {
    xs: 'w-16 h-[90px]',    // 64x90px - very compact (e.g., ink piles)
    sm: 'w-20 h-28',        // 80x112px - compact (play area)
    hand: 'w-24 h-[134px]', // 96x134px - 1.2x of sm (Player Hand)
    md: 'w-28 h-40',        // 112x160px - medium (hand cards)
    lg: 'w-32 h-44',        // 128x176px - large (modals, selection)
    xl: 'w-40 h-56',        // 160x224px - extra large
    zoom: 'w-72 h-[403px]', // 288x403px - fixed hover zoom size (1.2x scale for readability)
    zoomLandscape: 'w-[420px] h-[300px]', // 420x300px - larger frame for rotated locations
} as const;

// Zoom dimensions in pixels for calculations
const ZOOM_WIDTH = 288;
const ZOOM_HEIGHT = 403;
const ZOOM_WIDTH_LANDSCAPE = 420;
const ZOOM_HEIGHT_LANDSCAPE = 300;
const VIEWPORT_PADDING = 16; // Minimum distance from viewport edge

export type CardSize = keyof typeof CARD_SIZES;

export interface ZoomableCardProps {
    card: CardInstance;
    /** Predefined size: 'xs' | 'sm' | 'md' | 'lg' | 'xl', or custom Tailwind classes */
    size?: CardSize | string;
    /** How zoom is triggered */
    zoomTrigger?: 'hover' | 'none';
    /** Show selection overlay (X mark and red tint) */
    selected?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Show ability badges below card */
    showAbilities?: boolean;
    /** Card was just played and can't act yet */
    isDrying?: boolean;
    /** Additional classes for the wrapper */
    className?: string;
}

function ZoomableCard({
    card,
    size = 'md',
    zoomTrigger = 'hover',
    selected = false,
    onClick,
    showAbilities = false,
    isDrying = false,
    className = ''
}: ZoomableCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [cardRect, setCardRect] = useState<DOMRect | null>(null);

    // Detect stat modifications for glow effect
    const hasBuffs = (
        (card.strength !== undefined && card.baseStrength !== undefined && card.strength > card.baseStrength) ||
        (card.willpower !== undefined && card.baseWillpower !== undefined && card.willpower > card.baseWillpower) ||
        (card.lore !== undefined && card.baseLore !== undefined && card.lore > card.baseLore)
    );
    const hasDebuffs = (
        (card.strength !== undefined && card.baseStrength !== undefined && card.strength < card.baseStrength) ||
        (card.willpower !== undefined && card.baseWillpower !== undefined && card.willpower < card.baseWillpower) ||
        (card.lore !== undefined && card.baseLore !== undefined && card.lore < card.baseLore)
    );
    const hasModifications = hasBuffs || hasDebuffs;

    // Extract keywords (always extract for visuals, but badges depend on prop)
    const keywords = card.parsedEffects ? extractKeywords(card.parsedEffects as any[]) : [];

    // Check for specific visual keywords
    const hasWard = keywords.some(k => k.keyword.toLowerCase() === 'ward');
    const hasBodyguard = keywords.some(k => k.keyword.toLowerCase() === 'bodyguard');

    // Resolve size - use predefined if it's a key, otherwise treat as custom class
    const sizeClass = size in CARD_SIZES ? CARD_SIZES[size as CardSize] : size;

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (zoomTrigger === 'none') return;
        const rect = e.currentTarget.getBoundingClientRect();
        setCardRect(rect);
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        if (zoomTrigger === 'none') return;
        setIsHovered(false);
        setCardRect(null);
    };

    // Check if this is a Location card (landscape orientation)
    const isLocation = card.type === 'Location';

    // Calculate smart position that keeps zoom within viewport
    const getZoomPosition = () => {
        if (!cardRect) return { left: 0, top: 0 };

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Start with center of the card
        let left = cardRect.left + cardRect.width / 2;
        let top = cardRect.top + cardRect.height / 2;

        // Calculate zoom box boundaries if centered - use landscape dimensions for Locations
        const zoomW = isLocation ? ZOOM_WIDTH_LANDSCAPE : ZOOM_WIDTH;
        const zoomH = isLocation ? ZOOM_HEIGHT_LANDSCAPE : ZOOM_HEIGHT;
        const halfWidth = zoomW / 2;
        const halfHeight = zoomH / 2;

        // Clamp horizontal position
        if (left - halfWidth < VIEWPORT_PADDING) {
            left = halfWidth + VIEWPORT_PADDING;
        } else if (left + halfWidth > viewportWidth - VIEWPORT_PADDING) {
            left = viewportWidth - halfWidth - VIEWPORT_PADDING;
        }

        // Clamp vertical position - prioritize showing full card
        if (top - halfHeight < VIEWPORT_PADDING) {
            // Card too close to top, push down
            top = halfHeight + VIEWPORT_PADDING;
        } else if (top + halfHeight > viewportHeight - VIEWPORT_PADDING) {
            // Card too close to bottom, push up
            top = viewportHeight - halfHeight - VIEWPORT_PADDING;
        }

        return { left, top };
    };

    // Selection overlay component (reused in both views)
    const SelectionOverlay = ({ iconSize = 'h-8 w-8' }: { iconSize?: string }) => (
        <div className="absolute inset-0 bg-red-500/30 rounded-lg flex items-center justify-center pointer-events-none">
            <div className="bg-red-600 text-white rounded-full p-1 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
        </div>
    );

    const zoomPosition = cardRect ? getZoomPosition() : { left: 0, top: 0 };

    return (
        <>
            {/* Base Card Container */}
            <div
                className={`
                    ${sizeClass} relative cursor-pointer transition-all duration-200
                    ${className}
                `}
                data-card-id={card.instanceId}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={onClick}
            >
                <Card
                    card={card}
                    disableHoverZoom={true}
                    selected={selected}
                    isExerted={card.ready === false}
                    size={sizeClass.includes('w-28') ? 'md' : 'sm'}
                    isWarded={hasWard}
                    isDrying={isDrying}
                    damage={card.damage}
                    willpower={card.willpower}
                    strength={card.strength}
                    lore={card.lore}
                    cost={card.cost}
                />

                {/* Visual Keyword Indicators */}
                {hasWard && (
                    <div className="absolute inset-0 rounded-lg ring-2 ring-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.3)] pointer-events-none z-10" />
                )}
                {hasBodyguard && (
                    <div className="absolute inset-0 rounded-lg border-2 border-slate-400/80 shadow-[inset_0_0_10px_rgba(148,163,184,0.5)] pointer-events-none z-10" />
                )}

                {/* Stat Modification Glow */}
                {hasModifications && (
                    <div className={`absolute inset-0 rounded-lg ring-2 pointer-events-none z-10 ${hasBuffs
                        ? 'ring-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                        : 'ring-orange-400/50 shadow-[0_0_12px_rgba(251,146,60,0.4)]'
                        }`} />
                )}

                {/* Ability Badges */}
                {showAbilities && keywords.length > 0 && (
                    <div className="absolute -bottom-1 left-0 right-0 flex justify-center gap-0.5 flex-wrap z-20">
                        {keywords.map((kw, idx) => (
                            <AbilityBadge key={`${kw.keyword}-${idx}`} keyword={kw.keyword} value={kw.value} size="sm" />
                        ))}
                    </div>
                )}
                {/* Drying Indicator - card just played, can't act */}
                {isDrying && (
                    <div className="absolute inset-0 bg-blue-900/40 rounded-lg flex items-center justify-center pointer-events-none z-10">
                        <div
                            className="text-2xl animate-pulse"
                            title="Just played - drying (can't act this turn)"
                        >
                            💧
                        </div>
                    </div>
                )}
            </div>

            {/* Zoomed Overlay - FIXED SIZE via Portal with smart positioning */}
            {isHovered && cardRect && zoomTrigger === 'hover' && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed pointer-events-none z-[10000]"
                    style={{
                        left: `${zoomPosition.left}px`,
                        top: `${zoomPosition.top}px`,
                        transform: 'translate(-50%, -50%)',
                        transition: 'opacity 0.15s ease-out',
                    }}
                >
                    {/* Always use fixed ZOOM size for the enlarged view */}
                    {/* For locations, rotate the entire container to show landscape orientation */}
                    <div
                        className={`${CARD_SIZES.zoom} rounded-lg overflow-hidden shadow-2xl relative ring-2 ring-white/20`}
                        style={isLocation ? {
                            transform: 'rotate(90deg)',
                        } : {}}
                    >
                        <Card
                            card={card}
                            disableHoverZoom={true}
                            selected={false}
                        />

                        {/* Visual Keyword Indicators (duplicated for zoom) */}
                        {hasWard && (
                            <div className="absolute inset-0 rounded-lg ring-2 ring-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.3)] pointer-events-none z-10" />
                        )}
                        {hasBodyguard && (
                            <div className="absolute inset-0 rounded-lg border-2 border-slate-400/80 shadow-[inset_0_0_10px_rgba(148,163,184,0.5)] pointer-events-none z-10" />
                        )}

                        {/* Stat Modification Glow (duplicated for zoom) */}
                        {hasModifications && (
                            <div className={`absolute inset-0 rounded-lg ring-2 pointer-events-none z-10 ${hasBuffs
                                ? 'ring-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                                : 'ring-orange-400/50 shadow-[0_0_12px_rgba(251,146,60,0.4)]'
                                }`} />
                        )}

                        {/* Selection overlay in zoom view with larger icon */}
                        {selected && (
                            <div className="absolute inset-0 bg-red-500/30 rounded-lg flex items-center justify-center pointer-events-none z-20">
                                <div className="bg-red-600 text-white rounded-full p-2 shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* Drying Indicator (duplicated for zoom) */}
                        {isDrying && (
                            <div className="absolute inset-0 bg-blue-900/40 rounded-lg flex items-center justify-center pointer-events-none z-10">
                                <div
                                    className="text-4xl animate-pulse"
                                    title="Just played - drying (can't act this turn)"
                                >
                                    💧
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ability Badges below zoomed card */}
                    {keywords.length > 0 && (
                        <div className="flex justify-center gap-1 flex-wrap mt-2">
                            {keywords.map((kw, idx) => (
                                <AbilityBadge key={`zoom-${kw.keyword}-${idx}`} keyword={kw.keyword} value={kw.value} size="md" />
                            ))}
                        </div>
                    )}
                </div>,
                document.body
            )}
        </>
    );
}

// Export directly without memo to handle deep state mutations
export default ZoomableCard;
