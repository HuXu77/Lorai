'use client';

/**
 * DebugPanel - Collapsible debug panel for manipulating game state
 * 
 * Only appears when ?debug=true is in the URL.
 * Allows adding cards to zones, setting lore, importing/exporting state, and loading presets.
 */

import React, { useState, useCallback } from 'react';
import { CardPickerModal } from './CardPickerModal';
import { StateManipulator, DEBUG_PRESETS, getCategories, DebugPreset } from '../devtools';
import { TurnManager } from '../engine/actions';
import { GameStateManager } from '../engine/state';
import { GameState, ZoneType, CardInstance } from '../engine/models';

declare global {
    interface Window {
        lorcanaDebug?: {
            loadPreset: (preset: DebugPreset) => boolean;
            importState: (json: string) => boolean;
            getState: () => string;
            // E2E testing methods
            addToHand: (playerId: string, cardName: string) => any;
            addToPlay: (playerId: string, cardName: string, options?: { ready?: boolean }) => any;
            addToInkwell: (playerId: string, cardName: string) => any;
            setLore: (playerId: string, amount: number) => boolean;
            setTurn: (playerId: string) => boolean;
            setDeck: (playerId: string, cardNames: string[]) => boolean;
            setDamage: (instanceId: string, amount: number) => boolean;
            findCard: (name: string) => any;
            clearHand: (playerId: string) => any;
            // Player IDs for test access
            player1Id: string;
            player2Id: string;
        };
    }
}

export interface DebugPanelProps {
    gameEngine: {
        turnManager: TurnManager;
        stateManager: GameStateManager;
        humanController: any;
        botController: any;
    };
    engineState: GameState;
    onStateChange: (newState: GameState) => void;
}

type Tab = 'cards' | 'state' | 'presets';
type TargetZone = 'hand' | 'play' | 'inkwell' | 'deck';
type TargetPlayer = 'player1' | 'player2';

