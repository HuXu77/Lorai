'use client';

import React, { useEffect, useState } from 'react';

interface VictoryOverlayProps {
    winnerId: string;
    currentPlayerId: string;
    onDismiss?: () => void;
    onRestart?: () => void;
}

export default function VictoryOverlay({ winnerId, currentPlayerId, onDismiss, onRestart }: VictoryOverlayProps) {
    const isWinner = winnerId === currentPlayerId;
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isWinner) {
            setShowConfetti(true);
        }
    }, [isWinner]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            {/* Confetti Container (Simple CSS implementation for now, can be enhanced) */}
            {showConfetti && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-10px`,
                                backgroundColor: ['#FFD700', '#FF6347', '#4169E1', '#32CD32', '#9370DB'][Math.floor(Math.random() * 5)],
                                width: `${Math.random() * 10 + 5}px`,
                                height: `${Math.random() * 10 + 5}px`,
                                animationDuration: `${Math.random() * 3 + 2}s`,
                                animationDelay: `${Math.random() * 2}s`,
                                transform: `rotate(${Math.random() * 360}deg)`
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="relative text-center animate-scale-up">
                {/* Glow Effect */}
                <div className={`absolute inset-0 blur-3xl opacity-50 ${isWinner ? 'bg-yellow-500' : 'bg-red-900'}`} />

                <h1 className={`relative text-8xl font-black tracking-tighter mb-4 
                    ${isWinner
                        ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]'
                        : 'text-gray-400 drop-shadow-md'
                    } 
                    uppercase`}
                >
                    {isWinner ? 'Victory' : 'Defeat'}
                </h1>

                <div className="relative">
                    <p className={`text-2xl font-bold mb-8 ${isWinner ? 'text-yellow-100' : 'text-gray-500'}`}>
                        {isWinner ? 'Congratulations! You are a Lore Master!' : 'Better luck next time...'}
                    </p>

                    <div className="flex gap-4 justify-center">
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg 
                                         text-white font-bold tracking-wide transition-all duration-200 
                                         hover:scale-105 active:scale-95 backdrop-blur-md"
                            >
                                Close
                            </button>
                        )}

                        {onRestart && (
                            <button
                                onClick={onRestart}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 
                                         border border-blue-400/50 rounded-lg shadow-lg shadow-blue-900/50
                                         text-white font-bold tracking-wide transition-all duration-200 
                                         hover:scale-105 active:scale-95 backdrop-blur-md"
                            >
                                Restart Match
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Styles for animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes confetti {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
                .animate-confetti {
                    animation-name: confetti;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                .animate-scale-up {
                    animation: scaleUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleUp {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}} />
        </div>
    );
}
