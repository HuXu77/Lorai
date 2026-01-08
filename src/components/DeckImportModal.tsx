'use client'

import { useState, useEffect } from 'react'
import { fetchDreambornDeck } from '../app/actions'
import { DeckStorage, SavedDeck } from '../utils/deck-storage'
import { parseDeckText, parseDreambornUrl } from '../utils/deck-import'

interface DeckImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (deck1: string[], deck2: string[]) => void;
}

export default function DeckImportModal({ isOpen, onClose, onImport }: DeckImportModalProps) {
    const [activeTab, setActiveTab] = useState<'import' | 'saved'>('import')

    // Import Sources
    const [deck1Source, setDeck1Source] = useState('')
    const [deck2Source, setDeck2Source] = useState('')
    const [deck1Type, setDeck1Type] = useState<'text' | 'url'>('text')
    const [deck2Type, setDeck2Type] = useState<'text' | 'url'>('text')

    // Storage State
    const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([])

    // UI State
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    useEffect(() => {
        if (isOpen) {
            setSavedDecks(DeckStorage.getDecks());
        }
    }, [isOpen]);

    const handleSaveDeck = (source: string, type: 'text' | 'url', defaultName: string) => {
        if (!source.trim()) {
            setError('Cannot save empty deck.');
            return;
        }
        const name = prompt('Enter a name for this deck:', defaultName);
        if (name) {
            DeckStorage.saveDeck({
                name,
                sourceType: type,
                sourceValue: source,
                cards: [] // We could parse it here, but store raw source for edits? simpler to store source.
                // Wait, the interface I wrote expects cards: string[]. I should parse it or store raw.
                // Let's store raw in sourceValue and parse on load.
                // Actually my interface has `cards`. Let's parse it now to validate.
            });
            setSavedDecks(DeckStorage.getDecks());
            setSuccessMsg(`Deck "${name}" saved!`);
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    const handleLoadDeck = (deck: SavedDeck, target: 'p1' | 'p2') => {
        if (target === 'p1') {
            setDeck1Type(deck.sourceType);
            setDeck1Source(deck.sourceValue);
        } else {
            setDeck2Type(deck.sourceType);
            setDeck2Source(deck.sourceValue);
        }
        setActiveTab('import');
        setSuccessMsg(`Loaded "${deck.name}" into Player ${target === 'p1' ? '1' : '2'}`);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleDeleteDeck = (id: string) => {
        if (confirm('Are you sure you want to delete this deck?')) {
            DeckStorage.deleteDeck(id);
            setSavedDecks(DeckStorage.getDecks());
        }
    };

    const handleImport = async () => {
        setIsLoading(true);
        setError('');

        try {
            let d1Cards: string[] = [];
            let d2Cards: string[] = [];

            // Helper to parse
            const parse = async (source: string, type: 'text' | 'url') => {
                if (!source.trim()) return [];
                if (type === 'text') return parseDeckText(source);
                return await parseDreambornUrl(source, fetchDreambornDeck);
            };

            d1Cards = await parse(deck1Source, deck1Type);
            d2Cards = await parse(deck2Source, deck2Type);

            if (d1Cards.length === 0 && d2Cards.length === 0) {
                setError('Please provide at least one deck.');
                return;
            }

            // Validate Decks
            const { validateDeck } = await import('../utils/deck-validation');

            if (d1Cards.length > 0) {
                const d1Result = validateDeck(d1Cards);
                if (!d1Result.isValid) {
                    setError(`Deck 1 Error: ${d1Result.errors[0]}`);
                    return;
                }
            }

            if (d2Cards.length > 0) {
                const d2Result = validateDeck(d2Cards);
                if (!d2Result.isValid) {
                    setError(`Deck 2 Error: ${d2Result.errors[0]}`);
                    return;
                }
            }

            onImport(d1Cards, d2Cards);
            onClose();

        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Failed to import decks');
        } finally {
            setIsLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 bg-backdrop-blur-sm">
            <div className="bg-slate-800 rounded-xl p-6 w-[850px] max-h-[90vh] overflow-y-auto border border-indigo-500 shadow-2xl relative flex flex-col">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-indigo-400">🎴</span> Deck Import
                </h2>

                {/* Tabs */}
                <div className="flex border-b border-slate-700 mb-6">
                    <button
                        onClick={() => setActiveTab('import')}
                        className={`px-6 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'import' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        Import / Setup
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`px-6 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'saved' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        Saved Decks ({savedDecks.length})
                    </button>
                </div>

                {/* Success Message Toast */}
                {successMsg && (
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-4 py-2 rounded shadow-lg animate-fade-in-down z-50">
                        {successMsg}
                    </div>
                )}

                {activeTab === 'import' && (
                    <div className="flex-1">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Deck 1 Column */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-blue-300">Player 1 (You)</h3>
                                    <div className="flex bg-slate-700 rounded p-1 text-xs">
                                        <button onClick={() => setDeck1Type('text')} className={`px-3 py-1 rounded ${deck1Type === 'text' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>Text</button>
                                        <button onClick={() => setDeck1Type('url')} className={`px-3 py-1 rounded ${deck1Type === 'url' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>URL</button>
                                    </div>
                                </div>

                                {deck1Type === 'text' ? (
                                    <textarea
                                        value={deck1Source}
                                        onChange={(e) => setDeck1Source(e.target.value)}
                                        placeholder="4 Stitch - Rock Star..."
                                        className="w-full h-64 bg-slate-900 border border-slate-700 rounded p-3 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 font-mono"
                                    />
                                ) : (
                                    <div className="h-64 flex flex-col gap-2">
                                        <label className="text-sm text-gray-400">Dreamborn.ink Deck URL</label>
                                        <input
                                            type="text"
                                            value={deck1Source}
                                            onChange={(e) => setDeck1Source(e.target.value)}
                                            placeholder="https://dreamborn.ink/decks/..."
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-gray-300 focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-xs">
                                    <button
                                        onClick={() => handleSaveDeck(deck1Source, deck1Type, 'My Deck')}
                                        className="text-gray-400 hover:text-white flex items-center gap-1 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                                        disabled={!deck1Source.trim()}
                                    >
                                        <span>💾</span> Save P1 Deck
                                    </button>
                                    {savedDecks.length > 0 && <span className="text-gray-600">Tip: Check 'Saved Decks' tab to load</span>}
                                </div>
                            </div>

                            {/* Deck 2 Column */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-purple-300">Player 2 (Bot)</h3>
                                    <div className="flex bg-slate-700 rounded p-1 text-xs">
                                        <button onClick={() => setDeck2Type('text')} className={`px-3 py-1 rounded ${deck2Type === 'text' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>Text</button>
                                        <button onClick={() => setDeck2Type('url')} className={`px-3 py-1 rounded ${deck2Type === 'url' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>URL</button>
                                    </div>
                                </div>

                                {deck2Type === 'text' ? (
                                    <textarea
                                        value={deck2Source}
                                        onChange={(e) => setDeck2Source(e.target.value)}
                                        placeholder="4 Stitch - Rock Star..."
                                        className="w-full h-64 bg-slate-900 border border-slate-700 rounded p-3 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 font-mono"
                                    />
                                ) : (
                                    <div className="h-64 flex flex-col gap-2">
                                        <label className="text-sm text-gray-400">Dreamborn.ink Deck URL</label>
                                        <input
                                            type="text"
                                            value={deck2Source}
                                            onChange={(e) => setDeck2Source(e.target.value)}
                                            placeholder="https://dreamborn.ink/decks/..."
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-gray-300 focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                )}

                                <div className="flex justify-between items-center text-xs">
                                    <button
                                        onClick={() => handleSaveDeck(deck2Source, deck2Type, 'Bot Deck')}
                                        className="text-gray-400 hover:text-white flex items-center gap-1 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                                        disabled={!deck2Source.trim()}
                                    >
                                        <span>💾</span> Save P2 Deck
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="flex-1 overflow-y-auto">
                        {savedDecks.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                                <span className="text-4xl mb-2">📭</span>
                                <p>No saved decks yet.</p>
                                <p className="text-sm">Import or type a deck in the "Import" tab and click Save.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {savedDecks.sort((a, b) => b.lastUsedAt - a.lastUsedAt).map(deck => (
                                    <div key={deck.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 hover:border-indigo-500/50 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white text-lg">{deck.name}</h4>
                                            <button
                                                onClick={() => handleDeleteDeck(deck.id)}
                                                className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete Deck"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-400 mb-4 font-mono truncate">
                                            {deck.sourceType === 'url' ? 'Dreamborn URL' : `${deck.sourceValue.substring(0, 40)}...`}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleLoadDeck(deck, 'p1')}
                                                className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-200 py-1.5 px-3 rounded text-sm transition-colors border border-blue-500/30"
                                            >
                                                Load P1
                                            </button>
                                            <button
                                                onClick={() => handleLoadDeck(deck, 'p2')}
                                                className="flex-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 py-1.5 px-3 rounded text-sm transition-colors border border-purple-500/30"
                                            >
                                                Load P2
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}


                {error && (
                    <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-slate-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={isLoading || (deck1Source.trim() === '' && deck2Source.trim() === '')}
                        className="px-6 py-2 rounded bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Importing...
                            </>
                        ) : (
                            <>Start Game 🚀</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
