'use client';

import { ChoiceRequest, ChoiceResponse } from '../engine/models';
import { ReactNode } from 'react';

interface ChoiceModalProps {
    choice: ChoiceRequest | null;
    onResponse: (response: ChoiceResponse) => void;
    children: ReactNode;
}

export default function ChoiceModal({ choice, onResponse, children }: ChoiceModalProps) {
    if (!choice) return null;

    const handleDecline = () => {
        onResponse({
            requestId: choice.id,
            playerId: choice.playerId,
            selectedIds: [],
            declined: true,
            timestamp: Date.now()
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex items-center justify-center p-4">
            {/* Modal Content */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl max-w-4xl w-full border-2 border-yellow-500">
                {/* Header */}
                <div className="bg-black bg-opacity-40 p-4 border-b border-gray-700">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            {/* Prompt */}
                            <h2 className="text-2xl font-bold text-yellow-300 mb-2">
                                {choice.prompt}
                            </h2>
                            {/* Source Info */}
                            <div className="text-sm text-gray-300">
                                {choice.source.card && (
                                    <span className="text-blue-400">{choice.source.card.fullName || choice.source.card.name}</span>
                                )}
                                {choice.source.abilityName && (
                                    <span className="ml-2 text-purple-400">• {choice.source.abilityName}</span>
                                )}
                            </div>
                        </div>
                        {/* Optional badge */}
                        {choice.optional && (
                            <div className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-semibold">
                                Optional
                            </div>
                        )}
                    </div>
                </div>

                {/* Choice Content */}
                <div className="p-6">
                    {children}
                </div>

                {/* Footer */}
                {choice.optional && (
                    <div className="bg-black bg-opacity-40 p-4 border-t border-gray-700 flex justify-center">
                        <button
                            onClick={handleDecline}
                            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            Decline
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