export function DebugPanel({ gameEngine, engineState, onStateChange }: DebugPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('cards');
    const [cardPickerOpen, setCardPickerOpen] = useState(false);
    const [targetZone, setTargetZone] = useState<TargetZone>('hand');
    const [targetPlayer, setTargetPlayer] = useState<TargetPlayer>('player1');
    const [addReady, setAddReady] = useState(true);
    const [loreInput, setLoreInput] = useState('');
    const [importInput, setImportInput] = useState('');
    const [showImportModal, setShowImportModal] = useState(false);
    const [presetCategory, setPresetCategory] = useState<string>('');

    // Create manipulator instance
    const manipulator = new StateManipulator(gameEngine);

    // Refresh UI state
    const refreshState = useCallback(() => {
        onStateChange({ ...gameEngine.stateManager.state });
    }, [gameEngine.stateManager, onStateChange]);

    // Expose to window for automated testing (E2E)
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            window.lorcanaDebug = {
                // Core state methods
                loadPreset: (preset: DebugPreset) => {
                    const success = manipulator.loadPreset(preset);
                    if (success) refreshState();
                    return success;
                },
                importState: (json: string) => {
                    const success = manipulator.importState(json);
                    if (success) refreshState();
                    return success;
                },
                getState: () => manipulator.exportState(),

                // Card manipulation for E2E tests
                addToHand: (playerId: string, cardName: string) => {
                    const result = manipulator.addToHand(playerId, cardName);
                    refreshState();
                    return result;
                },
                addToPlay: (playerId: string, cardName: string, options?: { ready?: boolean }) => {
                    const result = manipulator.addToPlay(playerId, cardName, options);
                    refreshState();
                    return result;
                },
                findCard: (name: string) => manipulator.findCard(name),
                clearHand: (playerId: string) => {
                    const result = manipulator.clearZone(playerId, ZoneType.Hand);
                    refreshState();
                    return result;
                },
                addToInkwell: (playerId: string, cardName: string) => {
                    const result = manipulator.addToInkwell(playerId, cardName);
                    refreshState();
                    return result;
                },
                setLore: (playerId: string, amount: number) => {
                    const success = manipulator.setLore(playerId, amount);
                    refreshState();
                    return success;
                },
                setTurn: (playerId: string) => {
                    const success = manipulator.setTurn(playerId);
                    refreshState();
                    return success;
                },
                setDeck: (playerId: string, cardNames: string[]) => {
                    const success = manipulator.setDeckTop(playerId, cardNames);
                    refreshState();
                    return success;
                },
                setDamage: (instanceId: string, amount: number) => {
                    const success = manipulator.setDamage(instanceId, amount);
                    refreshState();
                    return success;
                },

                // Player IDs for E2E tests
                player1Id: 'player1',
                player2Id: 'player2'
            };
        }
        return () => {
            if (typeof window !== 'undefined') {
                delete window.lorcanaDebug;
            }
        };
    }, [manipulator, refreshState]);

    // Handle card selection from picker
    const handleSelectCard = useCallback((card: any) => {
        console.log(`[DebugPanel] Adding ${card.fullName} to ${targetPlayer}'s ${targetZone}`);

        switch (targetZone) {
            case 'hand':
                manipulator.addToHand(targetPlayer, card.fullName);
                break;
            case 'play':
                manipulator.addToPlay(targetPlayer, card.fullName, { ready: addReady });
                break;
            case 'inkwell':
                manipulator.addToInkwell(targetPlayer, card.fullName);
                break;
            case 'deck':
                manipulator.setDeckTop(targetPlayer, [card.fullName]);
                break;
        }

        refreshState();
        setCardPickerOpen(false);
    }, [targetPlayer, targetZone, addReady, manipulator, refreshState]);

    // Handle setting lore
    const handleSetLore = useCallback(() => {
        const amount = parseInt(loreInput);
        if (!isNaN(amount)) {
            manipulator.setLore(targetPlayer, amount);
            refreshState();
            setLoreInput('');
        }
    }, [loreInput, targetPlayer, manipulator, refreshState]);

    // Handle export
    const handleExport = useCallback(() => {
        const json = manipulator.exportState();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lorcana-debug-state-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [manipulator]);

    // Handle import
    const handleImport = useCallback(() => {
        if (importInput.trim()) {
            const success = manipulator.importState(importInput.trim());
            if (success) {
                refreshState();
                setShowImportModal(false);
                setImportInput('');
            } else {
                alert('Failed to import state. Check console for errors.');
            }
        }
    }, [importInput, manipulator, refreshState]);

    // Handle preset load
    const handleLoadPreset = useCallback((preset: DebugPreset) => {
        const success = manipulator.loadPreset(preset);
        if (success) {
            refreshState();
        } else {
            alert('Failed to load preset. Check console for errors.');
        }
    }, [manipulator, refreshState]);

    // Get player's current zone for quick info
    const getZoneCount = (playerId: string, zone: string): number => {
        const player = engineState.players[playerId];
        if (!player) return 0;
        switch (zone) {
            case 'hand': return player.hand.length;
            case 'play': return player.play.length;
            case 'inkwell': return player.inkwell.length;
            case 'deck': return player.deck.length;
            case 'discard': return player.discard.length;
            default: return 0;
        }
    };

    // Filter presets by category
    const filteredPresets = presetCategory
        ? DEBUG_PRESETS.filter(p => p.category === presetCategory)
        : DEBUG_PRESETS;

    return (
        <>
            {/* Collapsed Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                    fixed bottom-4 right-4 z-40 px-4 py-2 rounded-lg font-medium shadow-lg transition-all
                    ${isExpanded
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'}
                `}
            >
                {isExpanded ? '✕ Close Debug' : '🔧 Debug'}
            </button>

            {/* Expanded Panel */}
            {isExpanded && (
                <div className="fixed bottom-16 right-4 z-40 w-96 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                    {/* Panel Header */}
                    <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                        <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                            🔧 Debug Panel
                        </h3>
                        <p className="text-xs text-gray-500">
                            Turn {engineState.turnCount} • {engineState.turnPlayerId === 'player1' ? 'Your Turn' : "Bot's Turn"}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-700">
                        {(['cards', 'state', 'presets'] as Tab[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    flex-1 px-4 py-2 text-sm font-medium transition-colors capitalize
                                    ${activeTab === tab
                                        ? 'bg-gray-700 text-white border-b-2 border-yellow-400'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-4 max-h-80 overflow-y-auto">
                        {/* Cards Tab */}
                        {activeTab === 'cards' && (
                            <div className="space-y-4">
                                {/* Target Selection */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Target Player</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setTargetPlayer('player1')}
                                            className={`flex-1 py-2 text-sm rounded ${targetPlayer === 'player1'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            You (P1)
                                        </button>
                                        <button
                                            onClick={() => setTargetPlayer('player2')}
                                            className={`flex-1 py-2 text-sm rounded ${targetPlayer === 'player2'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            Bot (P2)
                                        </button>
                                    </div>
                                </div>

                                {/* Zone Selection */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Target Zone</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['hand', 'play', 'inkwell', 'deck'] as TargetZone[]).map(zone => (
                                            <button
                                                key={zone}
                                                onClick={() => setTargetZone(zone)}
                                                className={`py-2 text-sm rounded capitalize ${targetZone === zone
                                                    ? 'bg-yellow-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                    }`}
                                            >
                                                {zone} ({getZoneCount(targetPlayer, zone)})
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Ready toggle for play zone */}
                                {targetZone === 'play' && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="addReady"
                                            checked={addReady}
                                            onChange={(e) => setAddReady(e.target.checked)}
                                            className="rounded bg-gray-700 border-gray-600"
                                        />
                                        <label htmlFor="addReady" className="text-sm text-gray-300">
                                            Add as Ready (uncheck for Exerted)
                                        </label>
                                    </div>
                                )}

                                {/* Add Card Button */}
                                <button
                                    onClick={() => setCardPickerOpen(true)}
                                    className="w-full py-2 mt-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded shadow-md transition-all active:scale-95"
                                >
                                    + Add Card to {targetZone}
                                </button>

                                {/* Manage Play Zone Cards */}
                                {targetZone === 'play' && (
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <h4 className="text-xs font-medium text-gray-500 mb-2">Cards in Play</h4>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {engineState.players[targetPlayer]?.play.map(card => {
                                                const isDrying = card.turnPlayed === engineState.turnCount;
                                                return (
                                                    <div key={card.instanceId} className="bg-gray-800 p-2 rounded flex flex-col gap-2 text-xs">
                                                        <div className="font-medium text-white truncate">{card.name}</div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    manipulator.setReady(card.instanceId, !card.ready);
                                                                    refreshState();
                                                                }}
                                                                className={`flex-1 py-1 rounded ${card.ready
                                                                    ? 'bg-green-900 text-green-200 border border-green-700'
                                                                    : 'bg-gray-700 text-gray-400'
                                                                    }`}
                                                            >
                                                                {card.ready ? 'Ready' : 'Exerted'}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    manipulator.setDrying(card.instanceId, !isDrying);
                                                                    refreshState();
                                                                }}
                                                                className={`flex-1 py-1 rounded ${isDrying
                                                                    ? 'bg-blue-900 text-blue-200 border border-blue-700'
                                                                    : 'bg-gray-700 text-gray-400'
                                                                    }`}
                                                            >
                                                                {isDrying ? 'Drying' : 'Dry'}
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 bg-gray-900/50 p-1 rounded">
                                                            <span className="text-red-400 text-[10px] uppercase font-bold">Damage</span>
                                                            <input
                                                                key={card.damage} /* Force reset when external damage changes */
                                                                type="number"
                                                                min="0"
                                                                className="flex-1 bg-gray-700 text-white rounded px-2 py-0.5 text-right border border-gray-600 focus:border-yellow-500 outline-none"
                                                                defaultValue={card.damage}
                                                                onBlur={(e) => {
                                                                    const val = parseInt(e.target.value);
                                                                    if (!isNaN(val) && val !== card.damage) {
                                                                        manipulator.setDamage(card.instanceId, val);
                                                                        refreshState();
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        const val = parseInt(e.currentTarget.value);
                                                                        if (!isNaN(val) && val !== card.damage) {
                                                                            manipulator.setDamage(card.instanceId, val);
                                                                            refreshState();
                                                                        }
                                                                        e.currentTarget.blur();
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {engineState.players[targetPlayer]?.play.length === 0 && (
                                                <p className="text-gray-500 italic">No cards in play</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Zone Stats */}
                                <div className="mt-4 pt-4 border-t border-gray-700">
                                    <h4 className="text-xs font-medium text-gray-500 mb-2">Zone Summary</h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-gray-800 p-2 rounded">
                                            <span className="text-blue-400">P1:</span>
                                            <span className="text-gray-400 ml-1">
                                                H:{getZoneCount('player1', 'hand')}
                                                P:{getZoneCount('player1', 'play')}
                                                I:{getZoneCount('player1', 'inkwell')}
                                                D:{getZoneCount('player1', 'deck')}
                                            </span>
                                        </div>
                                        <div className="bg-gray-800 p-2 rounded">
                                            <span className="text-red-400">P2:</span>
                                            <span className="text-gray-400 ml-1">
                                                H:{getZoneCount('player2', 'hand')}
                                                P:{getZoneCount('player2', 'play')}
                                                I:{getZoneCount('player2', 'inkwell')}
                                                D:{getZoneCount('player2', 'deck')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* State Tab */}
                        {activeTab === 'state' && (
                            <div className="space-y-4">
                                {/* Lore Control */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Set Lore</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={targetPlayer}
                                            onChange={(e) => setTargetPlayer(e.target.value as TargetPlayer)}
                                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                                        >
                                            <option value="player1">You (P1)</option>
                                            <option value="player2">Bot (P2)</option>
                                        </select>
                                        <input
                                            type="number"
                                            value={loreInput}
                                            onChange={(e) => setLoreInput(e.target.value)}
                                            placeholder="Lore"
                                            min="0"
                                            max="30"
                                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                                        />
                                        <button
                                            onClick={handleSetLore}
                                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
                                        >
                                            Set
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Current: P1 = {engineState.players.player1?.lore || 0},
                                        P2 = {engineState.players.player2?.lore || 0}
                                    </p>
                                </div>

                                {/* Turn Control */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Active Turn</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                manipulator.setTurn('player1');
                                                refreshState();
                                            }}
                                            className={`flex-1 py-2 text-sm rounded ${engineState.turnPlayerId === 'player1'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            Your Turn
                                        </button>
                                        <button
                                            onClick={() => {
                                                manipulator.setTurn('player2');
                                                refreshState();
                                            }}
                                            className={`flex-1 py-2 text-sm rounded ${engineState.turnPlayerId === 'player2'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            Bot's Turn
                                        </button>
                                    </div>
                                </div>

                                {/* Export/Import */}
                                <div className="pt-4 border-t border-gray-700 space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">State Serialization</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleExport}
                                            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded"
                                        >
                                            📥 Export State
                                        </button>
                                        <button
                                            onClick={() => setShowImportModal(true)}
                                            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded"
                                        >
                                            📤 Import State
                                        </button>
                                    </div>
                                </div>

                                {/* Clear Zones */}
                                <div className="pt-4 border-t border-gray-700 space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Clear Zones</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => {
                                                manipulator.clearZone('player1', ZoneType.Play);
                                                manipulator.clearZone('player2', ZoneType.Play);
                                                refreshState();
                                            }}
                                            className="py-2 bg-red-800 hover:bg-red-700 text-white text-sm rounded"
                                        >
                                            Clear All Play
                                        </button>
                                        <button
                                            onClick={() => {
                                                manipulator.clearZone('player1', ZoneType.Hand);
                                                manipulator.clearZone('player2', ZoneType.Hand);
                                                refreshState();
                                            }}
                                            className="py-2 bg-red-800 hover:bg-red-700 text-white text-sm rounded"
                                        >
                                            Clear All Hands
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Presets Tab */}
                        {activeTab === 'presets' && (
                            <div className="space-y-4">
                                {/* Category Filter */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Filter by Category</label>
                                    <select
                                        value={presetCategory}
                                        onChange={(e) => setPresetCategory(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                                    >
                                        <option value="">All Categories</option>
                                        {getCategories().map(cat => (
                                            <option key={cat} value={cat} className="capitalize">{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Preset List */}
                                <div className="space-y-2">
                                    {filteredPresets.map(preset => (
                                        <button
                                            key={preset.id}
                                            onClick={() => handleLoadPreset(preset)}
                                            className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-yellow-500 rounded-lg transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-white">{preset.name}</span>
                                                <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(preset.category)}`}>
                                                    {preset.category}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{preset.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Card Picker Modal */}
            <CardPickerModal
                isOpen={cardPickerOpen}
                onClose={() => setCardPickerOpen(false)}
                onSelectCard={handleSelectCard}
                title={`Add to ${targetPlayer === 'player1' ? 'Your' : "Bot's"} ${targetZone}`}
                subtitle={targetZone === 'play' ? `Cards will be added ${addReady ? 'Ready' : 'Exerted'}` : undefined}
            />

            {/* Import Modal */}
            {showImportModal && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                    onClick={(e) => e.target === e.currentTarget && setShowImportModal(false)}
                >
                    <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl w-full max-w-lg p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Import Game State</h3>
                        <textarea
                            value={importInput}
                            onChange={(e) => setImportInput(e.target.value)}
                            placeholder="Paste JSON state here..."
                            className="w-full h-48 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 font-mono text-sm resize-none"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                            >
                                Import
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Helper for category badge colors
function getCategoryColor(category: string): string {
    switch (category) {
        case 'ability': return 'bg-blue-600 text-white';
        case 'keyword': return 'bg-purple-600 text-white';
        case 'combat': return 'bg-red-600 text-white';
        case 'general': return 'bg-gray-600 text-white';
        default: return 'bg-gray-600 text-white';
    }
}
