'use client';

import { useState, useEffect } from 'react';

// ============================================================================
// HEALING ANIMATION
// ============================================================================

interface HealingEffectProps {
    position: { x: number; y: number };
    amount: number;
    onComplete?: () => void;
}

/**
 * Sparkling healing animation with floating hearts and green particles
 */
export function HealingEffect({ position, amount, onComplete }: HealingEffectProps) {
    const [particles] = useState(() =>
        Array.from({ length: 15 }, (_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 100,
            y: Math.random() * -80 - 20,
            delay: Math.random() * 0.3,
            scale: 0.5 + Math.random() * 0.5,
            type: ['sparkle', 'heart', 'plus'][Math.floor(Math.random() * 3)] as 'sparkle' | 'heart' | 'plus'
        }))
    );

    useEffect(() => {
        const timer = setTimeout(() => onComplete?.(), 1500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    const getEmoji = (type: 'sparkle' | 'heart' | 'plus') => {
        switch (type) {
            case 'sparkle': return '✨';
            case 'heart': return '💚';
            case 'plus': return '➕';
        }
    };

    return (
        <div
            className="animation-container"
            style={{ left: position.x, top: position.y }}
        >
            {/* Central glow */}
            <div className="heal-glow animate-heal-glow" />

            {/* Healing number */}
            <div className="heal-number animate-heal-number">
                +{amount}
            </div>

            {/* Particles */}
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="heal-particle animate-float-up"
                    style={{
                        '--target-x': `${particle.x}px`,
                        '--target-y': `${particle.y}px`,
                        animationDelay: `${particle.delay}s`,
                        fontSize: `${particle.scale * 1.5}rem`,
                    } as React.CSSProperties}
                >
                    {getEmoji(particle.type)}
                </div>
            ))}

            {/* Ring burst */}
            <div className="heal-ring animate-ring-burst" />
        </div>
    );
}

// ============================================================================
// CHALLENGE/COMBAT ANIMATION
// ============================================================================

interface ChallengeEffectProps {
    attackerPosition: { x: number; y: number };
    defenderPosition: { x: number; y: number };
    attackerDamage: number;
    defenderDamage: number;
    onComplete?: () => void;
}

/**
 * Dramatic challenge animation with sword clash and damage numbers
 */
