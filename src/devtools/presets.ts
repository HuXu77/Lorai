/**
 * Debug Presets - Pre-built game states for testing specific interactions
 * 
 * Use these to quickly set up game states when debugging abilities.
 * Add new presets as you encounter bugs that need reproducible scenarios.
 */

export interface CardSetup {
    name: string;
    ready?: boolean;
    damage?: number;
    exerted?: boolean; // Alias for ready: false
}

export interface PlayerSetup {
    hand: string[];
    play: (string | CardSetup)[];
    inkwell: string[];
    deck?: string[];
    lore: number;
}

export interface DebugPreset {
    id: string;
    name: string;
    description: string;
    category: 'ability' | 'keyword' | 'combat' | 'general';
    setup: {
        player1: PlayerSetup;
        player2: PlayerSetup;
        turnPlayer: 'player1' | 'player2';
        turnNumber?: number;
    };
}

/**
 * Collection of debug presets for testing various game mechanics
 */
export const DEBUG_PRESETS: DebugPreset[] = [
    // === Ability Testing ===
    {
        id: 'lady-tramp-synergy',
        name: 'Lady/Tramp Synergy',
        description: 'Test Lady\'s +1 lore bonus and Ward when Tramp is in play',
        category: 'ability',
        setup: {
            player1: {
                hand: [],
                play: [
                    { name: 'Lady - Elegant Spaniel', ready: true },
                    { name: 'Tramp - Enterprising Dog', ready: true }
                ],
                inkwell: [
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star'
                ],
                lore: 0
            },
            player2: {
                hand: [],
                play: [],
                inkwell: [],
                lore: 0
            },
            turnPlayer: 'player1'
        }
    },
    {
        id: 'bodyguard-test',
        name: 'Bodyguard Challenge Test',
        description: 'Test Bodyguard forcing challenges against exerted bodyguards',
        category: 'keyword',
        setup: {
            player1: {
                hand: [],
                play: [
                    { name: 'Stitch - Rock Star', ready: true }
                ],
                inkwell: [
                    'Stitch - Rock Star',
                    'Stitch - Rock Star'
                ],
                lore: 0
            },
            player2: {
                hand: [],
                play: [
                    { name: 'Donald Duck - Musketeer', ready: false }, // Bodyguard exerted
                    { name: 'Mickey Mouse - Brave Little Tailor', ready: true }
                ],
                inkwell: [],
                lore: 0
            },
            turnPlayer: 'player1'
        }
    },
    {
        id: 'on-play-targeting',
        name: 'On-Play Targeting Test',
        description: 'Test "when played" abilities that require targeting',
        category: 'ability',
        setup: {
            player1: {
                hand: ['The Queen - Commanding Presence'],
                play: [],
                inkwell: [
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star'
                ],
                lore: 0
            },
            player2: {
                hand: [],
                play: [
                    { name: 'Mickey Mouse - Brave Little Tailor', ready: true },
                    { name: 'Minnie Mouse - Beloved Princess', ready: true }
                ],
                inkwell: [],
                lore: 0
            },
            turnPlayer: 'player1'
        }
    },
    {
        id: 'quest-trigger-test',
        name: 'Quest Trigger Test',
        description: 'Test abilities that trigger when a character quests',
        category: 'ability',
        setup: {
            player1: {
                hand: [],
                play: [
                    { name: 'Daisy Duck - Donald\'s Date', ready: true }
                ],
                inkwell: [
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star'
                ],
                deck: [
                    'Mickey Mouse - Brave Little Tailor',
                    'Minnie Mouse - Beloved Princess'
                ],
                lore: 0
            },
            player2: {
                hand: [],
                play: [],
                inkwell: [],
                deck: [
                    'Stitch - Rock Star',
                    'Donald Duck - Musketeer'
                ],
                lore: 0
            },
            turnPlayer: 'player1'
        }
    },
    {
        id: 'cost-reduction-test',
        name: 'Cost Reduction Test',
        description: 'Test cards that reduce costs of other cards',
        category: 'ability',
        setup: {
            player1: {
                hand: ['Tramp - Enterprising Dog'],
                play: [
                    { name: 'Lady - Elegant Spaniel', ready: true }
                ],
                inkwell: [
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star'
                ],
                lore: 0
            },
            player2: {
                hand: [],
                play: [],
                inkwell: [],
                lore: 0
            },
            turnPlayer: 'player1'
        }
    },
    // === Combat Testing ===
    {
        id: 'combat-basic',
        name: 'Basic Combat',
        description: 'Simple combat scenario with ready characters',
        category: 'combat',
        setup: {
            player1: {
                hand: [],
                play: [
                    { name: 'Stitch - Rock Star', ready: true, damage: 0 }
                ],
                inkwell: [
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star'
                ],
                lore: 0
            },
            player2: {
                hand: [],
                play: [
                    { name: 'Mickey Mouse - Brave Little Tailor', ready: false, damage: 0 }
                ],
                inkwell: [],
                lore: 5
            },
            turnPlayer: 'player1'
        }
    },
    {
        id: 'lethal-combat',
        name: 'Lethal Combat Setup',
        description: 'Combat where one character will be banished',
        category: 'combat',
        setup: {
            player1: {
                hand: [],
                play: [
                    { name: 'Stitch - Rock Star', ready: true, damage: 0 }
                ],
                inkwell: [
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star'
                ],
                lore: 0
            },
            player2: {
                hand: [],
                play: [
                    { name: 'Pascal - Rapunzel\'s Companion', ready: false, damage: 0 }
                ],
                inkwell: [],
                lore: 0
            },
            turnPlayer: 'player1'
        }
    },
    // === General Testing ===
    {
        id: 'near-victory',
        name: 'Near Victory (19 Lore)',
        description: 'Player 1 at 19 lore, one quest from winning',
        category: 'general',
        setup: {
            player1: {
                hand: [],
                play: [
                    { name: 'Stitch - Rock Star', ready: true }
                ],
                inkwell: [
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star'
                ],
                lore: 19
            },
            player2: {
                hand: [],
                play: [],
                inkwell: [],
                lore: 0
            },
            turnPlayer: 'player1'
        }
    },
    {
        id: 'empty-board',
        name: 'Empty Board (Fresh Start)',
        description: 'Both players with empty boards, full ink, cards in hand',
        category: 'general',
        setup: {
            player1: {
                hand: [
                    'Stitch - Rock Star',
                    'Mickey Mouse - Brave Little Tailor',
                    'Cinderella - Gentle and Kind'
                ],
                play: [],
                inkwell: [
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star'
                ],
                lore: 0
            },
            player2: {
                hand: [
                    'Donald Duck - Musketeer',
                    'Minnie Mouse - Beloved Princess'
                ],
                play: [],
                inkwell: [
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star',
                    'Stitch - Rock Star'
                ],
                lore: 0
            },
            turnPlayer: 'player1'
        }
    }
];

/**
 * Get all presets in a specific category
 */
export function getPresetsByCategory(category: DebugPreset['category']): DebugPreset[] {
    return DEBUG_PRESETS.filter(p => p.category === category);
}

/**
 * Get a preset by its ID
 */
export function getPresetById(id: string): DebugPreset | undefined {
    return DEBUG_PRESETS.find(p => p.id === id);
}

/**
 * Get all unique categories
 */
export function getCategories(): DebugPreset['category'][] {
    return ['ability', 'keyword', 'combat', 'general'];
}
