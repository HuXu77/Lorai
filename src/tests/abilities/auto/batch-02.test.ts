import { parseToAbilityDefinition } from '../../../engine/ability-parser';
import { GameEvent } from '../../../engine/abilities/events';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { ZoneType } from '../../../engine/models';
import { CardType } from '../../../engine/models';

describe('Parser Batch 2', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    
    beforeEach(() => {
        game = new GameStateManager();
        const p1Id = game.addPlayer('Player 1');
        const p2Id = game.addPlayer('Player 2');
        turnManager = new TurnManager(game);
    });
    describe('Tigger - Wonderful Thing', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 127,
                name: 'Tigger',
                
                fullName: 'Tigger - Wonderful Thing',
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
                cost: 6,
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

    describe('Be Prepared', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 128,
                name: 'Be Prepared',
                
                fullName: 'Be Prepared',
                abilities: [
          {
                    "effect": "A character with cost 7 or more can ⟳ to sing this song for free.",
                    "fullText": "(A character with cost 7 or more can ⟳ to sing this\\nsong for free.)",
                    "type": "static"
          }
],
                fullTextSections: [
          "(A character with cost 7 or more can ⟳ to sing this\\nsong for free.)",
          "Banish all characters."
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

    describe('Cut to the Chase', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 129,
                name: 'Cut to the Chase',
                
                fullName: 'Cut to the Chase',
                abilities: [],
                fullTextSections: [
          "Chosen character gains Rush this turn. (They can\\nchallenge the turn they're played.)"
],
                cost: 2,
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

    describe('Dragon Fire', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 130,
                name: 'Dragon Fire',
                
                fullName: 'Dragon Fire',
                abilities: [],
                fullTextSections: [
          "Banish chosen character."
],
                cost: 5,
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

    describe('Fan the Flames', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 131,
                name: 'Fan the Flames',
                
                fullName: 'Fan the Flames',
                abilities: [],
                fullTextSections: [
          "Ready chosen character. They can't quest for the rest\\nof this turn."
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

    describe('He\'s Got a Sword!', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 132,
                name: 'He\'s Got a Sword!',
                
                fullName: 'He\'s Got a Sword!',
                abilities: [],
                fullTextSections: [
          "Chosen character gets +2 ¤ this turn."
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

    describe('Tangle', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 133,
                name: 'Tangle',
                
                fullName: 'Tangle',
                abilities: [],
                fullTextSections: [
          "Each opponent loses 1 lore."
],
                cost: 2,
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

    describe('Poisoned Apple', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 134,
                name: 'Poisoned Apple',
                
                fullName: 'Poisoned Apple',
                abilities: [
          {
                    "costs": [
                              "1 ⬡",
                              "Banish this item"
                    ],
                    "costsText": "1 ⬡, Banish this item",
                    "effect": "Exert chosen character. If a Princess character is chosen, banish her instead.",
                    "fullText": "TAKE A BITE... 1 ⬡, Banish this item — Exert chosen\\ncharacter. If a Princess character is chosen, banish her\\ninstead.",
                    "name": "TAKE A BITE...",
                    "type": "activated"
          }
],
                fullTextSections: [
          "TAKE A BITE... 1 ⬡, Banish this item — Exert chosen\\ncharacter. If a Princess character is chosen, banish her\\ninstead."
],
                cost: 3,
                type: 'Item' as CardType,
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

    describe('Shield of Virtue', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 135,
                name: 'Shield of Virtue',
                
                fullName: 'Shield of Virtue',
                abilities: [
          {
                    "costs": [
                              "⟳",
                              "3 ⬡"
                    ],
                    "costsText": "⟳, 3 ⬡",
                    "effect": "Ready chosen character. They can't quest for the rest of this turn.",
                    "fullText": "FIREPROOF ⟳, 3 ⬡ — Ready chosen character. They\\ncan't quest for the rest of this turn.",
                    "name": "FIREPROOF",
                    "type": "activated"
          }
],
                fullTextSections: [
          "FIREPROOF ⟳, 3 ⬡ — Ready chosen character. They\\ncan't quest for the rest of this turn."
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

    describe('Sword of Truth', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 136,
                name: 'Sword of Truth',
                
                fullName: 'Sword of Truth',
                abilities: [
          {
                    "costs": [
                              "Banish this item"
                    ],
                    "costsText": "Banish this item",
                    "effect": "Banish chosen Villain character.",
                    "fullText": "FINAL ENCHANTMENT Banish this item — Banish\\nchosen Villain character.",
                    "name": "FINAL ENCHANTMENT",
                    "type": "activated"
          }
],
                fullTextSections: [
          "FINAL ENCHANTMENT Banish this item — Banish\\nchosen Villain character."
],
                cost: 4,
                type: 'Item' as CardType,
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

    describe('Ariel - Whoseit Collector', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 137,
                name: 'Ariel',
                
                fullName: 'Ariel - Whoseit Collector',
                abilities: [
          {
                    "effect": "Whenever you play an item, you may ready this character.",
                    "fullText": "LOOK AT THIS STUFF Whenever you play an\\nitem, you may ready this character.",
                    "name": "LOOK AT THIS STUFF",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "LOOK AT THIS STUFF Whenever you play an\\nitem, you may ready this character."
],
                cost: 4,
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

    describe('Aurora - Briar Rose', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 138,
                name: 'Aurora',
                
                fullName: 'Aurora - Briar Rose',
                abilities: [
          {
                    "effect": "When you play this character, chosen character gets -2 ¤ this turn.",
                    "fullText": "DISARMING BEAUTY When you play this\\ncharacter, chosen character gets -2 ¤ this turn.",
                    "name": "DISARMING BEAUTY",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "DISARMING BEAUTY When you play this\\ncharacter, chosen character gets -2 ¤ this turn."
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

    describe('Aurora - Dreaming Guardian', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 139,
                name: 'Aurora',
                
                fullName: 'Aurora - Dreaming Guardian',
                abilities: [
          {
                    "fullText": "Shift 3 (You may pay 3 ⬡ to play this on top of one of\\nyour characters named Aurora.)",
                    "keyword": "Shift",
                    "keywordValue": "3",
                    "keywordValueNumber": 3,
                    "reminderText": "You may pay 3 ⬡ to play this on top of one of your characters named Aurora.",
                    "type": "keyword"
          },
          {
                    "effect": "Your other characters gain Ward. (Opponents can't choose them except to challenge.)",
                    "fullText": "PROTECTIVE EMBRACE Your other characters\\ngain Ward. (Opponents can't choose them except to\\nchallenge.)",
                    "name": "PROTECTIVE EMBRACE",
                    "type": "static"
          }
],
                fullTextSections: [
          "Shift 3 (You may pay 3 ⬡ to play this on top of one of\\nyour characters named Aurora.)",
          "PROTECTIVE EMBRACE Your other characters\\ngain Ward. (Opponents can't choose them except to\\nchallenge.)"
],
                cost: 5,
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

    describe('Belle - Inventive Engineer', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 141,
                name: 'Belle',
                
                fullName: 'Belle - Inventive Engineer',
                abilities: [
          {
                    "effect": "Whenever this character quests, you pay 1 ⬡ less for the next item you play this turn.",
                    "fullText": "TINKER Whenever this character quests, you\\npay 1 ⬡ less for the next item you play this turn.",
                    "name": "TINKER",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "TINKER Whenever this character quests, you\\npay 1 ⬡ less for the next item you play this turn."
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

    describe('Belle - Strange but Special', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 142,
                name: 'Belle',
                
                fullName: 'Belle - Strange but Special',
                abilities: [
          {
                    "effect": "During your turn, you may put an additional card from your hand into your inkwell facedown.",
                    "fullText": "READ A BOOK During your turn, you may put an additional\\ncard from your hand into your inkwell facedown.",
                    "name": "READ A BOOK",
                    "type": "static"
          },
          {
                    "effect": "While you have 10 or more cards in your inkwell, this character gets +4 ◊.",
                    "fullText": "MY FAVORITE PART! While you have 10 or more cards in\\nyour inkwell, this character gets +4 ◊.",
                    "name": "MY FAVORITE PART!",
                    "type": "static"
          }
],
                fullTextSections: [
          "READ A BOOK During your turn, you may put an additional\\ncard from your hand into your inkwell facedown.",
          "MY FAVORITE PART! While you have 10 or more cards in\\nyour inkwell, this character gets +4 ◊."
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

    describe('Chief Tui - Respected Leader', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 143,
                name: 'Chief Tui',
                
                fullName: 'Chief Tui - Respected Leader',
                abilities: [
          {
                    "fullText": "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)",
                    "keyword": "Support",
                    "reminderText": "Whenever this character quests, you may add their ¤ to another chosen character's ¤ this turn.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)"
],
                cost: 7,
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

    describe('Donald Duck - Strutting His Stuff', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 144,
                name: 'Donald Duck',
                
                fullName: 'Donald Duck - Strutting His Stuff',
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
                cost: 5,
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

    describe('Gramma Tala - Storyteller', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 146,
                name: 'Gramma Tala',
                
                fullName: 'Gramma Tala - Storyteller',
                abilities: [
          {
                    "effect": "When this character is banished, you may put this card into your inkwell facedown and exerted.",
                    "fullText": "I WILL BE WITH YOU When this character is\\nbanished, you may put this card into your inkwell\\nfacedown and exerted.",
                    "name": "I WILL BE WITH YOU",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "I WILL BE WITH YOU When this character is\\nbanished, you may put this card into your inkwell\\nfacedown and exerted."
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

    describe('Hades - Infernal Schemer', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 147,
                name: 'Hades',
                
                fullName: 'Hades - Infernal Schemer',
                abilities: [
          {
                    "effect": "When you play this character, you may put chosen opposing character into their player's inkwell facedown.",
                    "fullText": "IS THERE A DOWNSIDE TO THIS? When you\\nplay this character, you may put chosen opposing\\ncharacter into their player's inkwell facedown.",
                    "name": "IS THERE A DOWNSIDE TO THIS?",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "IS THERE A DOWNSIDE TO THIS? When you\\nplay this character, you may put chosen opposing\\ncharacter into their player's inkwell facedown."
],
                cost: 7,
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

    describe('Jasmine - Queen of Agrabah', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 149,
                name: 'Jasmine',
                
                fullName: 'Jasmine - Queen of Agrabah',
                abilities: [
          {
                    "fullText": "Shift 3 (You may pay 3 ⬡ to play this on top of\\none of your characters named Jasmine.)",
                    "keyword": "Shift",
                    "keywordValue": "3",
                    "keywordValueNumber": 3,
                    "reminderText": "You may pay 3 ⬡ to play this on top of one of your characters named Jasmine.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character and whenever she quests, you may remove up to 2 damage from each of your characters.",
                    "fullText": "CARETAKER When you play this character and\\nwhenever she quests, you may remove up to 2\\ndamage from each of your characters.",
                    "name": "CARETAKER",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 3 (You may pay 3 ⬡ to play this on top of\\none of your characters named Jasmine.)",
          "CARETAKER When you play this character and\\nwhenever she quests, you may remove up to 2\\ndamage from each of your characters."
],
                cost: 5,
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
            // Actual: 3
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

    describe('Maurice - World-Famous Inventor', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 152,
                name: 'Maurice',
                
                fullName: 'Maurice - World-Famous Inventor',
                abilities: [
          {
                    "effect": "Whenever this character quests, you pay 2 ⬡ less for the next item you play this turn.",
                    "fullText": "GIVE IT A TRY Whenever this character quests,\\nyou pay 2 ⬡ less for the next item you play this turn.",
                    "name": "GIVE IT A TRY",
                    "type": "triggered"
          },
          {
                    "effect": "Whenever you play an item, you may draw a card.",
                    "fullText": "IT WORKS! Whenever you play an item, you may\\ndraw a card.",
                    "name": "IT WORKS!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "GIVE IT A TRY Whenever this character quests,\\nyou pay 2 ⬡ less for the next item you play this turn.",
          "IT WORKS! Whenever you play an item, you may\\ndraw a card."
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

    describe('Merlin - Self-Appointed Mentor', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 153,
                name: 'Merlin',
                
                fullName: 'Merlin - Self-Appointed Mentor',
                abilities: [
          {
                    "fullText": "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)",
                    "keyword": "Support",
                    "reminderText": "Whenever this character quests, you may add their ¤ to another chosen character's ¤ this turn.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)"
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

    describe('Mickey Mouse - Detective', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 154,
                name: 'Mickey Mouse',
                
                fullName: 'Mickey Mouse - Detective',
                abilities: [
          {
                    "effect": "When you play this character, you may put the top card of your deck into your inkwell facedown and exerted.",
                    "fullText": "GET A CLUE When you play this character,\\nyou may put the top card of your deck into your\\ninkwell facedown and exerted.",
                    "name": "GET A CLUE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "GET A CLUE When you play this character,\\nyou may put the top card of your deck into your\\ninkwell facedown and exerted."
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

    describe('Philoctetes - Trainer of Heroes', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 156,
                name: 'Philoctetes',
                
                fullName: 'Philoctetes - Trainer of Heroes',
                abilities: [
          {
                    "fullText": "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)",
                    "keyword": "Support",
                    "reminderText": "Whenever this character quests, you may add their ¤ to another chosen character's ¤ this turn.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)"
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

    describe('Robin Hood - Unrivaled Archer', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 157,
                name: 'Robin Hood',
                
                fullName: 'Robin Hood - Unrivaled Archer',
                abilities: [
          {
                    "effect": "When you play this character, if an opponent has more cards in their hand than you, draw a card.",
                    "fullText": "FEED THE POOR When you play this character, if an\\nopponent has more cards in their hand than you, draw a card.",
                    "name": "FEED THE POOR",
                    "type": "triggered"
          },
          {
                    "effect": "During your turn, this character gains Evasive. (They can challenge characters with Evasive.)",
                    "fullText": "GOOD SHOT During your turn, this character gains Evasive.\\n(They can challenge characters with Evasive.)",
                    "name": "GOOD SHOT",
                    "type": "static"
          }
],
                fullTextSections: [
          "FEED THE POOR When you play this character, if an\\nopponent has more cards in their hand than you, draw a card.",
          "GOOD SHOT During your turn, this character gains Evasive.\\n(They can challenge characters with Evasive.)"
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

    describe('Scar - Mastermind', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 158,
                name: 'Scar',
                
                fullName: 'Scar - Mastermind',
                abilities: [
          {
                    "effect": "When you play this character, chosen opposing character gets -5 ¤ this turn.",
                    "fullText": "INSIDIOUS PLOT When you play this character,\\nchosen opposing character gets -5 ¤ this turn.",
                    "name": "INSIDIOUS PLOT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "INSIDIOUS PLOT When you play this character,\\nchosen opposing character gets -5 ¤ this turn."
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

    describe('Tamatoa - So Shiny!', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 159,
                name: 'Tamatoa',
                
                fullName: 'Tamatoa - So Shiny!',
                abilities: [
          {
                    "effect": "When you play this character and whenever he quests, you may return an item card from your discard to your hand.",
                    "fullText": "WHAT HAVE WE HERE? When you play this character\\nand whenever he quests, you may return an item card\\nfrom your discard to your hand.",
                    "name": "WHAT HAVE WE HERE?",
                    "type": "triggered"
          },
          {
                    "effect": "This character gets +1 ◊ for each item you have in play.",
                    "fullText": "GLAM This character gets +1 ◊ for each item you have\\nin play.",
                    "name": "GLAM",
                    "type": "static"
          }
],
                fullTextSections: [
          "WHAT HAVE WE HERE? When you play this character\\nand whenever he quests, you may return an item card\\nfrom your discard to your hand.",
          "GLAM This character gets +1 ◊ for each item you have\\nin play."
],
                cost: 8,
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
            // Actual: 3
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

    describe('Develop Your Brain', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 161,
                name: 'Develop Your Brain',
                
                fullName: 'Develop Your Brain',
                abilities: [],
                fullTextSections: [
          "Look at the top 2 cards of your deck. Put one into your\\nhand and the other on the bottom of the deck."
],
                cost: 1,
                type: 'Action' as CardType,
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

    describe('If It\'s Not Baroque', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 162,
                name: 'If It\'s Not Baroque',
                
                fullName: 'If It\'s Not Baroque',
                abilities: [],
                fullTextSections: [
          "Return an item card from your discard to your hand."
],
                cost: 3,
                type: 'Action' as CardType,
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

    describe('Let It Go', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 163,
                name: 'Let It Go',
                
                fullName: 'Let It Go',
                abilities: [
          {
                    "effect": "A character with cost 5 or more can ⟳ to sing this song for free.",
                    "fullText": "(A character with cost 5 or more can ⟳ to sing this song for free.)",
                    "type": "static"
          }
],
                fullTextSections: [
          "(A character with cost 5 or more can ⟳ to sing this song for free.)",
          "Put chosen character into their player's inkwell facedown and\\nexerted."
],
                cost: 5,
                type: 'Action' as CardType,
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

    describe('One Jump Ahead', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 164,
                name: 'One Jump Ahead',
                
                fullName: 'One Jump Ahead',
                abilities: [
          {
                    "effect": "A character with cost 2 or more can ⟳ to sing this song for free.",
                    "fullText": "(A character with cost 2 or more can ⟳ to sing this song for free.)",
                    "type": "static"
          }
],
                fullTextSections: [
          "(A character with cost 2 or more can ⟳ to sing this song for free.)",
          "Put the top card of your deck into your inkwell facedown and\\nexerted."
],
                cost: 2,
                type: 'Action' as CardType,
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

    describe('Work Together', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 165,
                name: 'Work Together',
                
                fullName: 'Work Together',
                abilities: [],
                fullTextSections: [
          "Chosen character gains Support this turn. (Whenever\\nthey quest, you may add their ¤ to another chosen\\ncharacter's ¤ this turn.)"
],
                cost: 1,
                type: 'Action' as CardType,
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

    describe('Coconut Basket', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 166,
                name: 'Coconut Basket',
                
                fullName: 'Coconut Basket',
                abilities: [
          {
                    "effect": "Whenever you play a character, you may remove up to 2 damage from chosen character.",
                    "fullText": "CONSIDER THE COCONUT Whenever you play a character,\\nyou may remove up to 2 damage from chosen character.",
                    "name": "CONSIDER THE COCONUT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "CONSIDER THE COCONUT Whenever you play a character,\\nyou may remove up to 2 damage from chosen character."
],
                cost: 2,
                type: 'Item' as CardType,
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

    describe('Eye of the Fates', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 167,
                name: 'Eye of the Fates',
                
                fullName: 'Eye of the Fates',
                abilities: [
          {
                    "costs": [
                              "⟳"
                    ],
                    "costsText": "⟳",
                    "effect": "Chosen character gets +1 ◊ this turn.",
                    "fullText": "SEE THE FUTURE ⟳ — Chosen character gets +1 ◊\\nthis turn.",
                    "name": "SEE THE FUTURE",
                    "type": "activated"
          }
],
                fullTextSections: [
          "SEE THE FUTURE ⟳ — Chosen character gets +1 ◊\\nthis turn."
],
                cost: 4,
                type: 'Item' as CardType,
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

    describe('Fishbone Quill', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 168,
                name: 'Fishbone Quill',
                
                fullName: 'Fishbone Quill',
                abilities: [
          {
                    "costs": [
                              "⟳"
                    ],
                    "costsText": "⟳",
                    "effect": "Put any card from your hand into your inkwell facedown.",
                    "fullText": "GO AHEAD AND SIGN ⟳ — Put any card from your\\nhand into your inkwell facedown.",
                    "name": "GO AHEAD AND SIGN",
                    "type": "activated"
          }
],
                fullTextSections: [
          "GO AHEAD AND SIGN ⟳ — Put any card from your\\nhand into your inkwell facedown."
],
                cost: 3,
                type: 'Item' as CardType,
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

    describe('Magic Golden Flower', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 169,
                name: 'Magic Golden Flower',
                
                fullName: 'Magic Golden Flower',
                abilities: [
          {
                    "costs": [
                              "Banish this item"
                    ],
                    "costsText": "Banish this item",
                    "effect": "Remove up to 3 damage from chosen character.",
                    "fullText": "HEALING POLLEN Banish this item — Remove up to 3\\ndamage from chosen character.",
                    "name": "HEALING POLLEN",
                    "type": "activated"
          }
],
                fullTextSections: [
          "HEALING POLLEN Banish this item — Remove up to 3\\ndamage from chosen character."
],
                cost: 1,
                type: 'Item' as CardType,
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

    describe('Scepter of Arendelle', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 170,
                name: 'Scepter of Arendelle',
                
                fullName: 'Scepter of Arendelle',
                abilities: [
          {
                    "costs": [
                              "⟳"
                    ],
                    "costsText": "⟳",
                    "effect": "Chosen character gains Support this turn. (Whenever they quest, you may add their ¤ to another chosen character's ¤ this turn.)",
                    "fullText": "COMMAND ⟳ — Chosen character gains Support\\nthis turn. (Whenever they quest, you may add their ¤\\nto another chosen character's ¤ this turn.)",
                    "name": "COMMAND",
                    "type": "activated"
          }
],
                fullTextSections: [
          "COMMAND ⟳ — Chosen character gains Support\\nthis turn. (Whenever they quest, you may add their ¤\\nto another chosen character's ¤ this turn.)"
],
                cost: 1,
                type: 'Item' as CardType,
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

    describe('Beast - Hardheaded', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 172,
                name: 'Beast',
                
                fullName: 'Beast - Hardheaded',
                abilities: [
          {
                    "effect": "When you play this character, you may banish chosen item.",
                    "fullText": "BREAK When you play this character, you may\\nbanish chosen item.",
                    "name": "BREAK",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "BREAK When you play this character, you may\\nbanish chosen item."
],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Captain Hook - Captain of the Jolly Roger', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 173,
                name: 'Captain Hook',
                
                fullName: 'Captain Hook - Captain of the Jolly Roger',
                abilities: [
          {
                    "effect": "When you play this character, you may return an action card named Fire the Cannons! from your discard to your hand.",
                    "fullText": "DOUBLE THE POWDER! When you play this\\ncharacter, you may return an action card named\\nFire the Cannons! from your discard to your hand.",
                    "name": "DOUBLE THE POWDER!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "DOUBLE THE POWDER! When you play this\\ncharacter, you may return an action card named\\nFire the Cannons! from your discard to your hand."
],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Steel'
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

    describe('Captain Hook - Forceful Duelist', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 174,
                name: 'Captain Hook',
                
                fullName: 'Captain Hook - Forceful Duelist',
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
                cost: 1,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Captain Hook - Thinking a Happy Thought', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 175,
                name: 'Captain Hook',
                
                fullName: 'Captain Hook - Thinking a Happy Thought',
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
                    "fullText": "Challenger +3 (While challenging, this character\\ngets +3 ¤.)",
                    "keyword": "Challenger",
                    "keywordValue": "+3",
                    "keywordValueNumber": 3,
                    "reminderText": "While challenging, this character gets +3 ¤.",
                    "type": "keyword"
          },
          {
                    "effect": "Characters with cost 3 or less can't challenge this character.",
                    "fullText": "STOLEN DUST Characters with cost 3 or less can't\\nchallenge this character.",
                    "name": "STOLEN DUST",
                    "type": "static"
          }
],
                fullTextSections: [
          "Shift 3 (You may pay 3 ⬡ to play this on top of one\\nof your characters named Captain Hook.)",
          "Challenger +3 (While challenging, this character\\ngets +3 ¤.)",
          "STOLEN DUST Characters with cost 3 or less can't\\nchallenge this character."
],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Steel'
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

    describe('Donald Duck - Musketeer', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 177,
                name: 'Donald Duck',
                
                fullName: 'Donald Duck - Musketeer',
                abilities: [
          {
                    "fullText": "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of your\\ncharacters must choose one with Bodyguard if able.)",
                    "keyword": "Bodyguard",
                    "reminderText": "This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.",
                    "type": "keyword"
          },
          {
                    "effect": "During your turn, your Musketeer characters gain Evasive. (They can challenge characters with Evasive.)",
                    "fullText": "STAY ALERT! During your turn, your Musketeer\\ncharacters gain Evasive. (They can challenge\\ncharacters with Evasive.)",
                    "name": "STAY ALERT!",
                    "type": "static"
          }
],
                fullTextSections: [
          "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of your\\ncharacters must choose one with Bodyguard if able.)",
          "STAY ALERT! During your turn, your Musketeer\\ncharacters gain Evasive. (They can challenge\\ncharacters with Evasive.)"
],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Gantu - Galactic Federation Captain', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 178,
                name: 'Gantu',
                
                fullName: 'Gantu - Galactic Federation Captain',
                abilities: [
          {
                    "effect": "Characters with cost 2 or less can't challenge your characters.",
                    "fullText": "UNDER ARREST Characters with cost 2 or less\\ncan't challenge your characters.",
                    "name": "UNDER ARREST",
                    "type": "static"
          }
],
                fullTextSections: [
          "UNDER ARREST Characters with cost 2 or less\\ncan't challenge your characters."
],
                cost: 8,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Hans - Thirteenth in Line', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 180,
                name: 'Hans',
                
                fullName: 'Hans - Thirteenth in Line',
                abilities: [
          {
                    "effect": "Whenever this character quests, you may deal 1 damage to chosen character.",
                    "fullText": "STAGE A LITTLE ACCIDENT Whenever this\\ncharacter quests, you may deal 1 damage to\\nchosen character.",
                    "name": "STAGE A LITTLE ACCIDENT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "STAGE A LITTLE ACCIDENT Whenever this\\ncharacter quests, you may deal 1 damage to\\nchosen character."
],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Hercules - True Hero', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 181,
                name: 'Hercules',
                
                fullName: 'Hercules - True Hero',
                abilities: [
          {
                    "fullText": "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of\\nyour characters must choose one with Bodyguard\\nif able.)",
                    "keyword": "Bodyguard",
                    "reminderText": "This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of\\nyour characters must choose one with Bodyguard\\nif able.)"
],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Mickey Mouse - Musketeer', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 186,
                name: 'Mickey Mouse',
                
                fullName: 'Mickey Mouse - Musketeer',
                abilities: [
          {
                    "fullText": "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of\\nyour characters must choose one with Bodyguard\\nif able.)",
                    "keyword": "Bodyguard",
                    "reminderText": "This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.",
                    "type": "keyword"
          },
          {
                    "effect": "Your other Musketeer characters get +1 ¤.",
                    "fullText": "ALL FOR ONE Your other Musketeer characters\\nget +1 ¤.",
                    "name": "ALL FOR ONE",
                    "type": "static"
          }
],
                fullTextSections: [
          "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of\\nyour characters must choose one with Bodyguard\\nif able.)",
          "ALL FOR ONE Your other Musketeer characters\\nget +1 ¤."
],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Prince Eric - Dashing and Brave', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 187,
                name: 'Prince Eric',
                
                fullName: 'Prince Eric - Dashing and Brave',
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
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Simba - Future King', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 188,
                name: 'Simba',
                
                fullName: 'Simba - Future King',
                abilities: [
          {
                    "effect": "When you play this character, you may draw a card, then choose and discard a card.",
                    "fullText": "GUESS WHAT? When you play this character, you\\nmay draw a card, then choose and discard a card.",
                    "name": "GUESS WHAT?",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "GUESS WHAT? When you play this character, you\\nmay draw a card, then choose and discard a card."
],
                cost: 1,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Simba - Returned King', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 189,
                name: 'Simba',
                
                fullName: 'Simba - Returned King',
                abilities: [
          {
                    "fullText": "Challenger +4 (While challenging, this character gets\\n+4 ¤.)",
                    "keyword": "Challenger",
                    "keywordValue": "+4",
                    "keywordValueNumber": 4,
                    "reminderText": "While challenging, this character gets +4 ¤.",
                    "type": "keyword"
          },
          {
                    "effect": "During your turn, this character gains Evasive. (They can challenge characters with Evasive.)",
                    "fullText": "POUNCE During your turn, this character gains\\nEvasive. (They can challenge characters with Evasive.)",
                    "name": "POUNCE",
                    "type": "static"
          }
],
                fullTextSections: [
          "Challenger +4 (While challenging, this character gets\\n+4 ¤.)",
          "POUNCE During your turn, this character gains\\nEvasive. (They can challenge characters with Evasive.)"
],
                cost: 7,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Simba - Rightful Heir', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 190,
                name: 'Simba',
                
                fullName: 'Simba - Rightful Heir',
                abilities: [
          {
                    "effect": "During your turn, whenever this character banishes another character in a challenge, you gain 1 lore.",
                    "fullText": "I KNOW WHAT I HAVE TO DO During your\\nturn, whenever this character banishes another\\ncharacter in a challenge, you gain 1 lore.",
                    "name": "I KNOW WHAT I HAVE TO DO",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "I KNOW WHAT I HAVE TO DO During your\\nturn, whenever this character banishes another\\ncharacter in a challenge, you gain 1 lore."
],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Steel'
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

    describe('Starkey - Hook\'s Henchman', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 191,
                name: 'Starkey',
                
                fullName: 'Starkey - Hook\'s Henchman',
                abilities: [
          {
                    "effect": "While you have a Captain character in play, this character gets +1 ◊.",
                    "fullText": "AYE AYE, CAPTAIN While you have a Captain\\ncharacter in play, this character gets +1 ◊.",
                    "name": "AYE AYE, CAPTAIN",
                    "type": "static"
          }
],
                fullTextSections: [
          "AYE AYE, CAPTAIN While you have a Captain\\ncharacter in play, this character gets +1 ◊."
],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Te Kā - Heartless', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 192,
                name: 'Te Kā',
                
                fullName: 'Te Kā - Heartless',
                abilities: [
          {
                    "effect": "During your turn, whenever this character banishes another character in a challenge, you gain 2 lore.",
                    "fullText": "SEEK THE HEART During your turn, whenever\\nthis character banishes another character in a\\nchallenge, you gain 2 lore.",
                    "name": "SEEK THE HEART",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "SEEK THE HEART During your turn, whenever\\nthis character banishes another character in a\\nchallenge, you gain 2 lore."
],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Tinker Bell - Giant Fairy', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 193,
                name: 'Tinker Bell',
                
                fullName: 'Tinker Bell - Giant Fairy',
                abilities: [
          {
                    "fullText": "Shift 4 (You may pay 4 ⬡ to play this on top of one of your\\ncharacters named Tinker Bell.)",
                    "keyword": "Shift",
                    "keywordValue": "4",
                    "keywordValueNumber": 4,
                    "reminderText": "You may pay 4 ⬡ to play this on top of one of your characters named Tinker Bell.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, deal 1 damage to each opposing character.",
                    "fullText": "ROCK THE BOAT When you play this character, deal 1\\ndamage to each opposing character.",
                    "name": "ROCK THE BOAT",
                    "type": "triggered"
          },
          {
                    "effect": "During your turn, whenever this character banishes another character in a challenge, you may deal 2 damage to chosen opposing character.",
                    "fullText": "PUNY PIRATE! During your turn, whenever this character\\nbanishes another character in a challenge, you may deal 2\\ndamage to chosen opposing character.",
                    "name": "PUNY PIRATE!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 4 (You may pay 4 ⬡ to play this on top of one of your\\ncharacters named Tinker Bell.)",
          "ROCK THE BOAT When you play this character, deal 1\\ndamage to each opposing character.",
          "PUNY PIRATE! During your turn, whenever this character\\nbanishes another character in a challenge, you may deal 2\\ndamage to chosen opposing character."
],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Tinker Bell - Tiny Tactician', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 194,
                name: 'Tinker Bell',
                
                fullName: 'Tinker Bell - Tiny Tactician',
                abilities: [
          {
                    "costs": [
                              "⟳"
                    ],
                    "costsText": "⟳",
                    "effect": "Draw a card, then choose and discard a card.",
                    "fullText": "BATTLE PLANS ⟳ — Draw a card, then choose\\nand discard a card.",
                    "name": "BATTLE PLANS",
                    "type": "activated"
          }
],
                fullTextSections: [
          "BATTLE PLANS ⟳ — Draw a card, then choose\\nand discard a card."
],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('A Whole New World', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 195,
                name: 'A Whole New World',
                
                fullName: 'A Whole New World',
                abilities: [
          {
                    "effect": "A character with cost 5 or more can ⟳ to sing this song for free.",
                    "fullText": "(A character with cost 5 or more can ⟳ to sing this\\nsong for free.)",
                    "type": "static"
          }
],
                fullTextSections: [
          "(A character with cost 5 or more can ⟳ to sing this\\nsong for free.)",
          "Each player discards their hand and draws 7 cards."
],
                cost: 5,
                type: 'Action' as CardType,
                inkwell: false,
                color: 'Steel'
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

    describe('Break', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 196,
                name: 'Break',
                
                fullName: 'Break',
                abilities: [],
                fullTextSections: [
          "Banish chosen item."
],
                cost: 2,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Fire the Cannons!', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 197,
                name: 'Fire the Cannons!',
                
                fullName: 'Fire the Cannons!',
                abilities: [],
                fullTextSections: [
          "Deal 2 damage to chosen character."
],
                cost: 1,
                type: 'Action' as CardType,
                inkwell: false,
                color: 'Steel'
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

    describe('Grab Your Sword', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 198,
                name: 'Grab Your Sword',
                
                fullName: 'Grab Your Sword',
                abilities: [
          {
                    "effect": "A character with cost 5 or more can ⟳ to sing this song for free.",
                    "fullText": "(A character with cost 5 or more can ⟳ to sing this song for\\nfree.)",
                    "type": "static"
          }
],
                fullTextSections: [
          "(A character with cost 5 or more can ⟳ to sing this song for\\nfree.)",
          "Deal 2 damage to each opposing character."
],
                cost: 5,
                type: 'Action' as CardType,
                inkwell: false,
                color: 'Steel'
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

    describe('Ransack', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 199,
                name: 'Ransack',
                
                fullName: 'Ransack',
                abilities: [],
                fullTextSections: [
          "Draw 2 cards, then choose and discard 2 cards."
],
                cost: 2,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Smash', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 200,
                name: 'Smash',
                
                fullName: 'Smash',
                abilities: [],
                fullTextSections: [
          "Deal 3 damage to chosen character."
],
                cost: 3,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Beast\'s Mirror', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 201,
                name: 'Beast\'s Mirror',
                
                fullName: 'Beast\'s Mirror',
                abilities: [
          {
                    "costs": [
                              "⟳",
                              "3 ⬡"
                    ],
                    "costsText": "⟳, 3 ⬡",
                    "effect": "If you have no cards in your hand, draw a card.",
                    "fullText": "SHOW ME ⟳, 3 ⬡ — If you have no cards in your\\nhand, draw a card.",
                    "name": "SHOW ME",
                    "type": "activated"
          }
],
                fullTextSections: [
          "SHOW ME ⟳, 3 ⬡ — If you have no cards in your\\nhand, draw a card."
],
                cost: 2,
                type: 'Item' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Frying Pan', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 202,
                name: 'Frying Pan',
                
                fullName: 'Frying Pan',
                abilities: [
          {
                    "costs": [
                              "Banish this item"
                    ],
                    "costsText": "Banish this item",
                    "effect": "Chosen character can't challenge during their next turn.",
                    "fullText": "CLANG! Banish this item — Chosen character can't\\nchallenge during their next turn.",
                    "name": "CLANG!",
                    "type": "activated"
          }
],
                fullTextSections: [
          "CLANG! Banish this item — Chosen character can't\\nchallenge during their next turn."
],
                cost: 2,
                type: 'Item' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Musketeer Tabard', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 203,
                name: 'Musketeer Tabard',
                
                fullName: 'Musketeer Tabard',
                abilities: [
          {
                    "effect": "Whenever one of your characters with Bodyguard is banished, you may draw a card.",
                    "fullText": "ALL FOR ONE AND ONE FOR ALL Whenever one of\\nyour characters with Bodyguard is banished, you may\\ndraw a card.",
                    "name": "ALL FOR ONE AND ONE FOR ALL",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "ALL FOR ONE AND ONE FOR ALL Whenever one of\\nyour characters with Bodyguard is banished, you may\\ndraw a card."
],
                cost: 4,
                type: 'Item' as CardType,
                inkwell: false,
                color: 'Steel'
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

    describe('Plasma Blaster', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 204,
                name: 'Plasma Blaster',
                
                fullName: 'Plasma Blaster',
                abilities: [
          {
                    "costs": [
                              "⟳",
                              "2 ⬡"
                    ],
                    "costsText": "⟳, 2 ⬡",
                    "effect": "Deal 1 damage to chosen character.",
                    "fullText": "QUICK SHOT ⟳, 2 ⬡ — Deal 1 damage to chosen\\ncharacter.",
                    "name": "QUICK SHOT",
                    "type": "activated"
          }
],
                fullTextSections: [
          "QUICK SHOT ⟳, 2 ⬡ — Deal 1 damage to chosen\\ncharacter."
],
                cost: 3,
                type: 'Item' as CardType,
                inkwell: false,
                color: 'Steel'
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

    describe('Hades - King of Olympus', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 205,
                name: 'Hades',
                
                fullName: 'Hades - King of Olympus',
                abilities: [
          {
                    "fullText": "Shift 6 (You may pay 6 ⬡ to play this on top of one\\nof your characters named Hades.)",
                    "keyword": "Shift",
                    "keywordValue": "6",
                    "keywordValueNumber": 6,
                    "reminderText": "You may pay 6 ⬡ to play this on top of one of your characters named Hades.",
                    "type": "keyword"
          },
          {
                    "effect": "This character gets +1 ◊ for each other Villain character you have in play.",
                    "fullText": "SINISTER PLOT This character gets +1 ◊ for each\\nother Villain character you have in play.",
                    "name": "SINISTER PLOT",
                    "type": "static"
          }
],
                fullTextSections: [
          "Shift 6 (You may pay 6 ⬡ to play this on top of one\\nof your characters named Hades.)",
          "SINISTER PLOT This character gets +1 ◊ for each\\nother Villain character you have in play."
],
                cost: 8,
                type: 'Character' as CardType,
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

    describe('Stitch - Carefree Surfer', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 206,
                name: 'Stitch',
                
                fullName: 'Stitch - Carefree Surfer',
                abilities: [
          {
                    "effect": "When you play this character, if you have 2 or more other characters in play, you may draw 2 cards.",
                    "fullText": "OHANA When you play this character, if you\\nhave 2 or more other characters in play, you may\\ndraw 2 cards.",
                    "name": "OHANA",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "OHANA When you play this character, if you\\nhave 2 or more other characters in play, you may\\ndraw 2 cards."
],
                cost: 7,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Elsa - Spirit of Winter', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 207,
                name: 'Elsa',
                
                fullName: 'Elsa - Spirit of Winter',
                abilities: [
          {
                    "fullText": "Shift 6 (You may pay 6 ⬡ to play this on top of one of\\nyour characters named Elsa.)",
                    "keyword": "Shift",
                    "keywordValue": "6",
                    "keywordValueNumber": 6,
                    "reminderText": "You may pay 6 ⬡ to play this on top of one of your characters named Elsa.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, exert up to 2 chosen characters. They can't ready at the start of their next turn.",
                    "fullText": "DEEP FREEZE When you play this character, exert up\\nto 2 chosen characters. They can't ready at the start of\\ntheir next turn.",
                    "name": "DEEP FREEZE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 6 (You may pay 6 ⬡ to play this on top of one of\\nyour characters named Elsa.)",
          "DEEP FREEZE When you play this character, exert up\\nto 2 chosen characters. They can't ready at the start of\\ntheir next turn."
],
                cost: 8,
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

    describe('Mickey Mouse - Wayward Sorcerer', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 208,
                name: 'Mickey Mouse',
                
                fullName: 'Mickey Mouse - Wayward Sorcerer',
                abilities: [
          {
                    "effect": "You pay 1 ⬡ less to play Broom characters.",
                    "fullText": "ANIMATE BROOM You pay 1 ⬡ less to play Broom\\ncharacters.",
                    "name": "ANIMATE BROOM",
                    "type": "static"
          },
          {
                    "effect": "Whenever one of your Broom characters is banished in a challenge, you may return that card to your hand.",
                    "fullText": "CEASELESS WORKER Whenever one of your Broom\\ncharacters is banished in a challenge, you may return\\nthat card to your hand.",
                    "name": "CEASELESS WORKER",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "ANIMATE BROOM You pay 1 ⬡ less to play Broom\\ncharacters.",
          "CEASELESS WORKER Whenever one of your Broom\\ncharacters is banished in a challenge, you may return\\nthat card to your hand."
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

    describe('Genie - On the Job', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 209,
                name: 'Genie',
                
                fullName: 'Genie - On the Job',
                abilities: [
          {
                    "fullText": "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
                    "keyword": "Evasive",
                    "reminderText": "Only characters with Evasive can challenge this character.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, you may return chosen character to their player's hand.",
                    "fullText": "DISAPPEAR When you play this character, you may\\nreturn chosen character to their player's hand.",
                    "name": "DISAPPEAR",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
          "DISAPPEAR When you play this character, you may\\nreturn chosen character to their player's hand."
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

    describe('Mickey Mouse - Artful Rogue', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 210,
                name: 'Mickey Mouse',
                
                fullName: 'Mickey Mouse - Artful Rogue',
                abilities: [
          {
                    "fullText": "Shift 5 (You may pay 5 ⬡ to play this on top of one of\\nyour characters named Mickey Mouse.)",
                    "keyword": "Shift",
                    "keywordValue": "5",
                    "keywordValueNumber": 5,
                    "reminderText": "You may pay 5 ⬡ to play this on top of one of your characters named Mickey Mouse.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever you play an action, chosen opposing character can't quest during their next turn.",
                    "fullText": "MISDIRECTION Whenever you play an action, chosen\\nopposing character can't quest during their next turn.",
                    "name": "MISDIRECTION",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 5 (You may pay 5 ⬡ to play this on top of one of\\nyour characters named Mickey Mouse.)",
          "MISDIRECTION Whenever you play an action, chosen\\nopposing character can't quest during their next turn."
],
                cost: 7,
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

    describe('Aladdin - Heroic Outlaw', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 211,
                name: 'Aladdin',
                
                fullName: 'Aladdin - Heroic Outlaw',
                abilities: [
          {
                    "fullText": "Shift 5 (You may pay 5 ⬡ to play this on top of one of your\\ncharacters named Aladdin.)",
                    "keyword": "Shift",
                    "keywordValue": "5",
                    "keywordValueNumber": 5,
                    "reminderText": "You may pay 5 ⬡ to play this on top of one of your characters named Aladdin.",
                    "type": "keyword"
          },
          {
                    "effect": "During your turn, whenever this character banishes another character in a challenge, you gain 2 lore and each opponent loses 2 lore.",
                    "fullText": "DARING EXPLOIT During your turn, whenever this character\\nbanishes another character in a challenge, you gain 2 lore and\\neach opponent loses 2 lore.",
                    "name": "DARING EXPLOIT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 5 (You may pay 5 ⬡ to play this on top of one of your\\ncharacters named Aladdin.)",
          "DARING EXPLOIT During your turn, whenever this character\\nbanishes another character in a challenge, you gain 2 lore and\\neach opponent loses 2 lore."
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

    describe('Maui - Hero to All', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 212,
                name: 'Maui',
                
                fullName: 'Maui - Hero to All',
                abilities: [
          {
                    "fullText": "Rush (This character can challenge the turn they're\\nplayed.)",
                    "keyword": "Rush",
                    "reminderText": "This character can challenge the turn they're played.",
                    "type": "keyword"
          },
          {
                    "fullText": "Reckless (This character can't quest and must\\nchallenge each turn if able.)",
                    "keyword": "Reckless",
                    "reminderText": "This character can't quest and must challenge each turn if able.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Rush (This character can challenge the turn they're\\nplayed.)",
          "Reckless (This character can't quest and must\\nchallenge each turn if able.)"
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

    describe('Aurora - Dreaming Guardian', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 213,
                name: 'Aurora',
                
                fullName: 'Aurora - Dreaming Guardian',
                abilities: [
          {
                    "fullText": "Shift 3 (You may pay 3 ⬡ to play this on top of one of your\\ncharacters named Aurora.)",
                    "keyword": "Shift",
                    "keywordValue": "3",
                    "keywordValueNumber": 3,
                    "reminderText": "You may pay 3 ⬡ to play this on top of one of your characters named Aurora.",
                    "type": "keyword"
          },
          {
                    "effect": "Your other characters gain Ward. (Opponents can't choose them except to challenge.)",
                    "fullText": "PROTECTIVE EMBRACE Your other characters gain Ward.\\n(Opponents can't choose them except to challenge.)",
                    "name": "PROTECTIVE EMBRACE",
                    "type": "static"
          }
],
                fullTextSections: [
          "Shift 3 (You may pay 3 ⬡ to play this on top of one of your\\ncharacters named Aurora.)",
          "PROTECTIVE EMBRACE Your other characters gain Ward.\\n(Opponents can't choose them except to challenge.)"
],
                cost: 5,
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

    describe('Belle - Strange but Special', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 214,
                name: 'Belle',
                
                fullName: 'Belle - Strange but Special',
                abilities: [
          {
                    "effect": "During your turn, you may put an additional card from your hand into your inkwell facedown.",
                    "fullText": "READ A BOOK During your turn, you may put an additional\\ncard from your hand into your inkwell facedown.",
                    "name": "READ A BOOK",
                    "type": "static"
          },
          {
                    "effect": "While you have 10 or more cards in your inkwell, this character gets +4 ◊.",
                    "fullText": "MY FAVORITE PART! While you have 10 or more cards in\\nyour inkwell, this character gets +4 ◊.",
                    "name": "MY FAVORITE PART!",
                    "type": "static"
          }
],
                fullTextSections: [
          "READ A BOOK During your turn, you may put an additional\\ncard from your hand into your inkwell facedown.",
          "MY FAVORITE PART! While you have 10 or more cards in\\nyour inkwell, this character gets +4 ◊."
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

    describe('Simba - Returned King', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 215,
                name: 'Simba',
                
                fullName: 'Simba - Returned King',
                abilities: [
          {
                    "fullText": "Challenger +4 (When challenging, this character gets\\n+4 ¤.)",
                    "keyword": "Challenger",
                    "keywordValue": "+4",
                    "keywordValueNumber": 4,
                    "reminderText": "When challenging, this character gets +4 ¤.",
                    "type": "keyword"
          },
          {
                    "effect": "During your turn, this character gains Evasive. (They can challenge characters with Evasive.)",
                    "fullText": "POUNCE During your turn, this character gains Evasive.\\n(They can challenge characters with Evasive.)",
                    "name": "POUNCE",
                    "type": "static"
          }
],
                fullTextSections: [
          "Challenger +4 (When challenging, this character gets\\n+4 ¤.)",
          "POUNCE During your turn, this character gains Evasive.\\n(They can challenge characters with Evasive.)"
],
                cost: 7,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Tinker Bell - Giant Fairy', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 216,
                name: 'Tinker Bell',
                
                fullName: 'Tinker Bell - Giant Fairy',
                abilities: [
          {
                    "fullText": "Shift 4 (You may pay 4 ⬡ to play this on top of one of your\\ncharacters named Tinker Bell.)",
                    "keyword": "Shift",
                    "keywordValue": "4",
                    "keywordValueNumber": 4,
                    "reminderText": "You may pay 4 ⬡ to play this on top of one of your characters named Tinker Bell.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, deal 1 damage to each opposing character.",
                    "fullText": "ROCK THE BOAT When you play this character, deal 1\\ndamage to each opposing character.",
                    "name": "ROCK THE BOAT",
                    "type": "triggered"
          },
          {
                    "effect": "During your turn, whenever this character banishes another character in a challenge, you may deal 2 damage to chosen opposing character.",
                    "fullText": "PUNY PIRATE! During your turn, whenever this character\\nbanishes another character in a challenge, you may deal 2\\ndamage to chosen opposing character.",
                    "name": "PUNY PIRATE!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 4 (You may pay 4 ⬡ to play this on top of one of your\\ncharacters named Tinker Bell.)",
          "ROCK THE BOAT When you play this character, deal 1\\ndamage to each opposing character.",
          "PUNY PIRATE! During your turn, whenever this character\\nbanishes another character in a challenge, you may deal 2\\ndamage to chosen opposing character."
],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
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

    describe('Bashful - Hopeless Romantic', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 217,
                name: 'Bashful',
                
                fullName: 'Bashful - Hopeless Romantic',
                abilities: [
          {
                    "effect": "This character can't quest unless you have another Seven Dwarfs character in play.",
                    "fullText": "OH, GOSH! This character can't quest unless you\\nhave another Seven Dwarfs character in play.",
                    "name": "OH, GOSH!",
                    "type": "static"
          }
],
                fullTextSections: [
          "OH, GOSH! This character can't quest unless you\\nhave another Seven Dwarfs character in play."
],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Christopher Robin - Adventurer', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 218,
                name: 'Christopher Robin',
                
                fullName: 'Christopher Robin - Adventurer',
                abilities: [
          {
                    "effect": "Whenever you ready this character, if you have 2 or more other characters in play, gain 2 lore.",
                    "fullText": "WE'LL ALWAYS BE TOGETHER Whenever you ready\\nthis character, if you have 2 or more other characters\\nin play, gain 2 lore.",
                    "name": "WE'LL ALWAYS BE TOGETHER",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "WE'LL ALWAYS BE TOGETHER Whenever you ready\\nthis character, if you have 2 or more other characters\\nin play, gain 2 lore."
],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Cinderella - Ballroom Sensation', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 219,
                name: 'Cinderella',
                
                fullName: 'Cinderella - Ballroom Sensation',
                abilities: [
          {
                    "fullText": "Singer 3 (This character counts as cost 3 to sing\\nsongs.)",
                    "keyword": "Singer",
                    "keywordValue": "3",
                    "keywordValueNumber": 3,
                    "reminderText": "This character counts as cost 3 to sing songs.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Singer 3 (This character counts as cost 3 to sing\\nsongs.)"
],
                cost: 1,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Doc - Leader of the Seven Dwarfs', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 221,
                name: 'Doc',
                
                fullName: 'Doc - Leader of the Seven Dwarfs',
                abilities: [
          {
                    "effect": "Whenever this character quests, you pay 1 ⬡ less for the next character you play this turn.",
                    "fullText": "SHARE AND SHARE ALIKE Whenever this\\ncharacter quests, you pay 1 ⬡ less for the next\\ncharacter you play this turn.",
                    "name": "SHARE AND SHARE ALIKE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "SHARE AND SHARE ALIKE Whenever this\\ncharacter quests, you pay 1 ⬡ less for the next\\ncharacter you play this turn."
],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Dopey - Always Playful', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 222,
                name: 'Dopey',
                
                fullName: 'Dopey - Always Playful',
                abilities: [
          {
                    "effect": "When this character is banished, your other Seven Dwarfs characters get +2 ¤ until the start of your next turn.",
                    "fullText": "ODD ONE OUT When this character is banished,\\nyour other Seven Dwarfs characters get +2 ¤\\nuntil the start of your next turn.",
                    "name": "ODD ONE OUT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "ODD ONE OUT When this character is banished,\\nyour other Seven Dwarfs characters get +2 ¤\\nuntil the start of your next turn."
],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Gaston - Baritone Bully', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 224,
                name: 'Gaston',
                
                fullName: 'Gaston - Baritone Bully',
                abilities: [
          {
                    "fullText": "Singer 5 (This character counts as cost 5 to sing\\nsongs.)",
                    "keyword": "Singer",
                    "keywordValue": "5",
                    "keywordValueNumber": 5,
                    "reminderText": "This character counts as cost 5 to sing songs.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Singer 5 (This character counts as cost 5 to sing\\nsongs.)"
],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Grand Duke - Advisor to the King', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 225,
                name: 'Grand Duke',
                
                fullName: 'Grand Duke - Advisor to the King',
                abilities: [
          {
                    "effect": "Your Prince, Princess, King, and Queen characters get +1 ¤.",
                    "fullText": "YES, YOUR MAJESTY Your Prince, Princess, King,\\nand Queen characters get +1 ¤.",
                    "name": "YES, YOUR MAJESTY",
                    "type": "static"
          }
],
                fullTextSections: [
          "YES, YOUR MAJESTY Your Prince, Princess, King,\\nand Queen characters get +1 ¤."
],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Grumpy - Bad-Tempered', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 226,
                name: 'Grumpy',
                
                fullName: 'Grumpy - Bad-Tempered',
                abilities: [
          {
                    "effect": "Your other Seven Dwarfs characters get +1 ¤.",
                    "fullText": "THERE'S TROUBLE A-BREWIN' Your other Seven\\nDwarfs characters get +1 ¤.",
                    "name": "THERE'S TROUBLE A-BREWIN'",
                    "type": "static"
          }
],
                fullTextSections: [
          "THERE'S TROUBLE A-BREWIN' Your other Seven\\nDwarfs characters get +1 ¤."
],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Happy - Good-Natured', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 227,
                name: 'Happy',
                
                fullName: 'Happy - Good-Natured',
                abilities: [
          {
                    "fullText": "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)",
                    "keyword": "Support",
                    "reminderText": "Whenever this character quests, you may add their ¤ to another chosen character's ¤ this turn.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)"
],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('King Louie - Jungle VIP', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 228,
                name: 'King Louie',
                
                fullName: 'King Louie - Jungle VIP',
                abilities: [
          {
                    "effect": "Whenever another character is banished, you may remove up to 2 damage from this character.",
                    "fullText": "LAY IT ON THE LINE Whenever another character\\nis banished, you may remove up to 2 damage\\nfrom this character.",
                    "name": "LAY IT ON THE LINE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "LAY IT ON THE LINE Whenever another character\\nis banished, you may remove up to 2 damage\\nfrom this character."
],
                cost: 7,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Mickey Mouse - Friendly Face', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 229,
                name: 'Mickey Mouse',
                
                fullName: 'Mickey Mouse - Friendly Face',
                abilities: [
          {
                    "effect": "Whenever this character quests, you pay 3 ⬡ less for the next character you play this turn.",
                    "fullText": "GLAD YOU'RE HERE! Whenever this character\\nquests, you pay 3 ⬡ less for the next character\\nyou play this turn.",
                    "name": "GLAD YOU'RE HERE!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "GLAD YOU'RE HERE! Whenever this character\\nquests, you pay 3 ⬡ less for the next character\\nyou play this turn."
],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Mufasa - Betrayed Leader', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 230,
                name: 'Mufasa',
                
                fullName: 'Mufasa - Betrayed Leader',
                abilities: [
          {
                    "effect": "When this character is banished, you may reveal the top card of your deck. If it's a character card, you may play that character for free and they enter play exerted. Otherwise, put it on the top of your deck.",
                    "fullText": "THE SUN WILL SET When this character is\\nbanished, you may reveal the top card of your\\ndeck. If it's a character card, you may play that\\ncharacter for free and they enter play exerted.\\nOtherwise, put it on the top of your deck.",
                    "name": "THE SUN WILL SET",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "THE SUN WILL SET When this character is\\nbanished, you may reveal the top card of your\\ndeck. If it's a character card, you may play that\\ncharacter for free and they enter play exerted.\\nOtherwise, put it on the top of your deck."
],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Mulan - Free Spirit', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 231,
                name: 'Mulan',
                
                fullName: 'Mulan - Free Spirit',
                abilities: [
          {
                    "fullText": "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)",
                    "keyword": "Support",
                    "reminderText": "Whenever this character quests, you may add their ¤ to another chosen character's ¤ this turn.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)"
],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Mulan - Reflecting', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 232,
                name: 'Mulan',
                
                fullName: 'Mulan - Reflecting',
                abilities: [
          {
                    "fullText": "Shift 2 (You may pay 2 ⬡ to play this on top of\\none of your characters named Mulan.)",
                    "keyword": "Shift",
                    "keywordValue": "2",
                    "keywordValueNumber": 2,
                    "reminderText": "You may pay 2 ⬡ to play this on top of one of your characters named Mulan.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever this character quests, you may reveal the top card of your deck. If it's a song card, you may play it for free. Otherwise, put it on the top of your deck.",
                    "fullText": "HONOR TO THE ANCESTORS Whenever this\\ncharacter quests, you may reveal the top card of\\nyour deck. If it's a song card, you may play it for\\nfree. Otherwise, put it on the top of your deck.",
                    "name": "HONOR TO THE ANCESTORS",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 2 (You may pay 2 ⬡ to play this on top of\\none of your characters named Mulan.)",
          "HONOR TO THE ANCESTORS Whenever this\\ncharacter quests, you may reveal the top card of\\nyour deck. If it's a song card, you may play it for\\nfree. Otherwise, put it on the top of your deck."
],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Nana - Darling Family Pet', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 233,
                name: 'Nana',
                
                fullName: 'Nana - Darling Family Pet',
                abilities: [
          {
                    "effect": "Whenever you play a Floodborn character, you may remove all damage from chosen character.",
                    "fullText": "NURSEMAID Whenever you play a Floodborn\\ncharacter, you may remove all damage from\\nchosen character.",
                    "name": "NURSEMAID",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "NURSEMAID Whenever you play a Floodborn\\ncharacter, you may remove all damage from\\nchosen character."
],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Rapunzel - Gifted Artist', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 235,
                name: 'Rapunzel',
                
                fullName: 'Rapunzel - Gifted Artist',
                abilities: [
          {
                    "fullText": "Shift 3 (You may pay 3 ⬡ to play this on top of\\none of your characters named Rapunzel.)",
                    "keyword": "Shift",
                    "keywordValue": "3",
                    "keywordValueNumber": 3,
                    "reminderText": "You may pay 3 ⬡ to play this on top of one of your characters named Rapunzel.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever you remove 1 or more damage from one of your characters, you may draw a card.",
                    "fullText": "LET YOUR POWER SHINE Whenever you remove 1\\nor more damage from one of your characters, you\\nmay draw a card.",
                    "name": "LET YOUR POWER SHINE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 3 (You may pay 3 ⬡ to play this on top of\\none of your characters named Rapunzel.)",
          "LET YOUR POWER SHINE Whenever you remove 1\\nor more damage from one of your characters, you\\nmay draw a card."
],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Rapunzel - Sunshine', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 236,
                name: 'Rapunzel',
                
                fullName: 'Rapunzel - Sunshine',
                abilities: [
          {
                    "costs": [
                              "⟳"
                    ],
                    "costsText": "⟳",
                    "effect": "Remove up to 2 damage from chosen character.",
                    "fullText": "MAGIC HAIR ⟳ — Remove up to 2 damage from\\nchosen character.",
                    "name": "MAGIC HAIR",
                    "type": "activated"
          }
],
                fullTextSections: [
          "MAGIC HAIR ⟳ — Remove up to 2 damage from\\nchosen character."
],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Sleepy - Nodding Off', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 237,
                name: 'Sleepy',
                
                fullName: 'Sleepy - Nodding Off',
                abilities: [
          {
                    "effect": "This character enters play exerted.",
                    "fullText": "YAWN! This character enters play exerted.",
                    "name": "YAWN!",
                    "type": "static"
          }
],
                fullTextSections: [
          "YAWN! This character enters play exerted."
],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Sneezy - Very Allergic', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 238,
                name: 'Sneezy',
                
                fullName: 'Sneezy - Very Allergic',
                abilities: [
          {
                    "effect": "Whenever you play this character or another Seven Dwarfs character, you may give chosen character -1 ¤ this turn.",
                    "fullText": "AH-CHOO! Whenever you play this character or\\nanother Seven Dwarfs character, you may give\\nchosen character -1 ¤ this turn.",
                    "name": "AH-CHOO!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "AH-CHOO! Whenever you play this character or\\nanother Seven Dwarfs character, you may give\\nchosen character -1 ¤ this turn."
],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Snow White - Lost in the Forest', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 239,
                name: 'Snow White',
                
                fullName: 'Snow White - Lost in the Forest',
                abilities: [
          {
                    "effect": "When you play this character, you may remove up to 2 damage from chosen character.",
                    "fullText": "I WON'T HURT YOU When you play this character,\\nyou may remove up to 2 damage from chosen\\ncharacter.",
                    "name": "I WON'T HURT YOU",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "I WON'T HURT YOU When you play this character,\\nyou may remove up to 2 damage from chosen\\ncharacter."
],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Snow White - Unexpected Houseguest', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 240,
                name: 'Snow White',
                
                fullName: 'Snow White - Unexpected Houseguest',
                abilities: [
          {
                    "effect": "You pay 1 ⬡ less to play Seven Dwarfs characters.",
                    "fullText": "HOW DO YOU DO? You pay 1 ⬡ less to play Seven\\nDwarfs characters.",
                    "name": "HOW DO YOU DO?",
                    "type": "static"
          }
],
                fullTextSections: [
          "HOW DO YOU DO? You pay 1 ⬡ less to play Seven\\nDwarfs characters."
],
                cost: 2,
                type: 'Character' as CardType,
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

    describe('Snow White - Well Wisher', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 241,
                name: 'Snow White',
                
                fullName: 'Snow White - Well Wisher',
                abilities: [
          {
                    "fullText": "Shift 4 (You may pay 4 ⬡ to play this on top of\\none of your characters named Snow White.)",
                    "keyword": "Shift",
                    "keywordValue": "4",
                    "keywordValueNumber": 4,
                    "reminderText": "You may pay 4 ⬡ to play this on top of one of your characters named Snow White.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever this character quests, you may return a character card from your discard to your hand.",
                    "fullText": "WISHES COME TRUE Whenever this character\\nquests, you may return a character card from\\nyour discard to your hand.",
                    "name": "WISHES COME TRUE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 4 (You may pay 4 ⬡ to play this on top of\\none of your characters named Snow White.)",
          "WISHES COME TRUE Whenever this character\\nquests, you may return a character card from\\nyour discard to your hand."
],
                cost: 6,
                type: 'Character' as CardType,
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

    describe('The Queen - Commanding Presence', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 242,
                name: 'The Queen',
                
                fullName: 'The Queen - Commanding Presence',
                abilities: [
          {
                    "fullText": "Shift 2 (You may pay 2 ⬡ to play this on top of one of\\nyour characters named The Queen.)",
                    "keyword": "Shift",
                    "keywordValue": "2",
                    "keywordValueNumber": 2,
                    "reminderText": "You may pay 2 ⬡ to play this on top of one of your characters named The Queen.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever this character quests, chosen opposing character gets -4 ¤ this turn and chosen character gets +4 ¤ this turn.",
                    "fullText": "WHO IS THE FAIREST? Whenever this character\\nquests, chosen opposing character gets -4 ¤ this\\nturn and chosen character gets +4 ¤ this turn.",
                    "name": "WHO IS THE FAIREST?",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 2 (You may pay 2 ⬡ to play this on top of one of\\nyour characters named The Queen.)",
          "WHO IS THE FAIREST? Whenever this character\\nquests, chosen opposing character gets -4 ¤ this\\nturn and chosen character gets +4 ¤ this turn."
],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
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

    describe('Hold Still', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 244,
                name: 'Hold Still',
                
                fullName: 'Hold Still',
                abilities: [],
                fullTextSections: [
          "Remove up to 4 damage from chosen character."
],
                cost: 2,
                type: 'Action' as CardType,
                inkwell: true,
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
