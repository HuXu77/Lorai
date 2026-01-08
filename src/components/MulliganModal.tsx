import React, { useState } from 'react';
import { CardInstance } from '../engine/models';
import ZoomableCard from './ZoomableCard';

interface MulliganModalProps {
    isOpen: boolean;
    hand: CardInstance[];
    onConfirm: (selectedIds: string[]) => void;
}

export const MulliganModal: React.FC<MulliganModalProps> = ({ isOpen, hand, onConfirm }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    if (!isOpen) return null;

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedIds(newSelection);
    };

    const handleConfirm = () => {
        onConfirm(Array.from(selectedIds));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-4xl w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-amber-400 mb-2">Mulligan Phase</h2>
                    <p className="text-slate-300">Select cards to shuffle back into your deck. You will draw replacements.</p>
                </div>

                <div className="grid grid-cols-7 gap-4 mb-8 justify-items-center">
                    {hand.map((card) => {
                        const isSelected = selectedIds.has(card.instanceId);
                        return (
                            <div
                                key={card.instanceId}
                                className={`relative transition-all duration-200 rounded-lg
                                    ${isSelected ? 'ring-4 ring-red-500 scale-95' : 'hover:ring-2 hover:ring-amber-400'}
                                `}
                            >
                                <ZoomableCard
                                    card={card}
                                    size="lg"
                                    selected={isSelected}
                                    onClick={() => toggleSelection(card.instanceId)}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={handleConfirm}
                        className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-full transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    >
                        {selectedIds.size === 0 ? 'Keep Hand' : `Mulligan ${selectedIds.size} Cards`}
                    </button>
                </div>
            </div>
        </div>
    );
};
