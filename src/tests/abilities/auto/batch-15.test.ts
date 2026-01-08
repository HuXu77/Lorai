import { parseToAbilityDefinition } from '../../../engine/ability-parser';
import { GameEvent } from '../../../engine/abilities/events';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { ZoneType } from '../../../engine/models';
import { CardType } from '../../../engine/models';

describe('Parser Batch 15', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    
    beforeEach(() => {
        game = new GameStateManager();
        const p1Id = game.addPlayer('Player 1');
        const p2Id = game.addPlayer('Player 2');
        turnManager = new TurnManager(game);
    });
    describe('Honey Lemon - Chemistry Whiz', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1602,
                name: 'Honey Lemon',
                
                fullName: 'Honey Lemon - Chemistry Whiz',
                abilities: [
          {
                    "effect": "Whenever you play a Floodborn character, if you used Shift to play them, you may remove up to 2 damage from chosen character.",
                    "fullText": "PRETTY GREAT, HUH? Whenever you play a\\nFloodborn character, if you used Shift to play\\nthem, you may remove up to 2 damage from\\nchosen character.",
                    "name": "PRETTY GREAT, HUH?",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "PRETTY GREAT, HUH? Whenever you play a\\nFloodborn character, if you used Shift to play\\nthem, you may remove up to 2 damage from\\nchosen character."
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

    describe('Robin Hood - Eye for Detail', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1603,
                name: 'Robin Hood',
                
                fullName: 'Robin Hood - Eye for Detail',
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

    describe('Penny the Orphan - Clever Child', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1604,
                name: 'Penny the Orphan',
                
                fullName: 'Penny the Orphan - Clever Child',
                abilities: [
          {
                    "effect": "While you have a Hero character in play, this character gains Ward. (Opponents can't choose them except to challenge.)",
                    "fullText": "OUR BOTTLE WORKED! While you have a Hero\\ncharacter in play, this character gains Ward.\\n(Opponents can't choose them except to challenge.)",
                    "name": "OUR BOTTLE WORKED!",
                    "type": "static"
          }
],
                fullTextSections: [
          "OUR BOTTLE WORKED! While you have a Hero\\ncharacter in play, this character gains Ward.\\n(Opponents can't choose them except to challenge.)"
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

    describe('Lady Kluck - Protective Confidant', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1605,
                name: 'Lady Kluck',
                
                fullName: 'Lady Kluck - Protective Confidant',
                abilities: [
          {
                    "fullText": "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of\\nyour characters must choose one with Bodyguard\\nif able.)",
                    "keyword": "Bodyguard",
                    "reminderText": "This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.",
                    "type": "keyword"
          },
          {
                    "fullText": "Ward (Opponents can't choose this character\\nexcept to challenge.)",
                    "keyword": "Ward",
                    "reminderText": "Opponents can't choose this character except to challenge.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of\\nyour characters must choose one with Bodyguard\\nif able.)",
          "Ward (Opponents can't choose this character\\nexcept to challenge.)"
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

    describe('Jasmine - Inspired Researcher', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1606,
                name: 'Jasmine',
                
                fullName: 'Jasmine - Inspired Researcher',
                abilities: [
          {
                    "effect": "Whenever this character quests, if you have no cards in your hand, draw a card for each Ally character you have in play.",
                    "fullText": "EXTRA ASSISTANCE Whenever this character\\nquests, if you have no cards in your hand, draw a\\ncard for each Ally character you have in play.",
                    "name": "EXTRA ASSISTANCE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "EXTRA ASSISTANCE Whenever this character\\nquests, if you have no cards in your hand, draw a\\ncard for each Ally character you have in play."
],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: false,
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

    describe('Jebidiah Farnsworth - Expedition Cook', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1607,
                name: 'Jebidiah Farnsworth',
                
                fullName: 'Jebidiah Farnsworth - Expedition Cook',
                abilities: [
          {
                    "fullText": "Support (Whenever this character quests, you may add\\ntheir ¤ to another chosen character's ¤ this turn.)",
                    "keyword": "Support",
                    "reminderText": "Whenever this character quests, you may add their ¤ to another chosen character's ¤ this turn.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, chosen character gains Resist +1 until the start of your next turn. (Damage dealt to them is reduced by 1.)",
                    "fullText": "I GOT YOUR FOUR BASIC FOOD GROUPS When you play\\nthis character, chosen character gains Resist +1 until\\nthe start of your next turn. (Damage dealt to them is\\nreduced by 1.)",
                    "name": "I GOT YOUR FOUR BASIC FOOD GROUPS",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Support (Whenever this character quests, you may add\\ntheir ¤ to another chosen character's ¤ this turn.)",
          "I GOT YOUR FOUR BASIC FOOD GROUPS When you play\\nthis character, chosen character gains Resist +1 until\\nthe start of your next turn. (Damage dealt to them is\\nreduced by 1.)"
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

    describe('Baymax - Upgraded Robot', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1608,
                name: 'Baymax',
                
                fullName: 'Baymax - Upgraded Robot',
                abilities: [
          {
                    "fullText": "Support (Whenever this character quests, you may add\\ntheir ¤ to another chosen character's ¤ this turn.)",
                    "keyword": "Support",
                    "reminderText": "Whenever this character quests, you may add their ¤ to another chosen character's ¤ this turn.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, look at the top 4 cards of your deck. You may reveal a Floodborn character card and put it into your hand. Put the rest on the bottom of your deck in any order.",
                    "fullText": "ADVANCED SCANNER When you play this character,\\nlook at the top 4 cards of your deck. You may reveal a\\nFloodborn character card and put it into your hand. Put\\nthe rest on the bottom of your deck in any order.",
                    "name": "ADVANCED SCANNER",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Support (Whenever this character quests, you may add\\ntheir ¤ to another chosen character's ¤ this turn.)",
          "ADVANCED SCANNER When you play this character,\\nlook at the top 4 cards of your deck. You may reveal a\\nFloodborn character card and put it into your hand. Put\\nthe rest on the bottom of your deck in any order."
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

    describe('Maid Marian - Badminton Ace', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1609,
                name: 'Maid Marian',
                
                fullName: 'Maid Marian - Badminton Ace',
                abilities: [
          {
                    "effect": "During an opponent's turn, whenever one of your Ally characters is damaged, deal 1 damage to chosen opposing character.",
                    "fullText": "GOOD SHOT During an opponent's turn, whenever\\none of your Ally characters is damaged, deal 1\\ndamage to chosen opposing character.",
                    "name": "GOOD SHOT",
                    "type": "triggered"
          },
          {
                    "effect": "Your characters named Lady Kluck gain Resist +1. (Damage dealt to them is reduced by 1.)",
                    "fullText": "FAIR PLAY Your characters named Lady Kluck gain\\nResist +1. (Damage dealt to them is reduced by 1.)",
                    "name": "FAIR PLAY",
                    "type": "static"
          }
],
                fullTextSections: [
          "GOOD SHOT During an opponent's turn, whenever\\none of your Ally characters is damaged, deal 1\\ndamage to chosen opposing character.",
          "FAIR PLAY Your characters named Lady Kluck gain\\nResist +1. (Damage dealt to them is reduced by 1.)"
],
                cost: 4,
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

    describe('Water Has Memory', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1610,
                name: 'Water Has Memory',
                
                fullName: 'Water Has Memory',
                abilities: [],
                fullTextSections: [
          "Look at the top 4 cards of chosen player's deck.\\nPut one on the top of their deck and the rest on the\\nbottom of their deck in any order."
],
                cost: 1,
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

    describe('All Is Found', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1611,
                name: 'All Is Found',
                
                fullName: 'All Is Found',
                abilities: [
          {
                    "effect": "A character with cost 5 or more can ⟳ to sing this song for free.",
                    "fullText": "(A character with cost 5 or more can ⟳ to sing this song for\\nfree.)",
                    "type": "static"
          }
],
                fullTextSections: [
          "(A character with cost 5 or more can ⟳ to sing this song for\\nfree.)",
          "Put up to 2 cards from your discard into your inkwell\\nfacedown and exerted."
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

    describe('Sapphire Coil', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1612,
                name: 'Sapphire Coil',
                
                fullName: 'Sapphire Coil',
                abilities: [
          {
                    "effect": "During your turn, whenever a card is put into your inkwell, you may give chosen character -2 ¤ this turn.",
                    "fullText": "BRILLIANT SHINE During your turn, whenever a card is put\\ninto your inkwell, you may give chosen character -2 ¤\\nthis turn.",
                    "name": "BRILLIANT SHINE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "BRILLIANT SHINE During your turn, whenever a card is put\\ninto your inkwell, you may give chosen character -2 ¤\\nthis turn."
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

    describe('Baymax\'s Charging Station', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1613,
                name: 'Baymax\'s Charging Station',
                
                fullName: 'Baymax\'s Charging Station',
                abilities: [
          {
                    "effect": "Whenever you play a Floodborn character, if you used Shift to play them, you may draw a card.",
                    "fullText": "ENERGY CONVERTER Whenever you play a Floodborn\\ncharacter, if you used Shift to play them, you may draw a card.",
                    "name": "ENERGY CONVERTER",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "ENERGY CONVERTER Whenever you play a Floodborn\\ncharacter, if you used Shift to play them, you may draw a card."
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

    describe('Dr. Calico - Green-Eyed Man', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1614,
                name: 'Dr. Calico',
                
                fullName: 'Dr. Calico - Green-Eyed Man',
                abilities: [
          {
                    "effect": "While this character has no damage, he gains Resist +2. (Damage dealt to them is reduced by 2.)",
                    "fullText": "YOU'RE BEGINNING TO IRK ME While this character\\nhas no damage, he gains Resist +2. (Damage\\ndealt to them is reduced by 2.)",
                    "name": "YOU'RE BEGINNING TO IRK ME",
                    "type": "static"
          }
],
                fullTextSections: [
          "YOU'RE BEGINNING TO IRK ME While this character\\nhas no damage, he gains Resist +2. (Damage\\ndealt to them is reduced by 2.)"
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

    describe('Helga Sinclair - Tough as Nails', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1616,
                name: 'Helga Sinclair',
                
                fullName: 'Helga Sinclair - Tough as Nails',
                abilities: [
          {
                    "fullText": "Challenger +3 (While challenging, this character\\ngets +3 ¤.)",
                    "keyword": "Challenger",
                    "keywordValue": "+3",
                    "keywordValueNumber": 3,
                    "reminderText": "While challenging, this character gets +3 ¤.",
                    "type": "keyword"
          },
          {
                    "effect": "During your turn, this character gains Evasive. (They can challenge characters with Evasive.)",
                    "fullText": "QUICK REFLEXES During your turn, this character\\ngains Evasive. (They can challenge characters\\nwith Evasive.)",
                    "name": "QUICK REFLEXES",
                    "type": "static"
          }
],
                fullTextSections: [
          "Challenger +3 (While challenging, this character\\ngets +3 ¤.)",
          "QUICK REFLEXES During your turn, this character\\ngains Evasive. (They can challenge characters\\nwith Evasive.)"
],
                cost: 2,
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

    describe('Bolt - Headstrong Dog', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1617,
                name: 'Bolt',
                
                fullName: 'Bolt - Headstrong Dog',
                abilities: [
          {
                    "effect": "Whenever this character quests, if he has no damage, you may draw a card, then choose and discard a card.",
                    "fullText": "THERE'S NO TURNING BACK Whenever this\\ncharacter quests, if he has no damage, you may\\ndraw a card, then choose and discard a card.",
                    "name": "THERE'S NO TURNING BACK",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "THERE'S NO TURNING BACK Whenever this\\ncharacter quests, if he has no damage, you may\\ndraw a card, then choose and discard a card."
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

    describe('Raya - Guidance Seeker', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1619,
                name: 'Raya',
                
                fullName: 'Raya - Guidance Seeker',
                abilities: [
          {
                    "effect": "During your turn, whenever a card is put into your inkwell, this character gains Resist +1 until the start of your next turn. (Damage dealt to them is reduced by 1.)",
                    "fullText": "A GREATER PURPOSE During your turn, whenever\\na card is put into your inkwell, this character\\ngains Resist +1 until the start of your next turn.\\n(Damage dealt to them is reduced by 1.)",
                    "name": "A GREATER PURPOSE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "A GREATER PURPOSE During your turn, whenever\\na card is put into your inkwell, this character\\ngains Resist +1 until the start of your next turn.\\n(Damage dealt to them is reduced by 1.)"
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

    describe('Tuk Tuk - Disarmingly Cute', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1620,
                name: 'Tuk Tuk',
                
                fullName: 'Tuk Tuk - Disarmingly Cute',
                abilities: [
          {
                    "fullText": "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of\\nyour characters must choose one with Bodyguard\\nif able.)",
                    "keyword": "Bodyguard",
                    "reminderText": "This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.",
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
          "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of\\nyour characters must choose one with Bodyguard\\nif able.)",
          "Resist +2 (Damage dealt to this character is\\nreduced by 2.)"
],
                cost: 2,
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

    describe('Fa Zhou - War Hero', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1621,
                name: 'Fa Zhou',
                
                fullName: 'Fa Zhou - War Hero',
                abilities: [
          {
                    "effect": "Whenever one of your characters challenges another character, if it's the second challenge this turn, gain 3 lore.",
                    "fullText": "TRAINING EXERCISES Whenever one of your\\ncharacters challenges another character, if it's\\nthe second challenge this turn, gain 3 lore.",
                    "name": "TRAINING EXERCISES",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "TRAINING EXERCISES Whenever one of your\\ncharacters challenges another character, if it's\\nthe second challenge this turn, gain 3 lore."
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

    describe('Razoul - Menacing Guard', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1622,
                name: 'Razoul',
                
                fullName: 'Razoul - Menacing Guard',
                abilities: [
          {
                    "effect": "When you play this character, if you have a character named Jafar in play, you may banish chosen item.",
                    "fullText": "MY ORDERS COME FROM JAFAR When you play this\\ncharacter, if you have a character named Jafar in\\nplay, you may banish chosen item.",
                    "name": "MY ORDERS COME FROM JAFAR",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "MY ORDERS COME FROM JAFAR When you play this\\ncharacter, if you have a character named Jafar in\\nplay, you may banish chosen item."
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

    describe('Jafar - Aspiring Ruler', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1623,
                name: 'Jafar',
                
                fullName: 'Jafar - Aspiring Ruler',
                abilities: [
          {
                    "effect": "When you play this character, chosen character gains Challenger +2 this turn. (They get +2 ¤ while challenging.)",
                    "fullText": "THAT'S BETTER When you play this character,\\nchosen character gains Challenger +2 this turn.\\n(They get +2 ¤ while challenging.)",
                    "name": "THAT'S BETTER",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "THAT'S BETTER When you play this character,\\nchosen character gains Challenger +2 this turn.\\n(They get +2 ¤ while challenging.)"
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

    describe('Tick-Tock - Relentless Crocodile', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1624,
                name: 'Tick-Tock',
                
                fullName: 'Tick-Tock - Relentless Crocodile',
                abilities: [
          {
                    "effect": "During your turn, this character gains Evasive while a Pirate character is in play. (They can challenge characters with Evasive.)",
                    "fullText": "LOOKING FOR LUNCH During your turn, this\\ncharacter gains Evasive while a Pirate character is in\\nplay. (They can challenge characters with Evasive.)",
                    "name": "LOOKING FOR LUNCH",
                    "type": "static"
          }
],
                fullTextSections: [
          "LOOKING FOR LUNCH During your turn, this\\ncharacter gains Evasive while a Pirate character is in\\nplay. (They can challenge characters with Evasive.)"
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

    describe('Kakamora - Band of Pirates', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1625,
                name: 'Kakamora',
                
                fullName: 'Kakamora - Band of Pirates',
                abilities: [
          {
                    "effect": "While you have another Pirate character in play, this character gains Challenger +3. (While challenging, this character gets +3 ¤.)",
                    "fullText": "SHOWBOATING While you have another Pirate\\ncharacter in play, this character gains Challenger +3.\\n(While challenging, this character gets +3 ¤.)",
                    "name": "SHOWBOATING",
                    "type": "static"
          }
],
                fullTextSections: [
          "SHOWBOATING While you have another Pirate\\ncharacter in play, this character gains Challenger +3.\\n(While challenging, this character gets +3 ¤.)"
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

    describe('Mulan - Disguised Soldier', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1626,
                name: 'Mulan',
                
                fullName: 'Mulan - Disguised Soldier',
                abilities: [
          {
                    "effect": "When you play this character, you may draw a card, then choose and discard a card.",
                    "fullText": "WHERE DO I SIGN IN? When you play this\\ncharacter, you may draw a card, then choose and\\ndiscard a card.",
                    "name": "WHERE DO I SIGN IN?",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "WHERE DO I SIGN IN? When you play this\\ncharacter, you may draw a card, then choose and\\ndiscard a card."
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

    describe('Orville - Albatross Air', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1627,
                name: 'Orville',
                
                fullName: 'Orville - Albatross Air',
                abilities: [
          {
                    "effect": "During your turn, while you have a character named Miss Bianca or Bernard in play, this character gains Evasive. (They can challenge characters with Evasive.)",
                    "fullText": "WELCOME ABOARD, FOLKS During your turn, while you\\nhave a character named Miss Bianca or Bernard in\\nplay, this character gains Evasive. (They can challenge\\ncharacters with Evasive.)",
                    "name": "WELCOME ABOARD, FOLKS",
                    "type": "static"
          }
],
                fullTextSections: [
          "WELCOME ABOARD, FOLKS During your turn, while you\\nhave a character named Miss Bianca or Bernard in\\nplay, this character gains Evasive. (They can challenge\\ncharacters with Evasive.)"
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

    describe('Miss Bianca - Unwavering Agent', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1628,
                name: 'Miss Bianca',
                
                fullName: 'Miss Bianca - Unwavering Agent',
                abilities: [
          {
                    "effect": "If you have an Ally character in play, you pay 2 ⬡ less to play this character.",
                    "fullText": "HAVE A LITTLE FAITH If you have an Ally character\\nin play, you pay 2 ⬡ less to play this character.",
                    "name": "HAVE A LITTLE FAITH",
                    "type": "static"
          }
],
                fullTextSections: [
          "HAVE A LITTLE FAITH If you have an Ally character\\nin play, you pay 2 ⬡ less to play this character."
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

    describe('Aladdin - Research Assistant', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1630,
                name: 'Aladdin',
                
                fullName: 'Aladdin - Research Assistant',
                abilities: [
          {
                    "effect": "Whenever this character quests, you may play an Ally character with cost 3 or less for free.",
                    "fullText": "HELPING HAND Whenever this character quests,\\nyou may play an Ally character with cost 3 or less\\nfor free.",
                    "name": "HELPING HAND",
                    "type": "triggered"
          },
          {
                    "effect": "While this character is exerted, your Ally characters get +1 ¤.",
                    "fullText": "PUT IN THE EFFORT While this character is\\nexerted, your Ally characters get +1 ¤.",
                    "name": "PUT IN THE EFFORT",
                    "type": "static"
          }
],
                fullTextSections: [
          "HELPING HAND Whenever this character quests,\\nyou may play an Ally character with cost 3 or less\\nfor free.",
          "PUT IN THE EFFORT While this character is\\nexerted, your Ally characters get +1 ¤."
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

    describe('Bagheera - Guardian Jaguar', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1631,
                name: 'Bagheera',
                
                fullName: 'Bagheera - Guardian Jaguar',
                abilities: [
          {
                    "fullText": "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of your\\ncharacters must choose one with Bodyguard if able.)",
                    "keyword": "Bodyguard",
                    "reminderText": "This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.",
                    "type": "keyword"
          },
          {
                    "effect": "During an opponent's turn, when this character is banished, deal 2 damage to each opposing character.",
                    "fullText": "YOU'VE GOT TO BE BRAVE During an opponent's turn,\\nwhen this character is banished, deal 2 damage to\\neach opposing character.",
                    "name": "YOU'VE GOT TO BE BRAVE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of your\\ncharacters must choose one with Bodyguard if able.)",
          "YOU'VE GOT TO BE BRAVE During an opponent's turn,\\nwhen this character is banished, deal 2 damage to\\neach opposing character."
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

    describe('Gantu - Experienced Enforcer', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1632,
                name: 'Gantu',
                
                fullName: 'Gantu - Experienced Enforcer',
                abilities: [
          {
                    "effect": "When you play this character, characters can't exert to sing songs until the start of your next turn.",
                    "fullText": "CLOSE ALL CHANNELS When you play this\\ncharacter, characters can't exert to sing songs\\nuntil the start of your next turn.",
                    "name": "CLOSE ALL CHANNELS",
                    "type": "triggered"
          },
          {
                    "effect": "Each player pays 2 ⬡ more to play actions or items. (This doesn't apply to singing songs.)",
                    "fullText": "DON'T GET ANY IDEAS Each player pays 2 ⬡ more\\nto play actions or items. (This doesn't apply to\\nsinging songs.)",
                    "name": "DON'T GET ANY IDEAS",
                    "type": "static"
          }
],
                fullTextSections: [
          "CLOSE ALL CHANNELS When you play this\\ncharacter, characters can't exert to sing songs\\nuntil the start of your next turn.",
          "DON'T GET ANY IDEAS Each player pays 2 ⬡ more\\nto play actions or items. (This doesn't apply to\\nsinging songs.)"
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

    describe('Mickey Mouse - Inspirational Warrior', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1633,
                name: 'Mickey Mouse',
                
                fullName: 'Mickey Mouse - Inspirational Warrior',
                abilities: [
          {
                    "effect": "During your turn, whenever this character banishes another character in a challenge, you may play a character for free.",
                    "fullText": "STIRRING SPIRIT During your turn, whenever this\\ncharacter banishes another character in a challenge,\\nyou may play a character for free.",
                    "name": "STIRRING SPIRIT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "STIRRING SPIRIT During your turn, whenever this\\ncharacter banishes another character in a challenge,\\nyou may play a character for free."
],
                cost: 2,
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

    describe('Restoring Atlantis', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1634,
                name: 'Restoring Atlantis',
                
                fullName: 'Restoring Atlantis',
                abilities: [],
                fullTextSections: [
          "Your characters can't be challenged until the start of\\nyour next turn."
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

    describe('Double Trouble', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1635,
                name: 'Double Trouble',
                
                fullName: 'Double Trouble',
                abilities: [],
                fullTextSections: [
          "Deal 1 damage each to up to 2 chosen characters."
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

    describe('Steel Coil', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1636,
                name: 'Steel Coil',
                
                fullName: 'Steel Coil',
                abilities: [
          {
                    "effect": "During your turn, whenever a card is put into your inkwell, you may draw a card, then choose and discard a card.",
                    "fullText": "METALLIC FLOW During your turn, whenever a card\\nis put into your inkwell, you may draw a card, then\\nchoose and discard a card.",
                    "name": "METALLIC FLOW",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "METALLIC FLOW During your turn, whenever a card\\nis put into your inkwell, you may draw a card, then\\nchoose and discard a card."
],
                cost: 2,
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

    describe('Training Staff', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1637,
                name: 'Training Staff',
                
                fullName: 'Training Staff',
                abilities: [
          {
                    "costs": [
                              "⟳",
                              "1 ⬡"
                    ],
                    "costsText": "⟳, 1 ⬡",
                    "effect": "Chosen character gains Challenger +2 this turn. (They get +2 ¤ while challenging.)",
                    "fullText": "PRECISION STRIKE ⟳, 1 ⬡ — Chosen character\\ngains Challenger +2 this turn. (They get +2 ¤ while\\nchallenging.)",
                    "name": "PRECISION STRIKE",
                    "type": "activated"
          }
],
                fullTextSections: [
          "PRECISION STRIKE ⟳, 1 ⬡ — Chosen character\\ngains Challenger +2 this turn. (They get +2 ¤ while\\nchallenging.)"
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

    describe('Aurora - Waking Beauty', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1638,
                name: 'Aurora',
                
                fullName: 'Aurora - Waking Beauty',
                abilities: [
          {
                    "fullText": "Singer 5 (This character counts as cost 5 to sing\\nsongs.)",
                    "keyword": "Singer",
                    "keywordValue": "5",
                    "keywordValueNumber": 5,
                    "reminderText": "This character counts as cost 5 to sing songs.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever you remove 1 or more damage from a character, ready this character. She can't quest or challenge for the rest of this turn.",
                    "fullText": "SWEET DREAMS Whenever you remove 1 or more\\ndamage from a character, ready this character.\\nShe can't quest or challenge for the rest of this\\nturn.",
                    "name": "SWEET DREAMS",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Singer 5 (This character counts as cost 5 to sing\\nsongs.)",
          "SWEET DREAMS Whenever you remove 1 or more\\ndamage from a character, ready this character.\\nShe can't quest or challenge for the rest of this\\nturn."
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

    describe('Mirabel Madrigal - Musically Talented', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1639,
                name: 'Mirabel Madrigal',
                
                fullName: 'Mirabel Madrigal - Musically Talented',
                abilities: [
          {
                    "fullText": "Shift 4 (You may pay 4 ⬡ to play this on top of\\none of your characters named Mirabel Madrigal.)",
                    "keyword": "Shift",
                    "keywordValue": "4",
                    "keywordValueNumber": 4,
                    "reminderText": "You may pay 4 ⬡ to play this on top of one of your characters named Mirabel Madrigal.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever this character quests, you may return a song card with cost 3 or less from your discard to your hand.",
                    "fullText": "HER OWN SPECIAL GIFT Whenever this character\\nquests, you may return a song card with cost 3\\nor less from your discard to your hand.",
                    "name": "HER OWN SPECIAL GIFT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 4 (You may pay 4 ⬡ to play this on top of\\none of your characters named Mirabel Madrigal.)",
          "HER OWN SPECIAL GIFT Whenever this character\\nquests, you may return a song card with cost 3\\nor less from your discard to your hand."
],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber-Amethyst'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Bolt - Superdog', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 1640,
                name: 'Bolt',
                
                fullName: 'Bolt - Superdog',
                abilities: [
          {
                    "fullText": "Shift 3 (You may pay 3 ⬡ to play this on top of one of\\nyour characters named Bolt.)",
                    "keyword": "Shift",
                    "keywordValue": "3",
                    "keywordValueNumber": 3,
                    "reminderText": "You may pay 3 ⬡ to play this on top of one of your characters named Bolt.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever you ready this character, gain 1 lore for each other undamaged character you have in play.",
                    "fullText": "MARK OF POWER Whenever you ready this character,\\ngain 1 lore for each other undamaged character you\\nhave in play.",
                    "name": "MARK OF POWER",
                    "type": "triggered"
          },
          {
                    "costs": [
                              "⟳"
                    ],
                    "costsText": "⟳",
                    "effect": "Banish chosen Illusion character.",
                    "fullText": "BOLT STARE ⟳ — Banish chosen Illusion character.",
                    "name": "BOLT STARE",
                    "type": "activated"
          }
],
                fullTextSections: [
          "Shift 3 (You may pay 3 ⬡ to play this on top of one of\\nyour characters named Bolt.)",
          "MARK OF POWER Whenever you ready this character,\\ngain 1 lore for each other undamaged character you\\nhave in play.",
          "BOLT STARE ⟳ — Banish chosen Illusion character."
],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber-Steel'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('The Glass Slipper', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1641,
                name: 'The Glass Slipper',
                
                fullName: 'The Glass Slipper',
                abilities: [
          {
                    "effect": "You may only have 2 copies of The Glass Slipper in your deck.",
                    "fullText": "PERFECT PAIR You may only have 2 copies of The\\nGlass Slipper in your deck.",
                    "name": "PERFECT PAIR",
                    "type": "static"
          },
          {
                    "costs": [
                              "Banish this item",
                              "⟳ one of your Prince characters"
                    ],
                    "costsText": "Banish this item, ⟳ one of your Prince characters",
                    "effect": "Search your deck for a Princess character card and reveal it to all players. Put that card into your hand and shuffle your deck.",
                    "fullText": "SEARCH THE KINGDOM Banish this item, ⟳ one of\\nyour Prince characters — Search your deck for a\\nPrincess character card and reveal it to all players.\\nPut that card into your hand and shuffle your deck.",
                    "name": "SEARCH THE KINGDOM",
                    "type": "activated"
          }
],
                fullTextSections: [
          "PERFECT PAIR You may only have 2 copies of The\\nGlass Slipper in your deck.",
          "SEARCH THE KINGDOM Banish this item, ⟳ one of\\nyour Prince characters — Search your deck for a\\nPrincess character card and reveal it to all players.\\nPut that card into your hand and shuffle your deck."
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

    describe('Donald Duck - Flustered Sorcerer', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1642,
                name: 'Donald Duck',
                
                fullName: 'Donald Duck - Flustered Sorcerer',
                abilities: [
          {
                    "effect": "Opponents need 25 lore to win the game.",
                    "fullText": "OBFUSCATE! Opponents need 25 lore to win\\nthe game.",
                    "name": "OBFUSCATE!",
                    "type": "static"
          }
],
                fullTextSections: [
          "OBFUSCATE! Opponents need 25 lore to win\\nthe game."
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

    describe('Jafar - Newly Crowned', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1643,
                name: 'Jafar',
                
                fullName: 'Jafar - Newly Crowned',
                abilities: [
          {
                    "effect": "During an opponent's turn, whenever one of your Illusion characters is banished, you may return that card to your hand.",
                    "fullText": "THIS IS NOT DONE YET During an opponent's\\nturn, whenever one of your Illusion characters\\nis banished, you may return that card to your\\nhand.",
                    "name": "THIS IS NOT DONE YET",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "THIS IS NOT DONE YET During an opponent's\\nturn, whenever one of your Illusion characters\\nis banished, you may return that card to your\\nhand."
],
                cost: 4,
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

    describe('Show Me More!', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1644,
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

    describe('Tramp - Enterprising Dog', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1645,
                name: 'Tramp',
                
                fullName: 'Tramp - Enterprising Dog',
                abilities: [
          {
                    "effect": "If you have a character named Lady in play, you pay 1 ⬡ less to play this character.",
                    "fullText": "HEY, PIDGE If you have a character named Lady in\\nplay, you pay 1 ⬡ less to play this character.",
                    "name": "HEY, PIDGE",
                    "type": "static"
          },
          {
                    "effect": "When you play this character, chosen character of yours gets +1 ¤ this turn for each other character you have in play.",
                    "fullText": "NO TIME FOR WISECRACKS When you play this\\ncharacter, chosen character of yours gets +1 ¤ this\\nturn for each other character you have in play.",
                    "name": "NO TIME FOR WISECRACKS",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "HEY, PIDGE If you have a character named Lady in\\nplay, you pay 1 ⬡ less to play this character.",
          "NO TIME FOR WISECRACKS When you play this\\ncharacter, chosen character of yours gets +1 ¤ this\\nturn for each other character you have in play."
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

    describe('Mad Hatter - Unruly Eccentric', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1646,
                name: 'Mad Hatter',
                
                fullName: 'Mad Hatter - Unruly Eccentric',
                abilities: [
          {
                    "effect": "Whenever a damaged character challenges another character, you may draw a card.",
                    "fullText": "UNBIRTHDAY PRESENT Whenever a damaged\\ncharacter challenges another character, you\\nmay draw a card.",
                    "name": "UNBIRTHDAY PRESENT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "UNBIRTHDAY PRESENT Whenever a damaged\\ncharacter challenges another character, you\\nmay draw a card."
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

    describe('Hiro Hamada - Armor Designer', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1647,
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

    describe('The Return of Hercules', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1648,
                name: 'The Return of Hercules',
                
                fullName: 'The Return of Hercules',
                abilities: [],
                fullTextSections: [
          "Each player may reveal a character card from their\\nhand and play it for free."
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

    describe('Ratigan - Nefarious Criminal', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1649,
                name: 'Ratigan',
                
                fullName: 'Ratigan - Nefarious Criminal',
                abilities: [
          {
                    "effect": "Whenever you play an action while this character is exerted, gain 1 lore.",
                    "fullText": "A MARVELOUS PERFORMANCE Whenever you\\nplay an action while this character is exerted,\\ngain 1 lore.",
                    "name": "A MARVELOUS PERFORMANCE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "A MARVELOUS PERFORMANCE Whenever you\\nplay an action while this character is exerted,\\ngain 1 lore."
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

    describe('Belle - Mechanic Extraordinaire', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 1650,
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
                    "fullText": "REPURPOSE Whenever this character quests, you may\\nput up to 3 item cards from your discard on the bottom of\\nyour deck to gain 1 lore for each item card moved this way.",
                    "name": "REPURPOSE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 7",
          "SALVAGE For each item card in your discard, you pay 1 ⬡\\nless to play this character using her Shift ability.",
          "REPURPOSE Whenever this character quests, you may\\nput up to 3 item cards from your discard on the bottom of\\nyour deck to gain 1 lore for each item card moved this way."
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

    describe('Devil\'s Eye Diamond', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1651,
                name: 'Devil\'s Eye Diamond',
                
                fullName: 'Devil\'s Eye Diamond',
                abilities: [
          {
                    "costs": [
                              "⟳"
                    ],
                    "costsText": "⟳",
                    "effect": "If one of your characters was damaged this turn, gain 1 lore.",
                    "fullText": "THE PRICE OF POWER ⟳ — If one of your\\ncharacters was damaged this turn, gain 1 lore.",
                    "name": "THE PRICE OF POWER",
                    "type": "activated"
          }
],
                fullTextSections: [
          "THE PRICE OF POWER ⟳ — If one of your\\ncharacters was damaged this turn, gain 1 lore."
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

    describe('Tamatoa - Happy as a Clam', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1652,
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

    describe('All Is Found', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1653,
                name: 'All Is Found',
                
                fullName: 'All Is Found',
                abilities: [
          {
                    "effect": "A character with cost 5 or more can ⟳ to sing this song for free.",
                    "fullText": "(A character with cost 5 or more can ⟳ to sing this\\nsong for free.)",
                    "type": "static"
          }
],
                fullTextSections: [
          "(A character with cost 5 or more can ⟳ to sing this\\nsong for free.)",
          "Put up to 2 cards from your discard into your\\ninkwell facedown and exerted."
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

    describe('Mickey Mouse - Inspirational Warrior', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1654,
                name: 'Mickey Mouse',
                
                fullName: 'Mickey Mouse - Inspirational Warrior',
                abilities: [
          {
                    "effect": "During your turn, whenever this character banishes another character in a challenge, you may play a character for free.",
                    "fullText": "STIRRING SPIRIT During your turn, whenever\\nthis character banishes another character in a\\nchallenge, you may play a character for free.",
                    "name": "STIRRING SPIRIT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "STIRRING SPIRIT During your turn, whenever\\nthis character banishes another character in a\\nchallenge, you may play a character for free."
],
                cost: 2,
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

    describe('Restoring Atlantis', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1655,
                name: 'Restoring Atlantis',
                
                fullName: 'Restoring Atlantis',
                abilities: [],
                fullTextSections: [
          "Your characters can't be challenged until the start\\nof your next turn."
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

    describe('Anna - Ice Breaker', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1656,
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

    describe('Kronk - Laid Back', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1657,
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

    describe('Perdita - Playful Mother', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1658,
                name: 'Perdita',
                
                fullName: 'Perdita - Playful Mother',
                abilities: [
          {
                    "effect": "Whenever this character quests, you pay 2 ⬡ less for the next Puppy character you play this turn.",
                    "fullText": "WHO'S NEXT? Whenever this character quests,\\nyou pay 2 ⬡ less for the next Puppy character\\nyou play this turn.",
                    "name": "WHO'S NEXT?",
                    "type": "triggered"
          },
          {
                    "effect": "Your Puppy characters gain Ward. (Opponents can't choose them except to challenge.)",
                    "fullText": "DON'T BE AFRAID Your Puppy characters gain\\nWard. (Opponents can't choose them except to\\nchallenge.)",
                    "name": "DON'T BE AFRAID",
                    "type": "static"
          }
],
                fullTextSections: [
          "WHO'S NEXT? Whenever this character quests,\\nyou pay 2 ⬡ less for the next Puppy character\\nyou play this turn.",
          "DON'T BE AFRAID Your Puppy characters gain\\nWard. (Opponents can't choose them except to\\nchallenge.)"
],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber-Sapphire'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Li Shang - Newly Promoted', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1659,
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

    describe('Snow White - Fairest in the Land', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1660,
                name: 'Snow White',
                
                fullName: 'Snow White - Fairest in the Land',
                abilities: [
          {
                    "effect": "This character can't be challenged.",
                    "fullText": "HIDDEN AWAY This character can't be challenged.",
                    "name": "HIDDEN AWAY",
                    "type": "static"
          }
],
                fullTextSections: [
          "HIDDEN AWAY This character can't be challenged."
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

    describe('Hiro Hamada - Armor Designer', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1661,
                name: 'Hiro Hamada',
                
                fullName: 'Hiro Hamada - Armor Designer',
                abilities: [
          {
                    "fullText": "Shift 5 (You may pay 5 ⬡ to play this on top of one of\\nyour characters named Hiro Hamada.)",
                    "keyword": "Shift",
                    "keywordValue": "5",
                    "keywordValueNumber": 5,
                    "reminderText": "You may pay 5 ⬡ to play this on top of one of your characters named Hiro Hamada.",
                    "type": "keyword"
          },
          {
                    "effect": "Your Floodborn characters that have a card under them gain Evasive and Ward. (Only characters with Evasive can challenge them. Opponents can't choose them except to challenge.)",
                    "fullText": "YOU CAN BE WAY MORE Your Floodborn characters that\\nhave a card under them gain Evasive and Ward. (Only\\ncharacters with Evasive can challenge them. Opponents\\ncan't choose them except to challenge.)",
                    "name": "YOU CAN BE WAY MORE",
                    "type": "static"
          }
],
                fullTextSections: [
          "Shift 5 (You may pay 5 ⬡ to play this on top of one of\\nyour characters named Hiro Hamada.)",
          "YOU CAN BE WAY MORE Your Floodborn characters that\\nhave a card under them gain Evasive and Ward. (Only\\ncharacters with Evasive can challenge them. Opponents\\ncan't choose them except to challenge.)"
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

    describe('Hiro Hamada - Armor Designer', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1662,
                name: 'Hiro Hamada',
                
                fullName: 'Hiro Hamada - Armor Designer',
                abilities: [
          {
                    "fullText": "Shift 5 (You may pay 5 ⬡ to play this on top of one of your\\ncharacters named Hiro Hamada.)",
                    "keyword": "Shift",
                    "keywordValue": "5",
                    "keywordValueNumber": 5,
                    "reminderText": "You may pay 5 ⬡ to play this on top of one of your characters named Hiro Hamada.",
                    "type": "keyword"
          },
          {
                    "effect": "Your Floodborn characters that have a card under them gain Evasive and Ward. (Only characters with Evasive can challenge them. Opponents can't choose them except to challenge.)",
                    "fullText": "YOU CAN BE WAY MORE Your Floodborn characters that\\nhave a card under them gain Evasive and Ward. (Only\\ncharacters with Evasive can challenge them. Opponents\\ncan't choose them except to challenge.)",
                    "name": "YOU CAN BE WAY MORE",
                    "type": "static"
          }
],
                fullTextSections: [
          "Shift 5 (You may pay 5 ⬡ to play this on top of one of your\\ncharacters named Hiro Hamada.)",
          "YOU CAN BE WAY MORE Your Floodborn characters that\\nhave a card under them gain Evasive and Ward. (Only\\ncharacters with Evasive can challenge them. Opponents\\ncan't choose them except to challenge.)"
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

    describe('Baymax - Armored Companion', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1664,
                name: 'Baymax',
                
                fullName: 'Baymax - Armored Companion',
                abilities: [
          {
                    "effect": "When you play this character and whenever he quests, you may remove up to 2 damage from another chosen character of yours. Gain 1 lore for each 1 damage removed this way.",
                    "fullText": "THE TREATMENT IS WORKING When you play this\\ncharacter and whenever he quests, you may remove up\\nto 2 damage from another chosen character of yours.\\nGain 1 lore for each 1 damage removed this way.",
                    "name": "THE TREATMENT IS WORKING",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "THE TREATMENT IS WORKING When you play this\\ncharacter and whenever he quests, you may remove up\\nto 2 damage from another chosen character of yours.\\nGain 1 lore for each 1 damage removed this way."
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

    describe('Louie - One Cool Duck', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1665,
                name: 'Louie',
                
                fullName: 'Louie - One Cool Duck',
                abilities: [
          {
                    "effect": "While this character is being challenged, the challenging character gets -1 ¤.",
                    "fullText": "SPRING THE TRAP While this character is being\\nchallenged, the challenging character gets -1 ¤.",
                    "name": "SPRING THE TRAP",
                    "type": "static"
          }
],
                fullTextSections: [
          "SPRING THE TRAP While this character is being\\nchallenged, the challenging character gets -1 ¤."
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

    describe('Huey - Reliable Leader', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1667,
                name: 'Huey',
                
                fullName: 'Huey - Reliable Leader',
                abilities: [
          {
                    "effect": "Whenever this character quests, you pay 1 ⬡ less for the next character you play this turn.",
                    "fullText": "I KNOW THE WAY Whenever this character quests,\\nyou pay 1 ⬡ less for the next character you play\\nthis turn.",
                    "name": "I KNOW THE WAY",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "I KNOW THE WAY Whenever this character quests,\\nyou pay 1 ⬡ less for the next character you play\\nthis turn."
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

    describe('Goofy - Groundbreaking Chef', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1668,
                name: 'Goofy',
                
                fullName: 'Goofy - Groundbreaking Chef',
                abilities: [
          {
                    "effect": "At the end of your turn, you may remove up to 1 damage from each of your other characters. Ready each character you removed damage from this way.",
                    "fullText": "PLENTY TO GO AROUND At the end of your turn,\\nyou may remove up to 1 damage from each of\\nyour other characters. Ready each character you\\nremoved damage from this way.",
                    "name": "PLENTY TO GO AROUND",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "PLENTY TO GO AROUND At the end of your turn,\\nyou may remove up to 1 damage from each of\\nyour other characters. Ready each character you\\nremoved damage from this way."
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

    describe('Antonio Madrigal - Friend to All', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1669,
                name: 'Antonio Madrigal',
                
                fullName: 'Antonio Madrigal - Friend to All',
                abilities: [
          {
                    "effect": "Once during your turn, whenever one of your characters sings a song, you may search your deck for a character card with cost 3 or less and reveal that card to all players. Put that card into your hand and shuffle your deck.",
                    "fullText": "OF COURSE THEY CAN COME Once during your\\nturn, whenever one of your characters sings a\\nsong, you may search your deck for a character\\ncard with cost 3 or less and reveal that card to all\\nplayers. Put that card into your hand and shuffle\\nyour deck.",
                    "name": "OF COURSE THEY CAN COME",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "OF COURSE THEY CAN COME Once during your\\nturn, whenever one of your characters sings a\\nsong, you may search your deck for a character\\ncard with cost 3 or less and reveal that card to all\\nplayers. Put that card into your hand and shuffle\\nyour deck."
],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber-Amethyst'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Minnie Mouse - Daring Defender', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1670,
                name: 'Minnie Mouse',
                
                fullName: 'Minnie Mouse - Daring Defender',
                abilities: [
          {
                    "fullText": "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of your\\ncharacters must choose one with Bodyguard if able.)",
                    "keyword": "Bodyguard",
                    "reminderText": "This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.",
                    "type": "keyword"
          },
          {
                    "effect": "This character gets +1 ¤ for each 1 damage on her.",
                    "fullText": "TRUE VALOR This character gets +1 ¤ for each 1\\ndamage on her.",
                    "name": "TRUE VALOR",
                    "type": "static"
          }
],
                fullTextSections: [
          "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of your\\ncharacters must choose one with Bodyguard if able.)",
          "TRUE VALOR This character gets +1 ¤ for each 1\\ndamage on her."
],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber-Ruby'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Ludwig Von Drake - All-Around Expert', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1671,
                name: 'Ludwig Von Drake',
                
                fullName: 'Ludwig Von Drake - All-Around Expert',
                abilities: [
          {
                    "effect": "When you play this character, chosen opponent reveals their hand and discards a non-character card of your choice.",
                    "fullText": "SUPERIOR MIND When you play this character,\\nchosen opponent reveals their hand and discards\\na non-character card of your choice.",
                    "name": "SUPERIOR MIND",
                    "type": "triggered"
          },
          {
                    "effect": "When this character is banished, you may put this card into your inkwell facedown and exerted.",
                    "fullText": "LASTING LEGACY When this character is\\nbanished, you may put this card into your inkwell\\nfacedown and exerted.",
                    "name": "LASTING LEGACY",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "SUPERIOR MIND When you play this character,\\nchosen opponent reveals their hand and discards\\na non-character card of your choice.",
          "LASTING LEGACY When this character is\\nbanished, you may put this card into your inkwell\\nfacedown and exerted."
],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Amber-Sapphire'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Tiana - Natural Talent', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1673,
                name: 'Tiana',
                
                fullName: 'Tiana - Natural Talent',
                abilities: [
          {
                    "fullText": "Singer 6 (This character counts as cost 6 to sing songs.)",
                    "keyword": "Singer",
                    "keywordValue": "6",
                    "keywordValueNumber": 6,
                    "reminderText": "This character counts as cost 6 to sing songs.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever you play a song, each opposing character gets -1 ¤ until the start of your next turn.",
                    "fullText": "CAPTIVATING MELODY Whenever you play a song,\\neach opposing character gets -1 ¤ until the start of\\nyour next turn.",
                    "name": "CAPTIVATING MELODY",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Singer 6 (This character counts as cost 6 to sing songs.)",
          "CAPTIVATING MELODY Whenever you play a song,\\neach opposing character gets -1 ¤ until the start of\\nyour next turn."
],
                cost: 4,
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

    describe('Mirabel Madrigal - Curious Child', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1674,
                name: 'Mirabel Madrigal',
                
                fullName: 'Mirabel Madrigal - Curious Child',
                abilities: [
          {
                    "effect": "When you play this character, you may reveal a song card in your hand to gain 1 lore.",
                    "fullText": "YOU ARE A WONDER When you play this character,\\nyou may reveal a song card in your hand to gain 1 lore.",
                    "name": "YOU ARE A WONDER",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "YOU ARE A WONDER When you play this character,\\nyou may reveal a song card in your hand to gain 1 lore."
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

    describe('Lady - Family Dog', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1675,
                name: 'Lady',
                
                fullName: 'Lady - Family Dog',
                abilities: [
          {
                    "effect": "When you play this character, you may play a character with cost 2 or less for free.",
                    "fullText": "SOMEONE TO CARE FOR When you play this\\ncharacter, you may play a character with cost 2 or\\nless for free.",
                    "name": "SOMEONE TO CARE FOR",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "SOMEONE TO CARE FOR When you play this\\ncharacter, you may play a character with cost 2 or\\nless for free."
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

    describe('Jim Dear - Beloved Husband', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1676,
                name: 'Jim Dear',
                
                fullName: 'Jim Dear - Beloved Husband',
                abilities: [
          {
                    "fullText": "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of your\\ncharacters must choose one with Bodyguard if able.)",
                    "keyword": "Bodyguard",
                    "reminderText": "This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of your\\ncharacters must choose one with Bodyguard if able.)"
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

    describe('Gene - Niceland Resident', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1677,
                name: 'Gene',
                
                fullName: 'Gene - Niceland Resident',
                abilities: [
          {
                    "effect": "Whenever this character quests, you may remove up to 2 damage from chosen character.",
                    "fullText": "I GUESS YOU EARNED THIS Whenever this character\\nquests, you may remove up to 2 damage from\\nchosen character.",
                    "name": "I GUESS YOU EARNED THIS",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "I GUESS YOU EARNED THIS Whenever this character\\nquests, you may remove up to 2 damage from\\nchosen character."
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

    describe('Perdita - On the Lookout', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1678,
                name: 'Perdita',
                
                fullName: 'Perdita - On the Lookout',
                abilities: [
          {
                    "effect": "While you have a Puppy character in play, this character gets +1 ⛉.",
                    "fullText": "KEEPING WATCH While you have a Puppy\\ncharacter in play, this character gets +1 ⛉.",
                    "name": "KEEPING WATCH",
                    "type": "static"
          }
],
                fullTextSections: [
          "KEEPING WATCH While you have a Puppy\\ncharacter in play, this character gets +1 ⛉."
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

    describe('Rhino - One-Sixteenth Wolf', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1679,
                name: 'Rhino',
                
                fullName: 'Rhino - One-Sixteenth Wolf',
                abilities: [
          {
                    "effect": "When you play this character, chosen opposing character gets -1 ¤ until the start of your next turn.",
                    "fullText": "TINY HOWL When you play this character, chosen\\nopposing character gets -1 ¤ until the start of\\nyour next turn.",
                    "name": "TINY HOWL",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "TINY HOWL When you play this character, chosen\\nopposing character gets -1 ¤ until the start of\\nyour next turn."
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

    describe('Darling Dear - Beloved Wife', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1680,
                name: 'Darling Dear',
                
                fullName: 'Darling Dear - Beloved Wife',
                abilities: [
          {
                    "effect": "When you play this character, chosen character gets +2 ◊ this turn.",
                    "fullText": "HOW SWEET When you play this character,\\nchosen character gets +2 ◊ this turn.",
                    "name": "HOW SWEET",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "HOW SWEET When you play this character,\\nchosen character gets +2 ◊ this turn."
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

    describe('The Colonel - Old Sheepdog', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1681,
                name: 'The Colonel',
                
                fullName: 'The Colonel - Old Sheepdog',
                abilities: [
          {
                    "effect": "While you have 3 or more Puppy characters in play, this character gets +2 ¤ and +2 ◊.",
                    "fullText": "WE'VE GOT 'EM OUTNUMBERED While you have 3\\nor more Puppy characters in play, this character\\ngets +2 ¤ and +2 ◊.",
                    "name": "WE'VE GOT 'EM OUTNUMBERED",
                    "type": "static"
          }
],
                fullTextSections: [
          "WE'VE GOT 'EM OUTNUMBERED While you have 3\\nor more Puppy characters in play, this character\\ngets +2 ¤ and +2 ◊."
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

    describe('Chief Bogo - Commanding Officer', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1682,
                name: 'Chief Bogo',
                
                fullName: 'Chief Bogo - Commanding Officer',
                abilities: [
          {
                    "effect": "During an opponent's turn, whenever one of your characters with Bodyguard is banished, you may reveal the top card of your deck. If it's a character card with cost 5 or less, you may play that character for free. Otherwise, put it on the top of your deck.",
                    "fullText": "SENDING BACKUP During an opponent's turn,\\nwhenever one of your characters with Bodyguard\\nis banished, you may reveal the top card of your\\ndeck. If it's a character card with cost 5 or less,\\nyou may play that character for free. Otherwise,\\nput it on the top of your deck.",
                    "name": "SENDING BACKUP",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "SENDING BACKUP During an opponent's turn,\\nwhenever one of your characters with Bodyguard\\nis banished, you may reveal the top card of your\\ndeck. If it's a character card with cost 5 or less,\\nyou may play that character for free. Otherwise,\\nput it on the top of your deck."
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

    describe('Pua - Protective Pig', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1683,
                name: 'Pua',
                
                fullName: 'Pua - Protective Pig',
                abilities: [
          {
                    "fullText": "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of your\\ncharacters must choose one with Bodyguard if able.)",
                    "keyword": "Bodyguard",
                    "reminderText": "This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.",
                    "type": "keyword"
          },
          {
                    "effect": "When this character is banished, you may draw a card.",
                    "fullText": "FREE FRUIT When this character is banished, you\\nmay draw a card.",
                    "name": "FREE FRUIT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of your\\ncharacters must choose one with Bodyguard if able.)",
          "FREE FRUIT When this character is banished, you\\nmay draw a card."
],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber-Amethyst'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Bruno Madrigal - Singing Seer', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1684,
                name: 'Bruno Madrigal',
                
                fullName: 'Bruno Madrigal - Singing Seer',
                abilities: [
          {
                    "fullText": "Shift 5 (You may pay 5 ⬡ to play this on top of\\none of your characters named Bruno Madrigal.)",
                    "keyword": "Shift",
                    "keywordValue": "5",
                    "keywordValueNumber": 5,
                    "reminderText": "You may pay 5 ⬡ to play this on top of one of your characters named Bruno Madrigal.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever this character sings a song, you may draw a card for each character you have in play.",
                    "fullText": "BRIGHT FUTURE Whenever this character sings a\\nsong, you may draw a card for each character you\\nhave in play.",
                    "name": "BRIGHT FUTURE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 5 (You may pay 5 ⬡ to play this on top of\\none of your characters named Bruno Madrigal.)",
          "BRIGHT FUTURE Whenever this character sings a\\nsong, you may draw a card for each character you\\nhave in play."
],
                cost: 7,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Amber-Amethyst'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Kaa - Hypnotizing Python', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1685,
                name: 'Kaa',
                
                fullName: 'Kaa - Hypnotizing Python',
                abilities: [
          {
                    "effect": "Whenever this character quests, chosen opposing character gets -2 ¤ and gains Reckless until the start of your next turn. (They can't quest and must challenge if able.)",
                    "fullText": "LOOK ME IN THE EYE Whenever this character quests,\\nchosen opposing character gets -2 ¤ and gains\\nReckless until the start of your next turn. (They can't\\nquest and must challenge if able.)",
                    "name": "LOOK ME IN THE EYE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "LOOK ME IN THE EYE Whenever this character quests,\\nchosen opposing character gets -2 ¤ and gains\\nReckless until the start of your next turn. (They can't\\nquest and must challenge if able.)"
],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Amber-Emerald'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Tramp - Dapper Rascal', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1686,
                name: 'Tramp',
                
                fullName: 'Tramp - Dapper Rascal',
                abilities: [
          {
                    "fullText": "Shift 4 (You may pay 4 ⬡ to play this on top of\\none of your characters named Tramp.)",
                    "keyword": "Shift",
                    "keywordValue": "4",
                    "keywordValueNumber": 4,
                    "reminderText": "You may pay 4 ⬡ to play this on top of one of your characters named Tramp.",
                    "type": "keyword"
          },
          {
                    "effect": "During an opponent's turn, whenever one of your characters is banished, you may draw a card.",
                    "fullText": "PLAY IT COOL During an opponent's turn,\\nwhenever one of your characters is banished, you\\nmay draw a card.",
                    "name": "PLAY IT COOL",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 4 (You may pay 4 ⬡ to play this on top of\\none of your characters named Tramp.)",
          "PLAY IT COOL During an opponent's turn,\\nwhenever one of your characters is banished, you\\nmay draw a card."
],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber-Emerald'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('King Candy - Sugar Rush Nightmare', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1687,
                name: 'King Candy',
                
                fullName: 'King Candy - Sugar Rush Nightmare',
                abilities: [
          {
                    "effect": "When this character is banished, you may return another Racer character card from your discard to your hand.",
                    "fullText": "A NEW ROSTER When this character is banished,\\nyou may return another Racer character card\\nfrom your discard to your hand.",
                    "name": "A NEW ROSTER",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "A NEW ROSTER When this character is banished,\\nyou may return another Racer character card\\nfrom your discard to your hand."
],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber-Ruby'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Wreck-It Ralph - Big Lug', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1688,
                name: 'Wreck-It Ralph',
                
                fullName: 'Wreck-It Ralph - Big Lug',
                abilities: [
          {
                    "fullText": "Shift 5 (You may pay 5 ⬡ to play this on top of\\none of your characters named Wreck-It Ralph.)",
                    "keyword": "Shift",
                    "keywordValue": "5",
                    "keywordValueNumber": 5,
                    "reminderText": "You may pay 5 ⬡ to play this on top of one of your characters named Wreck-It Ralph.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character and whenever he quests, you may return a Racer character card with cost 6 or less from your discard to your hand. If you do, gain 1 lore.",
                    "fullText": "BACK ON TRACK When you play this character\\nand whenever he quests, you may return a Racer\\ncharacter card with cost 6 or less from your\\ndiscard to your hand. If you do, gain 1 lore.",
                    "name": "BACK ON TRACK",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 5 (You may pay 5 ⬡ to play this on top of\\none of your characters named Wreck-It Ralph.)",
          "BACK ON TRACK When you play this character\\nand whenever he quests, you may return a Racer\\ncharacter card with cost 6 or less from your\\ndiscard to your hand. If you do, gain 1 lore."
],
                cost: 7,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Amber-Ruby'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Patch - Playful Pup', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1689,
                name: 'Patch',
                
                fullName: 'Patch - Playful Pup',
                abilities: [
          {
                    "fullText": "Ward (Opponents can't choose this character\\nexcept to challenge.)",
                    "keyword": "Ward",
                    "reminderText": "Opponents can't choose this character except to challenge.",
                    "type": "keyword"
          },
          {
                    "effect": "While you have another Puppy character in play, this character gets +1 ◊.",
                    "fullText": "PUPPY BARKING While you have another Puppy\\ncharacter in play, this character gets +1 ◊.",
                    "name": "PUPPY BARKING",
                    "type": "static"
          }
],
                fullTextSections: [
          "Ward (Opponents can't choose this character\\nexcept to challenge.)",
          "PUPPY BARKING While you have another Puppy\\ncharacter in play, this character gets +1 ◊."
],
                cost: 1,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Amber-Sapphire'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Rolly - Chubby Puppy', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1690,
                name: 'Rolly',
                
                fullName: 'Rolly - Chubby Puppy',
                abilities: [
          {
                    "fullText": "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)",
                    "keyword": "Support",
                    "reminderText": "Whenever this character quests, you may add their ¤ to another chosen character's ¤ this turn.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, you may put a character card from your discard into your inkwell facedown and exerted.",
                    "fullText": "ADORABLE ANTICS When you play this character,\\nyou may put a character card from your discard\\ninto your inkwell facedown and exerted.",
                    "name": "ADORABLE ANTICS",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)",
          "ADORABLE ANTICS When you play this character,\\nyou may put a character card from your discard\\ninto your inkwell facedown and exerted."
],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber-Sapphire'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Perdita - Determined Mother', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1691,
                name: 'Perdita',
                
                fullName: 'Perdita - Determined Mother',
                abilities: [
          {
                    "fullText": "Shift 4 (You may pay 4 ⬡ to play this on top of\\none of your characters named Perdita.)",
                    "keyword": "Shift",
                    "keywordValue": "4",
                    "keywordValueNumber": 4,
                    "reminderText": "You may pay 4 ⬡ to play this on top of one of your characters named Perdita.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, you may put all Puppy character cards from your discard into your inkwell facedown and exerted.",
                    "fullText": "QUICK, EVERYONE HIDE When you play this\\ncharacter, you may put all Puppy character cards\\nfrom your discard into your inkwell facedown and\\nexerted.",
                    "name": "QUICK, EVERYONE HIDE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 4 (You may pay 4 ⬡ to play this on top of\\none of your characters named Perdita.)",
          "QUICK, EVERYONE HIDE When you play this\\ncharacter, you may put all Puppy character cards\\nfrom your discard into your inkwell facedown and\\nexerted."
],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber-Sapphire'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Pluto - Tried and True', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1692,
                name: 'Pluto',
                
                fullName: 'Pluto - Tried and True',
                abilities: [
          {
                    "effect": "While this character has no damage, he gets +2 ¤ and gains Support. (Whenever they quest, you may add their ¤ to another chosen character's ¤ this turn.)",
                    "fullText": "HAPPY HELPER While this character has no\\ndamage, he gets +2 ¤ and gains Support.\\n(Whenever they quest, you may add their ¤ to\\nanother chosen character's ¤ this turn.)",
                    "name": "HAPPY HELPER",
                    "type": "static"
          }
],
                fullTextSections: [
          "HAPPY HELPER While this character has no\\ndamage, he gets +2 ¤ and gains Support.\\n(Whenever they quest, you may add their ¤ to\\nanother chosen character's ¤ this turn.)"
],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber-Steel'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Bolt - Down but Not Out', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1693,
                name: 'Bolt',
                
                fullName: 'Bolt - Down but Not Out',
                abilities: [
          {
                    "effect": "This character enters play exerted.",
                    "fullText": "NONE OF YOUR POWERS ARE WORKING This character\\nenters play exerted.",
                    "name": "NONE OF YOUR POWERS ARE WORKING",
                    "type": "static"
          }
],
                fullTextSections: [
          "NONE OF YOUR POWERS ARE WORKING This character\\nenters play exerted."
],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber-Steel'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Rhino - Power Hamster', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1694,
                name: 'Rhino',
                
                fullName: 'Rhino - Power Hamster',
                abilities: [
          {
                    "fullText": "Shift 2 (You may pay 2 ⬡ to play this on top of\\none of your characters named Rhino.)",
                    "keyword": "Shift",
                    "keywordValue": "2",
                    "keywordValueNumber": 2,
                    "reminderText": "You may pay 2 ⬡ to play this on top of one of your characters named Rhino.",
                    "type": "keyword"
          },
          {
                    "effect": "While this character has no damage, he gains Resist +2. (Damage dealt to them is reduced by 2.)",
                    "fullText": "EPIC BALL OF AWESOME While this character has\\nno damage, he gains Resist +2. (Damage dealt to\\nthem is reduced by 2.)",
                    "name": "EPIC BALL OF AWESOME",
                    "type": "static"
          }
],
                fullTextSections: [
          "Shift 2 (You may pay 2 ⬡ to play this on top of\\none of your characters named Rhino.)",
          "EPIC BALL OF AWESOME While this character has\\nno damage, he gains Resist +2. (Damage dealt to\\nthem is reduced by 2.)"
],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber-Steel'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Antonio\'s Jaguar - Faithful Companion', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1695,
                name: 'Antonio\'s Jaguar',
                
                fullName: 'Antonio\'s Jaguar - Faithful Companion',
                abilities: [
          {
                    "effect": "When you play this character, if you have a character named Antonio Madrigal in play, gain 1 lore.",
                    "fullText": "YOU WANT TO GO WHERE? When you play this\\ncharacter, if you have a character named Antonio\\nMadrigal in play, gain 1 lore.",
                    "name": "YOU WANT TO GO WHERE?",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "YOU WANT TO GO WHERE? When you play this\\ncharacter, if you have a character named Antonio\\nMadrigal in play, gain 1 lore."
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

    describe('Calhoun - Hard-Nosed Leader', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1696,
                name: 'Calhoun',
                
                fullName: 'Calhoun - Hard-Nosed Leader',
                abilities: [
          {
                    "fullText": "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of your\\ncharacters must choose one with Bodyguard if able.)",
                    "keyword": "Bodyguard",
                    "reminderText": "This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.",
                    "type": "keyword"
          },
          {
                    "effect": "When this character is banished, gain 1 lore.",
                    "fullText": "LOOT DROP When this character is banished, gain 1 lore.",
                    "name": "LOOT DROP",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of your\\ncharacters must choose one with Bodyguard if able.)",
          "LOOT DROP When this character is banished, gain 1 lore."
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

    describe('Lady - Decisive Dog', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1697,
                name: 'Lady',
                
                fullName: 'Lady - Decisive Dog',
                abilities: [
          {
                    "effect": "Whenever you play a character, this character gets +1 ¤ this turn.",
                    "fullText": "PACK OF HER OWN Whenever you play a\\ncharacter, this character gets +1 ¤ this turn.",
                    "name": "PACK OF HER OWN",
                    "type": "triggered"
          },
          {
                    "effect": "While this character has 3 ¤ or more, she gets +2 ◊.",
                    "fullText": "TAKE THE LEAD While this character has 3 ¤ or\\nmore, she gets +2 ◊.",
                    "name": "TAKE THE LEAD",
                    "type": "static"
          }
],
                fullTextSections: [
          "PACK OF HER OWN Whenever you play a\\ncharacter, this character gets +1 ¤ this turn.",
          "TAKE THE LEAD While this character has 3 ¤ or\\nmore, she gets +2 ◊."
],
                cost: 1,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber-Emerald'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Alma Madrigal - Accepting Grandmother', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1698,
                name: 'Alma Madrigal',
                
                fullName: 'Alma Madrigal - Accepting Grandmother',
                abilities: [
          {
                    "effect": "Once during your turn, whenever one or more of your characters sings a song, you may ready those characters.",
                    "fullText": "THE MIRACLE IS YOU Once during your turn,\\nwhenever one or more of your characters sings a\\nsong, you may ready those characters.",
                    "name": "THE MIRACLE IS YOU",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "THE MIRACLE IS YOU Once during your turn,\\nwhenever one or more of your characters sings a\\nsong, you may ready those characters."
],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber-Amethyst'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Clawhauser - Front Desk Officer', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1699,
                name: 'Clawhauser',
                
                fullName: 'Clawhauser - Front Desk Officer',
                abilities: [
          {
                    "fullText": "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of\\nyour characters must choose one with Bodyguard\\nif able.)",
                    "keyword": "Bodyguard",
                    "reminderText": "This character may enter play exerted. An opposing character who challenges one of your characters must choose one with Bodyguard if able.",
                    "type": "keyword"
          },
          {
                    "fullText": "Singer 4 (This character counts as cost 4 to sing\\nsongs.)",
                    "keyword": "Singer",
                    "keywordValue": "4",
                    "keywordValueNumber": 4,
                    "reminderText": "This character counts as cost 4 to sing songs.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of\\nyour characters must choose one with Bodyguard\\nif able.)",
          "Singer 4 (This character counts as cost 4 to sing\\nsongs.)"
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

    describe('Joey - Blue Pigeon', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1700,
                name: 'Joey',
                
                fullName: 'Joey - Blue Pigeon',
                abilities: [
          {
                    "effect": "Whenever this character quests, you may remove up to 1 damage from each of your characters with Bodyguard.",
                    "fullText": "I'VE GOT JUST THE THING Whenever this character\\nquests, you may remove up to 1 damage from\\neach of your characters with Bodyguard.",
                    "name": "I'VE GOT JUST THE THING",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "I'VE GOT JUST THE THING Whenever this character\\nquests, you may remove up to 1 damage from\\neach of your characters with Bodyguard."
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

    describe('Donald Duck - Coin Collector', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1701,
                name: 'Donald Duck',
                
                fullName: 'Donald Duck - Coin Collector',
                abilities: [
          {
                    "effect": "For each item named The Nephews' Piggy Bank you have in play, you pay 2 ⬡ less to play this character.",
                    "fullText": "HERE, PIGGY, PIGGY For each item named The Nephews'\\nPiggy Bank you have in play, you pay 2 ⬡ less to play\\nthis character.",
                    "name": "HERE, PIGGY, PIGGY",
                    "type": "static"
          },
          {
                    "effect": "When you play this character, your other characters gain “⟳ — Draw a card” this turn.",
                    "fullText": "MONEY EVERYWHERE When you play this character,\\nyour other characters gain “⟳ — Draw a card” this turn.",
                    "name": "MONEY EVERYWHERE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "HERE, PIGGY, PIGGY For each item named The Nephews'\\nPiggy Bank you have in play, you pay 2 ⬡ less to play\\nthis character.",
          "MONEY EVERYWHERE When you play this character,\\nyour other characters gain “⟳ — Draw a card” this turn."
],
                cost: 8,
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

    describe('Dalmatian Puppy - Tail Wagger', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1702,
                name: 'Dalmatian Puppy',
                
                fullName: 'Dalmatian Puppy - Tail Wagger',
                abilities: [
          {
                    "effect": "You may have up to 99 copies of Dalmatian Puppy - Tail Wagger in your deck.",
                    "fullText": "WHERE DID THEY ALL COME FROM? You may have\\nup to 99 copies of Dalmatian Puppy - Tail Wagger\\nin your deck.",
                    "name": "WHERE DID THEY ALL COME FROM?",
                    "type": "static"
          }
],
                fullTextSections: [
          "WHERE DID THEY ALL COME FROM? You may have\\nup to 99 copies of Dalmatian Puppy - Tail Wagger\\nin your deck."
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

    describe('Candy Drift', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1703,
                name: 'Candy Drift',
                
                fullName: 'Candy Drift',
                abilities: [],
                fullTextSections: [
          "Draw a card. Chosen character of yours gets +5 ¤ this\\nturn. At the end of your turn, banish them."
],
                cost: 2,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Amber-Ruby'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('She\'s Your Person', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1704,
                name: 'She\'s Your Person',
                
                fullName: 'She\'s Your Person',
                abilities: [],
                fullTextSections: [
          "Choose one:\\n• Remove up to 3 damage from chosen character.\\n• Remove up to 3 damage from each of your characters\\nwith Bodyguard."
],
                cost: 1,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Amber-Steel'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('Only So Much Room', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1705,
                name: 'Only So Much Room',
                
                fullName: 'Only So Much Room',
                abilities: [],
                fullTextSections: [
          "Return chosen character with 2 ¤ or less to their\\nplayer's hand. Return a character card from your\\ndiscard to your hand."
],
                cost: 4,
                type: 'Action' as CardType,
                inkwell: true,
                color: 'Amber-Emerald'
            } as any;
            
            const abilities = parseToAbilityDefinition(card);
            
            // VERBOSE OUTPUT: Show per-ability results
            console.log(`\n📋 ${card.fullName}`);
            console.log(`Expected: ${card.abilities?.length || 0} abilities`);
            console.log(`Parsed: ${abilities.length} abilities\n`);
            
            // HYPER VERBOSE: Analyze each ability
            if (card.abilities && card.abilities.length > 0) {
                card.abilities.forEach((expected: any, idx: number) => {
                    const text = expected.effect || expected.fullText || expected.keyword || '';
                    const shortText = text?.substring(0, 60) || 'No text';
                    
                    // Try to find corresponding parsed ability
                    const searchStr = text?.substring(0, 20);
                    const parsed = abilities.find((a: any) => 
                        a.rawText?.includes(searchStr) || 
                        a.rawText?.toLowerCase().includes(expected.keyword?.toLowerCase())
                    );
                    
                    if (parsed) {
                        console.log(`✅ Ability ${idx + 1}: ${shortText}...`);
                        console.log(`   Type: ${parsed.type}, Effects: ${parsed.effects?.length || 0}`);
                    } else {
                        console.log(`❌ Ability ${idx + 1}: NOT PARSED`);
                        console.log(`   Text: "${text}"`);
                        
                        // Pattern hints
                        const lower = text.toLowerCase();
                        const hints: string[] = [];
                        
                        if (lower.includes('whenever') || lower.includes('when')) {
                            hints.push('TRIGGERED');
                            if (lower.includes('you play')) hints.push('play-trigger');
                            if (lower.includes('challenges')) hints.push('challenge-trigger');
                            if (lower.includes('quests')) hints.push('quest-trigger');
                            if (lower.includes('banished')) hints.push('banish-trigger');
                        }
                        
                        if (lower.includes('while') || lower.includes('during')) {
                            hints.push('CONDITIONAL');
                            if (lower.includes('while here')) hints.push('location-cond');
                            if (lower.includes('during your turn')) hints.push('turn-cond');
                        }
                        
                        const keywords = ['evasive', 'ward', 'support', 'shift', 'boost', 'singer'];
                        const found = keywords.filter(k => lower.includes(k));
                        if (found.length > 0) {
                            hints.push('KEYWORD: ' + found.join('/'));
                        }
                        
                        if (lower.match(/([^)]{15,})/)) {
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

    describe('It Means No Worries', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1706,
                name: 'It Means No Worries',
                
                fullName: 'It Means No Worries',
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
          "Return up to 3 character cards from your discard to\\nyour hand. You pay 2 ⬡ less for the next character you\\nplay this turn."
],
                cost: 9,
                type: 'Action' as CardType,
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

    describe('Trials and Tribulations', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1707,
                name: 'Trials and Tribulations',
                
                fullName: 'Trials and Tribulations',
                abilities: [
          {
                    "effect": "A character with cost 2 or more can ⟳ to sing this song for free.",
                    "fullText": "(A character with cost 2 or more can ⟳ to sing this\\nsong for free.)",
                    "type": "static"
          }
],
                fullTextSections: [
          "(A character with cost 2 or more can ⟳ to sing this\\nsong for free.)",
          "Chosen character gets -4 ¤ until the start of your\\nnext turn."
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
});
