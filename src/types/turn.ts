export enum TurnPhase {
    READY = 'ready',
    SET = 'set',
    MAIN = 'main',
    END = 'end'
}

export interface PhaseInfo {
    phase: TurnPhase;
    icon: string;
    label: string;
    color: string;
    bgClass: string;
    textClass: string;
}

export const PHASE_INFO: Record<TurnPhase, PhaseInfo> = {
    [TurnPhase.READY]: {
        phase: TurnPhase.READY,
        icon: '🔄',
        label: 'Ready',
        color: 'blue',
        bgClass: 'bg-blue-600',
        textClass: 'text-blue-400'
    },
    [TurnPhase.SET]: {
        phase: TurnPhase.SET,
        icon: '🎴',
        label: 'Set',
        color: 'purple',
        bgClass: 'bg-purple-600',
        textClass: 'text-purple-400'
    },
    [TurnPhase.MAIN]: {
        phase: TurnPhase.MAIN,
        icon: '⚡',
        label: 'Main',
        color: 'green',
        bgClass: 'bg-green-600',
        textClass: 'text-green-400'
    },
    [TurnPhase.END]: {
        phase: TurnPhase.END,
        icon: '✓',
        label: 'End',
        color: 'gray',
        bgClass: 'bg-gray-600',
        textClass: 'text-gray-400'
    }
};

export const PHASE_ORDER = [
    TurnPhase.READY,
    TurnPhase.SET,
    TurnPhase.MAIN,
    TurnPhase.END
];
