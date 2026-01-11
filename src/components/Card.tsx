import React, { useState } from 'react';
import { CardInstance, ZoneType } from '../engine/models';
import { getCardImagePath } from '../utils/card-images';
import StatModificationBadge from './StatModificationBadge';
import AbilityBadge from './AbilityBadge';

interface CardProps {
    card: CardInstance;
    onClick?: () => void;
    isExerted?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isOverlay?: boolean;
    disabled?: boolean;
    showDetails?: boolean;
    variant?: 'full' | 'thumbnail';
    /** @deprecated - Use ZoomableCard wrapper instead */
    disableHoverZoom?: boolean;
    /** Show selection overlay (X mark and red tint) for mulligan */
    selected?: boolean;
    // visual states
    isWarded?: boolean;
    isDrying?: boolean;
    damage?: number;
    willpower?: number;
    strength?: number;
    lore?: number;
    cost?: number;
}

export default function Card({
    card,
    onClick,
    isExerted = false,
    size = 'md',
    isOverlay = false,
    disabled = false,
    showDetails = true,
    variant = 'full',
    disableHoverZoom = false,
    selected = false,
    isWarded,
    isDrying,
    damage,
    willpower,
    strength,
    lore,
    cost,
}: CardProps) {
    const [imageError, setImageError] = useState(false);
    const imagePath = getCardImagePath(card, 'full'); // Assuming 'full' as default since variant prop is removed

    // Calculate stat modifications
    const strengthMod = card.strength !== undefined && card.baseStrength !== undefined
        ? card.strength - card.baseStrength
        : 0;
    const willpowerMod = card.willpower !== undefined && card.baseWillpower !== undefined
        ? card.willpower - card.baseWillpower
        : 0;
    const loreMod = card.lore !== undefined && card.baseLore !== undefined
        ? card.lore - card.baseLore
        : 0;

    // Helper to get stat color class
    const getStatColor = (modification: number, defaultClass: string) => {
        if (modification > 0) return 'text-green-400';
        if (modification < 0) return 'text-red-400';
        return defaultClass;
    };

    // Fallback to text-based card if no image path or image fails to load
    const showFallback = !imagePath || imageError;

    // Render card content helper
    const renderCardContent = () => (
        <>
            {!showFallback ? (
                <>
                    {/* Card Image */}
                    <img
                        src={imagePath}
                        alt={card.fullName || card.name}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />

                    {/* Damage Counter */}
                    {card.damage > 0 && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white z-10">
                            {card.damage}
                        </div>
                    )}



                    {/* Stat Modification Badges - only show if there are modifications */}
                    {(strengthMod !== 0 || willpowerMod !== 0 || loreMod !== 0) && (
                        <div className="absolute bottom-2 right-2 flex flex-col gap-1 z-10">
                            {strengthMod !== 0 && (
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shadow-lg border ${strengthMod > 0 ? 'bg-green-600 border-green-400 text-white' : 'bg-red-600 border-red-400 text-white'}`}>
                                    <span>⚔️</span>
                                    <span>{strengthMod > 0 ? '+' : ''}{strengthMod}</span>
                                </div>
                            )}
                            {willpowerMod !== 0 && (
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shadow-lg border ${willpowerMod > 0 ? 'bg-green-600 border-green-400 text-white' : 'bg-red-600 border-red-400 text-white'}`}>
                                    <span>🛡️</span>
                                    <span>{willpowerMod > 0 ? '+' : ''}{willpowerMod}</span>
                                </div>
                            )}
                            {loreMod !== 0 && (
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shadow-lg border ${loreMod > 0 ? 'bg-green-600 border-green-400 text-white' : 'bg-red-600 border-red-400 text-white'}`}>
                                    <span>◊</span>
                                    <span>{loreMod > 0 ? '+' : ''}{loreMod}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Temporary Keyword Indicators */}
                    {((card.meta?.temporaryKeywords?.length ?? 0) > 0 || (card.meta?.resist || 0) > 0) && (
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            {/* Render numeric Resist first if present */}
                            {(card.meta?.resist || 0) > 0 && (
                                <AbilityBadge keyword="resist" value={card.meta?.resist} />
                            )}

                            {/* Render other temporary keywords */}
                            {card.meta?.temporaryKeywords
                                ?.filter((k: string) => k !== 'Singer' && k !== 'Resist') // Resist handled above, Singer excluded
                                .map((keyword: string) => {
                                    // Parse keyword string matching AbilityBadge types (lowercase)
                                    const lower = keyword.toLowerCase();
                                    // Map string to valid KeywordType if possible. 
                                    // AbilityBadge checks config, safely returns null if invalid.
                                    return (
                                        <AbilityBadge
                                            key={keyword}
                                            keyword={lower as any}
                                        />
                                    );
                                })
                            }
                        </div>
                    )}


                </>
            ) : (
                /* Fallback Text-Based Card */
                <>
                    {/* Card Header */}
                    <div className="p-2 bg-gradient-to-r from-blue-900 to-purple-900 rounded-t-lg">
                        <div className="flex justify-between items-start">
                            <h3 className="text-white text-xs font-bold truncate flex-1">
                                {card.fullName || card.name}
                            </h3>
                            <span className="text-yellow-300 text-sm font-bold ml-1">
                                {card.cost}
                            </span>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-2 flex flex-col justify-between h-40">
                        {/* Type */}
                        <div className="text-xs text-blue-300">
                            {card.type}
                            {card.subtypes && card.subtypes.length > 0 && (
                                <span className="text-gray-400"> • {card.subtypes.join(', ')}</span>
                            )}
                        </div>

                        {/* Ability Text (if showDetails) */}
                        {showDetails && card.abilities && card.abilities.length > 0 && (
                            <div className="text-xs text-gray-300 overflow-hidden flex-1 my-1">
                                {card.abilities[0].fullText?.substring(0, 60)}
                                {card.abilities[0].fullText && card.abilities[0].fullText.length > 60 && '...'}
                            </div>
                        )}

                        {/* Stats */}
                        <div className="flex justify-between items-end">
                            {card.type === 'Character' && (
                                <>
                                    <div className="flex gap-2 text-xs">
                                        {card.strength !== undefined && (
                                            <span className="flex items-center gap-0.5">
                                                <span className={`font-bold ${getStatColor(strengthMod, 'text-red-400')}`}>
                                                    ⚔️ {card.strength}
                                                </span>
                                                <StatModificationBadge modification={strengthMod} stat="strength" size="sm" />
                                            </span>
                                        )}
                                        {card.willpower !== undefined && (
                                            <span className="flex items-center gap-0.5">
                                                <span className={`font-bold ${getStatColor(willpowerMod, 'text-blue-400')}`}>
                                                    🛡️ {card.willpower}
                                                </span>
                                                <StatModificationBadge modification={willpowerMod} stat="willpower" size="sm" />
                                            </span>
                                        )}
                                    </div>
                                    {card.lore !== undefined && (
                                        <span className="flex items-center gap-0.5">
                                            <span className={`font-bold ${getStatColor(loreMod, 'text-yellow-300')}`}>
                                                ◆ {card.lore}
                                            </span>
                                            <StatModificationBadge modification={loreMod} stat="lore" size="sm" />
                                        </span>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Damage Counter */}
                        {card.damage > 0 && (
                            <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                {card.damage}
                            </div>
                        )}


                    </div>
                </>
            )
            }
        </>
    );

    // Determine if card is exerted from card.ready or isExerted prop
    const exerted = isExerted || !card.ready;

    return (
        <div
            onClick={onClick}
            data-card-name={card.fullName || card.name}
            data-card-id={card.instanceId}
            className={`
                card-container relative w-full h-full z-10
                ${exerted ? 'opacity-60' : ''}
                ${onClick ? 'cursor-pointer' : ''}
            `}
        >
            {/* Main Card Content (Clipped) */}
            <div className={`
                card-inner relative w-full h-full rounded-lg overflow-hidden z-20
                ${showFallback ? 'border-2 border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900' : ''}
            `}>
                {renderCardContent()}
            </div>

            {/* Cards Under (for Boost mechanic) */}
            {/* Cards Under (for Boost mechanic) */}
            {(card as any).meta?.cardsUnder?.length > 0 && (
                <>
                    {/* Show up to 3 card backs stacked */}
                    {Array.from({ length: Math.min((card as any).meta.cardsUnder.length, 3) }).map((_, index) => (
                        <div
                            key={index}
                            className="absolute rounded-lg shadow-md z-0 overflow-hidden border border-gray-500"
                            style={{
                                width: '100%',
                                height: '100%',
                                top: '0',
                                left: `${(index + 1) * 12}px`,
                                transform: `rotate(${(index + 1) * 2}deg)`,
                                zIndex: 0
                            }}
                            title={`${(card as any).meta.cardsUnder.length} card${(card as any).meta.cardsUnder.length > 1 ? 's' : ''} under (for Boost)`}
                        >
                            <img
                                src="/images/card-back.png"
                                alt="Card Back"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                    {/* Count badge */}
                    {(card as any).meta.cardsUnder.length > 1 && (
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white z-20 shadow-lg">
                            {(card as any).meta.cardsUnder.length}
                        </div>
                    )}
                </>
            )}

            {/* Selection Overlay for Mulligan */}
            {selected && (
                <div className="absolute inset-0 bg-red-500/30 rounded-lg flex items-center justify-center pointer-events-none">
                    <div className="bg-red-600 text-white rounded-full p-1 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}
