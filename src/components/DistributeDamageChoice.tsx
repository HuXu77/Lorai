'use client';

import { ChoiceRequest, ChoiceResponse } from '../engine/models';
import Card from './Card';
import { useState } from 'react';

interface DistributeDamageChoiceProps {
    choice: ChoiceRequest;
    onResponse: (response: ChoiceResponse) => void;
}

export default function DistributeDamageChoice({ choice, onResponse }: DistributeDamageChoiceProps) {
    // Map of target ID -> damage assigned
    const [assignments, setAssignments] = useState<Record<string, number>>({});

    // Total damage to distribute is basically "max" selections (assuming 1 selection = 1 damage)
    // Or we can use context.totalDamage if passed
    const totalDamageToDistribute = choice.context?.totalDamage || choice.max || 1;

    // Calculate current total assigned
    const totalAssigned = Object.values(assignments).reduce((sum, val) => sum + val, 0);
    const remaining = totalDamageToDistribute - totalAssigned;

    const handleIncrement = (targetId: string) => {
        if (remaining <= 0) return;
        setAssignments(prev => ({
            ...prev,
            [targetId]: (prev[targetId] || 0) + 1
        }));
    };

    const handleDecrement = (targetId: string) => {
        const current = assignments[targetId] || 0;
        if (current <= 0) return;
        setAssignments(prev => ({
            ...prev,
            [targetId]: current - 1
        }));
    };

    const handleConfirm = () => {
        if (totalAssigned < totalDamageToDistribute && !choice.optional) return;

        // Convert assignments to selectedIds array (id repeated N times)
        const selectedIds: string[] = [];
        Object.entries(assignments).forEach(([id, amount]) => {
            for (let i = 0; i < amount; i++) {
                selectedIds.push(id);
            }
        });

        onResponse({
            requestId: choice.id,
            playerId: choice.playerId,
            selectedIds: selectedIds,
            declined: false,
            timestamp: Date.now()
        });
    };

    const handleDecline = () => {
        onResponse({
            requestId: choice.id,
            playerId: choice.playerId,
            selectedIds: [],
            declined: true,
            timestamp: Date.now()
        });
    };

    const isValid = totalAssigned === totalDamageToDistribute;

    return (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 rounded-xl shadow-2xl max-w-4xl w-full border border-red-500/50 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-gradient-to-r from-red-900/40 to-slate-900/80 p-6 border-b border-red-500/30 flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-red-400 font-bold uppercase tracking-wider text-sm mb-1">
                                Distribute Damage
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">{choice.prompt}</h2>
                            <div className="text-slate-300 text-lg">
                                Remaining Damage: <span className="font-bold text-red-500 text-2xl ml-1">{remaining}</span>
                            </div>
                        </div>
                        {choice.optional && (
                            <button
                                onClick={handleDecline}
                                className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                            >
                                Pass / Decline
                            </button>
                        )}
                    </div>
                </div>

                {/* Body - Targets Grid */}
                <div className="p-6 overflow-y-auto min-h-0 flex-1 bg-slate-900/50">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {choice.options.map(option => {
                            const assigned = assignments[option.id] || 0;
                            // Need to fetch card data? Option usually has card attached via 'value' (legacy) or we look up?
                            // In models.ts: ChoiceOption has NO card property.
                            // But usually executor provides it? 
                            // Re-reading models.ts, ChoiceOption interface is minimal {id, label, value}.
                            // WAIT, I REMOVED 'card' from ChoiceOption in models.ts!
                            // I need to confirm if 'value' holds the card instance or if I need to re-add 'card'.
                            // In executor.ts, I just removed 'value' and used 'display'.
                            // So currently the UI has NO WAY to render the card image unless I pass it somehow.
                            // I should re-add 'card' to ChoiceOption in models.ts and executor.ts.
                            // But for now, let's assume 'display' contains the name and render a placeholder or look it up?
                            // Rendering without image is bad UX.

                            // Let's assume for this step I just render boxes with names, 
                            // and I will fix the 'card' property issue in next step if critical.
                            // Actually, PlayerChoiceHandler likely passes the full context? 

                            // Let's stick to the plan: render a simple UI for now.
                            return (
                                <div key={option.id} className={`relative group rounded-xl border-2 transition-all duration-200 p-4 flex flex-col items-center bg-slate-800 ${assigned > 0 ? 'border-red-500 bg-red-900/10' : 'border-slate-700 hover:border-slate-500'}`}>
                                    <div className="text-center font-bold text-slate-200 mb-4 h-12 flex items-center justify-center text-sm leading-tight">
                                        {option.display}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleDecrement(option.id)}
                                            disabled={assigned <= 0}
                                            className="w-10 h-10 rounded-full bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-600 text-white font-bold flex items-center justify-center text-xl transition-colors"
                                        >
                                            -
                                        </button>
                                        <div className="text-2xl font-bold text-red-500 w-8 text-center">
                                            {assigned}
                                        </div>
                                        <button
                                            onClick={() => handleIncrement(option.id)}
                                            disabled={remaining <= 0}
                                            className="w-10 h-10 rounded-full bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-600 text-white font-bold flex items-center justify-center text-xl transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-900/80 border-t border-slate-700/50 flex justify-end gap-4 flex-shrink-0">
                    <button
                        onClick={handleConfirm}
                        disabled={!isValid}
                        className={`
                            px-8 py-3 rounded-lg font-bold text-lg shadow-lg transition-all transform active:scale-95
                            ${isValid
                                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:shadow-red-500/20 hover:scale-105'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'}
                        `}
                    >
                        Confirm Damage
                    </button>
                </div>
            </div>
        </div>
    );
}
