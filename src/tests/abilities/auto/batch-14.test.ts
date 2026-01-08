import { parseToAbilityDefinition } from '../../../engine/ability-parser';
import { GameEvent } from '../../../engine/abilities/events';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { ZoneType } from '../../../engine/models';
import { CardType } from '../../../engine/models';

describe('Parser Batch 14', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    
    beforeEach(() => {
        game = new GameStateManager();
        const p1Id = game.addPlayer('Player 1');
        const p2Id = game.addPlayer('Player 2');
        turnManager = new TurnManager(game);
    });
    describe('Te Kā - Lava Monster', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1491,
                name: 'Te Kā',
                
                fullName: 'Te Kā - Lava Monster',
                abilities: [
          {
                    "fullText": "Challenger +2 (While challenging, this character\\ngets +2 ¤.)",
                    "keyword": "Challenger",
                    "keywordValue": "+2",
                    "keywordValueNumber": 2,
                    "reminderText": "While challenging, this character gets +2 ¤.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Challenger +2 (While challenging, this character\\ngets +2 ¤.)"
],
                cost: 6,
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

    describe('Yzma - Transformed Kitten', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1492,
                name: 'Yzma',
                
                fullName: 'Yzma - Transformed Kitten',
                abilities: [
          {
                    "effect": "When this character is banished, if you have more cards in your hand than each opponent, you may return this card to your hand.",
                    "fullText": "I WIN When this character is banished, if\\nyou have more cards in your hand than each\\nopponent, you may return this card to your hand.",
                    "name": "I WIN",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "I WIN When this character is banished, if\\nyou have more cards in your hand than each\\nopponent, you may return this card to your hand."
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

    describe('Bucky - Nutty Rascal', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1493,
                name: 'Bucky',
                
                fullName: 'Bucky - Nutty Rascal',
                abilities: [
          {
                    "effect": "When this character is banished in a challenge, you may draw a card.",
                    "fullText": "POP! When this character is banished in a\\nchallenge, you may draw a card.",
                    "name": "POP!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "POP! When this character is banished in a\\nchallenge, you may draw a card."
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

    describe('Rajah - Ghostly Tiger', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1495,
                name: 'Rajah',
                
                fullName: 'Rajah - Ghostly Tiger',
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

    describe('Kronk - Laid Back', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1496,
                name: 'Kronk',
                
                fullName: 'Kronk - Laid Back',
                abilities: [
          {
                    "fullText": "Ward (Opponents can't choose this character\\nexcept to challenge.)",
                    "keyword": "Ward",
                    "reminderText": "Opponents can't choose this character except to challenge.",
                    "type": "keyword"
          },
          {
                    "effect": "If an effect would cause you to discard one or more cards, you don't discard.",
                    "fullText": "I'M LOVIN' THIS If an effect would cause you to\\ndiscard one or more cards, you don't discard.",
                    "name": "I'M LOVIN' THIS",
                    "type": "static"
          }
],
                fullTextSections: [
          "Ward (Opponents can't choose this character\\nexcept to challenge.)",
          "I'M LOVIN' THIS If an effect would cause you to\\ndiscard one or more cards, you don't discard."
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

    describe('Mother Gothel - Vain Sorceress', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1497,
                name: 'Mother Gothel',
                
                fullName: 'Mother Gothel - Vain Sorceress',
                abilities: [
          {
                    "effect": "Whenever one of your characters challenges, you may move 1 damage counter from chosen character to chosen opposing character.",
                    "fullText": "NOW YOU'VE UPSET ME Whenever one of your\\ncharacters challenges, you may move 1 damage\\ncounter from chosen character to chosen\\nopposing character.",
                    "name": "NOW YOU'VE UPSET ME",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "NOW YOU'VE UPSET ME Whenever one of your\\ncharacters challenges, you may move 1 damage\\ncounter from chosen character to chosen\\nopposing character."
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

    describe('Sven - Keen-Eyed Reindeer', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1498,
                name: 'Sven',
                
                fullName: 'Sven - Keen-Eyed Reindeer',
                abilities: [
          {
                    "fullText": "Rush (This character can challenge the turn\\nthey're played.)",
                    "keyword": "Rush",
                    "reminderText": "This character can challenge the turn they're played.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, chosen character gets -3 ¤ this turn.",
                    "fullText": "FORMIDABLE GLARE When you play this\\ncharacter, chosen character gets -3 ¤ this turn.",
                    "name": "FORMIDABLE GLARE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Rush (This character can challenge the turn\\nthey're played.)",
          "FORMIDABLE GLARE When you play this\\ncharacter, chosen character gets -3 ¤ this turn."
],
                cost: 5,
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

    describe('Diablo - Spiteful Raven', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1499,
                name: 'Diablo',
                
                fullName: 'Diablo - Spiteful Raven',
                abilities: [
          {
                    "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                    "keyword": "Evasive",
                    "reminderText": "Only characters with Evasive can challenge this character.",
                    "type": "keyword"
          },
          {
                    "fullText": "Challenger +2 (While challenging, this character\\ngets +2 ¤.)",
                    "keyword": "Challenger",
                    "keywordValue": "+2",
                    "keywordValueNumber": 2,
                    "reminderText": "While challenging, this character gets +2 ¤.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Evasive (Only characters with Evasive can\\nchallenge this character.)",
          "Challenger +2 (While challenging, this character\\ngets +2 ¤.)"
],
                cost: 2,
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

    describe('Merlin - Clever Clairvoyant', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1500,
                name: 'Merlin',
                
                fullName: 'Merlin - Clever Clairvoyant',
                abilities: [
          {
                    "effect": "Whenever this character quests, name a card, then reveal the top card of your deck. If it's the named card, put it into your inkwell facedown and exerted. Otherwise, put it on the top of your deck.",
                    "fullText": "PRESTIDIGITONIUM Whenever this character\\nquests, name a card, then reveal the top card of\\nyour deck. If it's the named card, put it into your\\ninkwell facedown and exerted. Otherwise, put it\\non the top of your deck.",
                    "name": "PRESTIDIGITONIUM",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "PRESTIDIGITONIUM Whenever this character\\nquests, name a card, then reveal the top card of\\nyour deck. If it's the named card, put it into your\\ninkwell facedown and exerted. Otherwise, put it\\non the top of your deck."
],
                cost: 1,
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

    describe('Yzma - Above It All', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 1501,
                name: 'Yzma',
                
                fullName: 'Yzma - Above It All',
                abilities: [
          {
                    "fullText": "Shift 5 (You may pay 5 ⬡ to play this on top of one of your\\ncharacters named Yzma.)",
                    "keyword": "Shift",
                    "keywordValue": "5",
                    "keywordValueNumber": 5,
                    "reminderText": "You may pay 5 ⬡ to play this on top of one of your characters named Yzma.",
                    "type": "keyword"
          },
          {
                    "fullText": "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
                    "keyword": "Evasive",
                    "reminderText": "Only characters with Evasive can challenge this character.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever another character is banished in a challenge, return that card to its player's hand, then that player discards a card at random.",
                    "fullText": "BACK TO WORK Whenever another character is banished in\\na challenge, return that card to its player's hand, then that\\nplayer discards a card at random.",
                    "name": "BACK TO WORK",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 5 (You may pay 5 ⬡ to play this on top of one of your\\ncharacters named Yzma.)",
          "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
          "BACK TO WORK Whenever another character is banished in\\na challenge, return that card to its player's hand, then that\\nplayer discards a card at random."
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

    describe('Elsa - Ice Maker', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1502,
                name: 'Elsa',
                
                fullName: 'Elsa - Ice Maker',
                abilities: [
          {
                    "fullText": "Shift 4 (You may pay 4 ⬡ to play this on top of one of\\nyour characters named Elsa.)",
                    "keyword": "Shift",
                    "keywordValue": "4",
                    "keywordValueNumber": 4,
                    "reminderText": "You may pay 4 ⬡ to play this on top of one of your characters named Elsa.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever this character quests, you may exert chosen character. If you do and you have a character named Anna in play, the chosen character can't ready at the start of their next turn.",
                    "fullText": "WINTER WALL Whenever this character quests, you\\nmay exert chosen character. If you do and you have a\\ncharacter named Anna in play, the chosen character\\ncan't ready at the start of their next turn.",
                    "name": "WINTER WALL",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 4 (You may pay 4 ⬡ to play this on top of one of\\nyour characters named Elsa.)",
          "WINTER WALL Whenever this character quests, you\\nmay exert chosen character. If you do and you have a\\ncharacter named Anna in play, the chosen character\\ncan't ready at the start of their next turn."
],
                cost: 7,
                type: 'Character' as CardType,
                inkwell: false,
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

    describe('Kenai - Magical Bear', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1503,
                name: 'Kenai',
                
                fullName: 'Kenai - Magical Bear',
                abilities: [
          {
                    "fullText": "Challenger +2 (While challenging, this character\\ngets +2 ¤.)",
                    "keyword": "Challenger",
                    "keywordValue": "+2",
                    "keywordValueNumber": 2,
                    "reminderText": "While challenging, this character gets +2 ¤.",
                    "type": "keyword"
          },
          {
                    "effect": "During your turn, when this character is banished in a challenge, return this card to your hand and gain 1 lore.",
                    "fullText": "WISDOM OF HIS STORY During your turn, when\\nthis character is banished in a challenge, return\\nthis card to your hand and gain 1 lore.",
                    "name": "WISDOM OF HIS STORY",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Challenger +2 (While challenging, this character\\ngets +2 ¤.)",
          "WISDOM OF HIS STORY During your turn, when\\nthis character is banished in a challenge, return\\nthis card to your hand and gain 1 lore."
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

    describe('Kuzco - Panicked Llama', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1504,
                name: 'Kuzco',
                
                fullName: 'Kuzco - Panicked Llama',
                abilities: [
          {
                    "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                    "keyword": "Evasive",
                    "reminderText": "Only characters with Evasive can challenge this character.",
                    "type": "keyword"
          },
          {
                    "effect": "At the start of your turn, choose one: • Each player draws a card. • Each player chooses and discards a card.",
                    "fullText": "WE CAN FIGURE THIS OUT At the start of your\\nturn, choose one:\\n• Each player draws a card.\\n• Each player chooses and discards a card.",
                    "name": "WE CAN FIGURE THIS OUT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Evasive (Only characters with Evasive can\\nchallenge this character.)",
          "WE CAN FIGURE THIS OUT At the start of your\\nturn, choose one:\\n• Each player draws a card.\\n• Each player chooses and discards a card."
],
                cost: 4,
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

    describe('Anna - Ice Breaker', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1505,
                name: 'Anna',
                
                fullName: 'Anna - Ice Breaker',
                abilities: [
          {
                    "fullText": "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)",
                    "keyword": "Support",
                    "reminderText": "Whenever this character quests, you may add their ¤ to another chosen character's ¤ this turn.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, chosen opposing character can't ready at the start of their next turn.",
                    "fullText": "WINTER AMBUSH When you play this character,\\nchosen opposing character can't ready at the\\nstart of their next turn.",
                    "name": "WINTER AMBUSH",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)",
          "WINTER AMBUSH When you play this character,\\nchosen opposing character can't ready at the\\nstart of their next turn."
],
                cost: 4,
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

    describe('Donald Duck - Flustered Sorcerer', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1506,
                name: 'Donald Duck',
                
                fullName: 'Donald Duck - Flustered Sorcerer',
                abilities: [
          {
                    "effect": "Opponents need 25 lore to win the game.",
                    "fullText": "OBFUSCATE! Opponents need 25 lore to win the game.",
                    "name": "OBFUSCATE!",
                    "type": "static"
          }
],
                fullTextSections: [
          "OBFUSCATE! Opponents need 25 lore to win the game."
],
                cost: 7,
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

    describe('The Queen - Jealous Beauty', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1507,
                name: 'The Queen',
                
                fullName: 'The Queen - Jealous Beauty',
                abilities: [
          {
                    "costs": [
                              "⟳"
                    ],
                    "costsText": "⟳",
                    "effect": "Choose 3 cards from chosen opponent's discard and put them on the bottom of their deck to gain 3 lore. If any Princess cards were moved this way, gain 4 lore instead.",
                    "fullText": "NO ORDINARY APPLE ⟳ — Choose 3 cards from\\nchosen opponent's discard and put them on\\nthe bottom of their deck to gain 3 lore. If any\\nPrincess cards were moved this way, gain 4 lore\\ninstead.",
                    "name": "NO ORDINARY APPLE",
                    "type": "activated"
          }
],
                fullTextSections: [
          "NO ORDINARY APPLE ⟳ — Choose 3 cards from\\nchosen opponent's discard and put them on\\nthe bottom of their deck to gain 3 lore. If any\\nPrincess cards were moved this way, gain 4 lore\\ninstead."
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

    describe('Panic - High-Strung Imp', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1508,
                name: 'Panic',
                
                fullName: 'Panic - High-Strung Imp',
                abilities: [
          {
                    "effect": "When you play this character, you may move up to 2 damage counters from chosen character to chosen opposing character.",
                    "fullText": "STARTLED SHRIEK When you play this character,\\nyou may move up to 2 damage counters from\\nchosen character to chosen opposing character.",
                    "name": "STARTLED SHRIEK",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "STARTLED SHRIEK When you play this character,\\nyou may move up to 2 damage counters from\\nchosen character to chosen opposing character."
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

    describe('Archimedes - Exceptional Owl', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1509,
                name: 'Archimedes',
                
                fullName: 'Archimedes - Exceptional Owl',
                abilities: [
          {
                    "effect": "Whenever an opponent chooses this character for an action or ability, you may draw a card.",
                    "fullText": "MORE TO LEARN Whenever an opponent chooses\\nthis character for an action or ability, you may\\ndraw a card.",
                    "name": "MORE TO LEARN",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "MORE TO LEARN Whenever an opponent chooses\\nthis character for an action or ability, you may\\ndraw a card."
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

    describe('Dolores Madrigal - Within Earshot', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1511,
                name: 'Dolores Madrigal',
                
                fullName: 'Dolores Madrigal - Within Earshot',
                abilities: [
          {
                    "effect": "Whenever one of your characters sings a song, chosen opponent reveals their hand.",
                    "fullText": "I HEAR YOU Whenever one of your characters\\nsings a song, chosen opponent reveals their hand.",
                    "name": "I HEAR YOU",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "I HEAR YOU Whenever one of your characters\\nsings a song, chosen opponent reveals their hand."
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

    describe('Mufasa - Among the Stars', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 1512,
                name: 'Mufasa',
                
                fullName: 'Mufasa - Among the Stars',
                abilities: [
          {
                    "fullText": "Shift 5 (You may pay 5 ⬡ to play this on top of one of\\nyour characters named Mufasa.)",
                    "keyword": "Shift",
                    "keywordValue": "5",
                    "keywordValueNumber": 5,
                    "reminderText": "You may pay 5 ⬡ to play this on top of one of your characters named Mufasa.",
                    "type": "keyword"
          },
          {
                    "fullText": "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
                    "keyword": "Evasive",
                    "reminderText": "Only characters with Evasive can challenge this character.",
                    "type": "keyword"
          },
          {
                    "fullText": "Resist +1 (Damage dealt to this character is reduced by 1.)",
                    "keyword": "Resist",
                    "keywordValue": "+1",
                    "keywordValueNumber": 1,
                    "reminderText": "Damage dealt to this character is reduced by 1.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Shift 5 (You may pay 5 ⬡ to play this on top of one of\\nyour characters named Mufasa.)",
          "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
          "Resist +1 (Damage dealt to this character is reduced by 1.)"
],
                cost: 7,
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

    describe('Magical Maneuvers', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1513,
                name: 'Magical Maneuvers',
                
                fullName: 'Magical Maneuvers',
                abilities: [],
                fullTextSections: [
          "Return chosen character of yours to your hand. Exert\\nchosen character."
],
                cost: 2,
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

    describe('This Is My Family', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1514,
                name: 'This Is My Family',
                
                fullName: 'This Is My Family',
                abilities: [
          {
                    "effect": "A character with cost 2 or more can ⟳ to sing this song for free.",
                    "fullText": "(A character with cost 2 or more can ⟳ to sing this\\nsong for free.)",
                    "type": "static"
          }
],
                fullTextSections: [
          "(A character with cost 2 or more can ⟳ to sing this\\nsong for free.)",
          "Gain 1 lore. Draw a card."
],
                cost: 2,
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

    describe('Show Me More!', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1515,
                name: 'Show Me More!',
                
                fullName: 'Show Me More!',
                abilities: [],
                fullTextSections: [
          "Each player draws 3 cards."
],
                cost: 2,
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

    describe('Restoring the Crown', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1516,
                name: 'Restoring the Crown',
                
                fullName: 'Restoring the Crown',
                abilities: [],
                fullTextSections: [
          "Exert all opposing characters. Whenever one of your\\ncharacters banishes another character in a challenge\\nthis turn, gain 2 lore."
],
                cost: 6,
                type: 'Action' as CardType,
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

    describe('Amethyst Coil', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1517,
                name: 'Amethyst Coil',
                
                fullName: 'Amethyst Coil',
                abilities: [
          {
                    "effect": "During your turn, whenever a card is put into your inkwell, you may move 1 damage counter from chosen character to chosen opposing character.",
                    "fullText": "MAGICAL TOUCH During your turn, whenever a card is\\nput into your inkwell, you may move 1 damage counter\\nfrom chosen character to chosen opposing character.",
                    "name": "MAGICAL TOUCH",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "MAGICAL TOUCH During your turn, whenever a card is\\nput into your inkwell, you may move 1 damage counter\\nfrom chosen character to chosen opposing character."
],
                cost: 3,
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

    describe('Grewnge - Cannon Expert', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1519,
                name: 'Grewnge',
                
                fullName: 'Grewnge - Cannon Expert',
                abilities: [
          {
                    "effect": "Whenever this character quests, you pay 1 ⬡ less for the next action you play this turn.",
                    "fullText": "RAPID FIRE Whenever this character quests, you\\npay 1 ⬡ less for the next action you play this turn.",
                    "name": "RAPID FIRE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "RAPID FIRE Whenever this character quests, you\\npay 1 ⬡ less for the next action you play this turn."
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

    describe('Baymax - Low Battery', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1520,
                name: 'Baymax',
                
                fullName: 'Baymax - Low Battery',
                abilities: [
          {
                    "effect": "This character enters play exerted.",
                    "fullText": "SHHHHH This character enters play exerted.",
                    "name": "SHHHHH",
                    "type": "static"
          }
],
                fullTextSections: [
          "SHHHHH This character enters play exerted."
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

    describe('Thomas O\'Malley - Feline Charmer', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1521,
                name: 'Thomas O\'Malley',
                
                fullName: 'Thomas O\'Malley - Feline Charmer',
                abilities: [
          {
                    "fullText": "Ward (Opponents can't choose this character\\nexcept to challenge.)",
                    "keyword": "Ward",
                    "reminderText": "Opponents can't choose this character except to challenge.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Ward (Opponents can't choose this character\\nexcept to challenge.)"
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

    describe('Pete - Pirate Scoundrel', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1522,
                name: 'Pete',
                
                fullName: 'Pete - Pirate Scoundrel',
                abilities: [
          {
                    "effect": "Whenever you play an action that isn't a song, you may banish chosen item.",
                    "fullText": "PILFER AND PLUNDER Whenever you play an action\\nthat isn't a song, you may banish chosen item.",
                    "name": "PILFER AND PLUNDER",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "PILFER AND PLUNDER Whenever you play an action\\nthat isn't a song, you may banish chosen item."
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

    describe('Hiro Hamada - Future Champion', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1523,
                name: 'Hiro Hamada',
                
                fullName: 'Hiro Hamada - Future Champion',
                abilities: [
          {
                    "effect": "When you play a Floodborn character on this card, draw a card.",
                    "fullText": "ORIGIN STORY When you play a Floodborn\\ncharacter on this card, draw a card.",
                    "name": "ORIGIN STORY",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "ORIGIN STORY When you play a Floodborn\\ncharacter on this card, draw a card."
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

    describe('Cheshire Cat - Perplexing Feline', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1524,
                name: 'Cheshire Cat',
                
                fullName: 'Cheshire Cat - Perplexing Feline',
                abilities: [
          {
                    "effect": "When you play this character, you may deal 2 damage to chosen damaged character.",
                    "fullText": "MAD GRIN When you play this character, you may\\ndeal 2 damage to chosen damaged character.",
                    "name": "MAD GRIN",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "MAD GRIN When you play this character, you may\\ndeal 2 damage to chosen damaged character."
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

    describe('Shere Khan - Infamous Tiger', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1525,
                name: 'Shere Khan',
                
                fullName: 'Shere Khan - Infamous Tiger',
                abilities: [
          {
                    "effect": "When you play this character, discard your hand.",
                    "fullText": "WHAT A PITY When you play this character,\\ndiscard your hand.",
                    "name": "WHAT A PITY",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "WHAT A PITY When you play this character,\\ndiscard your hand."
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

    describe('Basil - Secret Informer', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1526,
                name: 'Basil',
                
                fullName: 'Basil - Secret Informer',
                abilities: [
          {
                    "effect": "Whenever this character quests, opposing damaged characters gain Reckless during their next turn. (They can't quest and must challenge if able.)",
                    "fullText": "DRAW THEM OUT Whenever this character\\nquests, opposing damaged characters gain\\nReckless during their next turn. (They can't quest\\nand must challenge if able.)",
                    "name": "DRAW THEM OUT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "DRAW THEM OUT Whenever this character\\nquests, opposing damaged characters gain\\nReckless during their next turn. (They can't quest\\nand must challenge if able.)"
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

    describe('Mad Hatter - Unruly Eccentric', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1527,
                name: 'Mad Hatter',
                
                fullName: 'Mad Hatter - Unruly Eccentric',
                abilities: [
          {
                    "effect": "Whenever a damaged character challenges another character, you may draw a card.",
                    "fullText": "UNBIRTHDAY PRESENT Whenever a damaged\\ncharacter challenges another character, you may\\ndraw a card.",
                    "name": "UNBIRTHDAY PRESENT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "UNBIRTHDAY PRESENT Whenever a damaged\\ncharacter challenges another character, you may\\ndraw a card."
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

    describe('Queen of Hearts - Unpredictable Bully', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1528,
                name: 'Queen of Hearts',
                
                fullName: 'Queen of Hearts - Unpredictable Bully',
                abilities: [
          {
                    "fullText": "Shift 3 (You may pay 3 ⬡ to play this on top of\\none of your characters named Queen of Hearts.)",
                    "keyword": "Shift",
                    "keywordValue": "3",
                    "keywordValueNumber": 3,
                    "reminderText": "You may pay 3 ⬡ to play this on top of one of your characters named Queen of Hearts.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever another character is played, put a damage counter on them.",
                    "fullText": "IF I LOSE MY TEMPER... Whenever another\\ncharacter is played, put a damage counter on\\nthem.",
                    "name": "IF I LOSE MY TEMPER...",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 3 (You may pay 3 ⬡ to play this on top of\\none of your characters named Queen of Hearts.)",
          "IF I LOSE MY TEMPER... Whenever another\\ncharacter is played, put a damage counter on\\nthem."
],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: false,
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

    describe('Hiro Hamada - Armor Designer', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1529,
                name: 'Hiro Hamada',
                
                fullName: 'Hiro Hamada - Armor Designer',
                abilities: [
          {
                    "fullText": "Shift 5 (You may pay 5 ⬡ to play this on top of one\\nof your characters named Hiro Hamada.)",
                    "keyword": "Shift",
                    "keywordValue": "5",
                    "keywordValueNumber": 5,
                    "reminderText": "You may pay 5 ⬡ to play this on top of one of your characters named Hiro Hamada.",
                    "type": "keyword"
          },
          {
                    "effect": "Your Floodborn characters that have a card under them gain Evasive and Ward. (Only characters with Evasive can challenge them. Opponents can't choose them except to challenge.)",
                    "fullText": "YOU CAN BE WAY MORE Your Floodborn characters\\nthat have a card under them gain Evasive and Ward.\\n(Only characters with Evasive can challenge them.\\nOpponents can't choose them except to challenge.)",
                    "name": "YOU CAN BE WAY MORE",
                    "type": "static"
          }
],
                fullTextSections: [
          "Shift 5 (You may pay 5 ⬡ to play this on top of one\\nof your characters named Hiro Hamada.)",
          "YOU CAN BE WAY MORE Your Floodborn characters\\nthat have a card under them gain Evasive and Ward.\\n(Only characters with Evasive can challenge them.\\nOpponents can't choose them except to challenge.)"
],
                cost: 7,
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

    describe('Yokai - Intellectual Schemer', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1530,
                name: 'Yokai',
                
                fullName: 'Yokai - Intellectual Schemer',
                abilities: [
          {
                    "effect": "You pay 1 ⬡ less to play characters using their Shift ability.",
                    "fullText": "INNOVATE You pay 1 ⬡ less to play characters\\nusing their Shift ability.",
                    "name": "INNOVATE",
                    "type": "static"
          }
],
                fullTextSections: [
          "INNOVATE You pay 1 ⬡ less to play characters\\nusing their Shift ability."
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

    describe('Donald Duck - Lively Pirate', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1531,
                name: 'Donald Duck',
                
                fullName: 'Donald Duck - Lively Pirate',
                abilities: [
          {
                    "effect": "Whenever this character is challenged, you may return an action card that isn't a song card from your discard to your hand.",
                    "fullText": "DUCK OF ACTION Whenever this character is\\nchallenged, you may return an action card that\\nisn't a song card from your discard to your hand.",
                    "name": "DUCK OF ACTION",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "DUCK OF ACTION Whenever this character is\\nchallenged, you may return an action card that\\nisn't a song card from your discard to your hand."
],
                cost: 2,
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

    describe('Lady - Elegant Spaniel', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1533,
                name: 'Lady',
                
                fullName: 'Lady - Elegant Spaniel',
                abilities: [
          {
                    "effect": "While you have a character named Tramp in play, this character gets +1 ◊.",
                    "fullText": "A DOG'S LIFE While you have a character named\\nTramp in play, this character gets +1 ◊.",
                    "name": "A DOG'S LIFE",
                    "type": "static"
          }
],
                fullTextSections: [
          "A DOG'S LIFE While you have a character named\\nTramp in play, this character gets +1 ◊."
],
                cost: 1,
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

    describe('Yzma - Exasperated Schemer', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1534,
                name: 'Yzma',
                
                fullName: 'Yzma - Exasperated Schemer',
                abilities: [
          {
                    "effect": "When you play this character, you may draw a card, then choose and discard a card.",
                    "fullText": "HOW SHALL I DO IT? When you play this character, you\\nmay draw a card, then choose and discard a card.",
                    "name": "HOW SHALL I DO IT?",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "HOW SHALL I DO IT? When you play this character, you\\nmay draw a card, then choose and discard a card."
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

    describe('Pacha - Trekmate', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1535,
                name: 'Pacha',
                
                fullName: 'Pacha - Trekmate',
                abilities: [
          {
                    "effect": "While you have more cards in your hand than each opponent, this character gets +2 ◊.",
                    "fullText": "FULL PACK While you have more cards in your hand\\nthan each opponent, this character gets +2 ◊.",
                    "name": "FULL PACK",
                    "type": "static"
          }
],
                fullTextSections: [
          "FULL PACK While you have more cards in your hand\\nthan each opponent, this character gets +2 ◊."
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

    describe('Tweedle Dee & Tweedle Dum - Strange Storytellers', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1536,
                name: 'Tweedle Dee & Tweedle Dum',
                
                fullName: 'Tweedle Dee & Tweedle Dum - Strange Storytellers',
                abilities: [
          {
                    "effect": "Whenever this character quests, you may return chosen damaged character to their player's hand.",
                    "fullText": "ANOTHER RECITATION Whenever this character quests,\\nyou may return chosen damaged character to their\\nplayer's hand.",
                    "name": "ANOTHER RECITATION",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "ANOTHER RECITATION Whenever this character quests,\\nyou may return chosen damaged character to their\\nplayer's hand."
],
                cost: 5,
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

    describe('Baymax - Giant Robot', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1537,
                name: 'Baymax',
                
                fullName: 'Baymax - Giant Robot',
                abilities: [
          {
                    "fullText": "Universal Shift 4 (You may pay 4 ⬡ to play this on\\ntop of any one of your characters.)",
                    "keyword": "Universal Shift",
                    "keywordValue": "4",
                    "keywordValueNumber": 4,
                    "reminderText": "You may pay 4 ⬡ to play this on top of any one of your characters.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, if you used Shift to play him, remove all damage from him.",
                    "fullText": "FUNCTIONALITY IMPROVED When you play this\\ncharacter, if you used Shift to play him, remove\\nall damage from him.",
                    "name": "FUNCTIONALITY IMPROVED",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Universal Shift 4 (You may pay 4 ⬡ to play this on\\ntop of any one of your characters.)",
          "FUNCTIONALITY IMPROVED When you play this\\ncharacter, if you used Shift to play him, remove\\nall damage from him."
],
                cost: 6,
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

    describe('Gizmoduck - Suited Up', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1538,
                name: 'Gizmoduck',
                
                fullName: 'Gizmoduck - Suited Up',
                abilities: [
          {
                    "fullText": "Resist +1 (Damage dealt to this character is\\nreduced by 1.)",
                    "keyword": "Resist",
                    "keywordValue": "+1",
                    "keywordValueNumber": 1,
                    "reminderText": "Damage dealt to this character is reduced by 1.",
                    "type": "keyword"
          },
          {
                    "effect": "This character can challenge ready damaged characters.",
                    "fullText": "BLATHERING BLATHERSKITE This character can\\nchallenge ready damaged characters.",
                    "name": "BLATHERING BLATHERSKITE",
                    "type": "static"
          }
],
                fullTextSections: [
          "Resist +1 (Damage dealt to this character is\\nreduced by 1.)",
          "BLATHERING BLATHERSKITE This character can\\nchallenge ready damaged characters."
],
                cost: 4,
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

    describe('Fidget - Sneaky Bat', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1539,
                name: 'Fidget',
                
                fullName: 'Fidget - Sneaky Bat',
                abilities: [
          {
                    "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                    "keyword": "Evasive",
                    "reminderText": "Only characters with Evasive can challenge this character.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever this character quests, another chosen character of yours gains Evasive until the start of your next turn.",
                    "fullText": "I TOOK CARE OF EVERYTHING Whenever this\\ncharacter quests, another chosen character of\\nyours gains Evasive until the start of your next turn.",
                    "name": "I TOOK CARE OF EVERYTHING",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Evasive (Only characters with Evasive can\\nchallenge this character.)",
          "I TOOK CARE OF EVERYTHING Whenever this\\ncharacter quests, another chosen character of\\nyours gains Evasive until the start of your next turn."
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

    describe('Mr. Smee - Efficient Captain', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1540,
                name: 'Mr. Smee',
                
                fullName: 'Mr. Smee - Efficient Captain',
                abilities: [
          {
                    "effect": "Whenever you play an action that isn't a song, you may ready chosen Pirate character.",
                    "fullText": "PIPE UP THE CREW Whenever you play an action\\nthat isn't a song, you may ready chosen Pirate\\ncharacter.",
                    "name": "PIPE UP THE CREW",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "PIPE UP THE CREW Whenever you play an action\\nthat isn't a song, you may ready chosen Pirate\\ncharacter."
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

    describe('Daisy Duck - Multitalented Pirate', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1541,
                name: 'Daisy Duck',
                
                fullName: 'Daisy Duck - Multitalented Pirate',
                abilities: [
          {
                    "effect": "Once during your turn, whenever a card is put into your inkwell, chosen opponent chooses one of their characters and returns that card to their hand.",
                    "fullText": "FOWL PLAY Once during your turn, whenever a card is\\nput into your inkwell, chosen opponent chooses one of\\ntheir characters and returns that card to their hand.",
                    "name": "FOWL PLAY",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "FOWL PLAY Once during your turn, whenever a card is\\nput into your inkwell, chosen opponent chooses one of\\ntheir characters and returns that card to their hand."
],
                cost: 8,
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

    describe('John Silver - Vengeful Pirate', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 1542,
                name: 'John Silver',
                
                fullName: 'John Silver - Vengeful Pirate',
                abilities: [
          {
                    "effect": "If an opposing character was damaged this turn, you pay 2 ⬡ less to play this character.",
                    "fullText": "DRAWN TO A FIGHT If an opposing character was damaged\\nthis turn, you pay 2 ⬡ less to play this character.",
                    "name": "DRAWN TO A FIGHT",
                    "type": "static"
          },
          {
                    "fullText": "Resist +1 (Damage dealt to this character is reduced by 1.)",
                    "keyword": "Resist",
                    "keywordValue": "+1",
                    "keywordValueNumber": 1,
                    "reminderText": "Damage dealt to this character is reduced by 1.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever you play an action that isn't a song, you may deal 1 damage to chosen character.",
                    "fullText": "I AIN'T GONE SOFT! Whenever you play an action that isn't a\\nsong, you may deal 1 damage to chosen character.",
                    "name": "I AIN'T GONE SOFT!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "DRAWN TO A FIGHT If an opposing character was damaged\\nthis turn, you pay 2 ⬡ less to play this character.",
          "Resist +1 (Damage dealt to this character is reduced by 1.)",
          "I AIN'T GONE SOFT! Whenever you play an action that isn't a\\nsong, you may deal 1 damage to chosen character."
],
                cost: 8,
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

    describe('Tramp - Enterprising Dog', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1543,
                name: 'Tramp',
                
                fullName: 'Tramp - Enterprising Dog',
                abilities: [
          {
                    "effect": "If you have a character named Lady in play, you pay 1 ⬡ less to play this character.",
                    "fullText": "HEY, PIDGE If you have a character named Lady\\nin play, you pay 1 ⬡ less to play this character.",
                    "name": "HEY, PIDGE",
                    "type": "static"
          },
          {
                    "effect": "When you play this character, chosen character of yours gets +1 ¤ this turn for each other character you have in play.",
                    "fullText": "NO TIME FOR WISECRACKS When you play this\\ncharacter, chosen character of yours gets +1 ¤\\nthis turn for each other character you have in play.",
                    "name": "NO TIME FOR WISECRACKS",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "HEY, PIDGE If you have a character named Lady\\nin play, you pay 1 ⬡ less to play this character.",
          "NO TIME FOR WISECRACKS When you play this\\ncharacter, chosen character of yours gets +1 ¤\\nthis turn for each other character you have in play."
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

    describe('King of Hearts - Picky Ruler', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1544,
                name: 'King of Hearts',
                
                fullName: 'King of Hearts - Picky Ruler',
                abilities: [
          {
                    "effect": "Damaged characters can't challenge your characters.",
                    "fullText": "OBJECTIONABLE STATE Damaged characters can't\\nchallenge your characters.",
                    "name": "OBJECTIONABLE STATE",
                    "type": "static"
          }
],
                fullTextSections: [
          "OBJECTIONABLE STATE Damaged characters can't\\nchallenge your characters."
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

    describe('Anastasia - Bossy Stepsister', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1546,
                name: 'Anastasia',
                
                fullName: 'Anastasia - Bossy Stepsister',
                abilities: [
          {
                    "effect": "Whenever this character is challenged, the challenging player chooses and discards a card.",
                    "fullText": "OH, I HATE THIS! Whenever this character is\\nchallenged, the challenging player chooses and\\ndiscards a card.",
                    "name": "OH, I HATE THIS!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "OH, I HATE THIS! Whenever this character is\\nchallenged, the challenging player chooses and\\ndiscards a card."
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

    describe('Pete - Space Pirate', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1547,
                name: 'Pete',
                
                fullName: 'Pete - Space Pirate',
                abilities: [
          {
                    "fullText": "Shift 4 (You may pay 4 ⬡ to play this on top of\\none of your characters named Pete.)",
                    "keyword": "Shift",
                    "keywordValue": "4",
                    "keywordValueNumber": 4,
                    "reminderText": "You may pay 4 ⬡ to play this on top of one of your characters named Pete.",
                    "type": "keyword"
          },
          {
                    "effect": "While this character is exerted, opposing characters can't exert to sing songs and your Pirate characters gain Resist +1. (Damage dealt to them is reduced by 1.)",
                    "fullText": "FRIGHTFUL SCHEME While this character is\\nexerted, opposing characters can't exert to sing\\nsongs and your Pirate characters gain Resist +1.\\n(Damage dealt to them is reduced by 1.)",
                    "name": "FRIGHTFUL SCHEME",
                    "type": "static"
          }
],
                fullTextSections: [
          "Shift 4 (You may pay 4 ⬡ to play this on top of\\none of your characters named Pete.)",
          "FRIGHTFUL SCHEME While this character is\\nexerted, opposing characters can't exert to sing\\nsongs and your Pirate characters gain Resist +1.\\n(Damage dealt to them is reduced by 1.)"
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

    describe('Lady Tremaine - Bitterly Jealous', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1548,
                name: 'Lady Tremaine',
                
                fullName: 'Lady Tremaine - Bitterly Jealous',
                abilities: [
          {
                    "costs": [
                              "⟳"
                    ],
                    "costsText": "⟳",
                    "effect": "Return chosen damaged character to their player's hand. Then, each opponent discards a card at random.",
                    "fullText": "THAT'S QUITE ENOUGH ⟳ — Return chosen\\ndamaged character to their player's hand. Then,\\neach opponent discards a card at random.",
                    "name": "THAT'S QUITE ENOUGH",
                    "type": "activated"
          }
],
                fullTextSections: [
          "THAT'S QUITE ENOUGH ⟳ — Return chosen\\ndamaged character to their player's hand. Then,\\neach opponent discards a card at random."
],
                cost: 6,
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

    describe('Wake Up, Alice!', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1549,
                name: 'Wake Up, Alice!',
                
                fullName: 'Wake Up, Alice!',
                abilities: [],
                fullTextSections: [
          "Return chosen damaged character to their player's hand."
],
                cost: 1,
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

    describe('He\'s a Tramp', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1550,
                name: 'He\'s a Tramp',
                
                fullName: 'He\'s a Tramp',
                abilities: [
          {
                    "effect": "A character with cost 1 or more can ⟳ to sing this song for free.",
                    "fullText": "(A character with cost 1 or more can ⟳ to sing this song\\nfor free.)",
                    "type": "static"
          }
],
                fullTextSections: [
          "(A character with cost 1 or more can ⟳ to sing this song\\nfor free.)",
          "Chosen character gets +1 ¤ this turn for each\\ncharacter you have in play."
],
                cost: 1,
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

    describe('The Return of Hercules', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1551,
                name: 'The Return of Hercules',
                
                fullName: 'The Return of Hercules',
                abilities: [],
                fullTextSections: [
          "Each player may reveal a character card from their hand\\nand play it for free."
],
                cost: 5,
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

    describe('Ink Geyser', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1552,
                name: 'Ink Geyser',
                
                fullName: 'Ink Geyser',
                abilities: [],
                fullTextSections: [
          "Each player exerts all the cards in their inkwell.\\nThen each player with more than 3 cards in their\\ninkwell returns cards at random from their inkwell\\nto their hand until they have 3 cards in their inkwell."
],
                cost: 3,
                type: 'Action' as CardType,
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

    describe('Emerald Coil', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1553,
                name: 'Emerald Coil',
                
                fullName: 'Emerald Coil',
                abilities: [
          {
                    "effect": "During your turn, whenever a card is put into your inkwell, chosen character gains Evasive until the start of your next turn. (Only characters with Evasive can challenge them.)",
                    "fullText": "SHIMMERING WINGS During your turn, whenever\\na card is put into your inkwell, chosen character\\ngains Evasive until the start of your next turn. (Only\\ncharacters with Evasive can challenge them.)",
                    "name": "SHIMMERING WINGS",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "SHIMMERING WINGS During your turn, whenever\\na card is put into your inkwell, chosen character\\ngains Evasive until the start of your next turn. (Only\\ncharacters with Evasive can challenge them.)"
],
                cost: 3,
                type: 'Item' as CardType,
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

    describe('Grandmother Fa - Spirited Elder', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1554,
                name: 'Grandmother Fa',
                
                fullName: 'Grandmother Fa - Spirited Elder',
                abilities: [
          {
                    "effect": "Whenever this character quests, you may give chosen character of yours +2 ¤ this turn.",
                    "fullText": "I'VE GOT ALL THE LUCK WE'LL NEED Whenever this\\ncharacter quests, you may give chosen character\\nof yours +2 ¤ this turn.",
                    "name": "I'VE GOT ALL THE LUCK WE'LL NEED",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "I'VE GOT ALL THE LUCK WE'LL NEED Whenever this\\ncharacter quests, you may give chosen character\\nof yours +2 ¤ this turn."
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

    describe('Queen of Hearts - Losing Her Temper', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1555,
                name: 'Queen of Hearts',
                
                fullName: 'Queen of Hearts - Losing Her Temper',
                abilities: [
          {
                    "effect": "While this character has damage, she gets +3 ¤.",
                    "fullText": "ROYAL PAIN While this character has damage,\\nshe gets +3 ¤.",
                    "name": "ROYAL PAIN",
                    "type": "static"
          }
],
                fullTextSections: [
          "ROYAL PAIN While this character has damage,\\nshe gets +3 ¤."
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

    describe('The Matchmaker - Unforgiving Expert', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1556,
                name: 'The Matchmaker',
                
                fullName: 'The Matchmaker - Unforgiving Expert',
                abilities: [
          {
                    "effect": "Whenever this character challenges another character, each opponent loses 1 lore.",
                    "fullText": "YOU ARE A DISGRACE! Whenever this character\\nchallenges another character, each opponent\\nloses 1 lore.",
                    "name": "YOU ARE A DISGRACE!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "YOU ARE A DISGRACE! Whenever this character\\nchallenges another character, each opponent\\nloses 1 lore."
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

    describe('Denahi - Impatient Hunter', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1557,
                name: 'Denahi',
                
                fullName: 'Denahi - Impatient Hunter',
                abilities: [
          {
                    "fullText": "Reckless (This character can't quest and must\\nchallenge each turn if able.)",
                    "keyword": "Reckless",
                    "reminderText": "This character can't quest and must challenge each turn if able.",
                    "type": "keyword"
          },
          {
                    "fullText": "Resist +2 (Damage dealt to this character is\\nreduced by 2.)",
                    "keyword": "Resist",
                    "keywordValue": "+2",
                    "keywordValueNumber": 2,
                    "reminderText": "Damage dealt to this character is reduced by 2.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Reckless (This character can't quest and must\\nchallenge each turn if able.)",
          "Resist +2 (Damage dealt to this character is\\nreduced by 2.)"
],
                cost: 3,
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

    describe('Stabbington Brother - Without a Patch', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1558,
                name: 'Stabbington Brother',
                
                fullName: 'Stabbington Brother - Without a Patch',
                abilities: [
          {
                    "fullText": "Rush (This character can challenge the turn\\nthey're played.)",
                    "keyword": "Rush",
                    "reminderText": "This character can challenge the turn they're played.",
                    "type": "keyword"
          },
          {
                    "effect": "Your other characters named Stabbington Brother gain Rush.",
                    "fullText": "GET 'EM! Your other characters named\\nStabbington Brother gain Rush.",
                    "name": "GET 'EM!",
                    "type": "static"
          }
],
                fullTextSections: [
          "Rush (This character can challenge the turn\\nthey're played.)",
          "GET 'EM! Your other characters named\\nStabbington Brother gain Rush."
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

    describe('Belle - Mechanic Extraordinaire', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 1559,
                name: 'Belle',
                
                fullName: 'Belle - Mechanic Extraordinaire',
                abilities: [
          {
                    "fullText": "Shift 7",
                    "keyword": "Shift",
                    "keywordValue": "7",
                    "keywordValueNumber": 7,
                    "type": "keyword"
          },
          {
                    "effect": "For each item card in your discard, you pay 1 ⬡ less to play this character using her Shift ability.",
                    "fullText": "SALVAGE For each item card in your discard, you pay 1 ⬡\\nless to play this character using her Shift ability.",
                    "name": "SALVAGE",
                    "type": "static"
          },
          {
                    "effect": "Whenever this character quests, you may put up to 3 item cards from your discard on the bottom of your deck to gain 1 lore for each item card moved this way.",
                    "fullText": "REPURPOSE Whenever this character quests, you may put\\nup to 3 item cards from your discard on the bottom of your\\ndeck to gain 1 lore for each item card moved this way.",
                    "name": "REPURPOSE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 7",
          "SALVAGE For each item card in your discard, you pay 1 ⬡\\nless to play this character using her Shift ability.",
          "REPURPOSE Whenever this character quests, you may put\\nup to 3 item cards from your discard on the bottom of your\\ndeck to gain 1 lore for each item card moved this way."
],
                cost: 9,
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

    describe('Cy-Bug - Invasive Enemy', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1560,
                name: 'Cy-Bug',
                
                fullName: 'Cy-Bug - Invasive Enemy',
                abilities: [
          {
                    "effect": "This character gets +1 ¤ for each other character you have in play.",
                    "fullText": "HIVE MIND This character gets +1 ¤ for each\\nother character you have in play.",
                    "name": "HIVE MIND",
                    "type": "static"
          }
],
                fullTextSections: [
          "HIVE MIND This character gets +1 ¤ for each\\nother character you have in play."
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

    describe('Stabbington Brother - With a Patch', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1561,
                name: 'Stabbington Brother',
                
                fullName: 'Stabbington Brother - With a Patch',
                abilities: [
          {
                    "effect": "When you play this character, chosen opponent loses 1 lore.",
                    "fullText": "CRIME OF OPPORTUNITY When you play this\\ncharacter, chosen opponent loses 1 lore.",
                    "name": "CRIME OF OPPORTUNITY",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "CRIME OF OPPORTUNITY When you play this\\ncharacter, chosen opponent loses 1 lore."
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

    describe('Card Soldiers - Royal Troops', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1562,
                name: 'Card Soldiers',
                
                fullName: 'Card Soldiers - Royal Troops',
                abilities: [
          {
                    "effect": "While a damaged character is in play, this character gets +2 ¤.",
                    "fullText": "TAKE POINT While a damaged character is in\\nplay, this character gets +2 ¤.",
                    "name": "TAKE POINT",
                    "type": "static"
          }
],
                fullTextSections: [
          "TAKE POINT While a damaged character is in\\nplay, this character gets +2 ¤."
],
                cost: 1,
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

    describe('Cogsworth - Climbing Clock', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1563,
                name: 'Cogsworth',
                
                fullName: 'Cogsworth - Climbing Clock',
                abilities: [
          {
                    "effect": "While you have an item card in your discard, this character gets +2 ¤.",
                    "fullText": "STILL USEFUL While you have an item card in your\\ndiscard, this character gets +2 ¤.",
                    "name": "STILL USEFUL",
                    "type": "static"
          }
],
                fullTextSections: [
          "STILL USEFUL While you have an item card in your\\ndiscard, this character gets +2 ¤."
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

    describe('Beagle Boys - Small-Time Crooks', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1565,
                name: 'Beagle Boys',
                
                fullName: 'Beagle Boys - Small-Time Crooks',
                abilities: [
          {
                    "effect": "Whenever this character quests, chosen character of yours gains Rush and Resist +1 this turn. (They can challenge the turn they're played. Damage dealt to them is reduced by 1.)",
                    "fullText": "HURRY IT UP! Whenever this character quests,\\nchosen character of yours gains Rush and\\nResist +1 this turn. (They can challenge the turn\\nthey're played. Damage dealt to them is reduced\\nby 1.)",
                    "name": "HURRY IT UP!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "HURRY IT UP! Whenever this character quests,\\nchosen character of yours gains Rush and\\nResist +1 this turn. (They can challenge the turn\\nthey're played. Damage dealt to them is reduced\\nby 1.)"
],
                cost: 4,
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

    describe('Li Shang - Newly Promoted', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1566,
                name: 'Li Shang',
                
                fullName: 'Li Shang - Newly Promoted',
                abilities: [
          {
                    "effect": "This character can challenge ready characters.",
                    "fullText": "I WON'T LET YOU DOWN This character can\\nchallenge ready characters.",
                    "name": "I WON'T LET YOU DOWN",
                    "type": "static"
          },
          {
                    "effect": "While this character has damage, he gets +2 ¤.",
                    "fullText": "ENORMOUS RESPONSIBILITY While this character\\nhas damage, he gets +2 ¤.",
                    "name": "ENORMOUS RESPONSIBILITY",
                    "type": "static"
          }
],
                fullTextSections: [
          "I WON'T LET YOU DOWN This character can\\nchallenge ready characters.",
          "ENORMOUS RESPONSIBILITY While this character\\nhas damage, he gets +2 ¤."
],
                cost: 3,
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

    describe('Moana - Island Explorer', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1567,
                name: 'Moana',
                
                fullName: 'Moana - Island Explorer',
                abilities: [
          {
                    "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                    "keyword": "Evasive",
                    "reminderText": "Only characters with Evasive can challenge this character.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever this character challenges another character, another chosen character of yours gets +3 ¤ this turn.",
                    "fullText": "ADVENTUROUS SPIRIT Whenever this character\\nchallenges another character, another chosen\\ncharacter of yours gets +3 ¤ this turn.",
                    "name": "ADVENTUROUS SPIRIT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Evasive (Only characters with Evasive can\\nchallenge this character.)",
          "ADVENTUROUS SPIRIT Whenever this character\\nchallenges another character, another chosen\\ncharacter of yours gets +3 ¤ this turn."
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

    describe('The Phantom Blot - Shadowy Figure', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1568,
                name: 'The Phantom Blot',
                
                fullName: 'The Phantom Blot - Shadowy Figure',
                abilities: [
          {
                    "fullText": "Rush (This character can challenge the turn\\nthey're played.)",
                    "keyword": "Rush",
                    "reminderText": "This character can challenge the turn they're played.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Rush (This character can challenge the turn\\nthey're played.)"
],
                cost: 2,
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

    describe('Beast - Frustrated Designer', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1569,
                name: 'Beast',
                
                fullName: 'Beast - Frustrated Designer',
                abilities: [
          {
                    "costs": [
                              "⟳",
                              "2 ⬡",
                              "Banish 2 of your items"
                    ],
                    "costsText": "⟳, 2 ⬡, Banish 2 of your items",
                    "effect": "Deal 5 damage to chosen character.",
                    "fullText": "I'VE HAD IT! ⟳, 2 ⬡, Banish 2 of your items —\\nDeal 5 damage to chosen character.",
                    "name": "I'VE HAD IT!",
                    "type": "activated"
          }
],
                fullTextSections: [
          "I'VE HAD IT! ⟳, 2 ⬡, Banish 2 of your items —\\nDeal 5 damage to chosen character."
],
                cost: 6,
                type: 'Character' as CardType,
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

    describe('Mushu - Majestic Dragon', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1570,
                name: 'Mushu',
                
                fullName: 'Mushu - Majestic Dragon',
                abilities: [
          {
                    "effect": "Whenever one of your characters challenges, they gain Resist +2 during that challenge. (Damage dealt to them is reduced by 2.)",
                    "fullText": "INTIMIDATING AND AWE-INSPIRING Whenever one of your\\ncharacters challenges, they gain Resist +2 during that\\nchallenge. (Damage dealt to them is reduced by 2.)",
                    "name": "INTIMIDATING AND AWE-INSPIRING",
                    "type": "triggered"
          },
          {
                    "effect": "During your turn, whenever one of your characters banishes another character in a challenge, gain 2 lore.",
                    "fullText": "GUARDIAN OF LOST SOULS During your turn, whenever\\none of your characters banishes another character in a\\nchallenge, gain 2 lore.",
                    "name": "GUARDIAN OF LOST SOULS",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "INTIMIDATING AND AWE-INSPIRING Whenever one of your\\ncharacters challenges, they gain Resist +2 during that\\nchallenge. (Damage dealt to them is reduced by 2.)",
          "GUARDIAN OF LOST SOULS During your turn, whenever\\none of your characters banishes another character in a\\nchallenge, gain 2 lore."
],
                cost: 5,
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

    describe('Maurice - Unconventional Inventor', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1571,
                name: 'Maurice',
                
                fullName: 'Maurice - Unconventional Inventor',
                abilities: [
          {
                    "effect": "When you play this character, you may banish chosen item of yours to draw a card. If the banished item is named Maurice's Machine, you may also banish chosen character with 2 ¤ or less.",
                    "fullText": "HOW ON EARTH DID THAT HAPPEN? When you\\nplay this character, you may banish chosen item\\nof yours to draw a card. If the banished item is\\nnamed Maurice's Machine, you may also banish\\nchosen character with 2 ¤ or less.",
                    "name": "HOW ON EARTH DID THAT HAPPEN?",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "HOW ON EARTH DID THAT HAPPEN? When you\\nplay this character, you may banish chosen item\\nof yours to draw a card. If the banished item is\\nnamed Maurice's Machine, you may also banish\\nchosen character with 2 ¤ or less."
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

    describe('Goofy - Extreme Athlete', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1572,
                name: 'Goofy',
                
                fullName: 'Goofy - Extreme Athlete',
                abilities: [
          {
                    "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                    "keyword": "Evasive",
                    "reminderText": "Only characters with Evasive can challenge this character.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever this character challenges another character, your other characters get +1 ◊ this turn.",
                    "fullText": "STAR POWER Whenever this character challenges\\nanother character, your other characters get +1 ◊\\nthis turn.",
                    "name": "STAR POWER",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Evasive (Only characters with Evasive can\\nchallenge this character.)",
          "STAR POWER Whenever this character challenges\\nanother character, your other characters get +1 ◊\\nthis turn."
],
                cost: 7,
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

    describe('Lyle Tiberius Rourke - Crystallized Mercenary', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1573,
                name: 'Lyle Tiberius Rourke',
                
                fullName: 'Lyle Tiberius Rourke - Crystallized Mercenary',
                abilities: [
          {
                    "effect": "Once during your turn, whenever a card is put into your inkwell, deal 2 damage to each character in play.",
                    "fullText": "EXPLOSIVE Once during your turn, whenever a\\ncard is put into your inkwell, deal 2 damage to\\neach character in play.",
                    "name": "EXPLOSIVE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "EXPLOSIVE Once during your turn, whenever a\\ncard is put into your inkwell, deal 2 damage to\\neach character in play."
],
                cost: 8,
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

    describe('Mulan - Imperial General', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 1574,
                name: 'Mulan',
                
                fullName: 'Mulan - Imperial General',
                abilities: [
          {
                    "fullText": "Shift 5 (You may pay 5 ⬡ to play this on top of one of your\\ncharacters named Mulan.)",
                    "keyword": "Shift",
                    "keywordValue": "5",
                    "keywordValueNumber": 5,
                    "reminderText": "You may pay 5 ⬡ to play this on top of one of your characters named Mulan.",
                    "type": "keyword"
          },
          {
                    "fullText": "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
                    "keyword": "Evasive",
                    "reminderText": "Only characters with Evasive can challenge this character.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever this character challenges another character, your other characters gain “This character can challenge ready characters” this turn.",
                    "fullText": "EXCEPTIONAL LEADER Whenever this character challenges\\nanother character, your other characters gain “This\\ncharacter can challenge ready characters” this turn.",
                    "name": "EXCEPTIONAL LEADER",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 5 (You may pay 5 ⬡ to play this on top of one of your\\ncharacters named Mulan.)",
          "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
          "EXCEPTIONAL LEADER Whenever this character challenges\\nanother character, your other characters gain “This\\ncharacter can challenge ready characters” this turn."
],
                cost: 7,
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

    describe('Baloo - Ol\' Iron Paws', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1575,
                name: 'Baloo',
                
                fullName: 'Baloo - Ol\' Iron Paws',
                abilities: [
          {
                    "effect": "Your characters with 7 ¤ or more can't be dealt damage.",
                    "fullText": "FIGHT LIKE A BEAR Your characters with 7 ¤ or\\nmore can't be dealt damage.",
                    "name": "FIGHT LIKE A BEAR",
                    "type": "static"
          }
],
                fullTextSections: [
          "FIGHT LIKE A BEAR Your characters with 7 ¤ or\\nmore can't be dealt damage."
],
                cost: 6,
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

    describe('Ratigan - Nefarious Criminal', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1576,
                name: 'Ratigan',
                
                fullName: 'Ratigan - Nefarious Criminal',
                abilities: [
          {
                    "effect": "Whenever you play an action while this character is exerted, gain 1 lore.",
                    "fullText": "A MARVELOUS PERFORMANCE Whenever you play\\nan action while this character is exerted, gain 1 lore.",
                    "name": "A MARVELOUS PERFORMANCE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "A MARVELOUS PERFORMANCE Whenever you play\\nan action while this character is exerted, gain 1 lore."
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

    describe('Milo Thatch - Undaunted Scholar', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1578,
                name: 'Milo Thatch',
                
                fullName: 'Milo Thatch - Undaunted Scholar',
                abilities: [
          {
                    "effect": "Whenever you play an action, you may give chosen character +2 ¤ this turn.",
                    "fullText": "I'M YOUR GUY Whenever you play an action, you\\nmay give chosen character +2 ¤ this turn.",
                    "name": "I'M YOUR GUY",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "I'M YOUR GUY Whenever you play an action, you\\nmay give chosen character +2 ¤ this turn."
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

    describe('We\'ve Got Company!', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1580,
                name: 'We\'ve Got Company!',
                
                fullName: 'We\'ve Got Company!',
                abilities: [],
                fullTextSections: [
          "Ready all your characters. They gain Reckless this turn.\\n(They can't quest and must challenge if able.)"
],
                cost: 3,
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

    describe('Out of Order', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1581,
                name: 'Out of Order',
                
                fullName: 'Out of Order',
                abilities: [],
                fullTextSections: [
          "Banish chosen character."
],
                cost: 7,
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

    describe('Ruby Coil', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1582,
                name: 'Ruby Coil',
                
                fullName: 'Ruby Coil',
                abilities: [
          {
                    "effect": "During your turn, whenever a card is put into your inkwell, chosen character gets +2 ¤ this turn.",
                    "fullText": "CRIMSON SPARK During your turn, whenever a card is put\\ninto your inkwell, chosen character gets +2 ¤ this turn.",
                    "name": "CRIMSON SPARK",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "CRIMSON SPARK During your turn, whenever a card is put\\ninto your inkwell, chosen character gets +2 ¤ this turn."
],
                cost: 2,
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

    describe('Unconventional Tool', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1583,
                name: 'Unconventional Tool',
                
                fullName: 'Unconventional Tool',
                abilities: [
          {
                    "effect": "When this item is banished, you pay 2 ⬡ less for the next item you play this turn.",
                    "fullText": "FIXED IN NO TIME When this item is banished, you pay\\n2 ⬡ less for the next item you play this turn.",
                    "name": "FIXED IN NO TIME",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "FIXED IN NO TIME When this item is banished, you pay\\n2 ⬡ less for the next item you play this turn."
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

    describe('Maurice\'s Machine', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1584,
                name: 'Maurice\'s Machine',
                
                fullName: 'Maurice\'s Machine',
                abilities: [
          {
                    "effect": "When this item is banished, you may return an item card with cost 2 or less from your discard to your hand.",
                    "fullText": "BREAK DOWN When this item is banished, you may\\nreturn an item card with cost 2 or less from your\\ndiscard to your hand.",
                    "name": "BREAK DOWN",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "BREAK DOWN When this item is banished, you may\\nreturn an item card with cost 2 or less from your\\ndiscard to your hand."
],
                cost: 3,
                type: 'Item' as CardType,
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

    describe('Devil\'s Eye Diamond', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1585,
                name: 'Devil\'s Eye Diamond',
                
                fullName: 'Devil\'s Eye Diamond',
                abilities: [
          {
                    "costs": [
                              "⟳"
                    ],
                    "costsText": "⟳",
                    "effect": "If one of your characters was damaged this turn, gain 1 lore.",
                    "fullText": "THE PRICE OF POWER ⟳ — If one of your characters\\nwas damaged this turn, gain 1 lore.",
                    "name": "THE PRICE OF POWER",
                    "type": "activated"
          }
],
                fullTextSections: [
          "THE PRICE OF POWER ⟳ — If one of your characters\\nwas damaged this turn, gain 1 lore."
],
                cost: 2,
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

    describe('Clarabelle - News Reporter', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1586,
                name: 'Clarabelle',
                
                fullName: 'Clarabelle - News Reporter',
                abilities: [
          {
                    "fullText": "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)",
                    "keyword": "Support",
                    "reminderText": "Whenever this character quests, you may add their ¤ to another chosen character's ¤ this turn.",
                    "type": "keyword"
          },
          {
                    "effect": "Your other characters with Support get +1 ¤.",
                    "fullText": "BREAKING STORY Your other characters with\\nSupport get +1 ¤.",
                    "name": "BREAKING STORY",
                    "type": "static"
          }
],
                fullTextSections: [
          "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)",
          "BREAKING STORY Your other characters with\\nSupport get +1 ¤."
],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Sapphire'
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

    describe('Scrooge McDuck - Resourceful Miser', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1587,
                name: 'Scrooge McDuck',
                
                fullName: 'Scrooge McDuck - Resourceful Miser',
                abilities: [
          {
                    "effect": "You may exert 4 items of yours to play this character for free.",
                    "fullText": "PUT IT TO GOOD USE You may exert 4 items of\\nyours to play this character for free.",
                    "name": "PUT IT TO GOOD USE",
                    "type": "static"
          },
          {
                    "effect": "When you play this character, look at the top 4 cards of your deck. You may reveal an item card and put it into your hand. Put the rest on the bottom of your deck in any order.",
                    "fullText": "FORTUNE HUNTER When you play this character,\\nlook at the top 4 cards of your deck. You may\\nreveal an item card and put it into your hand. Put\\nthe rest on the bottom of your deck in any order.",
                    "name": "FORTUNE HUNTER",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "PUT IT TO GOOD USE You may exert 4 items of\\nyours to play this character for free.",
          "FORTUNE HUNTER When you play this character,\\nlook at the top 4 cards of your deck. You may\\nreveal an item card and put it into your hand. Put\\nthe rest on the bottom of your deck in any order."
],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Sapphire'
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

    describe('Mattias - Arendelle General', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1588,
                name: 'Mattias',
                
                fullName: 'Mattias - Arendelle General',
                abilities: [
          {
                    "effect": "Your Queen characters gain Ward. (Opponents can't choose them except to challenge.)",
                    "fullText": "PROUD TO SERVE Your Queen characters gain\\nWard. (Opponents can't choose them except to\\nchallenge.)",
                    "name": "PROUD TO SERVE",
                    "type": "static"
          }
],
                fullTextSections: [
          "PROUD TO SERVE Your Queen characters gain\\nWard. (Opponents can't choose them except to\\nchallenge.)"
],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Sapphire'
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

    describe('Monsieur D\'Arque - Despicable Proprietor', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1590,
                name: 'Monsieur D\'Arque',
                
                fullName: 'Monsieur D\'Arque - Despicable Proprietor',
                abilities: [
          {
                    "effect": "Whenever this character quests, you may banish chosen item of yours to draw a card.",
                    "fullText": "I'VE COME TO COLLECT Whenever this character\\nquests, you may banish chosen item of yours to\\ndraw a card.",
                    "name": "I'VE COME TO COLLECT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "I'VE COME TO COLLECT Whenever this character\\nquests, you may banish chosen item of yours to\\ndraw a card."
],
                cost: 1,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Sapphire'
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

    describe('Belle - Apprentice Inventor', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1592,
                name: 'Belle',
                
                fullName: 'Belle - Apprentice Inventor',
                abilities: [
          {
                    "effect": "During your turn, you may banish chosen item of yours to play this character for free.",
                    "fullText": "WHAT A MESS During your turn, you may banish\\nchosen item of yours to play this character for free.",
                    "name": "WHAT A MESS",
                    "type": "static"
          }
],
                fullTextSections: [
          "WHAT A MESS During your turn, you may banish\\nchosen item of yours to play this character for free."
],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Sapphire'
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

    describe('Lucky - Runt of the Litter', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1593,
                name: 'Lucky',
                
                fullName: 'Lucky - Runt of the Litter',
                abilities: [
          {
                    "effect": "Whenever this character quests, look at the top 2 cards of your deck. You may reveal any number of Puppy character cards and put them in your hand. Put the rest on the bottom of your deck in any order.",
                    "fullText": "FOLLOW MY VOICE Whenever this character\\nquests, look at the top 2 cards of your deck. You\\nmay reveal any number of Puppy character cards\\nand put them in your hand. Put the rest on the\\nbottom of your deck in any order.",
                    "name": "FOLLOW MY VOICE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "FOLLOW MY VOICE Whenever this character\\nquests, look at the top 2 cards of your deck. You\\nmay reveal any number of Puppy character cards\\nand put them in your hand. Put the rest on the\\nbottom of your deck in any order."
],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Sapphire'
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

    describe('Dawson - Puzzling Sleuth', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1594,
                name: 'Dawson',
                
                fullName: 'Dawson - Puzzling Sleuth',
                abilities: [
          {
                    "effect": "Once during your turn, whenever a card is put into your inkwell, look at the top card of your deck. You may put it on either the top or the bottom of your deck.",
                    "fullText": "BE SENSIBLE Once during your turn, whenever a\\ncard is put into your inkwell, look at the top card\\nof your deck. You may put it on either the top or\\nthe bottom of your deck.",
                    "name": "BE SENSIBLE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "BE SENSIBLE Once during your turn, whenever a\\ncard is put into your inkwell, look at the top card\\nof your deck. You may put it on either the top or\\nthe bottom of your deck."
],
                cost: 1,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Sapphire'
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

    describe('Tamatoa - Happy as a Clam', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1595,
                name: 'Tamatoa',
                
                fullName: 'Tamatoa - Happy as a Clam',
                abilities: [
          {
                    "effect": "When you play this character, return up to 2 item cards from your discard to your hand.",
                    "fullText": "COOLEST COLLECTION When you play this\\ncharacter, return up to 2 item cards from your\\ndiscard to your hand.",
                    "name": "COOLEST COLLECTION",
                    "type": "triggered"
          },
          {
                    "effect": "Whenever this character quests, you may play an item for free.",
                    "fullText": "I'M BEAUTIFUL, BABY! Whenever this character\\nquests, you may play an item for free.",
                    "name": "I'M BEAUTIFUL, BABY!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "COOLEST COLLECTION When you play this\\ncharacter, return up to 2 item cards from your\\ndiscard to your hand.",
          "I'M BEAUTIFUL, BABY! Whenever this character\\nquests, you may play an item for free."
],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Sapphire'
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

    describe('HeiHei - Expanded Consciousness', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 1596,
                name: 'HeiHei',
                
                fullName: 'HeiHei - Expanded Consciousness',
                abilities: [
          {
                    "fullText": "Shift 3 (You may pay 3 ⬡ to play this on top of one of your\\ncharacters named Heihei.)",
                    "keyword": "Shift",
                    "keywordValue": "3",
                    "keywordValueNumber": 3,
                    "reminderText": "You may pay 3 ⬡ to play this on top of one of your characters named Heihei.",
                    "type": "keyword"
          },
          {
                    "fullText": "Resist +1 (Damage dealt to this character is reduced by 1.)",
                    "keyword": "Resist",
                    "keywordValue": "+1",
                    "keywordValueNumber": 1,
                    "reminderText": "Damage dealt to this character is reduced by 1.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, put all cards from your hand into your inkwell facedown and exerted.",
                    "fullText": "CLEAR YOUR MIND When you play this character, put all\\ncards from your hand into your inkwell facedown and\\nexerted.",
                    "name": "CLEAR YOUR MIND",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 3 (You may pay 3 ⬡ to play this on top of one of your\\ncharacters named Heihei.)",
          "Resist +1 (Damage dealt to this character is reduced by 1.)",
          "CLEAR YOUR MIND When you play this character, put all\\ncards from your hand into your inkwell facedown and\\nexerted."
],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Sapphire-Steel'
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

    describe('Kida - Creative Thinker', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1597,
                name: 'Kida',
                
                fullName: 'Kida - Creative Thinker',
                abilities: [
          {
                    "fullText": "Ward (Opponents can't choose this character\\nexcept to challenge.)",
                    "keyword": "Ward",
                    "reminderText": "Opponents can't choose this character except to challenge.",
                    "type": "keyword"
          },
          {
                    "costs": [
                              "⟳"
                    ],
                    "costsText": "⟳",
                    "effect": "Look at the top 2 cards of your deck. Put one into your inkwell facedown and exerted and the other on the top of your deck.",
                    "fullText": "KEY TO THE PUZZLE ⟳ — Look at the top 2 cards of\\nyour deck. Put one into your inkwell facedown and\\nexerted and the other on the top of your deck.",
                    "name": "KEY TO THE PUZZLE",
                    "type": "activated"
          }
],
                fullTextSections: [
          "Ward (Opponents can't choose this character\\nexcept to challenge.)",
          "KEY TO THE PUZZLE ⟳ — Look at the top 2 cards of\\nyour deck. Put one into your inkwell facedown and\\nexerted and the other on the top of your deck."
],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Sapphire'
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

    describe('Marie - Favored Kitten', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1599,
                name: 'Marie',
                
                fullName: 'Marie - Favored Kitten',
                abilities: [
          {
                    "effect": "Whenever this character quests, you may give chosen character -2 ¤ this turn.",
                    "fullText": "I'LL SHOW YOU Whenever this character quests,\\nyou may give chosen character -2 ¤ this turn.",
                    "name": "I'LL SHOW YOU",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "I'LL SHOW YOU Whenever this character quests,\\nyou may give chosen character -2 ¤ this turn."
],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Sapphire'
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

    describe('Pepper - Quick-Thinking Puppy', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1600,
                name: 'Pepper',
                
                fullName: 'Pepper - Quick-Thinking Puppy',
                abilities: [
          {
                    "effect": "Whenever one of your Puppy characters is banished, you may put that card into your inkwell facedown and exerted.",
                    "fullText": "IN THE NICK OF TIME Whenever one of your Puppy\\ncharacters is banished, you may put that card into\\nyour inkwell facedown and exerted.",
                    "name": "IN THE NICK OF TIME",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "IN THE NICK OF TIME Whenever one of your Puppy\\ncharacters is banished, you may put that card into\\nyour inkwell facedown and exerted."
],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Sapphire'
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

    describe('Freckles - Good Boy', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1601,
                name: 'Freckles',
                
                fullName: 'Freckles - Good Boy',
                abilities: [
          {
                    "effect": "When you play this character, chosen opposing character gets -1 ¤ this turn.",
                    "fullText": "JUST SO CUTE! When you play this character,\\nchosen opposing character gets -1 ¤ this turn.",
                    "name": "JUST SO CUTE!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "JUST SO CUTE! When you play this character,\\nchosen opposing character gets -1 ¤ this turn."
],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Sapphire'
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
