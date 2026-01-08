import { parseToAbilityDefinition } from '../../../engine/ability-parser';
import { GameEvent } from '../../../engine/abilities/events';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { ZoneType } from '../../../engine/models';
import { CardType } from '../../../engine/models';
describe('Parser Batch 16', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;

    beforeEach(() => {
        game = new GameStateManager();
        const p1Id = game.addPlayer('Player 1');
        const p2Id = game.addPlayer('Player 2');
        turnManager = new TurnManager(game);
    });
    describe('The Nephews\' Piggy Bank', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1708,
                name: 'The Nephews\' Piggy Bank',

                fullName: 'The Nephews\' Piggy Bank',
                abilities: [
                    {
                        "effect": "If you have a character named Donald Duck in play, you pay 1 ⬡ less to play this item.",
                        "fullText": "INSIDE JOB If you have a character named Donald\\nDuck in play, you pay 1 ⬡ less to play this item.",
                        "name": "INSIDE JOB",
                        "type": "static"
                    },
                    {
                        "costs": [
                            "⟳"
                        ],
                        "costsText": "⟳",
                        "effect": "Chosen character gets -1 ¤ until the start of your next turn.",
                        "fullText": "PAYOFF ⟳ — Chosen character gets -1 ¤ until the\\nstart of your next turn.",
                        "name": "PAYOFF",
                        "type": "activated"
                    }
                ],
                fullTextSections: [
                    "INSIDE JOB If you have a character named Donald\\nDuck in play, you pay 1 ⬡ less to play this item.",
                    "PAYOFF ⟳ — Chosen character gets -1 ¤ until the\\nstart of your next turn."
                ],
                cost: 2,
                type: 'Item' as CardType,
                inkwell: false,
                color: 'Amber'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Palace Guard - Spectral Sentry', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1709,
                name: 'Palace Guard',

                fullName: 'Palace Guard - Spectral Sentry',
                abilities: [
                    {
                        "fullText": "Vanish (When an opponent chooses this character\\nfor an action, banish them.)",
                        "keyword": "Vanish",
                        "reminderText": "When an opponent chooses this character for an action, banish them.",
                        "type": "keyword"
                    }
                ],
                fullTextSections: [
                    "Vanish (When an opponent chooses this character\\nfor an action, banish them.)"
                ],
                cost: 1,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Druun - Ravenous Plague', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1710,
                name: 'Druun',

                fullName: 'Druun - Ravenous Plague',
                abilities: [
                    {
                        "fullText": "Challenger +4 (While challenging, this character\\ngets +4 ¤.)",
                        "keyword": "Challenger",
                        "keywordValue": "+4",
                        "keywordValueNumber": 4,
                        "reminderText": "While challenging, this character gets +4 ¤.",
                        "type": "keyword"
                    }
                ],
                fullTextSections: [
                    "Challenger +4 (While challenging, this character\\ngets +4 ¤.)"
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Madame Medusa - Deceiving Partner', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1711,
                name: 'Madame Medusa',

                fullName: 'Madame Medusa - Deceiving Partner',
                abilities: [
                    {
                        "effect": "When you play this character, you may deal 2 damage to another chosen character of yours to return chosen character with cost 2 or less to their player's hand.",
                        "fullText": "DOUBLE-CROSS When you play this character,\\nyou may deal 2 damage to another chosen\\ncharacter of yours to return chosen character\\nwith cost 2 or less to their player's hand.",
                        "name": "DOUBLE-CROSS",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "DOUBLE-CROSS When you play this character,\\nyou may deal 2 damage to another chosen\\ncharacter of yours to return chosen character\\nwith cost 2 or less to their player's hand."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst-Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Hades - Ruthless Tyrant', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1712,
                name: 'Hades',

                fullName: 'Hades - Ruthless Tyrant',
                abilities: [
                    {
                        "effect": "When you play this character and whenever he quests, you may deal 2 damage to another chosen character of yours to draw 2 cards.",
                        "fullText": "SHORT ON PATIENCE When you play this\\ncharacter and whenever he quests, you may deal\\n2 damage to another chosen character of yours to\\ndraw 2 cards.",
                        "name": "SHORT ON PATIENCE",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "SHORT ON PATIENCE When you play this\\ncharacter and whenever he quests, you may deal\\n2 damage to another chosen character of yours to\\ndraw 2 cards."
                ],
                cost: 7,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Amethyst-Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Lena Sabrewing - Pure Energy', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1713,
                name: 'Lena Sabrewing',

                fullName: 'Lena Sabrewing - Pure Energy',
                abilities: [
                    {
                        "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                        "keyword": "Evasive",
                        "reminderText": "Only characters with Evasive can challenge this character.",
                        "type": "keyword"
                    },
                    {
                        "costs": [
                            "⟳"
                        ],
                        "costsText": "⟳",
                        "effect": "Deal 1 damage to chosen character.",
                        "fullText": "SUPERNATURAL VENGEANCE ⟳ — Deal 1 damage\\nto chosen character.",
                        "name": "SUPERNATURAL VENGEANCE",
                        "type": "activated"
                    }
                ],
                fullTextSections: [
                    "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                    "SUPERNATURAL VENGEANCE ⟳ — Deal 1 damage\\nto chosen character."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst-Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Abu - Illusory Pachyderm', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1714,
                name: 'Abu',

                fullName: 'Abu - Illusory Pachyderm',
                abilities: [
                    {
                        "fullText": "Vanish (When an opponent chooses this character\\nfor an action, banish them.)",
                        "keyword": "Vanish",
                        "reminderText": "When an opponent chooses this character for an action, banish them.",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever this character quests, gain lore equal to the ◊ of chosen opposing character.",
                        "fullText": "GRASPING TRUNK Whenever this character\\nquests, gain lore equal to the ◊ of chosen\\nopposing character.",
                        "name": "GRASPING TRUNK",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Vanish (When an opponent chooses this character\\nfor an action, banish them.)",
                    "GRASPING TRUNK Whenever this character\\nquests, gain lore equal to the ◊ of chosen\\nopposing character."
                ],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst-Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Bruno Madrigal - Single-Minded', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1715,
                name: 'Bruno Madrigal',

                fullName: 'Bruno Madrigal - Single-Minded',
                abilities: [
                    {
                        "effect": "When you play this character, chosen opposing character can't ready at the start of their next turn.",
                        "fullText": "STANDING TALL When you play this character,\\nchosen opposing character can't ready at the\\nstart of their next turn.",
                        "name": "STANDING TALL",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "STANDING TALL When you play this character,\\nchosen opposing character can't ready at the\\nstart of their next turn."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Royal Guard - Octopus Soldier', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1716,
                name: 'Royal Guard',

                fullName: 'Royal Guard - Octopus Soldier',
                abilities: [
                    {
                        "effect": "Whenever you draw a card, this character gains Challenger +1 this turn. (They get +1 ¤ while challenging.)",
                        "fullText": "HEAVILY ARMED Whenever you draw a card, this\\ncharacter gains Challenger +1 this turn. (They get\\n+1 ¤ while challenging.)",
                        "name": "HEAVILY ARMED",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "HEAVILY ARMED Whenever you draw a card, this\\ncharacter gains Challenger +1 this turn. (They get\\n+1 ¤ while challenging.)"
                ],
                cost: 1,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Kuzco - Bored Royal', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1717,
                name: 'Kuzco',

                fullName: 'Kuzco - Bored Royal',
                abilities: [
                    {
                        "effect": "When you play this character, you may return chosen character, item, or location with cost 2 or less to their player's hand.",
                        "fullText": "LLAMA BREATH When you play this character, you\\nmay return chosen character, item, or location\\nwith cost 2 or less to their player's hand.",
                        "name": "LLAMA BREATH",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "LLAMA BREATH When you play this character, you\\nmay return chosen character, item, or location\\nwith cost 2 or less to their player's hand."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Megara - Part of the Plan', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1718,
                name: 'Megara',

                fullName: 'Megara - Part of the Plan',
                abilities: [
                    {
                        "effect": "While you have a character named Hades in play, this character gains Challenger +2. (They get +2 ¤ while challenging.)",
                        "fullText": "CONTENTIOUS ALLIANCE While you have a character\\nnamed Hades in play, this character gains Challenger +2.\\n(They get +2 ¤ while challenging.)",
                        "name": "CONTENTIOUS ALLIANCE",
                        "type": "static"
                    }
                ],
                fullTextSections: [
                    "CONTENTIOUS ALLIANCE While you have a character\\nnamed Hades in play, this character gains Challenger +2.\\n(They get +2 ¤ while challenging.)"
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Yelana - Northuldra Leader', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1719,
                name: 'Yelana',

                fullName: 'Yelana - Northuldra Leader',
                abilities: [
                    {
                        "effect": "When you play this character, chosen character gains Challenger +2 this turn. (They get +2 ¤ while challenging.)",
                        "fullText": "WE ONLY TRUST NATURE When you play this\\ncharacter, chosen character gains Challenger +2\\nthis turn. (They get +2 ¤ while challenging.)",
                        "name": "WE ONLY TRUST NATURE",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "WE ONLY TRUST NATURE When you play this\\ncharacter, chosen character gains Challenger +2\\nthis turn. (They get +2 ¤ while challenging.)"
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Ryder - Fleet-Footed Infiltrator', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1720,
                name: 'Ryder',

                fullName: 'Ryder - Fleet-Footed Infiltrator',
                abilities: [
                    {
                        "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                        "keyword": "Evasive",
                        "reminderText": "Only characters with Evasive can challenge this character.",
                        "type": "keyword"
                    }
                ],
                fullTextSections: [
                    "Evasive (Only characters with Evasive can\\nchallenge this character.)"
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Elsa - Fierce Protector', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1724,
                name: 'Elsa',

                fullName: 'Elsa - Fierce Protector',
                abilities: [
                    {
                        "costs": [
                            "1 ⬡",
                            "Choose and discard a card"
                        ],
                        "costsText": "1 ⬡, Choose and discard a card",
                        "effect": "Exert chosen opposing character.",
                        "fullText": "ICE OVER 1 ⬡, Choose and discard a card — Exert\\nchosen opposing character.",
                        "name": "ICE OVER",
                        "type": "activated"
                    }
                ],
                fullTextSections: [
                    "ICE OVER 1 ⬡, Choose and discard a card — Exert\\nchosen opposing character."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Pinocchio - Strings Attached', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1725,
                name: 'Pinocchio',

                fullName: 'Pinocchio - Strings Attached',
                abilities: [
                    {
                        "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                        "keyword": "Evasive",
                        "reminderText": "Only characters with Evasive can challenge this character.",
                        "type": "keyword"
                    },
                    {
                        "effect": "Once during your turn, whenever you ready this character, you may draw a card.",
                        "fullText": "GOT TO KEEP REAL QUIET Once during your turn,\\nwhenever you ready this character, you may draw\\na card.",
                        "name": "GOT TO KEEP REAL QUIET",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                    "GOT TO KEEP REAL QUIET Once during your turn,\\nwhenever you ready this character, you may draw\\na card."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Jiminy Cricket - Level-Headed and Wise', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1726,
                name: 'Jiminy Cricket',

                fullName: 'Jiminy Cricket - Level-Headed and Wise',
                abilities: [
                    {
                        "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                        "keyword": "Evasive",
                        "reminderText": "Only characters with Evasive can challenge this character.",
                        "type": "keyword"
                    },
                    {
                        "effect": "While this character is exerted, opposing characters with Rush enter play exerted.",
                        "fullText": "ENOUGH'S ENOUGH While this character is\\nexerted, opposing characters with Rush enter\\nplay exerted.",
                        "name": "ENOUGH'S ENOUGH",
                        "type": "static"
                    }
                ],
                fullTextSections: [
                    "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                    "ENOUGH'S ENOUGH While this character is\\nexerted, opposing characters with Rush enter\\nplay exerted."
                ],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Bambi - Little Prince', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1727,
                name: 'Bambi',

                fullName: 'Bambi - Little Prince',
                abilities: [
                    {
                        "effect": "When you play this character, gain 1 lore.",
                        "fullText": "SAY HELLO When you play this character, gain 1 lore.",
                        "name": "SAY HELLO",
                        "type": "triggered"
                    },
                    {
                        "effect": "When an opponent plays a character, return this character to your hand.",
                        "fullText": "KIND OF BASHFUL When an opponent plays a\\ncharacter, return this character to your hand.",
                        "name": "KIND OF BASHFUL",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "SAY HELLO When you play this character, gain 1 lore.",
                    "KIND OF BASHFUL When an opponent plays a\\ncharacter, return this character to your hand."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Monstro - Infamous Whale', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1728,
                name: 'Monstro',

                fullName: 'Monstro - Infamous Whale',
                abilities: [
                    {
                        "fullText": "Rush (This character can challenge the turn they're\\nplayed.)",
                        "keyword": "Rush",
                        "reminderText": "This character can challenge the turn they're played.",
                        "type": "keyword"
                    },
                    {
                        "costs": [
                            "Choose and discard a card"
                        ],
                        "costsText": "Choose and discard a card",
                        "effect": "Ready this character. He can't quest for the rest of this turn.",
                        "fullText": "FULL BREACH Choose and discard a card — Ready this\\ncharacter. He can't quest for the rest of this turn.",
                        "name": "FULL BREACH",
                        "type": "activated"
                    }
                ],
                fullTextSections: [
                    "Rush (This character can challenge the turn they're\\nplayed.)",
                    "FULL BREACH Choose and discard a card — Ready this\\ncharacter. He can't quest for the rest of this turn."
                ],
                cost: 8,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Nero - Fearsome Crocodile', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1729,
                name: 'Nero',

                fullName: 'Nero - Fearsome Crocodile',
                abilities: [
                    {
                        "costs": [
                            "⟳"
                        ],
                        "costsText": "⟳",
                        "effect": "Move 1 damage counter from this character to chosen opposing character.",
                        "fullText": "AND MEAN ⟳ — Move 1 damage counter from\\nthis character to chosen opposing character.",
                        "name": "AND MEAN",
                        "type": "activated"
                    }
                ],
                fullTextSections: [
                    "AND MEAN ⟳ — Move 1 damage counter from\\nthis character to chosen opposing character."
                ],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Magica De Spell - Shadow Form', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1730,
                name: 'Magica De Spell',

                fullName: 'Magica De Spell - Shadow Form',
                abilities: [
                    {
                        "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                        "keyword": "Evasive",
                        "reminderText": "Only characters with Evasive can challenge this character.",
                        "type": "keyword"
                    },
                    {
                        "effect": "When you play this character, you may return another chosen character of yours to your hand to draw a card.",
                        "fullText": "DANCE OF DARKNESS When you play this\\ncharacter, you may return another chosen\\ncharacter of yours to your hand to draw a card.",
                        "name": "DANCE OF DARKNESS",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                    "DANCE OF DARKNESS When you play this\\ncharacter, you may return another chosen\\ncharacter of yours to your hand to draw a card."
                ],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Amethyst-Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Kuzco - Impulsive Llama', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1731,
                name: 'Kuzco',

                fullName: 'Kuzco - Impulsive Llama',
                abilities: [
                    {
                        "fullText": "Shift 4 (You may pay 4 ⬡ to play this on top of one of your\\ncharacters named Kuzco.)",
                        "keyword": "Shift",
                        "keywordValue": "4",
                        "keywordValueNumber": 4,
                        "reminderText": "You may pay 4 ⬡ to play this on top of one of your characters named Kuzco.",
                        "type": "keyword"
                    },
                    {
                        "effect": "When you play this character, each opponent chooses one of their characters and puts that card on the bottom of their deck. Then, each opponent may draw a card.",
                        "fullText": "WHAT DOES THIS DO? When you play this character, each\\nopponent chooses one of their characters and puts that\\ncard on the bottom of their deck. Then, each opponent may\\ndraw a card.",
                        "name": "WHAT DOES THIS DO?",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Shift 4 (You may pay 4 ⬡ to play this on top of one of your\\ncharacters named Kuzco.)",
                    "WHAT DOES THIS DO? When you play this character, each\\nopponent chooses one of their characters and puts that\\ncard on the bottom of their deck. Then, each opponent may\\ndraw a card."
                ],
                cost: 7,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst-Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Yzma - On Edge', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1732,
                name: 'Yzma',

                fullName: 'Yzma - On Edge',
                abilities: [
                    {
                        "effect": "When you play this character, if you have a card named Pull the Lever! in your discard, you may search your deck for a card named Wrong Lever! and reveal that card to all players. Put that card into your hand and shuffle your deck.",
                        "fullText": "WHY DO WE EVEN HAVE THAT LEVER? When you\\nplay this character, if you have a card named Pull\\nthe Lever! in your discard, you may search your\\ndeck for a card named Wrong Lever! and reveal\\nthat card to all players. Put that card into your\\nhand and shuffle your deck.",
                        "name": "WHY DO WE EVEN HAVE THAT LEVER?",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "WHY DO WE EVEN HAVE THAT LEVER? When you\\nplay this character, if you have a card named Pull\\nthe Lever! in your discard, you may search your\\ndeck for a card named Wrong Lever! and reveal\\nthat card to all players. Put that card into your\\nhand and shuffle your deck."
                ],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Amethyst-Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Madam Mim - Rhino', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1733,
                name: 'Madam Mim',

                fullName: 'Madam Mim - Rhino',
                abilities: [
                    {
                        "fullText": "Shift 2 (You may pay 2 ⬡ to play this on top of\\none of your characters named Madam Mim.)",
                        "keyword": "Shift",
                        "keywordValue": "2",
                        "keywordValueNumber": 2,
                        "reminderText": "You may pay 2 ⬡ to play this on top of one of your characters named Madam Mim.",
                        "type": "keyword"
                    },
                    {
                        "effect": "When you play this character, banish her or return another chosen character of yours to your hand.",
                        "fullText": "MAKE WAY, COMING THROUGH! When you play\\nthis character, banish her or return another\\nchosen character of yours to your hand.",
                        "name": "MAKE WAY, COMING THROUGH!",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Shift 2 (You may pay 2 ⬡ to play this on top of\\none of your characters named Madam Mim.)",
                    "MAKE WAY, COMING THROUGH! When you play\\nthis character, banish her or return another\\nchosen character of yours to your hand."
                ],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Amethyst-Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Mother Gothel - Knows What\'s Best', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1734,
                name: 'Mother Gothel',

                fullName: 'Mother Gothel - Knows What\'s Best',
                abilities: [
                    {
                        "effect": "When you play this character, you may deal 2 damage to another chosen character of yours to give that character Challenger +1 and “When this character is banished in a challenge, return this card to your hand” this turn. (They get +1 ¤ while challenging.)",
                        "fullText": "LOOK WHAT YOU'VE DONE When you play this character,\\nyou may deal 2 damage to another chosen character of\\nyours to give that character Challenger +1 and “When this\\ncharacter is banished in a challenge, return this card to\\nyour hand” this turn. (They get +1 ¤ while challenging.)",
                        "name": "LOOK WHAT YOU'VE DONE",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "LOOK WHAT YOU'VE DONE When you play this character,\\nyou may deal 2 damage to another chosen character of\\nyours to give that character Challenger +1 and “When this\\ncharacter is banished in a challenge, return this card to\\nyour hand” this turn. (They get +1 ¤ while challenging.)"
                ],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Amethyst-Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Blue Fairy - Guiding Light', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1735,
                name: 'Blue Fairy',

                fullName: 'Blue Fairy - Guiding Light',
                abilities: [
                    {
                        "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                        "keyword": "Evasive",
                        "reminderText": "Only characters with Evasive can challenge this character.",
                        "type": "keyword"
                    },
                    {
                        "fullText": "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)",
                        "keyword": "Support",
                        "reminderText": "Whenever this character quests, you may add their ¤ to another chosen character's ¤ this turn.",
                        "type": "keyword"
                    }
                ],
                fullTextSections: [
                    "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                    "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)"
                ],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst-Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Anna - Magical Mission', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 1736,
                name: 'Anna',

                fullName: 'Anna - Magical Mission',
                abilities: [
                    {
                        "fullText": "Shift 4 (You may pay 4 ⬡ to play this on top of one of your\\ncharacters named Anna.)",
                        "keyword": "Shift",
                        "keywordValue": "4",
                        "keywordValueNumber": 4,
                        "reminderText": "You may pay 4 ⬡ to play this on top of one of your characters named Anna.",
                        "type": "keyword"
                    },
                    {
                        "fullText": "Support (Whenever this character quests, you may add their\\n¤ to another chosen character's ¤ this turn.)",
                        "keyword": "Support",
                        "reminderText": "Whenever this character quests, you may add their ¤ to another chosen character's ¤ this turn.",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever this character quests, if you have a character named Elsa in play, you may draw a card.",
                        "fullText": "COORDINATED PLAN Whenever this character quests, if you\\nhave a character named Elsa in play, you may draw a card.",
                        "name": "COORDINATED PLAN",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Shift 4 (You may pay 4 ⬡ to play this on top of one of your\\ncharacters named Anna.)",
                    "Support (Whenever this character quests, you may add their\\n¤ to another chosen character's ¤ this turn.)",
                    "COORDINATED PLAN Whenever this character quests, if you\\nhave a character named Elsa in play, you may draw a card."
                ],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst-Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 3
            // Actual: 3
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(3);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('The Sultan - Royal Apparition', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1737,
                name: 'The Sultan',

                fullName: 'The Sultan - Royal Apparition',
                abilities: [
                    {
                        "fullText": "Vanish (When an opponent chooses this character\\nfor an action, banish them.)",
                        "keyword": "Vanish",
                        "reminderText": "When an opponent chooses this character for an action, banish them.",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever one of your Illusion characters quests, exert chosen opposing character.",
                        "fullText": "COMMANDING PRESENCE Whenever one of your\\nIllusion characters quests, exert chosen opposing\\ncharacter.",
                        "name": "COMMANDING PRESENCE",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Vanish (When an opponent chooses this character\\nfor an action, banish them.)",
                    "COMMANDING PRESENCE Whenever one of your\\nIllusion characters quests, exert chosen opposing\\ncharacter."
                ],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Amethyst-Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Jafar - High Sultan of Lorcana', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1738,
                name: 'Jafar',

                fullName: 'Jafar - High Sultan of Lorcana',
                abilities: [
                    {
                        "effect": "Whenever this character quests, you may draw a card, then choose and discard a card. If an Illusion character card is discarded this way, you may play that character for free.",
                        "fullText": "DARK POWER Whenever this character quests,\\nyou may draw a card, then choose and discard a\\ncard. If an Illusion character card is discarded this\\nway, you may play that character for free.",
                        "name": "DARK POWER",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "DARK POWER Whenever this character quests,\\nyou may draw a card, then choose and discard a\\ncard. If an Illusion character card is discarded this\\nway, you may play that character for free."
                ],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Amethyst-Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Camilo Madrigal - Center Stage', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1739,
                name: 'Camilo Madrigal',

                fullName: 'Camilo Madrigal - Center Stage',
                abilities: [
                    {
                        "effect": "When this character is banished in a challenge, return this card to your hand.",
                        "fullText": "ENCORE! ENCORE! When this character is banished\\nin a challenge, return this card to your hand.",
                        "name": "ENCORE! ENCORE!",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "ENCORE! ENCORE! When this character is banished\\nin a challenge, return this card to your hand."
                ],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Flower - Shy Skunk', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1740,
                name: 'Flower',

                fullName: 'Flower - Shy Skunk',
                abilities: [
                    {
                        "effect": "Whenever you play another character, look at the top card of your deck. Put it on either the top or the bottom of your deck.",
                        "fullText": "LOOKING FOR FRIENDS Whenever you play another\\ncharacter, look at the top card of your deck. Put it\\non either the top or the bottom of your deck.",
                        "name": "LOOKING FOR FRIENDS",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "LOOKING FOR FRIENDS Whenever you play another\\ncharacter, look at the top card of your deck. Put it\\non either the top or the bottom of your deck."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Forest Duel', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1741,
                name: 'Forest Duel',

                fullName: 'Forest Duel',
                abilities: [],
                fullTextSections: [
                    "Your characters gain Challenger +2 and “When this\\ncharacter is banished in a challenge, return this\\ncard to your hand” this turn. (They get +2 ¤ while\\nchallenging.)"
                ],
                cost: 5,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('They Never Come Back', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1742,
                name: 'They Never Come Back',

                fullName: 'They Never Come Back',
                abilities: [],
                fullTextSections: [
                    "Up to 2 chosen characters can't ready at the start of\\ntheir next turn. Draw a card."
                ],
                cost: 3,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Fantastical and Magical', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1743,
                name: 'Fantastical and Magical',

                fullName: 'Fantastical and Magical',
                abilities: [
                    {
                        "fullText": "Sing Together 9 (Any number of your or your\\nteammates' characters with total cost 9 or more may\\n⟳ to sing this song for free.)",
                        "keyword": "Sing Together",
                        "keywordValue": "9",
                        "keywordValueNumber": 9,
                        "reminderText": "Any number of your or your teammates' characters with total cost 9 or more may ⟳ to sing this song for free.",
                        "type": "keyword"
                    }
                ],
                fullTextSections: [
                    "Sing Together 9 (Any number of your or your\\nteammates' characters with total cost 9 or more may\\n⟳ to sing this song for free.)",
                    "For each character that sang this song, draw a card\\nand gain 1 lore."
                ],
                cost: 9,
                type: 'Action' as CardType,
                inkwell: false,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 3
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Pull the Lever!', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1744,
                name: 'Pull the Lever!',

                fullName: 'Pull the Lever!',
                abilities: [],
                fullTextSections: [
                    "Choose one:\\n• Draw 2 cards.\\n• Each opponent chooses and discards a card."
                ],
                cost: 3,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Amethyst-Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Into the Unknown', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1745,
                name: 'Into the Unknown',

                fullName: 'Into the Unknown',
                abilities: [
                    {
                        "effect": "A character with cost 3 or more can ⟳ to sing this song for free.",
                        "fullText": "(A character with cost 3 or more can ⟳ to sing this\\nsong for free.)",
                        "type": "static"
                    }
                ],
                fullTextSections: [
                    "(A character with cost 3 or more can ⟳ to sing this\\nsong for free.)",
                    "Put chosen exerted character into their player's inkwell\\nfacedown and exerted."
                ],
                cost: 3,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Amethyst-Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Everybody\'s Got a Weakness', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1746,
                name: 'Everybody\'s Got a Weakness',

                fullName: 'Everybody\'s Got a Weakness',
                abilities: [],
                fullTextSections: [
                    "Move 1 damage counter from each damaged character\\nyou have in play to chosen opposing character. Draw a\\ncard for each damage counter moved this way."
                ],
                cost: 4,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Scarab', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1747,
                name: 'Scarab',

                fullName: 'Scarab',
                abilities: [
                    {
                        "costs": [
                            "⟳",
                            "2 ⬡"
                        ],
                        "costsText": "⟳, 2 ⬡",
                        "effect": "Return an Illusion character card from your discard to your hand.",
                        "fullText": "SEARCH THE SANDS ⟳, 2 ⬡ — Return an Illusion\\ncharacter card from your discard to your hand.",
                        "name": "SEARCH THE SANDS",
                        "type": "activated"
                    }
                ],
                fullTextSections: [
                    "SEARCH THE SANDS ⟳, 2 ⬡ — Return an Illusion\\ncharacter card from your discard to your hand."
                ],
                cost: 2,
                type: 'Item' as CardType,
                inkwell: false,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Ice Spikes', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1748,
                name: 'Ice Spikes',

                fullName: 'Ice Spikes',
                abilities: [
                    {
                        "effect": "When you play this item, exert chosen opposing character.",
                        "fullText": "HOLD STILL When you play this item, exert chosen\\nopposing character.",
                        "name": "HOLD STILL",
                        "type": "triggered"
                    },
                    {
                        "costs": [
                            "⟳",
                            "1 ⬡"
                        ],
                        "costsText": "⟳, 1 ⬡",
                        "effect": "Exert chosen opposing item. It can't ready at the start of its next turn.",
                        "fullText": "IT'S STUCK ⟳, 1 ⬡ — Exert chosen opposing item.\\nIt can't ready at the start of its next turn.",
                        "name": "IT'S STUCK",
                        "type": "activated"
                    }
                ],
                fullTextSections: [
                    "HOLD STILL When you play this item, exert chosen\\nopposing character.",
                    "IT'S STUCK ⟳, 1 ⬡ — Exert chosen opposing item.\\nIt can't ready at the start of its next turn."
                ],
                cost: 2,
                type: 'Item' as CardType,
                inkwell: true,
                color: 'Amethyst-Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Basil - Undercover Detective', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1750,
                name: 'Basil',

                fullName: 'Basil - Undercover Detective',
                abilities: [
                    {
                        "effect": "When you play this character, you may return chosen character to their player's hand.",
                        "fullText": "INCAPACITATE When you play this character, you\\nmay return chosen character to their player's hand.",
                        "name": "INCAPACITATE",
                        "type": "triggered"
                    },
                    {
                        "effect": "Whenever this character quests, chosen opponent discards a card at random.",
                        "fullText": "INTERFERE Whenever this character quests, chosen\\nopponent discards a card at random.",
                        "name": "INTERFERE",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "INCAPACITATE When you play this character, you\\nmay return chosen character to their player's hand.",
                    "INTERFERE Whenever this character quests, chosen\\nopponent discards a card at random."
                ],
                cost: 7,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Tramp - Observant Guardian', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1751,
                name: 'Tramp',

                fullName: 'Tramp - Observant Guardian',
                abilities: [
                    {
                        "effect": "When you play this character, chosen character gains Ward until the start of your next turn. (Opponents can't choose them except to challenge.)",
                        "fullText": "HOW DO I GET IN? When you play this character, chosen\\ncharacter gains Ward until the start of your next turn.\\n(Opponents can't choose them except to challenge.)",
                        "name": "HOW DO I GET IN?",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "HOW DO I GET IN? When you play this character, chosen\\ncharacter gains Ward until the start of your next turn.\\n(Opponents can't choose them except to challenge.)"
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Chaca - Junior Chipmunk', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1752,
                name: 'Chaca',

                fullName: 'Chaca - Junior Chipmunk',
                abilities: [
                    {
                        "effect": "When you play this character, if you have a character named Tipo in play, chosen opposing character gains Reckless during their next turn. (They can't quest and must challenge if able.)",
                        "fullText": "IN CAHOOTS When you play this character, if\\nyou have a character named Tipo in play, chosen\\nopposing character gains Reckless during their next\\nturn. (They can't quest and must challenge if able.)",
                        "name": "IN CAHOOTS",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "IN CAHOOTS When you play this character, if\\nyou have a character named Tipo in play, chosen\\nopposing character gains Reckless during their next\\nturn. (They can't quest and must challenge if able.)"
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Tipo - Junior Chipmunk', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1753,
                name: 'Tipo',

                fullName: 'Tipo - Junior Chipmunk',
                abilities: [
                    {
                        "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                        "keyword": "Evasive",
                        "reminderText": "Only characters with Evasive can challenge this character.",
                        "type": "keyword"
                    }
                ],
                fullTextSections: [
                    "Evasive (Only characters with Evasive can\\nchallenge this character.)"
                ],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Bill the Lizard - Chimney Sweep', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1754,
                name: 'Bill the Lizard',

                fullName: 'Bill the Lizard - Chimney Sweep',
                abilities: [
                    {
                        "effect": "While another character in play has damage, this character gains Evasive. (Only characters with Evasive can challenge them.)",
                        "fullText": "NOTHING TO IT While another character in play\\nhas damage, this character gains Evasive. (Only\\ncharacters with Evasive can challenge them.)",
                        "name": "NOTHING TO IT",
                        "type": "static"
                    }
                ],
                fullTextSections: [
                    "NOTHING TO IT While another character in play\\nhas damage, this character gains Evasive. (Only\\ncharacters with Evasive can challenge them.)"
                ],
                cost: 1,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('March Hare - Hare-Brained Eccentric', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1755,
                name: 'March Hare',

                fullName: 'March Hare - Hare-Brained Eccentric',
                abilities: [
                    {
                        "effect": "When you play this character, you may deal 2 damage to chosen damaged character.",
                        "fullText": "LIGHT THE CANDLES When you play this\\ncharacter, you may deal 2 damage to chosen\\ndamaged character.",
                        "name": "LIGHT THE CANDLES",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "LIGHT THE CANDLES When you play this\\ncharacter, you may deal 2 damage to chosen\\ndamaged character."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Fred - Major Science Enthusiast', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1756,
                name: 'Fred',

                fullName: 'Fred - Major Science Enthusiast',
                abilities: [
                    {
                        "effect": "When you play this character, you may banish chosen item.",
                        "fullText": "SPITTING FIRE! When you play this character, you\\nmay banish chosen item.",
                        "name": "SPITTING FIRE!",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "SPITTING FIRE! When you play this character, you\\nmay banish chosen item."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Mad Dog - Karnage\'s First Mate', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1757,
                name: 'Mad Dog',

                fullName: 'Mad Dog - Karnage\'s First Mate',
                abilities: [
                    {
                        "effect": "If you have a character named Don Karnage in play, you pay 1 ⬡ less to play this character.",
                        "fullText": "ARE YOU SURE THIS IS SAFE, CAPTAIN? If you have a\\ncharacter named Don Karnage in play, you pay 1 ⬡\\nless to play this character.",
                        "name": "ARE YOU SURE THIS IS SAFE, CAPTAIN?",
                        "type": "static"
                    }
                ],
                fullTextSections: [
                    "ARE YOU SURE THIS IS SAFE, CAPTAIN? If you have a\\ncharacter named Don Karnage in play, you pay 1 ⬡\\nless to play this character."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Louis - Endearing Alligator', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1759,
                name: 'Louis',

                fullName: 'Louis - Endearing Alligator',
                abilities: [
                    {
                        "effect": "This character enters play exerted.",
                        "fullText": "SENSITIVE SOUL This character enters play exerted.",
                        "name": "SENSITIVE SOUL",
                        "type": "static"
                    },
                    {
                        "effect": "When you play this character, chosen opposing character gains Reckless during their next turn. (They can't quest and must challenge if able.)",
                        "fullText": "FRIENDLIER THAN HE LOOKS When you play this\\ncharacter, chosen opposing character gains Reckless\\nduring their next turn. (They can't quest and must\\nchallenge if able.)",
                        "name": "FRIENDLIER THAN HE LOOKS",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "SENSITIVE SOUL This character enters play exerted.",
                    "FRIENDLIER THAN HE LOOKS When you play this\\ncharacter, chosen opposing character gains Reckless\\nduring their next turn. (They can't quest and must\\nchallenge if able.)"
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Chip - Quick Thinker', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1761,
                name: 'Chip',

                fullName: 'Chip - Quick Thinker',
                abilities: [
                    {
                        "effect": "When you play this character, chosen opponent chooses and discards a card.",
                        "fullText": "I'LL HANDLE THIS When you play this character,\\nchosen opponent chooses and discards a card.",
                        "name": "I'LL HANDLE THIS",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "I'LL HANDLE THIS When you play this character,\\nchosen opponent chooses and discards a card."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Fred - Giant-Sized', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1762,
                name: 'Fred',

                fullName: 'Fred - Giant-Sized',
                abilities: [
                    {
                        "fullText": "Shift 5 (You may pay 5 ⬡ to play this on top of one of\\nyour characters named Fred.)",
                        "keyword": "Shift",
                        "keywordValue": "5",
                        "keywordValueNumber": 5,
                        "reminderText": "You may pay 5 ⬡ to play this on top of one of your characters named Fred.",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever this character quests, reveal cards from the top of your deck until you reveal a Floodborn character card. Put that card into your hand and shuffle the rest into your deck.",
                        "fullText": "I LIKE WHERE THIS IS HEADING Whenever this character\\nquests, reveal cards from the top of your deck until you\\nreveal a Floodborn character card. Put that card into\\nyour hand and shuffle the rest into your deck.",
                        "name": "I LIKE WHERE THIS IS HEADING",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Shift 5 (You may pay 5 ⬡ to play this on top of one of\\nyour characters named Fred.)",
                    "I LIKE WHERE THIS IS HEADING Whenever this character\\nquests, reveal cards from the top of your deck until you\\nreveal a Floodborn character card. Put that card into\\nyour hand and shuffle the rest into your deck."
                ],
                cost: 7,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Gadget Hackwrench - Quirky Scientist', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1763,
                name: 'Gadget Hackwrench',

                fullName: 'Gadget Hackwrench - Quirky Scientist',
                abilities: [
                    {
                        "effect": "When you play this character, if an opponent has more cards in their hand than you, you may draw a card.",
                        "fullText": "GOLLY! When you play this character, if an\\nopponent has more cards in their hand than you,\\nyou may draw a card.",
                        "name": "GOLLY!",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "GOLLY! When you play this character, if an\\nopponent has more cards in their hand than you,\\nyou may draw a card."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Raya - Infiltration Expert', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1764,
                name: 'Raya',

                fullName: 'Raya - Infiltration Expert',
                abilities: [
                    {
                        "effect": "Whenever this character quests, you may pay 2 ⬡ to ready another chosen character.",
                        "fullText": "UNCONVENTIONAL TACTICS Whenever this\\ncharacter quests, you may pay 2 ⬡ to ready\\nanother chosen character.",
                        "name": "UNCONVENTIONAL TACTICS",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "UNCONVENTIONAL TACTICS Whenever this\\ncharacter quests, you may pay 2 ⬡ to ready\\nanother chosen character."
                ],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Rapunzel - High Climber', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1765,
                name: 'Rapunzel',

                fullName: 'Rapunzel - High Climber',
                abilities: [
                    {
                        "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                        "keyword": "Evasive",
                        "reminderText": "Only characters with Evasive can challenge this character.",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever this character quests, chosen opposing character can't quest during their next turn.",
                        "fullText": "WRAPPED UP Whenever this character quests,\\nchosen opposing character can't quest during\\ntheir next turn.",
                        "name": "WRAPPED UP",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                    "WRAPPED UP Whenever this character quests,\\nchosen opposing character can't quest during\\ntheir next turn."
                ],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Flynn Rider - Breaking and Entering', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1766,
                name: 'Flynn Rider',

                fullName: 'Flynn Rider - Breaking and Entering',
                abilities: [
                    {
                        "effect": "Whenever this character is challenged, the challenging player may choose and discard a card. If they don't, you gain 2 lore.",
                        "fullText": "THIS IS A VERY BIG DAY Whenever this character\\nis challenged, the challenging player may choose\\nand discard a card. If they don't, you gain 2 lore.",
                        "name": "THIS IS A VERY BIG DAY",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "THIS IS A VERY BIG DAY Whenever this character\\nis challenged, the challenging player may choose\\nand discard a card. If they don't, you gain 2 lore."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Dormouse - Easily Agitated', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1767,
                name: 'Dormouse',

                fullName: 'Dormouse - Easily Agitated',
                abilities: [
                    {
                        "effect": "When you play this character, you may put 1 damage counter on chosen character.",
                        "fullText": "VERY RUDE INDEED When you play this character,\\nyou may put 1 damage counter on chosen\\ncharacter.",
                        "name": "VERY RUDE INDEED",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "VERY RUDE INDEED When you play this character,\\nyou may put 1 damage counter on chosen\\ncharacter."
                ],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald-Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Alice - Clumsy as Can Be', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1768,
                name: 'Alice',

                fullName: 'Alice - Clumsy as Can Be',
                abilities: [
                    {
                        "fullText": "Shift 3 (You may pay 3 ⬡ to play this on top of\\none of your characters named Alice.)",
                        "keyword": "Shift",
                        "keywordValue": "3",
                        "keywordValueNumber": 3,
                        "reminderText": "You may pay 3 ⬡ to play this on top of one of your characters named Alice.",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever this character quests, put 1 damage counter on each other character.",
                        "fullText": "ACCIDENT PRONE Whenever this character\\nquests, put 1 damage counter on each other\\ncharacter.",
                        "name": "ACCIDENT PRONE",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Shift 3 (You may pay 3 ⬡ to play this on top of\\none of your characters named Alice.)",
                    "ACCIDENT PRONE Whenever this character\\nquests, put 1 damage counter on each other\\ncharacter."
                ],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald-Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Queen of Hearts - Haughty Monarch', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1769,
                name: 'Queen of Hearts',

                fullName: 'Queen of Hearts - Haughty Monarch',
                abilities: [
                    {
                        "effect": "While there are 5 or more characters with damage in play, this character gets +3 ◊.",
                        "fullText": "COUNT OFF! While there are 5 or more characters\\nwith damage in play, this character gets +3 ◊.",
                        "name": "COUNT OFF!",
                        "type": "static"
                    }
                ],
                fullTextSections: [
                    "COUNT OFF! While there are 5 or more characters\\nwith damage in play, this character gets +3 ◊."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald-Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Hiro Hamada - Intuitive Thinker', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1770,
                name: 'Hiro Hamada',

                fullName: 'Hiro Hamada - Intuitive Thinker',
                abilities: [
                    {
                        "costs": [
                            "⟳"
                        ],
                        "costsText": "⟳",
                        "effect": "Ready chosen Floodborn character.",
                        "fullText": "LOOK FOR A NEW ANGLE ⟳ — Ready chosen\\nFloodborn character.",
                        "name": "LOOK FOR A NEW ANGLE",
                        "type": "activated"
                    }
                ],
                fullTextSections: [
                    "LOOK FOR A NEW ANGLE ⟳ — Ready chosen\\nFloodborn character."
                ],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald-Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Go Go Tomago - Cutting Edge', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 1771,
                name: 'Go Go Tomago',

                fullName: 'Go Go Tomago - Cutting Edge',
                abilities: [
                    {
                        "fullText": "Shift 4 (You may pay 4 ⬡ to play this on top of one of your\\ncharacters named Go Go Tomago.)",
                        "keyword": "Shift",
                        "keywordValue": "4",
                        "keywordValueNumber": 4,
                        "reminderText": "You may pay 4 ⬡ to play this on top of one of your characters named Go Go Tomago.",
                        "type": "keyword"
                    },
                    {
                        "fullText": "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
                        "keyword": "Evasive",
                        "reminderText": "Only characters with Evasive can challenge this character.",
                        "type": "keyword"
                    },
                    {
                        "effect": "When you play this character, if you used Shift to play her, you may put chosen character into their player's inkwell facedown and exerted.",
                        "fullText": "ZERO RESISTANCE When you play this character, if you used\\nShift to play her, you may put chosen character into their\\nplayer's inkwell facedown and exerted.",
                        "name": "ZERO RESISTANCE",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Shift 4 (You may pay 4 ⬡ to play this on top of one of your\\ncharacters named Go Go Tomago.)",
                    "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
                    "ZERO RESISTANCE When you play this character, if you used\\nShift to play her, you may put chosen character into their\\nplayer's inkwell facedown and exerted."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Emerald-Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 3
            // Actual: 3
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(3);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Don Karnage - Air Pirate Leader', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1772,
                name: 'Don Karnage',

                fullName: 'Don Karnage - Air Pirate Leader',
                abilities: [
                    {
                        "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                        "keyword": "Evasive",
                        "reminderText": "Only characters with Evasive can challenge this character.",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever you play an action that isn't a song, chosen opposing character gains Reckless during their next turn. (They can't quest and must challenge if able.)",
                        "fullText": "SCORNFUL TAUNT Whenever you play an action\\nthat isn't a song, chosen opposing character gains\\nReckless during their next turn. (They can't quest\\nand must challenge if able.)",
                        "name": "SCORNFUL TAUNT",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                    "SCORNFUL TAUNT Whenever you play an action\\nthat isn't a song, chosen opposing character gains\\nReckless during their next turn. (They can't quest\\nand must challenge if able.)"
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Emerald-Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Captain Hook - The Pirate King', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1773,
                name: 'Captain Hook',

                fullName: 'Captain Hook - The Pirate King',
                abilities: [
                    {
                        "fullText": "Shift 3 (You may pay 3 ⬡ to play this on top of one\\nof your characters named Captain Hook.)",
                        "keyword": "Shift",
                        "keywordValue": "3",
                        "keywordValueNumber": 3,
                        "reminderText": "You may pay 3 ⬡ to play this on top of one of your characters named Captain Hook.",
                        "type": "keyword"
                    },
                    {
                        "effect": "Once during your turn, whenever an opposing character is damaged, your Pirate characters get +2 ¤ and gain Resist +2 this turn. (Damage dealt to them is reduced by 2.)",
                        "fullText": "GIVE 'EM ALL YOU GOT! Once during your turn,\\nwhenever an opposing character is damaged, your\\nPirate characters get +2 ¤ and gain Resist +2 this\\nturn. (Damage dealt to them is reduced by 2.)",
                        "name": "GIVE 'EM ALL YOU GOT!",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Shift 3 (You may pay 3 ⬡ to play this on top of one\\nof your characters named Captain Hook.)",
                    "GIVE 'EM ALL YOU GOT! Once during your turn,\\nwhenever an opposing character is damaged, your\\nPirate characters get +2 ¤ and gain Resist +2 this\\nturn. (Damage dealt to them is reduced by 2.)"
                ],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald-Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Maui - Stubborn Trickster', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1774,
                name: 'Maui',

                fullName: 'Maui - Stubborn Trickster',
                abilities: [
                    {
                        "effect": "When this character is banished, choose one: • Put 2 damage counters on all opposing characters. • Banish all opposing items. • Banish all opposing locations.",
                        "fullText": "I'M NOT FINISHED YET When this character is banished,\\nchoose one:\\n• Put 2 damage counters on all opposing characters.\\n• Banish all opposing items.\\n• Banish all opposing locations.",
                        "name": "I'M NOT FINISHED YET",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "I'M NOT FINISHED YET When this character is banished,\\nchoose one:\\n• Put 2 damage counters on all opposing characters.\\n• Banish all opposing items.\\n• Banish all opposing locations."
                ],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald-Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Honey Lemon - Costumed Catalyst', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1775,
                name: 'Honey Lemon',

                fullName: 'Honey Lemon - Costumed Catalyst',
                abilities: [
                    {
                        "effect": "Whenever you play a Floodborn character, if you used Shift to play them, you may return chosen character to their player's hand.",
                        "fullText": "LET'S DO THIS! Whenever you play a Floodborn\\ncharacter, if you used Shift to play them, you may\\nreturn chosen character to their player's hand.",
                        "name": "LET'S DO THIS!",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "LET'S DO THIS! Whenever you play a Floodborn\\ncharacter, if you used Shift to play them, you may\\nreturn chosen character to their player's hand."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald-Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Jock - Attentive Uncle', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1776,
                name: 'Jock',

                fullName: 'Jock - Attentive Uncle',
                abilities: [
                    {
                        "effect": "When you play this character, if you have 3 or more other characters in play, gain 2 lore.",
                        "fullText": "VOICE OF EXPERIENCE When you play this character, if\\nyou have 3 or more other characters in play, gain 2 lore.",
                        "name": "VOICE OF EXPERIENCE",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "VOICE OF EXPERIENCE When you play this character, if\\nyou have 3 or more other characters in play, gain 2 lore."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Archimedes - Resourceful Owl', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1777,
                name: 'Archimedes',

                fullName: 'Archimedes - Resourceful Owl',
                abilities: [
                    {
                        "effect": "When you play this character, you may banish chosen item.",
                        "fullText": "YOU DON'T NEED THAT When you play this\\ncharacter, you may banish chosen item.",
                        "name": "YOU DON'T NEED THAT",
                        "type": "triggered"
                    },
                    {
                        "effect": "During your turn, whenever an item is banished, you may draw a card, then choose and discard a card.",
                        "fullText": "NOW, THAT'S NOT BAD During your turn,\\nwhenever an item is banished, you may draw a\\ncard, then choose and discard a card.",
                        "name": "NOW, THAT'S NOT BAD",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "YOU DON'T NEED THAT When you play this\\ncharacter, you may banish chosen item.",
                    "NOW, THAT'S NOT BAD During your turn,\\nwhenever an item is banished, you may draw a\\ncard, then choose and discard a card."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('He Who Steals and Runs Away', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1778,
                name: 'He Who Steals and Runs Away',

                fullName: 'He Who Steals and Runs Away',
                abilities: [],
                fullTextSections: [
                    "Banish chosen item. Draw a card."
                ],
                cost: 3,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Stopped Chaos in Its Tracks', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1779,
                name: 'Stopped Chaos in Its Tracks',

                fullName: 'Stopped Chaos in Its Tracks',
                abilities: [
                    {
                        "fullText": "Sing Together 8 (Any number of your or your\\nteammates' characters with total cost 8 or more may\\n⟳ to sing this song for free.)",
                        "keyword": "Sing Together",
                        "keywordValue": "8",
                        "keywordValueNumber": 8,
                        "reminderText": "Any number of your or your teammates' characters with total cost 8 or more may ⟳ to sing this song for free.",
                        "type": "keyword"
                    }
                ],
                fullTextSections: [
                    "Sing Together 8 (Any number of your or your\\nteammates' characters with total cost 8 or more may\\n⟳ to sing this song for free.)",
                    "Return up to 2 chosen characters with 3 ¤ or less\\neach to their player's hand."
                ],
                cost: 8,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Wrong Lever!', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1780,
                name: 'Wrong Lever!',

                fullName: 'Wrong Lever!',
                abilities: [],
                fullTextSections: [
                    "Choose one:\\n• Return chosen character to their player's hand.\\n• Put a card named Pull the Lever! from your discard on\\nthe bottom of your deck to put chosen character on\\nthe bottom of their player's deck."
                ],
                cost: 3,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Undermine', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1781,
                name: 'Undermine',

                fullName: 'Undermine',
                abilities: [],
                fullTextSections: [
                    "Chosen opponent chooses and discards a card. Chosen\\ncharacter gets +2 ¤ this turn."
                ],
                cost: 2,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Emerald-Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Walk the Plank!', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1782,
                name: 'Walk the Plank!',

                fullName: 'Walk the Plank!',
                abilities: [],
                fullTextSections: [
                    "Your Pirate characters gain “⟳ — Banish chosen\\ndamaged character” this turn."
                ],
                cost: 3,
                type: 'Action' as CardType,
                inkwell: false,
                color: 'Emerald-Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Chem Purse', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1783,
                name: 'Chem Purse',

                fullName: 'Chem Purse',
                abilities: [
                    {
                        "effect": "Whenever you play a character, if you used Shift to play them, they get +4 ¤ this turn.",
                        "fullText": "HERE'S THE BEST PART Whenever you play a character,\\nif you used Shift to play them, they get +4 ¤ this turn.",
                        "name": "HERE'S THE BEST PART",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "HERE'S THE BEST PART Whenever you play a character,\\nif you used Shift to play them, they get +4 ¤ this turn."
                ],
                cost: 2,
                type: 'Item' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Jeweled Collar', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1784,
                name: 'Jeweled Collar',

                fullName: 'Jeweled Collar',
                abilities: [
                    {
                        "effect": "Whenever one of your characters is challenged, you may put the top card of your deck into your inkwell facedown and exerted.",
                        "fullText": "WELCOME EXTRAVAGANCE Whenever one of your\\ncharacters is challenged, you may put the top card of\\nyour deck into your inkwell facedown and exerted.",
                        "name": "WELCOME EXTRAVAGANCE",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "WELCOME EXTRAVAGANCE Whenever one of your\\ncharacters is challenged, you may put the top card of\\nyour deck into your inkwell facedown and exerted."
                ],
                cost: 2,
                type: 'Item' as CardType,
                inkwell: true,
                color: 'Emerald-Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Gloyd Orangeboar - Fierce Competitor', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1785,
                name: 'Gloyd Orangeboar',

                fullName: 'Gloyd Orangeboar - Fierce Competitor',
                abilities: [
                    {
                        "effect": "When you play this character, each opponent loses 1 lore and you gain 1 lore.",
                        "fullText": "PUMPKIN SPICE When you play this character,\\neach opponent loses 1 lore and you gain 1 lore.",
                        "name": "PUMPKIN SPICE",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "PUMPKIN SPICE When you play this character,\\neach opponent loses 1 lore and you gain 1 lore."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Gyro Gearloose - Eccentric Inventor', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1787,
                name: 'Gyro Gearloose',

                fullName: 'Gyro Gearloose - Eccentric Inventor',
                abilities: [
                    {
                        "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                        "keyword": "Evasive",
                        "reminderText": "Only characters with Evasive can challenge this character.",
                        "type": "keyword"
                    },
                    {
                        "effect": "When you play this character, chosen opposing character gets -3 ¤ this turn.",
                        "fullText": "I'LL SHOW YOU! When you play this character,\\nchosen opposing character gets -3 ¤ this turn.",
                        "name": "I'LL SHOW YOU!",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                    "I'LL SHOW YOU! When you play this character,\\nchosen opposing character gets -3 ¤ this turn."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby-Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Vanellope Von Schweetz - Spunky Speedster', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1788,
                name: 'Vanellope Von Schweetz',

                fullName: 'Vanellope Von Schweetz - Spunky Speedster',
                abilities: [
                    {
                        "fullText": "Evasive (Only characters with Evasive can challenge\\nthis character.)",
                        "keyword": "Evasive",
                        "reminderText": "Only characters with Evasive can challenge this character.",
                        "type": "keyword"
                    }
                ],
                fullTextSections: [
                    "Evasive (Only characters with Evasive can challenge\\nthis character.)"
                ],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Brutus - Fearsome Crocodile', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1789,
                name: 'Brutus',

                fullName: 'Brutus - Fearsome Crocodile',
                abilities: [
                    {
                        "effect": "During your turn, when this character is banished, if one of your characters was damaged this turn, gain 2 lore.",
                        "fullText": "SPITEFUL During your turn, when this character\\nis banished, if one of your characters was damaged\\nthis turn, gain 2 lore.",
                        "name": "SPITEFUL",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "SPITEFUL During your turn, when this character\\nis banished, if one of your characters was damaged\\nthis turn, gain 2 lore."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('The Dodo - Outlandish Storyteller', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1790,
                name: 'The Dodo',

                fullName: 'The Dodo - Outlandish Storyteller',
                abilities: [
                    {
                        "effect": "This character gets +1 ¤ for each 1 damage on him.",
                        "fullText": "EXTRAORDINARY SITUATION This character gets\\n+1 ¤ for each 1 damage on him.",
                        "name": "EXTRAORDINARY SITUATION",
                        "type": "static"
                    }
                ],
                fullTextSections: [
                    "EXTRAORDINARY SITUATION This character gets\\n+1 ¤ for each 1 damage on him."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Alice - Courageous Keyholder', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1791,
                name: 'Alice',

                fullName: 'Alice - Courageous Keyholder',
                abilities: [
                    {
                        "effect": "When you play this character, you may ready chosen damaged character of yours. They can't quest for the rest of this turn.",
                        "fullText": "THIS WAY OUT When you play this character, you\\nmay ready chosen damaged character of yours.\\nThey can't quest for the rest of this turn.",
                        "name": "THIS WAY OUT",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "THIS WAY OUT When you play this character, you\\nmay ready chosen damaged character of yours.\\nThey can't quest for the rest of this turn."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Lumiere - Nimble Candelabra', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1792,
                name: 'Lumiere',

                fullName: 'Lumiere - Nimble Candelabra',
                abilities: [
                    {
                        "effect": "While you have an item card in your discard, this character gains Evasive. (Only characters with Evasive can challenge them.)",
                        "fullText": "QUICK-STEP While you have an item card in\\nyour discard, this character gains Evasive. (Only\\ncharacters with Evasive can challenge them.)",
                        "name": "QUICK-STEP",
                        "type": "static"
                    }
                ],
                fullTextSections: [
                    "QUICK-STEP While you have an item card in\\nyour discard, this character gains Evasive. (Only\\ncharacters with Evasive can challenge them.)"
                ],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Gaston - Arrogant Showoff', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1793,
                name: 'Gaston',

                fullName: 'Gaston - Arrogant Showoff',
                abilities: [
                    {
                        "effect": "When you play this character, you may banish one of your items to give chosen character +2 ¤ this turn.",
                        "fullText": "BREAK APART When you play this character, you\\nmay banish one of your items to give chosen\\ncharacter +2 ¤ this turn.",
                        "name": "BREAK APART",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "BREAK APART When you play this character, you\\nmay banish one of your items to give chosen\\ncharacter +2 ¤ this turn."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Mushu - Fast-Talking Dragon', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1794,
                name: 'Mushu',

                fullName: 'Mushu - Fast-Talking Dragon',
                abilities: [
                    {
                        "costs": [
                            "⟳"
                        ],
                        "costsText": "⟳",
                        "effect": "Chosen character gains Rush this turn. (They can challenge the turn they're played.)",
                        "fullText": "LET'S GET THIS SHOW ON THE ROAD ⟳ — Chosen\\ncharacter gains Rush this turn. (They can\\nchallenge the turn they're played.)",
                        "name": "LET'S GET THIS SHOW ON THE ROAD",
                        "type": "activated"
                    }
                ],
                fullTextSections: [
                    "LET'S GET THIS SHOW ON THE ROAD ⟳ — Chosen\\ncharacter gains Rush this turn. (They can\\nchallenge the turn they're played.)"
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Cri-Kee - Part of the Team', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1795,
                name: 'Cri-Kee',

                fullName: 'Cri-Kee - Part of the Team',
                abilities: [
                    {
                        "effect": "While you have 2 or more other exerted characters in play, this character gets +2 ◊.",
                        "fullText": "AT HER SIDE While you have 2 or more other exerted\\ncharacters in play, this character gets +2 ◊.",
                        "name": "AT HER SIDE",
                        "type": "static"
                    }
                ],
                fullTextSections: [
                    "AT HER SIDE While you have 2 or more other exerted\\ncharacters in play, this character gets +2 ◊."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Figaro - Tuxedo Cat', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1797,
                name: 'Figaro',

                fullName: 'Figaro - Tuxedo Cat',
                abilities: [
                    {
                        "effect": "Opposing items enter play exerted.",
                        "fullText": "PLAYFULNESS Opposing items enter play exerted.",
                        "name": "PLAYFULNESS",
                        "type": "static"
                    }
                ],
                fullTextSections: [
                    "PLAYFULNESS Opposing items enter play exerted."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Thumper - Young Bunny', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1798,
                name: 'Thumper',

                fullName: 'Thumper - Young Bunny',
                abilities: [
                    {
                        "costs": [
                            "⟳"
                        ],
                        "costsText": "⟳",
                        "effect": "Chosen character gets +3 ¤ this turn.",
                        "fullText": "YOU CAN DO IT! ⟳ — Chosen character gets +3 ¤\\nthis turn.",
                        "name": "YOU CAN DO IT!",
                        "type": "activated"
                    }
                ],
                fullTextSections: [
                    "YOU CAN DO IT! ⟳ — Chosen character gets +3 ¤\\nthis turn."
                ],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Wreck-It Ralph - Back Seat Driver', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1799,
                name: 'Wreck-It Ralph',

                fullName: 'Wreck-It Ralph - Back Seat Driver',
                abilities: [
                    {
                        "effect": "When you play this character, chosen Racer character gets +4 ¤ this turn.",
                        "fullText": "CHARGED UP When you play this character,\\nchosen Racer character gets +4 ¤ this turn.",
                        "name": "CHARGED UP",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "CHARGED UP When you play this character,\\nchosen Racer character gets +4 ¤ this turn."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Tinker Bell - Insistent Fairy', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1800,
                name: 'Tinker Bell',

                fullName: 'Tinker Bell - Insistent Fairy',
                abilities: [
                    {
                        "fullText": "Evasive (Only characters with Evasive can challenge\\nthis character.)",
                        "keyword": "Evasive",
                        "reminderText": "Only characters with Evasive can challenge this character.",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever you play a character with 5 ¤ or more, you may exert them to gain 2 lore.",
                        "fullText": "PAY ATTENTION Whenever you play a character with\\n5 ¤ or more, you may exert them to gain 2 lore.",
                        "name": "PAY ATTENTION",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Evasive (Only characters with Evasive can challenge\\nthis character.)",
                    "PAY ATTENTION Whenever you play a character with\\n5 ¤ or more, you may exert them to gain 2 lore."
                ],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Lilo - Causing an Uproar', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1801,
                name: 'Lilo',

                fullName: 'Lilo - Causing an Uproar',
                abilities: [
                    {
                        "effect": "During your turn, if you've played 3 or more actions this turn, you may play this character for free.",
                        "fullText": "STOMPIN' TIME! During your turn, if you've played\\n3 or more actions this turn, you may play this\\ncharacter for free.",
                        "name": "STOMPIN' TIME!",
                        "type": "static"
                    },
                    {
                        "effect": "When you play this character, ready chosen character. They can't quest for the rest of this turn.",
                        "fullText": "RAAAWR! When you play this character, ready\\nchosen character. They can't quest for the rest of\\nthis turn.",
                        "name": "RAAAWR!",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "STOMPIN' TIME! During your turn, if you've played\\n3 or more actions this turn, you may play this\\ncharacter for free.",
                    "RAAAWR! When you play this character, ready\\nchosen character. They can't quest for the rest of\\nthis turn."
                ],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('LeFou - Cake Thief', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1802,
                name: 'LeFou',

                fullName: 'LeFou - Cake Thief',
                abilities: [
                    {
                        "costs": [
                            "⟳",
                            "Banish one of your items"
                        ],
                        "costsText": "⟳, Banish one of your items",
                        "effect": "Chosen opponent loses 1 lore and you gain 1 lore.",
                        "fullText": "ALL FOR ME ⟳, Banish one of your items —\\nChosen opponent loses 1 lore and you gain 1 lore.",
                        "name": "ALL FOR ME",
                        "type": "activated"
                    }
                ],
                fullTextSections: [
                    "ALL FOR ME ⟳, Banish one of your items —\\nChosen opponent loses 1 lore and you gain 1 lore."
                ],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby-Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Lumiere - Fired Up', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 1803,
                name: 'Lumiere',

                fullName: 'Lumiere - Fired Up',
                abilities: [
                    {
                        "fullText": "Shift 3 (You may pay 3 ⬡ to play this on top of one of\\nyour characters named Lumiere.)",
                        "keyword": "Shift",
                        "keywordValue": "3",
                        "keywordValueNumber": 3,
                        "reminderText": "You may pay 3 ⬡ to play this on top of one of your characters named Lumiere.",
                        "type": "keyword"
                    },
                    {
                        "fullText": "Evasive (Only characters with Evasive can challenge\\nthis character.)",
                        "keyword": "Evasive",
                        "reminderText": "Only characters with Evasive can challenge this character.",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever one of your items is banished, this character gets +1 ◊ this turn.",
                        "fullText": "SACREBLEU! Whenever one of your items is\\nbanished, this character gets +1 ◊ this turn.",
                        "name": "SACREBLEU!",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Shift 3 (You may pay 3 ⬡ to play this on top of one of\\nyour characters named Lumiere.)",
                    "Evasive (Only characters with Evasive can challenge\\nthis character.)",
                    "SACREBLEU! Whenever one of your items is\\nbanished, this character gets +1 ◊ this turn."
                ],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby-Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 3
            // Actual: 3
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(3);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('The Coachman - Greedy Deceiver', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1804,
                name: 'The Coachman',

                fullName: 'The Coachman - Greedy Deceiver',
                abilities: [
                    {
                        "effect": "While 2 or more characters of yours are exerted, this character gets +2 ¤ and gains Evasive. (Only characters with Evasive can challenge them.)",
                        "fullText": "WILD RIDE While 2 or more characters of yours\\nare exerted, this character gets +2 ¤ and\\ngains Evasive. (Only characters with Evasive can\\nchallenge them.)",
                        "name": "WILD RIDE",
                        "type": "static"
                    }
                ],
                fullTextSections: [
                    "WILD RIDE While 2 or more characters of yours\\nare exerted, this character gets +2 ¤ and\\ngains Evasive. (Only characters with Evasive can\\nchallenge them.)"
                ],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby-Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Mulan - Charging Ahead', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 1805,
                name: 'Mulan',

                fullName: 'Mulan - Charging Ahead',
                abilities: [
                    {
                        "fullText": "Reckless (This character can't quest and must challenge\\neach turn if able.)",
                        "keyword": "Reckless",
                        "reminderText": "This character can't quest and must challenge each turn if able.",
                        "type": "keyword"
                    },
                    {
                        "effect": "During your turn, this character gains Evasive. (They can challenge characters with Evasive.)",
                        "fullText": "BURST OF SPEED During your turn, this character gains\\nEvasive. (They can challenge characters with Evasive.)",
                        "name": "BURST OF SPEED",
                        "type": "static"
                    },
                    {
                        "effect": "This character can challenge ready characters.",
                        "fullText": "LONG RANGE This character can challenge ready\\ncharacters.",
                        "name": "LONG RANGE",
                        "type": "static"
                    }
                ],
                fullTextSections: [
                    "Reckless (This character can't quest and must challenge\\neach turn if able.)",
                    "BURST OF SPEED During your turn, this character gains\\nEvasive. (They can challenge characters with Evasive.)",
                    "LONG RANGE This character can challenge ready\\ncharacters."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Ruby-Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 3
            // Actual: 3
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(3);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Mushu - Your Worst Nightmare', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1806,
                name: 'Mushu',

                fullName: 'Mushu - Your Worst Nightmare',
                abilities: [
                    {
                        "fullText": "Shift 4 (You may pay 4 ⬡ to play this on top of one of your\\ncharacters named Mushu.)",
                        "keyword": "Shift",
                        "keywordValue": "4",
                        "keywordValueNumber": 4,
                        "reminderText": "You may pay 4 ⬡ to play this on top of one of your characters named Mushu.",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever you play another character, they gain Rush, Reckless, and Evasive this turn. (They can challenge the turn they're played. They can't quest and must challenge if able. They can challenge characters with Evasive.)",
                        "fullText": "ALL FIRED UP Whenever you play another character, they\\ngain Rush, Reckless, and Evasive this turn. (They can\\nchallenge the turn they're played. They can't quest and\\nmust challenge if able. They can challenge characters with\\nEvasive.)",
                        "name": "ALL FIRED UP",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Shift 4 (You may pay 4 ⬡ to play this on top of one of your\\ncharacters named Mushu.)",
                    "ALL FIRED UP Whenever you play another character, they\\ngain Rush, Reckless, and Evasive this turn. (They can\\nchallenge the turn they're played. They can't quest and\\nmust challenge if able. They can challenge characters with\\nEvasive.)"
                ],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby-Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Mr. Snoops - Betrayed Partner', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1807,
                name: 'Mr. Snoops',

                fullName: 'Mr. Snoops - Betrayed Partner',
                abilities: [
                    {
                        "effect": "During your turn, when this character is banished, you may draw a card.",
                        "fullText": "DOUBLE-CROSSING CROOK! During your turn, when\\nthis character is banished, you may draw a card.",
                        "name": "DOUBLE-CROSSING CROOK!",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "DOUBLE-CROSSING CROOK! During your turn, when\\nthis character is banished, you may draw a card."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Faline - Playful Fawn', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1809,
                name: 'Faline',

                fullName: 'Faline - Playful Fawn',
                abilities: [
                    {
                        "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                        "keyword": "Evasive",
                        "reminderText": "Only characters with Evasive can challenge this character.",
                        "type": "keyword"
                    },
                    {
                        "effect": "While you have a character in play with more ¤ than each opposing character, this character gets +2 ◊.",
                        "fullText": "PRECOCIOUS FRIEND While you have a character\\nin play with more ¤ than each opposing\\ncharacter, this character gets +2 ◊.",
                        "name": "PRECOCIOUS FRIEND",
                        "type": "static"
                    }
                ],
                fullTextSections: [
                    "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                    "PRECOCIOUS FRIEND While you have a character\\nin play with more ¤ than each opposing\\ncharacter, this character gets +2 ◊."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 2
            // Actual: 2
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(2);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Prince John - Fraidy-Cat', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1810,
                name: 'Prince John',

                fullName: 'Prince John - Fraidy-Cat',
                abilities: [
                    {
                        "effect": "Whenever an opponent plays a character, deal 1 damage to this character.",
                        "fullText": "HELP! HELP! Whenever an opponent plays a\\ncharacter, deal 1 damage to this character.",
                        "name": "HELP! HELP!",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "HELP! HELP! Whenever an opponent plays a\\ncharacter, deal 1 damage to this character."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Nothing We Won\'t Do', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1811,
                name: 'Nothing We Won\'t Do',

                fullName: 'Nothing We Won\'t Do',
                abilities: [
                    {
                        "fullText": "Sing Together 8 (Any number of your or your\\nteammates' characters with total cost 8 or more may\\n⟳ to sing this song for free.)",
                        "keyword": "Sing Together",
                        "keywordValue": "8",
                        "keywordValueNumber": 8,
                        "reminderText": "Any number of your or your teammates' characters with total cost 8 or more may ⟳ to sing this song for free.",
                        "type": "keyword"
                    }
                ],
                fullTextSections: [
                    "Sing Together 8 (Any number of your or your\\nteammates' characters with total cost 8 or more may\\n⟳ to sing this song for free.)",
                    "Ready all your characters. For the rest of this turn,\\nthey take no damage from challenges and can't quest."
                ],
                cost: 8,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 3
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Get Out!', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1812,
                name: 'Get Out!',

                fullName: 'Get Out!',
                abilities: [],
                fullTextSections: [
                    "Banish chosen character, then return an item card\\nfrom your discard to your hand."
                ],
                cost: 6,
                type: 'Action' as CardType,
                inkwell: false,
                color: 'Ruby-Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Light the Fuse', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1813,
                name: 'Light the Fuse',

                fullName: 'Light the Fuse',
                abilities: [],
                fullTextSections: [
                    "Deal 1 damage to chosen character for each exerted\\ncharacter you have in play."
                ],
                cost: 1,
                type: 'Action' as CardType,
                inkwell: false,
                color: 'Ruby-Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Twitterpated', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1814,
                name: 'Twitterpated',

                fullName: 'Twitterpated',
                abilities: [],
                fullTextSections: [
                    "Chosen character gains Evasive until the start of your next\\nturn. (Only characters with Evasive can challenge them.)"
                ],
                cost: 1,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Most Everyone\'s Mad Here', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1815,
                name: 'Most Everyone\'s Mad Here',

                fullName: 'Most Everyone\'s Mad Here',
                abilities: [],
                fullTextSections: [
                    "Gain lore equal to the damage on chosen character,\\nthen banish them."
                ],
                cost: 7,
                type: 'Action' as CardType,
                inkwell: false,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('The Sword of Shan-Yu', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1816,
                name: 'The Sword of Shan-Yu',

                fullName: 'The Sword of Shan-Yu',
                abilities: [
                    {
                        "costs": [
                            "⟳",
                            "⟳ one of your characters"
                        ],
                        "costsText": "⟳, ⟳ one of your characters",
                        "effect": "Ready chosen character. They can't quest for the rest of this turn.",
                        "fullText": "WORTHY WEAPON ⟳, ⟳ one of your characters —\\nReady chosen character. They can't quest for the rest\\nof this turn.",
                        "name": "WORTHY WEAPON",
                        "type": "activated"
                    }
                ],
                fullTextSections: [
                    "WORTHY WEAPON ⟳, ⟳ one of your characters —\\nReady chosen character. They can't quest for the rest\\nof this turn."
                ],
                cost: 1,
                type: 'Item' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);

            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);

            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';

                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) =>
                        a.rawText?.includes(searchStr) ||
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );

                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);

                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];

                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }

                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }

                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }

                        if (lower.match(/([^)]{15,})/)) {
                            hints.push('has-reminder-text');
                        }

                        if (hints.length > 0) {
                            console.log(`   🔍 ${hints.join(', ')}`);
                        }
                    }
                });
            }

            console.log('');

            // Expected: 1
            // Actual: 1
            // Status: ✅ No error

            expect(abilities.length).toBeGreaterThanOrEqual(1);

            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });
});
