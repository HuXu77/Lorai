import { CardInstance, ZoneType } from '../engine/models';

export enum LogCategory {
    CARD = 'card',
    ABILITY = 'ability',
    COMBAT = 'combat',
    LORE = 'lore',
    TURN = 'turn',
    CHOICE = 'choice',
    SYSTEM = 'system'
}

export interface LogEntry {
    id: string;
    timestamp: number;
    category: LogCategory;
    message: string;
    details?: {
        card?: CardInstance;
        player?: string;
        amount?: number;
        from?: ZoneType;
        to?: ZoneType;
        ability?: string;
        /** Tracks which card/ability caused this action (for forced effects like Cursed Merfolk's discard) */
        causedBy?: {
            cardName: string;
            abilityName?: string;
        };
        [key: string]: any;
    };
    debugInfo?: any;
}

// Helper function to get category display info
export function getCategoryInfo(category: LogCategory) {
    const configs = {
        [LogCategory.CARD]: {
            icon: '🎴',
            color: 'blue',
            borderClass: 'border-blue-500',
            bgClass: 'bg-blue-900',
            textClass: 'text-blue-300'
        },
        [LogCategory.ABILITY]: {
            icon: '⚡',
            color: 'purple',
            borderClass: 'border-purple-500',
            bgClass: 'bg-purple-900',
            textClass: 'text-purple-300'
        },
        [LogCategory.COMBAT]: {
            icon: '⚔️',
            color: 'red',
            borderClass: 'border-red-500',
            bgClass: 'bg-red-900',
            textClass: 'text-red-300'
        },
        [LogCategory.LORE]: {
            icon: '◆',
            color: 'yellow',
            borderClass: 'border-yellow-500',
            bgClass: 'bg-yellow-900',
            textClass: 'text-yellow-300'
        },
        [LogCategory.TURN]: {
            icon: '🔄',
            color: 'gray',
            borderClass: 'border-gray-500',
            bgClass: 'bg-gray-800',
            textClass: 'text-gray-300'
        },
        [LogCategory.CHOICE]: {
            icon: '🎯',
            color: 'green',
            borderClass: 'border-green-500',
            bgClass: 'bg-green-900',
            textClass: 'text-green-300'
        },
        [LogCategory.SYSTEM]: {
            icon: '⚙️',
            color: 'gray',
            borderClass: 'border-gray-600',
            bgClass: 'bg-gray-900',
            textClass: 'text-gray-400'
        }
    };
    return configs[category];
}

// Helper to format relative time
export function formatRelativeTime(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return `${Math.floor(hours / 24)}d ago`;
}