export function ChallengeEffect({
    attackerPosition,
    defenderPosition,
    attackerDamage,
    defenderDamage,
    onComplete
}: ChallengeEffectProps) {
    const [showSparks, setShowSparks] = useState(false);
    const [sparks] = useState(() =>
        Array.from({ length: 12 }, (_, i) => ({
            id: i,
            angle: (i / 12) * 360 + Math.random() * 30,
            distance: 40 + Math.random() * 60,
            delay: Math.random() * 0.1,
        }))
    );

    const midX = (attackerPosition.x + defenderPosition.x) / 2;
    const midY = (attackerPosition.y + defenderPosition.y) / 2;

    useEffect(() => {
        const sparkTimer = setTimeout(() => setShowSparks(true), 400);
        const completeTimer = setTimeout(() => onComplete?.(), 1800);
        return () => {
            clearTimeout(sparkTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div className="challenge-container">
            {/* Attacker sword */}
            <div
                className="sword-slash animate-sword-attack"
                style={{ left: attackerPosition.x, top: attackerPosition.y }}
            >
                ⚔️
            </div>

            {/* Defender sword */}
            <div
                className="sword-slash animate-sword-defend"
                style={{ left: defenderPosition.x, top: defenderPosition.y }}
            >
                🗡️
            </div>

            {showSparks && (
                <>
                    {/* Central flash */}
                    <div
                        className="clash-flash animate-flash"
                        style={{ left: midX - 30, top: midY - 30 }}
                    />

                    {/* Clash icon */}
                    <div
                        className="clash-icon animate-clash"
                        style={{ left: midX - 20, top: midY - 20 }}
                    >
                        💥
                    </div>

                    {/* Sparks */}
                    {sparks.map((spark) => {
                        const radians = (spark.angle * Math.PI) / 180;
                        const targetX = Math.cos(radians) * spark.distance;
                        const targetY = Math.sin(radians) * spark.distance;

                        return (
                            <div
                                key={spark.id}
                                className="spark animate-spark"
                                style={{
                                    left: midX,
                                    top: midY,
                                    '--target-x': `${targetX}px`,
                                    '--target-y': `${targetY}px`,
                                    animationDelay: `${spark.delay}s`,
                                } as React.CSSProperties}
                            />
                        );
                    })}

                    {/* Damage on defender */}
                    <div
                        className="damage-number damage-red animate-damage-pop"
                        style={{ left: defenderPosition.x, top: defenderPosition.y - 20 }}
                    >
                        {attackerDamage > 0 ? `-${attackerDamage}` : '0'}
                    </div>

                    {/* Damage on attacker */}
                    <div
                        className="damage-number damage-orange animate-damage-pop"
                        style={{ left: attackerPosition.x, top: attackerPosition.y - 20, animationDelay: '0.1s' }}
                    >
                        {defenderDamage > 0 ? `-${defenderDamage}` : '0'}
                    </div>
                </>
            )}
        </div>
    );
}

// ============================================================================
// DAMAGE EFFECT
// ============================================================================

interface DamageEffectProps {
    position: { x: number; y: number };
    amount: number;
    onComplete?: () => void;
}

export function DamageEffect({ position, amount, onComplete }: DamageEffectProps) {
    useEffect(() => {
        const timer = setTimeout(() => onComplete?.(), 1200);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="animation-container" style={{ left: position.x, top: position.y }}>
            <div className="damage-flash animate-flash-red" />
            <div className="damage-number damage-red animate-damage-float">-{amount}</div>
            <div className="hit-icon animate-hit">💢</div>
        </div>
    );
}

// ============================================================================
// LORE GAIN ANIMATION
// ============================================================================

interface LoreGainEffectProps {
    position: { x: number; y: number };
    amount: number;
    onComplete?: () => void;
}

export function LoreGainEffect({ position, amount, onComplete }: LoreGainEffectProps) {
    // Create floating diamond particles
    const [diamonds] = useState(() =>
        Array.from({ length: amount }, (_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 100,
            y: Math.random() * -80 - 30,
            delay: i * 0.15,
            scale: 0.6 + Math.random() * 0.4,
        }))
    );

    // Create sparkle particles
    const [sparkles] = useState(() =>
        Array.from({ length: 12 }, (_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 120,
            y: Math.random() * -100 - 20,
            delay: Math.random() * 0.3,
        }))
    );

    useEffect(() => {
        const timer = setTimeout(() => onComplete?.(), 900); // Reduced to 0.9s
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="animation-container" style={{ left: position.x, top: position.y }}>
            {/* Central golden glow */}
            <div className="lore-glow animate-lore-glow" style={{
                background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,215,0,0) 70%)',
                width: '120px',
                height: '120px',
                animationDuration: '0.8s' // Faster glow
            }} />

            {/* Main Lore Symbol - spinning diamond */}
            <div className="lore-diamond animate-lore-spin" style={{
                position: 'absolute',
                width: '64px',
                height: '64px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                animationDuration: '0.8s' // Faster spin
            }}>
                <img
                    src="/images/lore-symbol.png"
                    alt="Lore"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))'
                    }}
                />
            </div>

            {/* Lore amount number */}
            <div className="lore-number animate-lore-number" style={{
                position: 'absolute',
                left: '50%',
                top: '-30px',
                transform: 'translateX(-50%)',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#FFD700',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 2px 4px rgba(0,0,0,0.5)',
                animationDuration: '0.8s' // Faster float
            }}>
                +{amount}
            </div>

            {/* Floating diamond particles (one per lore gained) */}
            {diamonds.map((diamond) => (
                <div
                    key={diamond.id}
                    className="animate-float-up"
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        '--target-x': `${diamond.x}px`,
                        '--target-y': `${diamond.y}px`,
                        animationDelay: `${diamond.delay * 0.5}s`, // Halved delay
                        animationDuration: '0.8s', // Faster float
                    } as React.CSSProperties}
                >
                    <img
                        src="/images/lore-symbol.png"
                        alt=""
                        style={{
                            width: `${diamond.scale * 32}px`,
                            height: `${diamond.scale * 32}px`,
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 0 5px rgba(255, 215, 0, 0.6))'
                        }}
                    />
                </div>
            ))}

            {/* Golden sparkles */}
            {sparkles.map((sparkle) => (
                <div
                    key={sparkle.id}
                    className="animate-float-up"
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        '--target-x': `${sparkle.x}px`,
                        '--target-y': `${sparkle.y}px`,
                        animationDelay: `${sparkle.delay * 0.5}s`, // Halved delay
                        fontSize: '1rem',
                        color: '#FFD700',
                        textShadow: '0 0 5px rgba(255, 215, 0, 0.8)',
                        animationDuration: '0.6s', // Faster float
                    } as React.CSSProperties}
                >
                    ✨
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// STAT CHANGE EFFECT
// ============================================================================

interface StatChangeEffectProps {
    position: { x: number; y: number };
    statType: 'strength' | 'willpower' | 'lore';
    amount: number;
    onComplete?: () => void;
}

/**
 * Floating stat change animation with colored indicator
 */
export function StatChangeEffect({ position, statType, amount, onComplete }: StatChangeEffectProps) {
    const [sparkles] = useState(() =>
        Array.from({ length: 6 }, (_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 60,
            y: Math.random() * -40 - 10,
            delay: Math.random() * 0.2,
        }))
    );

    useEffect(() => {
        const timer = setTimeout(() => onComplete?.(), 1800);
        return () => clearTimeout(timer);
    }, [onComplete]);

    const getStatConfig = () => {
        switch (statType) {
            case 'strength':
                return { icon: '⚔️', color: 'from-orange-500 to-red-500', textColor: 'text-orange-400', symbol: '¤' };
            case 'willpower':
                return { icon: '❤️', color: 'from-red-500 to-pink-500', textColor: 'text-red-400', symbol: '⛉' };
            case 'lore':
                return { icon: '◆', color: 'from-yellow-500 to-amber-500', textColor: 'text-yellow-400', symbol: '◊' };
        }
    };

    const config = getStatConfig();
    const isPositive = amount > 0;

    return (
        <div className="animation-container" style={{ left: position.x, top: position.y }}>
            {/* Background glow */}
            <div
                className={`absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial ${config.color} opacity-50 animate-ping`}
                style={{ animationDuration: '1s' }}
            />

            {/* Main stat change indicator */}
            <div
                className={`absolute -translate-x-1/2 -translate-y-1/2 text-3xl font-bold ${config.textColor} animate-bounce`}
                style={{
                    animationDuration: '0.5s',
                    textShadow: '0 0 10px currentColor, 0 0 20px currentColor'
                }}
            >
                {isPositive ? '+' : ''}{amount} {config.icon}
            </div>

            {/* Floating number that rises */}
            <div
                className={`absolute -translate-x-1/2 text-4xl font-bold ${config.textColor}`}
                style={{
                    animation: 'floatUp 1.5s ease-out forwards',
                    textShadow: '0 0 15px currentColor',
                }}
            >
                {isPositive ? '+' : ''}{amount}
            </div>

            {/* Sparkle particles */}
            {sparkles.map((sparkle) => (
                <div
                    key={sparkle.id}
                    className="stat-sparkle animate-float-up"
                    style={{
                        '--target-x': `${sparkle.x}px`,
                        '--target-y': `${sparkle.y}px`,
                        animationDelay: `${sparkle.delay}s`,
                        fontSize: '1rem',
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                    } as React.CSSProperties}
                >
                    {config.icon}
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// BANISH EFFECT
// ============================================================================

interface BanishEffectProps {
    position: { x: number; y: number };
    cardWidth?: number;
    cardHeight?: number;
    onComplete?: () => void;
}

export function BanishEffect({ position, cardWidth = 100, cardHeight = 140, onComplete }: BanishEffectProps) {
    useEffect(() => {
        const timer = setTimeout(() => onComplete?.(), 1500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div
            className="banish-container"
            style={{
                left: position.x - cardWidth / 2,
                top: position.y - cardHeight / 2,
                width: cardWidth,
                height: cardHeight,
            }}
        >
            {/* Shatter pieces */}
            {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i / 6) * 360;
                const radians = (angle * Math.PI) / 180;
                const distance = 50 + Math.random() * 30;

                return (
                    <div
                        key={i}
                        className="shatter-piece animate-shatter"
                        style={{
                            width: cardWidth / 3,
                            height: cardHeight / 3,
                            left: cardWidth / 3,
                            top: cardHeight / 3,
                            '--target-x': `${Math.cos(radians) * distance}px`,
                            '--target-y': `${Math.sin(radians) * distance}px`,
                            '--target-rotate': `${Math.random() * 180 - 90}deg`,
                            animationDelay: `${i * 0.05}s`,
                        } as React.CSSProperties}
                    />
                );
            })}

            {/* Skull icon */}
            <div
                className="banish-skull animate-banish-skull"
                style={{ left: cardWidth / 2 - 25, top: cardHeight / 2 - 25 }}
            >
                💀
            </div>

            {/* Smoke puffs */}
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={`smoke-${i}`}
                    className="smoke-puff animate-smoke"
                    style={{
                        left: cardWidth / 2 - 15 + (Math.random() - 0.5) * 40,
                        top: cardHeight / 2 - 15,
                        '--target-y': `${-40 - Math.random() * 20}px`,
                        animationDelay: `${0.2 + i * 0.1}s`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
}

// ============================================================================
// ANIMATION DEMO COMPONENT
// ============================================================================

interface AnimationDemoProps {
    onClose?: () => void;
}

export function AnimationDemo({ onClose }: AnimationDemoProps) {
    const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
    const [key, setKey] = useState(0);

    const triggerAnimation = (type: string) => {
        setActiveAnimation(type);
        setKey(prev => prev + 1);
    };

    const centerPosition = { x: 300, y: 200 };
    const attackerPos = { x: 150, y: 200 };
    const defenderPos = { x: 450, y: 200 };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">🎬 Animation Demo</h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-2xl transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Animation Stage */}
                <div
                    className="relative bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg mb-6 overflow-hidden"
                    style={{ height: 400 }}
                >
                    {/* Mock cards */}
                    <div
                        className="absolute w-16 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-blue-400 flex items-center justify-center text-xs text-white font-bold shadow-lg"
                        style={{ left: attackerPos.x - 32, top: attackerPos.y - 48 }}
                    >
                        Attacker
                    </div>
                    <div
                        className="absolute w-16 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-lg border-2 border-red-400 flex items-center justify-center text-xs text-white font-bold shadow-lg"
                        style={{ left: defenderPos.x - 32, top: defenderPos.y - 48 }}
                    >
                        Defender
                    </div>

                    {activeAnimation === 'heal' && (
                        <HealingEffect
                            key={key}
                            position={centerPosition}
                            amount={3}
                            onComplete={() => setActiveAnimation(null)}
                        />
                    )}
                    {activeAnimation === 'challenge' && (
                        <ChallengeEffect
                            key={key}
                            attackerPosition={attackerPos}
                            defenderPosition={defenderPos}
                            attackerDamage={3}
                            defenderDamage={2}
                            onComplete={() => setActiveAnimation(null)}
                        />
                    )}
                    {activeAnimation === 'damage' && (
                        <DamageEffect
                            key={key}
                            position={centerPosition}
                            amount={4}
                            onComplete={() => setActiveAnimation(null)}
                        />
                    )}
                    {activeAnimation === 'lore' && (
                        <LoreGainEffect
                            key={key}
                            position={centerPosition}
                            amount={2}
                            onComplete={() => setActiveAnimation(null)}
                        />
                    )}
                    {activeAnimation === 'banish' && (
                        <BanishEffect
                            key={key}
                            position={centerPosition}
                            onComplete={() => setActiveAnimation(null)}
                        />
                    )}
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-5 gap-3">
                    <button
                        onClick={() => triggerAnimation('heal')}
                        className="px-4 py-3 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex flex-col items-center gap-1 shadow-lg"
                    >
                        <span className="text-2xl">💚</span>
                        <span>Heal</span>
                    </button>
                    <button
                        onClick={() => triggerAnimation('challenge')}
                        className="px-4 py-3 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex flex-col items-center gap-1 shadow-lg"
                    >
                        <span className="text-2xl">⚔️</span>
                        <span>Challenge</span>
                    </button>
                    <button
                        onClick={() => triggerAnimation('damage')}
                        className="px-4 py-3 bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex flex-col items-center gap-1 shadow-lg"
                    >
                        <span className="text-2xl">💢</span>
                        <span>Damage</span>
                    </button>
                    <button
                        onClick={() => triggerAnimation('lore')}
                        className="px-4 py-3 bg-gradient-to-br from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex flex-col items-center gap-1 shadow-lg"
                    >
                        <span className="text-2xl">◆</span>
                        <span>Lore</span>
                    </button>
                    <button
                        onClick={() => triggerAnimation('banish')}
                        className="px-4 py-3 bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex flex-col items-center gap-1 shadow-lg"
                    >
                        <span className="text-2xl">💀</span>
                        <span>Banish</span>
                    </button>
                </div>

                <p className="text-gray-400 text-center mt-4 text-sm">
                    Click any button to preview the animation ✨
                </p>
            </div>
        </div>
    );
}

export default {
    HealingEffect,
    ChallengeEffect,
    DamageEffect,
    LoreGainEffect,
    StatChangeEffect,
    BanishEffect,
    AnimationDemo,
};
