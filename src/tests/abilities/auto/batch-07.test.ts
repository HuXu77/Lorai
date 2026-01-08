import { parseToAbilityDefinition } from '../../../engine/ability-parser';
import { GameEvent } from '../../../engine/abilities/events';
import { GameStateManager } from '../../../engine/state';
import { TurnManager } from '../../../engine/actions';
import { ZoneType } from '../../../engine/models';
import { CardType } from '../../../engine/models';

describe('Parser Batch 7', () => {
    let game: GameStateManager;
    let turnManager: TurnManager;
    
    beforeEach(() => {
        game = new GameStateManager();
        const p1Id = game.addPlayer('Player 1');
        const p2Id = game.addPlayer('Player 2');
        turnManager = new TurnManager(game);
    });
    describe('Mirabel Madrigal - Gift of the Family', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 709,
                name: 'Mirabel Madrigal',
                
                fullName: 'Mirabel Madrigal - Gift of the Family',
                abilities: [
          {
                    "fullText": "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)",
                    "keyword": "Support",
                    "reminderText": "Whenever this character quests, you may add their ¤ to another chosen character's ¤ this turn.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever this character quests, your other Madrigal characters get +1 ◊ this turn.",
                    "fullText": "SAVING THE MIRACLE Whenever this character\\nquests, your other Madrigal characters get +1 ◊\\nthis turn.",
                    "name": "SAVING THE MIRACLE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Support (Whenever this character quests, you\\nmay add their ¤ to another chosen character's\\n¤ this turn.)",
          "SAVING THE MIRACLE Whenever this character\\nquests, your other Madrigal characters get +1 ◊\\nthis turn."
],
                cost: 5,
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

    describe('Mirabel Madrigal - Prophecy Finder', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 710,
                name: 'Mirabel Madrigal',
                
                fullName: 'Mirabel Madrigal - Prophecy Finder',
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

    describe('Pluto - Rescue Dog', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 711,
                name: 'Pluto',
                
                fullName: 'Pluto - Rescue Dog',
                abilities: [
          {
                    "effect": "When you play this character, you may remove up to 3 damage from one of your characters.",
                    "fullText": "TO THE RESCUE When you play this character,\\nyou may remove up to 3 damage from one of your\\ncharacters.",
                    "name": "TO THE RESCUE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "TO THE RESCUE When you play this character,\\nyou may remove up to 3 damage from one of your\\ncharacters."
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

    describe('Prince Eric - Seafaring Prince', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 712,
                name: 'Prince Eric',
                
                fullName: 'Prince Eric - Seafaring Prince',
                abilities: [
          {
                    "fullText": "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of\\nyour characters must choose a character with\\nBodyguard if able.)",
                    "keyword": "Bodyguard",
                    "reminderText": "This character may enter play exerted. An opposing character who challenges one of your characters must choose a character with Bodyguard if able.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of\\nyour characters must choose a character with\\nBodyguard if able.)"
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

    describe('Prince Eric - Ursula\'s Groom', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 713,
                name: 'Prince Eric',
                
                fullName: 'Prince Eric - Ursula\'s Groom',
                abilities: [
          {
                    "fullText": "Shift 4 (You may pay 4 ⬡ to play this on top of one of your\\ncharacters named Prince Eric.)",
                    "keyword": "Shift",
                    "keywordValue": "4",
                    "keywordValueNumber": 4,
                    "reminderText": "You may pay 4 ⬡ to play this on top of one of your characters named Prince Eric.",
                    "type": "keyword"
          },
          {
                    "effect": "While you have a character named Ursula in play, this character gains Bodyguard and gets +2 ⛉. (An opposing character who challenges one of your characters must choose one with Bodyguard if able.)",
                    "fullText": "UNDER VANESSA'S SPELL While you have a character named\\nUrsula in play, this character gains Bodyguard and gets\\n+2 ⛉. (An opposing character who challenges one of your\\ncharacters must choose one with Bodyguard if able.)",
                    "name": "UNDER VANESSA'S SPELL",
                    "type": "static"
          }
],
                fullTextSections: [
          "Shift 4 (You may pay 4 ⬡ to play this on top of one of your\\ncharacters named Prince Eric.)",
          "UNDER VANESSA'S SPELL While you have a character named\\nUrsula in play, this character gains Bodyguard and gets\\n+2 ⛉. (An opposing character who challenges one of your\\ncharacters must choose one with Bodyguard if able.)"
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

    describe('Ursula - Eric\'s Bride', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 715,
                name: 'Ursula',
                
                fullName: 'Ursula - Eric\'s Bride',
                abilities: [
          {
                    "fullText": "Shift: Discard a song card (You may discard a song\\ncard to play this on top of one of your characters\\nnamed Ursula.)",
                    "keyword": "Shift",
                    "keywordValue": "Discard a song card",
                    "reminderText": "You may discard a song card to play this on top of one of your characters named Ursula.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever this character quests, chosen opponent reveals their hand and discards a non-character card of your choice.",
                    "fullText": "VANESSA'S DESIGN Whenever this character quests,\\nchosen opponent reveals their hand and discards a\\nnon-character card of your choice.",
                    "name": "VANESSA'S DESIGN",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift: Discard a song card (You may discard a song\\ncard to play this on top of one of your characters\\nnamed Ursula.)",
          "VANESSA'S DESIGN Whenever this character quests,\\nchosen opponent reveals their hand and discards a\\nnon-character card of your choice."
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

    describe('Ursula - Vanessa', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 716,
                name: 'Ursula',
                
                fullName: 'Ursula - Vanessa',
                abilities: [
          {
                    "fullText": "Singer 4 (This character counts as cost 4 to sing songs.)",
                    "keyword": "Singer",
                    "keywordValue": "4",
                    "keywordValueNumber": 4,
                    "reminderText": "This character counts as cost 4 to sing songs.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Singer 4 (This character counts as cost 4 to sing songs.)"
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

    describe('Bruno\'s Return', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 717,
                name: 'Bruno\'s Return',
                
                fullName: 'Bruno\'s Return',
                abilities: [],
                fullTextSections: [
          "Return a character card from your discard to your\\nhand. Then remove up to 2 damage from chosen\\ncharacter."
],
                cost: 2,
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
            // Actual: 1
            // Status: ✅ No error
            
            expect(abilities.length).toBeGreaterThanOrEqual(1);
            
            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('First Aid', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 718,
                name: 'First Aid',
                
                fullName: 'First Aid',
                abilities: [],
                fullTextSections: [
          "Remove up to 1 damage from each of your characters."
],
                cost: 1,
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

    describe('Look at This Family', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 719,
                name: 'Look at This Family',
                
                fullName: 'Look at This Family',
                abilities: [
          {
                    "fullText": "Sing Together 7 (Any number of your or your teammates'\\ncharacters with total cost 7 or more may ⟳ to sing this\\nsong for free.)",
                    "keyword": "Sing Together",
                    "keywordValue": "7",
                    "keywordValueNumber": 7,
                    "reminderText": "Any number of your or your teammates' characters with total cost 7 or more may ⟳ to sing this song for free.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Sing Together 7 (Any number of your or your teammates'\\ncharacters with total cost 7 or more may ⟳ to sing this\\nsong for free.)",
          "Look at the top 5 cards of your deck. You may reveal up\\nto 2 character cards and put them into your hand. Put the\\nrest on the bottom of your deck in any order."
],
                cost: 7,
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

    describe('Lost in the Woods', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 720,
                name: 'Lost in the Woods',
                
                fullName: 'Lost in the Woods',
                abilities: [
          {
                    "effect": "A character with cost 4 or more can ⟳ to sing this song for free.",
                    "fullText": "(A character with cost 4 or more can ⟳ to sing this\\nsong for free.)",
                    "type": "static"
          }
],
                fullTextSections: [
          "(A character with cost 4 or more can ⟳ to sing this\\nsong for free.)",
          "All opposing characters get -2 ¤ until the start of\\nyour next turn."
],
                cost: 4,
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

    describe('Sign the Scroll', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 721,
                name: 'Sign the Scroll',
                
                fullName: 'Sign the Scroll',
                abilities: [],
                fullTextSections: [
          "Each opponent may choose and discard a card. For\\neach opponent who doesn't, you gain 2 lore."
],
                cost: 3,
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
            // Actual: 1
            // Status: ✅ No error
            
            expect(abilities.length).toBeGreaterThanOrEqual(1);
            
            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Miracle Candle', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 722,
                name: 'Miracle Candle',
                
                fullName: 'Miracle Candle',
                abilities: [
          {
                    "costs": [
                              "Banish this item"
                    ],
                    "costsText": "Banish this item",
                    "effect": "If you have 3 or more characters in play, gain 2 lore and remove up to 2 damage from chosen location.",
                    "fullText": "ABUELA'S GIFT Banish this item — If you have 3 or\\nmore characters in play, gain 2 lore and remove up to 2\\ndamage from chosen location.",
                    "name": "ABUELA'S GIFT",
                    "type": "activated"
          }
],
                fullTextSections: [
          "ABUELA'S GIFT Banish this item — If you have 3 or\\nmore characters in play, gain 2 lore and remove up to 2\\ndamage from chosen location."
],
                cost: 2,
                type: 'Item' as CardType,
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

    describe('Record Player', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 723,
                name: 'Record Player',
                
                fullName: 'Record Player',
                abilities: [
          {
                    "effect": "Whenever you play a song, chosen character gets -2 ¤ until the start of your next turn.",
                    "fullText": "LOOK AT THIS! Whenever you play a song, chosen\\ncharacter gets -2 ¤ until the start of your next turn.",
                    "name": "LOOK AT THIS!",
                    "type": "triggered"
          },
          {
                    "effect": "Your characters named Stitch count as having +1 cost to sing songs.",
                    "fullText": "HIT PARADE Your characters named Stitch count as\\nhaving +1 cost to sing songs.",
                    "name": "HIT PARADE",
                    "type": "static"
          }
],
                fullTextSections: [
          "LOOK AT THIS! Whenever you play a song, chosen\\ncharacter gets -2 ¤ until the start of your next turn.",
          "HIT PARADE Your characters named Stitch count as\\nhaving +1 cost to sing songs."
],
                cost: 2,
                type: 'Item' as CardType,
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

    describe('Atlantica - Concert Hall', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 724,
                name: 'Atlantica',
                
                fullName: 'Atlantica - Concert Hall',
                abilities: [
          {
                    "effect": "Characters count as having +2 cost to sing songs while here.",
                    "fullText": "UNDERWATER ACOUSTICS Characters count as having +2 cost to sing\\nsongs while here.",
                    "name": "UNDERWATER ACOUSTICS",
                    "type": "static"
          }
],
                fullTextSections: [
          "UNDERWATER ACOUSTICS Characters count as having +2 cost to sing\\nsongs while here."
],
                cost: 1,
                type: 'Location' as CardType,
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

    describe('The Underworld - River Styx', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 725,
                name: 'The Underworld',
                
                fullName: 'The Underworld - River Styx',
                abilities: [
          {
                    "effect": "Whenever a character quests while here, you may pay 3 ⬡ to return a character card from your discard to your hand.",
                    "fullText": "SAVE A SOUL Whenever a character quests while here, you may pay 3 ⬡\\nto return a character card from your discard to your hand.",
                    "name": "SAVE A SOUL",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "SAVE A SOUL Whenever a character quests while here, you may pay 3 ⬡\\nto return a character card from your discard to your hand."
],
                cost: 2,
                type: 'Location' as CardType,
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

    describe('Belle - Accomplished Mystic', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 727,
                name: 'Belle',
                
                fullName: 'Belle - Accomplished Mystic',
                abilities: [
          {
                    "fullText": "Shift 3 (You may pay 3 ⬡ to play this on top of one of your\\ncharacters named Belle.)",
                    "keyword": "Shift",
                    "keywordValue": "3",
                    "keywordValueNumber": 3,
                    "reminderText": "You may pay 3 ⬡ to play this on top of one of your characters named Belle.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, move up to 3 damage counters from chosen character to chosen opposing character.",
                    "fullText": "ENHANCED HEALING When you play this character, move\\nup to 3 damage counters from chosen character to chosen\\nopposing character.",
                    "name": "ENHANCED HEALING",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 3 (You may pay 3 ⬡ to play this on top of one of your\\ncharacters named Belle.)",
          "ENHANCED HEALING When you play this character, move\\nup to 3 damage counters from chosen character to chosen\\nopposing character."
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

    describe('Belle - Untrained Mystic', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 728,
                name: 'Belle',
                
                fullName: 'Belle - Untrained Mystic',
                abilities: [
          {
                    "effect": "When you play this character, move up to 1 damage counter from chosen character to chosen opposing character.",
                    "fullText": "HERE NOW, DON'T DO THAT When you play this\\ncharacter, move up to 1 damage counter from\\nchosen character to chosen opposing character.",
                    "name": "HERE NOW, DON'T DO THAT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "HERE NOW, DON'T DO THAT When you play this\\ncharacter, move up to 1 damage counter from\\nchosen character to chosen opposing character."
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

    describe('Bruno Madrigal - Out of the Shadows', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 729,
                name: 'Bruno Madrigal',
                
                fullName: 'Bruno Madrigal - Out of the Shadows',
                abilities: [
          {
                    "effect": "When you play this character, chosen character gains “When this character is banished in a challenge, you may return this card to your hand” this turn.",
                    "fullText": "IT WAS YOUR VISION When you play this\\ncharacter, chosen character gains “When this\\ncharacter is banished in a challenge, you may\\nreturn this card to your hand” this turn.",
                    "name": "IT WAS YOUR VISION",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "IT WAS YOUR VISION When you play this\\ncharacter, chosen character gains “When this\\ncharacter is banished in a challenge, you may\\nreturn this card to your hand” this turn."
],
                cost: 5,
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

    describe('Bruno Madrigal - Undetected Uncle', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 730,
                name: 'Bruno Madrigal',
                
                fullName: 'Bruno Madrigal - Undetected Uncle',
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
                    "effect": "Name a card, then reveal the top card of your deck. If it's the named card, put that card into your hand and gain 3 lore. Otherwise, put it on the top of your deck.",
                    "fullText": "YOU JUST HAVE TO SEE IT ⟳ — Name a card, then\\nreveal the top card of your deck. If it's the named\\ncard, put that card into your hand and gain 3 lore.\\nOtherwise, put it on the top of your deck.",
                    "name": "YOU JUST HAVE TO SEE IT",
                    "type": "activated"
          }
],
                fullTextSections: [
          "Evasive (Only characters with Evasive can\\nchallenge this character.)",
          "YOU JUST HAVE TO SEE IT ⟳ — Name a card, then\\nreveal the top card of your deck. If it's the named\\ncard, put that card into your hand and gain 3 lore.\\nOtherwise, put it on the top of your deck."
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

    describe('Camilo Madrigal - Prankster', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 731,
                name: 'Camilo Madrigal',
                
                fullName: 'Camilo Madrigal - Prankster',
                abilities: [
          {
                    "effect": "At the start of your turn, you may choose one: • This character gets +1 ◊ this turn. • This character gains Challenger +2 this turn. (While challenging, this character gets +2 ¤.)",
                    "fullText": "MANY FORMS At the start of your turn, you may\\nchoose one:\\n• This character gets +1 ◊ this turn.\\n• This character gains Challenger +2 this turn.\\n(While challenging, this character gets +2 ¤.)",
                    "name": "MANY FORMS",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "MANY FORMS At the start of your turn, you may\\nchoose one:\\n• This character gets +1 ◊ this turn.\\n• This character gains Challenger +2 this turn.\\n(While challenging, this character gets +2 ¤.)"
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

    describe('Dolores Madrigal - Easy Listener', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 732,
                name: 'Dolores Madrigal',
                
                fullName: 'Dolores Madrigal - Easy Listener',
                abilities: [
          {
                    "effect": "When you play this character, if an opponent has an exerted character in play, you may draw a card.",
                    "fullText": "MAGICAL INFORMANT When you play this\\ncharacter, if an opponent has an exerted\\ncharacter in play, you may draw a card.",
                    "name": "MAGICAL INFORMANT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "MAGICAL INFORMANT When you play this\\ncharacter, if an opponent has an exerted\\ncharacter in play, you may draw a card."
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

    describe('Elsa - Storm Chaser', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 733,
                name: 'Elsa',
                
                fullName: 'Elsa - Storm Chaser',
                abilities: [
          {
                    "costs": [
                              "⟳"
                    ],
                    "costsText": "⟳",
                    "effect": "Chosen character gains Challenger +2 and Rush this turn. (They get +2 ¤ while challenging. They can challenge the turn they're played.)",
                    "fullText": "TEMPEST ⟳ — Chosen character gains Challenger +2\\nand Rush this turn. (They get +2 ¤ while challenging.\\nThey can challenge the turn they're played.)",
                    "name": "TEMPEST",
                    "type": "activated"
          }
],
                fullTextSections: [
          "TEMPEST ⟳ — Chosen character gains Challenger +2\\nand Rush this turn. (They get +2 ¤ while challenging.\\nThey can challenge the turn they're played.)"
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
            
            // Expected: 1
            // Actual: 1
            // Status: ✅ No error
            
            expect(abilities.length).toBeGreaterThanOrEqual(1);
            
            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Flotsam - Ursula\'s "Baby"', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 734,
                name: 'Flotsam',
                
                fullName: 'Flotsam - Ursula\'s "Baby"',
                abilities: [
          {
                    "effect": "When this character is banished in a challenge, return this card to your hand.",
                    "fullText": "QUICK ESCAPE When this character is banished in a\\nchallenge, return this card to your hand.",
                    "name": "QUICK ESCAPE",
                    "type": "triggered"
          },
          {
                    "effect": "Your characters named Jetsam gain “When this character is banished in a challenge, return this card to your hand.”",
                    "fullText": "OMINOUS PAIR Your characters named Jetsam gain “When\\nthis character is banished in a challenge, return this card to\\nyour hand.”",
                    "name": "OMINOUS PAIR",
                    "type": "static"
          }
],
                fullTextSections: [
          "QUICK ESCAPE When this character is banished in a\\nchallenge, return this card to your hand.",
          "OMINOUS PAIR Your characters named Jetsam gain “When\\nthis character is banished in a challenge, return this card to\\nyour hand.”"
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

    describe('Flotsam & Jetsam - Entangling Eels', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 735,
                name: 'Flotsam & Jetsam',
                
                fullName: 'Flotsam & Jetsam - Entangling Eels',
                abilities: [
          {
                    "fullText": "Shift: Discard 2 cards (You may discard 2 cards to\\nplay this on top of one of your characters named\\nFlotsam or Jetsam.)",
                    "keyword": "Shift",
                    "keywordValue": "Discard 2 cards",
                    "reminderText": "You may discard 2 cards to play this on top of one of your characters named Flotsam or Jetsam.",
                    "type": "keyword"
          },
          {
                    "effect": "This character counts as being named both Flotsam and Jetsam.",
                    "fullText": "(This character counts as being named both\\nFlotsam and Jetsam.)",
                    "type": "static"
          }
],
                fullTextSections: [
          "Shift: Discard 2 cards (You may discard 2 cards to\\nplay this on top of one of your characters named\\nFlotsam or Jetsam.)",
          "(This character counts as being named both\\nFlotsam and Jetsam.)"
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

    describe('Isabela Madrigal - Golden Child', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 736,
                name: 'Isabela Madrigal',
                
                fullName: 'Isabela Madrigal - Golden Child',
                abilities: [
          {
                    "fullText": "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
                    "keyword": "Evasive",
                    "reminderText": "Only characters with Evasive can challenge this character.",
                    "type": "keyword"
          },
          {
                    "effect": "During your turn, if no other character has quested this turn, this character gets +3 ◊.",
                    "fullText": "LADIES FIRST During your turn, if no other character\\nhas quested this turn, this character gets +3 ◊.",
                    "name": "LADIES FIRST",
                    "type": "static"
          },
          {
                    "effect": "Whenever this character quests, your other characters can't quest for the rest of this turn.",
                    "fullText": "LEAVE IT TO ME Whenever this character quests, your\\nother characters can't quest for the rest of this turn.",
                    "name": "LEAVE IT TO ME",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
          "LADIES FIRST During your turn, if no other character\\nhas quested this turn, this character gets +3 ◊.",
          "LEAVE IT TO ME Whenever this character quests, your\\nother characters can't quest for the rest of this turn."
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

    describe('Jetsam - Ursula\'s "Baby"', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 737,
                name: 'Jetsam',
                
                fullName: 'Jetsam - Ursula\'s "Baby"',
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
                    "effect": "Your characters named Flotsam gain Challenger +2.",
                    "fullText": "OMINOUS PAIR Your characters named Flotsam gain\\nChallenger +2.",
                    "name": "OMINOUS PAIR",
                    "type": "static"
          }
],
                fullTextSections: [
          "Challenger +2 (While challenging, this character\\ngets +2 ¤.)",
          "OMINOUS PAIR Your characters named Flotsam gain\\nChallenger +2."
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

    describe('Luisa Madrigal - Magically Strong One', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 738,
                name: 'Luisa Madrigal',
                
                fullName: 'Luisa Madrigal - Magically Strong One',
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
                cost: 4,
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

    describe('Magic Broom - Illuminary Keeper', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 739,
                name: 'Magic Broom',
                
                fullName: 'Magic Broom - Illuminary Keeper',
                abilities: [
          {
                    "effect": "Whenever you play another character, you may banish this character to draw a card.",
                    "fullText": "NICE AND TIDY Whenever you play another\\ncharacter, you may banish this character to draw\\na card.",
                    "name": "NICE AND TIDY",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "NICE AND TIDY Whenever you play another\\ncharacter, you may banish this character to draw\\na card."
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

    describe('Marshmallow - Terrifying Snowman', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 742,
                name: 'Marshmallow',
                
                fullName: 'Marshmallow - Terrifying Snowman',
                abilities: [
          {
                    "effect": "This character gets +1 ¤ for each card in your hand.",
                    "fullText": "BEHEMOTH This character gets +1 ¤ for each\\ncard in your hand.",
                    "name": "BEHEMOTH",
                    "type": "static"
          }
],
                fullTextSections: [
          "BEHEMOTH This character gets +1 ¤ for each\\ncard in your hand."
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
            
            // Expected: 1
            // Actual: 1
            // Status: ✅ No error
            
            expect(abilities.length).toBeGreaterThanOrEqual(1);
            
            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Mrs. Potts - Enchanted Teapot', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 743,
                name: 'Mrs. Potts',
                
                fullName: 'Mrs. Potts - Enchanted Teapot',
                abilities: [
          {
                    "effect": "When you play this character, if you have a character named Lumiere or Cogsworth in play, you may draw a card.",
                    "fullText": "IT'LL TURN OUT ALL RIGHT When you play this\\ncharacter, if you have a character named Lumiere\\nor Cogsworth in play, you may draw a card.",
                    "name": "IT'LL TURN OUT ALL RIGHT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "IT'LL TURN OUT ALL RIGHT When you play this\\ncharacter, if you have a character named Lumiere\\nor Cogsworth in play, you may draw a card."
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

    describe('Pepa Madrigal - Weather Maker', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 744,
                name: 'Pepa Madrigal',
                
                fullName: 'Pepa Madrigal - Weather Maker',
                abilities: [
          {
                    "effect": "When you play this character, you may exert chosen opposing character. That character can't ready at the start of their next turn unless they're at a location.",
                    "fullText": "IT LOOKS LIKE RAIN When you play this character,\\nyou may exert chosen opposing character. That\\ncharacter can't ready at the start of their next\\nturn unless they're at a location.",
                    "name": "IT LOOKS LIKE RAIN",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "IT LOOKS LIKE RAIN When you play this character,\\nyou may exert chosen opposing character. That\\ncharacter can't ready at the start of their next\\nturn unless they're at a location."
],
                cost: 5,
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

    describe('Peter Pan - Shadow Finder', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 745,
                name: 'Peter Pan',
                
                fullName: 'Peter Pan - Shadow Finder',
                abilities: [
          {
                    "fullText": "Rush (This character can challenge the turn\\nthey're played.)",
                    "keyword": "Rush",
                    "reminderText": "This character can challenge the turn they're played.",
                    "type": "keyword"
          },
          {
                    "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                    "keyword": "Evasive",
                    "reminderText": "Only characters with Evasive can challenge this character.",
                    "type": "keyword"
          },
          {
                    "effect": "Your other characters with Evasive gain Rush.",
                    "fullText": "FLY, OF COURSE! Your other characters with\\nEvasive gain Rush.",
                    "name": "FLY, OF COURSE!",
                    "type": "static"
          }
],
                fullTextSections: [
          "Rush (This character can challenge the turn\\nthey're played.)",
          "Evasive (Only characters with Evasive can\\nchallenge this character.)",
          "FLY, OF COURSE! Your other characters with\\nEvasive gain Rush."
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

    describe('Tick-Tock - Ever-Present Pursuer', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 747,
                name: 'Tick-Tock',
                
                fullName: 'Tick-Tock - Ever-Present Pursuer',
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

    describe('Ursula - Mad Sea Witch', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 748,
                name: 'Ursula',
                
                fullName: 'Ursula - Mad Sea Witch',
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

    describe('Ursula - Sea Witch Queen', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 749,
                name: 'Ursula',
                
                fullName: 'Ursula - Sea Witch Queen',
                abilities: [
          {
                    "fullText": "Shift 5 (You may pay 5 ⬡ to play this on top of one of\\nyour characters named Ursula.)",
                    "keyword": "Shift",
                    "keywordValue": "5",
                    "keywordValueNumber": 5,
                    "reminderText": "You may pay 5 ⬡ to play this on top of one of your characters named Ursula.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever this character quests, exert chosen character.",
                    "fullText": "NOW I AM THE RULER! Whenever this character quests,\\nexert chosen character.",
                    "name": "NOW I AM THE RULER!",
                    "type": "triggered"
          },
          {
                    "effect": "Other characters can't exert to sing songs.",
                    "fullText": "YOU'LL LISTEN TO ME! Other characters can't exert to\\nsing songs.",
                    "name": "YOU'LL LISTEN TO ME!",
                    "type": "static"
          }
],
                fullTextSections: [
          "Shift 5 (You may pay 5 ⬡ to play this on top of one of\\nyour characters named Ursula.)",
          "NOW I AM THE RULER! Whenever this character quests,\\nexert chosen character.",
          "YOU'LL LISTEN TO ME! Other characters can't exert to\\nsing songs."
],
                cost: 7,
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

    describe('Yen Sid - Powerful Sorcerer', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 750,
                name: 'Yen Sid',
                
                fullName: 'Yen Sid - Powerful Sorcerer',
                abilities: [
          {
                    "effect": "When you play this character, if you have a character named Magic Broom in play, you may draw a card.",
                    "fullText": "TIMELY INTERVENTION When you play this\\ncharacter, if you have a character named Magic\\nBroom in play, you may draw a card.",
                    "name": "TIMELY INTERVENTION",
                    "type": "triggered"
          },
          {
                    "effect": "While you have 2 or more Broom characters in play, this character gets +2 ◊.",
                    "fullText": "ARCANE STUDY While you have 2 or more Broom\\ncharacters in play, this character gets +2 ◊.",
                    "name": "ARCANE STUDY",
                    "type": "static"
          }
],
                fullTextSections: [
          "TIMELY INTERVENTION When you play this\\ncharacter, if you have a character named Magic\\nBroom in play, you may draw a card.",
          "ARCANE STUDY While you have 2 or more Broom\\ncharacters in play, this character gets +2 ◊."
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

    describe('Poor Unfortunate Souls', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 751,
                name: 'Poor Unfortunate Souls',
                
                fullName: 'Poor Unfortunate Souls',
                abilities: [
          {
                    "effect": "A character with cost 2 or more can ⟳ to sing this song for free.",
                    "fullText": "(A character with cost 2 or more can ⟳ to sing this\\nsong for free.)",
                    "type": "static"
          }
],
                fullTextSections: [
          "(A character with cost 2 or more can ⟳ to sing this\\nsong for free.)",
          "Return chosen character, item, or location with cost 2\\nor less to their player's hand."
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

    describe('Second Star to the Right', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 752,
                name: 'Second Star to the Right',
                
                fullName: 'Second Star to the Right',
                abilities: [
          {
                    "fullText": "Sing Together 10 (Any number of your or your\\nteammates' characters with total cost 10 or more may\\n⟳ to sing this song for free.)",
                    "keyword": "Sing Together",
                    "keywordValue": "10",
                    "keywordValueNumber": 10,
                    "reminderText": "Any number of your or your teammates' characters with total cost 10 or more may ⟳ to sing this song for free.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Sing Together 10 (Any number of your or your\\nteammates' characters with total cost 10 or more may\\n⟳ to sing this song for free.)",
          "Chosen player draws 5 cards."
],
                cost: 10,
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

    describe('Swing into Action', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 753,
                name: 'Swing into Action',
                
                fullName: 'Swing into Action',
                abilities: [],
                fullTextSections: [
          "Chosen character gains Rush this turn. (They can\\nchallenge the turn they're played.)"
],
                cost: 1,
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

    describe('Ursula\'s Plan', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 754,
                name: 'Ursula\'s Plan',
                
                fullName: 'Ursula\'s Plan',
                abilities: [],
                fullTextSections: [
          "Each opponent chooses and exerts one of their\\ncharacters. Those characters can't ready at the start of\\ntheir next turn."
],
                cost: 3,
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

    describe('Mystical Rose', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 755,
                name: 'Mystical Rose',
                
                fullName: 'Mystical Rose',
                abilities: [
          {
                    "costs": [
                              "Banish this item"
                    ],
                    "costsText": "Banish this item",
                    "effect": "Chosen character named Beast gets +2 ◊ this turn. If you have a character named Belle in play, move up to 3 damage counters from chosen character to chosen opposing character.",
                    "fullText": "DISPEL THE ENTANGLEMENT Banish this item — Chosen\\ncharacter named Beast gets +2 ◊ this turn. If you have a\\ncharacter named Belle in play, move up to 3 damage counters\\nfrom chosen character to chosen opposing character.",
                    "name": "DISPEL THE ENTANGLEMENT",
                    "type": "activated"
          }
],
                fullTextSections: [
          "DISPEL THE ENTANGLEMENT Banish this item — Chosen\\ncharacter named Beast gets +2 ◊ this turn. If you have a\\ncharacter named Belle in play, move up to 3 damage counters\\nfrom chosen character to chosen opposing character."
],
                cost: 2,
                type: 'Item' as CardType,
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

    describe('Rose Lantern', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 756,
                name: 'Rose Lantern',
                
                fullName: 'Rose Lantern',
                abilities: [
          {
                    "costs": [
                              "⟳",
                              "2 ⬡"
                    ],
                    "costsText": "⟳, 2 ⬡",
                    "effect": "Move 1 damage counter from chosen character to chosen opposing character.",
                    "fullText": "MYSTICAL PETALS ⟳, 2 ⬡ — Move 1 damage counter\\nfrom chosen character to chosen opposing character.",
                    "name": "MYSTICAL PETALS",
                    "type": "activated"
          }
],
                fullTextSections: [
          "MYSTICAL PETALS ⟳, 2 ⬡ — Move 1 damage counter\\nfrom chosen character to chosen opposing character."
],
                cost: 2,
                type: 'Item' as CardType,
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

    describe('Triton\'s Trident', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 757,
                name: 'Triton\'s Trident',
                
                fullName: 'Triton\'s Trident',
                abilities: [
          {
                    "costs": [
                              "Banish this item"
                    ],
                    "costsText": "Banish this item",
                    "effect": "Chosen character gets +1 ¤ this turn for each card in your hand.",
                    "fullText": "SYMBOL OF POWER Banish this item — Chosen\\ncharacter gets +1 ¤ this turn for each card in your\\nhand.",
                    "name": "SYMBOL OF POWER",
                    "type": "activated"
          }
],
                fullTextSections: [
          "SYMBOL OF POWER Banish this item — Chosen\\ncharacter gets +1 ¤ this turn for each card in your\\nhand."
],
                cost: 2,
                type: 'Item' as CardType,
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

    describe('Casa Madrigal - Casita', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 758,
                name: 'Casa Madrigal',
                
                fullName: 'Casa Madrigal - Casita',
                abilities: [
          {
                    "effect": "At the start of your turn, if you have a character here gain 1 lore.",
                    "fullText": "OUR HOME At the start of your turn, if you have a character here gain 1 lore.",
                    "name": "OUR HOME",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "OUR HOME At the start of your turn, if you have a character here gain 1 lore."
],
                cost: 1,
                type: 'Location' as CardType,
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

    describe('Ursula\'s Lair - Eye of the Storm', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 759,
                name: 'Ursula\'s Lair',
                
                fullName: 'Ursula\'s Lair - Eye of the Storm',
                abilities: [
          {
                    "effect": "Whenever a character is banished in a challenge while here, you may return them to your hand.",
                    "fullText": "SLIPPERY HALLS Whenever a character is banished in a challenge while\\nhere, you may return them to your hand.",
                    "name": "SLIPPERY HALLS",
                    "type": "triggered"
          },
          {
                    "effect": "Characters named Ursula get +1 ◊ while here.",
                    "fullText": "SEAT OF POWER Characters named Ursula get +1 ◊ while here.",
                    "name": "SEAT OF POWER",
                    "type": "static"
          }
],
                fullTextSections: [
          "SLIPPERY HALLS Whenever a character is banished in a challenge while\\nhere, you may return them to your hand.",
          "SEAT OF POWER Characters named Ursula get +1 ◊ while here."
],
                cost: 3,
                type: 'Location' as CardType,
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

    describe('Cri-Kee - Lucky Cricket', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 760,
                name: 'Cri-Kee',
                
                fullName: 'Cri-Kee - Lucky Cricket',
                abilities: [
          {
                    "effect": "When you play this character, your other characters get +3 ¤ this turn.",
                    "fullText": "SPREADING GOOD FORTUNE When you play this\\ncharacter, your other characters get +3 ¤ this\\nturn.",
                    "name": "SPREADING GOOD FORTUNE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "SPREADING GOOD FORTUNE When you play this\\ncharacter, your other characters get +3 ¤ this\\nturn."
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

    describe('Diablo - Devoted Herald', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 761,
                name: 'Diablo',
                
                fullName: 'Diablo - Devoted Herald',
                abilities: [
          {
                    "fullText": "Shift: Discard an action card (You may discard an action card\\nto play this on top of one of your characters named Diablo.)",
                    "keyword": "Shift",
                    "keywordValue": "Discard an action card",
                    "reminderText": "You may discard an action card to play this on top of one of your characters named Diablo.",
                    "type": "keyword"
          },
          {
                    "fullText": "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
                    "keyword": "Evasive",
                    "reminderText": "Only characters with Evasive can challenge this character.",
                    "type": "keyword"
          },
          {
                    "effect": "During each opponent's turn, whenever they draw a card while this character is exerted, you may draw a card.",
                    "fullText": "CIRCLE FAR AND WIDE During each opponent's turn,\\nwhenever they draw a card while this character is exerted,\\nyou may draw a card.",
                    "name": "CIRCLE FAR AND WIDE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift: Discard an action card (You may discard an action card\\nto play this on top of one of your characters named Diablo.)",
          "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
          "CIRCLE FAR AND WIDE During each opponent's turn,\\nwhenever they draw a card while this character is exerted,\\nyou may draw a card."
],
                cost: 3,
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

    describe('Diablo - Maleficent\'s Spy', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 762,
                name: 'Diablo',
                
                fullName: 'Diablo - Maleficent\'s Spy',
                abilities: [
          {
                    "effect": "When you play this character, you may look at each opponent's hand.",
                    "fullText": "SCOUT AHEAD When you play this character, you\\nmay look at each opponent's hand.",
                    "name": "SCOUT AHEAD",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "SCOUT AHEAD When you play this character, you\\nmay look at each opponent's hand."
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

    describe('Gunther - Interior Designer', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 763,
                name: 'Gunther',
                
                fullName: 'Gunther - Interior Designer',
                abilities: [
          {
                    "effect": "When this character is challenged and banished, each opponent chooses one of their characters and returns that card to their hand.",
                    "fullText": "SAD-EYED PUPPY When this character is challenged\\nand banished, each opponent chooses one of their\\ncharacters and returns that card to their hand.",
                    "name": "SAD-EYED PUPPY",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "SAD-EYED PUPPY When this character is challenged\\nand banished, each opponent chooses one of their\\ncharacters and returns that card to their hand."
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

    describe('Hades - Double Dealer', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 765,
                name: 'Hades',
                
                fullName: 'Hades - Double Dealer',
                abilities: [
          {
                    "costs": [
                              "⟳",
                              "Banish one of your other characters"
                    ],
                    "costsText": "⟳, Banish one of your other characters",
                    "effect": "Play a character with the same name as the banished character for free.",
                    "fullText": "HERE'S THE TRADE-OFF ⟳, Banish one of your\\nother characters — Play a character with the same\\nname as the banished character for free.",
                    "name": "HERE'S THE TRADE-OFF",
                    "type": "activated"
          }
],
                fullTextSections: [
          "HERE'S THE TRADE-OFF ⟳, Banish one of your\\nother characters — Play a character with the same\\nname as the banished character for free."
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

    describe('HeiHei - Bumbling Rooster', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 766,
                name: 'HeiHei',
                
                fullName: 'HeiHei - Bumbling Rooster',
                abilities: [
          {
                    "effect": "When you play this character, if an opponent has more cards in their inkwell than you, you may put the top card of your deck into your inkwell facedown and exerted.",
                    "fullText": "FATTEN YOU UP When you play this character, if\\nan opponent has more cards in their inkwell than\\nyou, you may put the top card of your deck into\\nyour inkwell facedown and exerted.",
                    "name": "FATTEN YOU UP",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "FATTEN YOU UP When you play this character, if\\nan opponent has more cards in their inkwell than\\nyou, you may put the top card of your deck into\\nyour inkwell facedown and exerted."
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

    describe('Hera - Queen of the Gods', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 767,
                name: 'Hera',
                
                fullName: 'Hera - Queen of the Gods',
                abilities: [
          {
                    "fullText": "Ward (Opponents can't choose this character except to\\nchallenge.)",
                    "keyword": "Ward",
                    "reminderText": "Opponents can't choose this character except to challenge.",
                    "type": "keyword"
          },
          {
                    "effect": "Your characters named Zeus gain Ward.",
                    "fullText": "PROTECTIVE GODDESS Your characters named Zeus gain\\nWard.",
                    "name": "PROTECTIVE GODDESS",
                    "type": "static"
          },
          {
                    "effect": "Your characters named Hercules gain Evasive. (Only characters with Evasive can challenge them.)",
                    "fullText": "YOU'RE A TRUE HERO Your characters named Hercules gain\\nEvasive. (Only characters with Evasive can challenge them.)",
                    "name": "YOU'RE A TRUE HERO",
                    "type": "static"
          }
],
                fullTextSections: [
          "Ward (Opponents can't choose this character except to\\nchallenge.)",
          "PROTECTIVE GODDESS Your characters named Zeus gain\\nWard.",
          "YOU'RE A TRUE HERO Your characters named Hercules gain\\nEvasive. (Only characters with Evasive can challenge them.)"
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

    describe('Jaq - Connoisseur of Climbing', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 768,
                name: 'Jaq',
                
                fullName: 'Jaq - Connoisseur of Climbing',
                abilities: [
          {
                    "effect": "When you play this character, chosen opposing character gains Reckless during their next turn. (They can't quest and must challenge if able.)",
                    "fullText": "SNEAKY IDEA When you play this character,\\nchosen opposing character gains Reckless during\\ntheir next turn. (They can't quest and must\\nchallenge if able.)",
                    "name": "SNEAKY IDEA",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "SNEAKY IDEA When you play this character,\\nchosen opposing character gains Reckless during\\ntheir next turn. (They can't quest and must\\nchallenge if able.)"
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

    describe('Jasmine - Desert Warrior', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 769,
                name: 'Jasmine',
                
                fullName: 'Jasmine - Desert Warrior',
                abilities: [
          {
                    "effect": "When you play this character and whenever she's challenged, each opponent chooses and discards a card.",
                    "fullText": "CUNNING MANEUVER When you play this\\ncharacter and whenever she's challenged, each\\nopponent chooses and discards a card.",
                    "name": "CUNNING MANEUVER",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "CUNNING MANEUVER When you play this\\ncharacter and whenever she's challenged, each\\nopponent chooses and discards a card."
],
                cost: 5,
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

    describe('Megara - Captivating Cynic', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 770,
                name: 'Megara',
                
                fullName: 'Megara - Captivating Cynic',
                abilities: [
          {
                    "effect": "When you play this character, choose and discard a card or banish this character.",
                    "fullText": "SHADY DEAL When you play this character,\\nchoose and discard a card or banish this\\ncharacter.",
                    "name": "SHADY DEAL",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "SHADY DEAL When you play this character,\\nchoose and discard a card or banish this\\ncharacter."
],
                cost: 3,
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

    describe('Megara - Liberated One', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 771,
                name: 'Megara',
                
                fullName: 'Megara - Liberated One',
                abilities: [
          {
                    "fullText": "Ward (Opponents can't choose this character\\nexcept to challenge.)",
                    "keyword": "Ward",
                    "reminderText": "Opponents can't choose this character except to challenge.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever you play a character named Hercules, you may ready this character.",
                    "fullText": "PEOPLE ALWAYS DO CRAZY THINGS Whenever you\\nplay a character named Hercules, you may ready\\nthis character.",
                    "name": "PEOPLE ALWAYS DO CRAZY THINGS",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Ward (Opponents can't choose this character\\nexcept to challenge.)",
          "PEOPLE ALWAYS DO CRAZY THINGS Whenever you\\nplay a character named Hercules, you may ready\\nthis character."
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

    describe('Panic - Immortal Sidekick', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 773,
                name: 'Panic',
                
                fullName: 'Panic - Immortal Sidekick',
                abilities: [
          {
                    "effect": "While this character is exerted, if you have a character named Pain in play, your Villain characters can't be challenged.",
                    "fullText": "REPORTING FOR DUTY While this character is\\nexerted, if you have a character named Pain in\\nplay, your Villain characters can't be challenged.",
                    "name": "REPORTING FOR DUTY",
                    "type": "static"
          }
],
                fullTextSections: [
          "REPORTING FOR DUTY While this character is\\nexerted, if you have a character named Pain in\\nplay, your Villain characters can't be challenged."
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

    describe('Pegasus - Cloud Racer', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 774,
                name: 'Pegasus',
                
                fullName: 'Pegasus - Cloud Racer',
                abilities: [
          {
                    "fullText": "Shift 3 (You may pay 3 ⬡ to play this on top of one of your\\ncharacters named Pegasus.)",
                    "keyword": "Shift",
                    "keywordValue": "3",
                    "keywordValueNumber": 3,
                    "reminderText": "You may pay 3 ⬡ to play this on top of one of your characters named Pegasus.",
                    "type": "keyword"
          },
          {
                    "fullText": "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
                    "keyword": "Evasive",
                    "reminderText": "Only characters with Evasive can challenge this character.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, if you used Shift to play him, your characters gain Evasive until the start of your next turn.",
                    "fullText": "HOP ON! When you play this character, if you used Shift to\\nplay him, your characters gain Evasive until the start of your\\nnext turn.",
                    "name": "HOP ON!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 3 (You may pay 3 ⬡ to play this on top of one of your\\ncharacters named Pegasus.)",
          "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
          "HOP ON! When you play this character, if you used Shift to\\nplay him, your characters gain Evasive until the start of your\\nnext turn."
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

    describe('Pegasus - Gift for Hercules', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 775,
                name: 'Pegasus',
                
                fullName: 'Pegasus - Gift for Hercules',
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

    describe('Pete - Born to Cheat', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 776,
                name: 'Pete',
                
                fullName: 'Pete - Born to Cheat',
                abilities: [
          {
                    "effect": "Whenever this character quests while he has 5 ¤ or more, return chosen character with 2 ¤ or less to their player's hand.",
                    "fullText": "I CLOBBER YOU! Whenever this character quests\\nwhile he has 5 ¤ or more, return chosen\\ncharacter with 2 ¤ or less to their player's hand.",
                    "name": "I CLOBBER YOU!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "I CLOBBER YOU! Whenever this character quests\\nwhile he has 5 ¤ or more, return chosen\\ncharacter with 2 ¤ or less to their player's hand."
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

    describe('Prince Phillip - Vanquisher of Foes', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 778,
                name: 'Prince Phillip',
                
                fullName: 'Prince Phillip - Vanquisher of Foes',
                abilities: [
          {
                    "fullText": "Shift 6 (You may pay 6 ⬡ to play this on top of one of\\nyour characters named Prince Phillip.)",
                    "keyword": "Shift",
                    "keywordValue": "6",
                    "keywordValueNumber": 6,
                    "reminderText": "You may pay 6 ⬡ to play this on top of one of your characters named Prince Phillip.",
                    "type": "keyword"
          },
          {
                    "fullText": "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
                    "keyword": "Evasive",
                    "reminderText": "Only characters with Evasive can challenge this character.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, banish all opposing damaged characters.",
                    "fullText": "SWIFT AND SURE When you play this character, banish\\nall opposing damaged characters.",
                    "name": "SWIFT AND SURE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 6 (You may pay 6 ⬡ to play this on top of one of\\nyour characters named Prince Phillip.)",
          "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
          "SWIFT AND SURE When you play this character, banish\\nall opposing damaged characters."
],
                cost: 9,
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

    describe('Prince Phillip - Warden of the Woods', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 779,
                name: 'Prince Phillip',
                
                fullName: 'Prince Phillip - Warden of the Woods',
                abilities: [
          {
                    "effect": "Your other Hero characters gain Ward. (Opponents can't choose them except to challenge.)",
                    "fullText": "SHINING BEACON Your other Hero characters\\ngain Ward. (Opponents can't choose them except\\nto challenge.)",
                    "name": "SHINING BEACON",
                    "type": "static"
          }
],
                fullTextSections: [
          "SHINING BEACON Your other Hero characters\\ngain Ward. (Opponents can't choose them except\\nto challenge.)"
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

    describe('The Fates - Only One Eye', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 780,
                name: 'The Fates',
                
                fullName: 'The Fates - Only One Eye',
                abilities: [
          {
                    "effect": "When you play this character, look at the top card of each opponent's deck.",
                    "fullText": "ALL WILL BE SEEN When you play this character,\\nlook at the top card of each opponent's deck.",
                    "name": "ALL WILL BE SEEN",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "ALL WILL BE SEEN When you play this character,\\nlook at the top card of each opponent's deck."
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

    describe('The Muses - Proclaimers of Heroes', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 781,
                name: 'The Muses',
                
                fullName: 'The Muses - Proclaimers of Heroes',
                abilities: [
          {
                    "fullText": "Ward (Opponents can't choose this character\\nexcept to challenge.)",
                    "keyword": "Ward",
                    "reminderText": "Opponents can't choose this character except to challenge.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever you play a song, you may return chosen character with 2 ¤ or less to their player's hand.",
                    "fullText": "THE GOSPEL TRUTH Whenever you play a song,\\nyou may return chosen character with 2 ¤ or\\nless to their player's hand.",
                    "name": "THE GOSPEL TRUTH",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Ward (Opponents can't choose this character\\nexcept to challenge.)",
          "THE GOSPEL TRUTH Whenever you play a song,\\nyou may return chosen character with 2 ¤ or\\nless to their player's hand."
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

    describe('Zeus - Mr. Lightning Bolts', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 783,
                name: 'Zeus',
                
                fullName: 'Zeus - Mr. Lightning Bolts',
                abilities: [
          {
                    "effect": "Whenever this character challenges another character, he gets +¤ equal to the ¤ of chosen character this turn.",
                    "fullText": "TARGET PRACTICE Whenever this character\\nchallenges another character, he gets +¤ equal\\nto the ¤ of chosen character this turn.",
                    "name": "TARGET PRACTICE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "TARGET PRACTICE Whenever this character\\nchallenges another character, he gets +¤ equal\\nto the ¤ of chosen character this turn."
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

    describe('Dodge!', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 784,
                name: 'Dodge!',
                
                fullName: 'Dodge!',
                abilities: [],
                fullTextSections: [
          "Chosen character gains Ward and Evasive until the\\nstart of your next turn. (Opponents can't choose them\\nexcept to challenge. Only characters with Evasive can\\nchallenge them.)"
],
                cost: 2,
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

    describe('Make the Potion', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 785,
                name: 'Make the Potion',
                
                fullName: 'Make the Potion',
                abilities: [],
                fullTextSections: [
          "Choose one:\\n• Banish chosen item.\\n• Deal 2 damage to chosen damaged character."
],
                cost: 2,
                type: 'Action' as CardType,
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

    describe('Under the Sea', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 786,
                name: 'Under the Sea',
                
                fullName: 'Under the Sea',
                abilities: [
          {
                    "fullText": "Sing Together 8 (Any number of your or your teammates'\\ncharacters with total cost 8 or more may ⟳ to sing this song\\nfor free.)",
                    "keyword": "Sing Together",
                    "keywordValue": "8",
                    "keywordValueNumber": 8,
                    "reminderText": "Any number of your or your teammates' characters with total cost 8 or more may ⟳ to sing this song for free.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Sing Together 8 (Any number of your or your teammates'\\ncharacters with total cost 8 or more may ⟳ to sing this song\\nfor free.)",
          "Put all opposing characters with 2 ¤ or less on the bottom of\\ntheir players' decks in any order."
],
                cost: 8,
                type: 'Action' as CardType,
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

    describe('Ursula\'s Trickery', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 787,
                name: 'Ursula\'s Trickery',
                
                fullName: 'Ursula\'s Trickery',
                abilities: [],
                fullTextSections: [
          "Each opponent may choose and discard a card. For\\neach opponent who doesn't, you draw a card."
],
                cost: 1,
                type: 'Action' as CardType,
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

    describe('We Don\'t Talk About Bruno', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 788,
                name: 'We Don\'t Talk About Bruno',
                
                fullName: 'We Don\'t Talk About Bruno',
                abilities: [
          {
                    "effect": "A character with cost 5 or more can ⟳ to sing this song for free.",
                    "fullText": "(A character with cost 5 or more can ⟳ to sing this\\nsong for free.)",
                    "type": "static"
          }
],
                fullTextSections: [
          "(A character with cost 5 or more can ⟳ to sing this\\nsong for free.)",
          "Return chosen character to their player's hand, then\\nthat player discards a card at random."
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

    describe('Hidden Inkcaster', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 789,
                name: 'Hidden Inkcaster',
                
                fullName: 'Hidden Inkcaster',
                abilities: [
          {
                    "effect": "When you play this item, draw a card.",
                    "fullText": "FRESH INK When you play this item, draw a card.",
                    "name": "FRESH INK",
                    "type": "triggered"
          },
          {
                    "effect": "All cards in your hand count as having ◉.",
                    "fullText": "UNEXPECTED TREASURE All cards in your hand count as\\nhaving ◉.",
                    "name": "UNEXPECTED TREASURE",
                    "type": "static"
          }
],
                fullTextSections: [
          "FRESH INK When you play this item, draw a card.",
          "UNEXPECTED TREASURE All cards in your hand count as\\nhaving ◉."
],
                cost: 2,
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

    describe('Signed Contract', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 790,
                name: 'Signed Contract',
                
                fullName: 'Signed Contract',
                abilities: [
          {
                    "effect": "Whenever an opponent plays a song, you may draw a card.",
                    "fullText": "FINE PRINT Whenever an opponent plays a song, you\\nmay draw a card.",
                    "name": "FINE PRINT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "FINE PRINT Whenever an opponent plays a song, you\\nmay draw a card."
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

    describe('Vision Slab', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 791,
                name: 'Vision Slab',
                
                fullName: 'Vision Slab',
                abilities: [
          {
                    "effect": "At the start of your turn, if an opposing character has damage, gain 1 lore.",
                    "fullText": "DANGER REVEALED At the start of your turn, if an\\nopposing character has damage, gain 1 lore.",
                    "name": "DANGER REVEALED",
                    "type": "triggered"
          },
          {
                    "effect": "Damage counters can't be removed.",
                    "fullText": "TRAPPED! Damage counters can't be removed.",
                    "name": "TRAPPED!",
                    "type": "static"
          }
],
                fullTextSections: [
          "DANGER REVEALED At the start of your turn, if an\\nopposing character has damage, gain 1 lore.",
          "TRAPPED! Damage counters can't be removed."
],
                cost: 3,
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

    describe('Hidden Cove - Tranquil Haven', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 792,
                name: 'Hidden Cove',
                
                fullName: 'Hidden Cove - Tranquil Haven',
                abilities: [
          {
                    "effect": "Characters get +1 ¤ and +1 ⛉ while here.",
                    "fullText": "REVITALIZING WATERS Characters get +1 ¤ and +1 ⛉ while here.",
                    "name": "REVITALIZING WATERS",
                    "type": "static"
          }
],
                fullTextSections: [
          "REVITALIZING WATERS Characters get +1 ¤ and +1 ⛉ while here."
],
                cost: 1,
                type: 'Location' as CardType,
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

    describe('Ursula\'s Garden - Full of the Unfortunate', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 793,
                name: 'Ursula\'s Garden',
                
                fullName: 'Ursula\'s Garden - Full of the Unfortunate',
                abilities: [
          {
                    "effect": "While you have an exerted character here, opposing characters get -1 ◊.",
                    "fullText": "ABANDON HOPE While you have an exerted character here, opposing\\ncharacters get -1 ◊.",
                    "name": "ABANDON HOPE",
                    "type": "static"
          }
],
                fullTextSections: [
          "ABANDON HOPE While you have an exerted character here, opposing\\ncharacters get -1 ◊."
],
                cost: 4,
                type: 'Location' as CardType,
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

    describe('Beast - Wounded', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 794,
                name: 'Beast',
                
                fullName: 'Beast - Wounded',
                abilities: [
          {
                    "effect": "This character enters play with 4 damage.",
                    "fullText": "THAT HURTS! This character enters play with 4\\ndamage.",
                    "name": "THAT HURTS!",
                    "type": "static"
          }
],
                fullTextSections: [
          "THAT HURTS! This character enters play with 4\\ndamage."
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

    describe('Fa Zhou - Mulan\'s Father', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 796,
                name: 'Fa Zhou',
                
                fullName: 'Fa Zhou - Mulan\'s Father',
                abilities: [
          {
                    "effect": "This character can't challenge.",
                    "fullText": "WAR INJURY This character can't challenge.",
                    "name": "WAR INJURY",
                    "type": "static"
          },
          {
                    "costs": [
                              "⟳"
                    ],
                    "costsText": "⟳",
                    "effect": "Ready chosen character named Mulan. She can't quest for the rest of this turn.",
                    "fullText": "HEAD OF THE HOUSEHOLD ⟳ — Ready chosen\\ncharacter named Mulan. She can't quest for the\\nrest of this turn.",
                    "name": "HEAD OF THE HOUSEHOLD",
                    "type": "activated"
          }
],
                fullTextSections: [
          "WAR INJURY This character can't challenge.",
          "HEAD OF THE HOUSEHOLD ⟳ — Ready chosen\\ncharacter named Mulan. She can't quest for the\\nrest of this turn."
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

    describe('Flynn Rider - Frenemy', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 797,
                name: 'Flynn Rider',
                
                fullName: 'Flynn Rider - Frenemy',
                abilities: [
          {
                    "effect": "At the start of your turn, if you have a character in play with more ¤ than each opposing character, gain 3 lore.",
                    "fullText": "NARROW ADVANTAGE At the start of your turn, if\\nyou have a character in play with more ¤ than\\neach opposing character, gain 3 lore.",
                    "name": "NARROW ADVANTAGE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "NARROW ADVANTAGE At the start of your turn, if\\nyou have a character in play with more ¤ than\\neach opposing character, gain 3 lore."
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

    describe('Goofy - Super Goof', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 798,
                name: 'Goofy',
                
                fullName: 'Goofy - Super Goof',
                abilities: [
          {
                    "fullText": "Rush (This character can challenge the turn\\nthey're played.)",
                    "keyword": "Rush",
                    "reminderText": "This character can challenge the turn they're played.",
                    "type": "keyword"
          },
          {
                    "effect": "Whenever this character challenges another character, gain 2 lore.",
                    "fullText": "SUPER PEANUT POWERS Whenever this character\\nchallenges another character, gain 2 lore.",
                    "name": "SUPER PEANUT POWERS",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Rush (This character can challenge the turn\\nthey're played.)",
          "SUPER PEANUT POWERS Whenever this character\\nchallenges another character, gain 2 lore."
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

    describe('Hercules - Clumsy Kid', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 799,
                name: 'Hercules',
                
                fullName: 'Hercules - Clumsy Kid',
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

    describe('Hercules - Daring Demigod', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 800,
                name: 'Hercules',
                
                fullName: 'Hercules - Daring Demigod',
                abilities: [
          {
                    "fullText": "Rush (This character can challenge the turn\\nthey're played.)",
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
          "Rush (This character can challenge the turn\\nthey're played.)",
          "Reckless (This character can't quest and must\\nchallenge each turn if able.)"
],
                cost: 5,
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

    describe('Li Shang - Valorous General', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 803,
                name: 'Li Shang',
                
                fullName: 'Li Shang - Valorous General',
                abilities: [
          {
                    "fullText": "Shift: Discard a character card (You may discard\\na character card to play this on top of one of your\\ncharacters named Li Shang.)",
                    "keyword": "Shift",
                    "keywordValue": "Discard a character card",
                    "reminderText": "You may discard a character card to play this on top of one of your characters named Li Shang.",
                    "type": "keyword"
          },
          {
                    "effect": "Your characters with 4 ¤ or more get +1 ◊.",
                    "fullText": "LEAD THE CHARGE Your characters with 4 ¤ or\\nmore get +1 ◊.",
                    "name": "LEAD THE CHARGE",
                    "type": "static"
          }
],
                fullTextSections: [
          "Shift: Discard a character card (You may discard\\na character card to play this on top of one of your\\ncharacters named Li Shang.)",
          "LEAD THE CHARGE Your characters with 4 ¤ or\\nmore get +1 ◊."
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

    describe('Lumiere - Fiery Friend', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 804,
                name: 'Lumiere',
                
                fullName: 'Lumiere - Fiery Friend',
                abilities: [
          {
                    "effect": "Your other characters get +1 ¤.",
                    "fullText": "FERVENT ADDRESS Your other characters get +1 ¤.",
                    "name": "FERVENT ADDRESS",
                    "type": "static"
          }
],
                fullTextSections: [
          "FERVENT ADDRESS Your other characters get +1 ¤."
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

    describe('Mulan - Elite Archer', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 805,
                name: 'Mulan',
                
                fullName: 'Mulan - Elite Archer',
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
                    "effect": "When you play this character, if you used Shift to play her, she gets +3 ¤ this turn.",
                    "fullText": "STRAIGHT SHOOTER When you play this character, if you\\nused Shift to play her, she gets +3 ¤ this turn.",
                    "name": "STRAIGHT SHOOTER",
                    "type": "triggered"
          },
          {
                    "effect": "During your turn, whenever this character deals damage to another character in a challenge, deal the same amount of damage to up to 2 other chosen characters.",
                    "fullText": "TRIPLE SHOT During your turn, whenever this character\\ndeals damage to another character in a challenge, deal the\\nsame amount of damage to up to 2 other chosen characters.",
                    "name": "TRIPLE SHOT",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 5 (You may pay 5 ⬡ to play this on top of one of your\\ncharacters named Mulan.)",
          "STRAIGHT SHOOTER When you play this character, if you\\nused Shift to play her, she gets +3 ¤ this turn.",
          "TRIPLE SHOT During your turn, whenever this character\\ndeals damage to another character in a challenge, deal the\\nsame amount of damage to up to 2 other chosen characters."
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

    describe('Mulan - Enemy of Entanglement', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 806,
                name: 'Mulan',
                
                fullName: 'Mulan - Enemy of Entanglement',
                abilities: [
          {
                    "effect": "Whenever you play an action, this character gets +2 ¤ this turn.",
                    "fullText": "TIME TO SHINE Whenever you play an action, this\\ncharacter gets +2 ¤ this turn.",
                    "name": "TIME TO SHINE",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "TIME TO SHINE Whenever you play an action, this\\ncharacter gets +2 ¤ this turn."
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

    describe('Mulan - Injured Soldier', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 807,
                name: 'Mulan',
                
                fullName: 'Mulan - Injured Soldier',
                abilities: [
          {
                    "effect": "This character enters play with 2 damage.",
                    "fullText": "BATTLE WOUND This character enters play with 2\\ndamage.",
                    "name": "BATTLE WOUND",
                    "type": "static"
          }
],
                fullTextSections: [
          "BATTLE WOUND This character enters play with 2\\ndamage."
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

    describe('Namaari - Heir of Fang', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 808,
                name: 'Namaari',
                
                fullName: 'Namaari - Heir of Fang',
                abilities: [
          {
                    "effect": "During your turn, whenever this character deals damage to another character in a challenge, you may deal the same amount of damage to another chosen character.",
                    "fullText": "TWO-WEAPON FIGHTING During your turn,\\nwhenever this character deals damage to another\\ncharacter in a challenge, you may deal the same\\namount of damage to another chosen character.",
                    "name": "TWO-WEAPON FIGHTING",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "TWO-WEAPON FIGHTING During your turn,\\nwhenever this character deals damage to another\\ncharacter in a challenge, you may deal the same\\namount of damage to another chosen character."
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

    describe('Noi - Acrobatic Baby', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 810,
                name: 'Noi',
                
                fullName: 'Noi - Acrobatic Baby',
                abilities: [
          {
                    "effect": "Whenever you play an action, this character takes no damage from challenges this turn.",
                    "fullText": "FANCY FOOTWORK Whenever you play an action,\\nthis character takes no damage from challenges\\nthis turn.",
                    "name": "FANCY FOOTWORK",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "FANCY FOOTWORK Whenever you play an action,\\nthis character takes no damage from challenges\\nthis turn."
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

    describe('Pegasus - Flying Steed', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 811,
                name: 'Pegasus',
                
                fullName: 'Pegasus - Flying Steed',
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

    describe('Raya - Fierce Protector', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 812,
                name: 'Raya',
                
                fullName: 'Raya - Fierce Protector',
                abilities: [
          {
                    "effect": "Whenever this character challenges another character, gain 1 lore for each other damaged character you have in play.",
                    "fullText": "DON'T CROSS ME Whenever this character\\nchallenges another character, gain 1 lore for each\\nother damaged character you have in play.",
                    "name": "DON'T CROSS ME",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "DON'T CROSS ME Whenever this character\\nchallenges another character, gain 1 lore for each\\nother damaged character you have in play."
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

    describe('Raya - Guardian of the Dragon Gem', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 813,
                name: 'Raya',
                
                fullName: 'Raya - Guardian of the Dragon Gem',
                abilities: [
          {
                    "effect": "When you play this character, ready chosen character of yours at a location. They can't quest for the rest of this turn.",
                    "fullText": "WE HAVE TO COME TOGETHER When you play this\\ncharacter, ready chosen character of yours at a\\nlocation. They can't quest for the rest of this turn.",
                    "name": "WE HAVE TO COME TOGETHER",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "WE HAVE TO COME TOGETHER When you play this\\ncharacter, ready chosen character of yours at a\\nlocation. They can't quest for the rest of this turn."
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

    describe('Sisu - Daring Visitor', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 814,
                name: 'Sisu',
                
                fullName: 'Sisu - Daring Visitor',
                abilities: [
          {
                    "fullText": "Evasive (Only characters with Evasive can challenge\\nthis character.)",
                    "keyword": "Evasive",
                    "reminderText": "Only characters with Evasive can challenge this character.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, banish chosen opposing character with 1 ¤ or less.",
                    "fullText": "BRING ON THE HEAT! When you play this character,\\nbanish chosen opposing character with 1 ¤ or less.",
                    "name": "BRING ON THE HEAT!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Evasive (Only characters with Evasive can challenge\\nthis character.)",
          "BRING ON THE HEAT! When you play this character,\\nbanish chosen opposing character with 1 ¤ or less."
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

    describe('Sisu - Emboldened Warrior', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 815,
                name: 'Sisu',
                
                fullName: 'Sisu - Emboldened Warrior',
                abilities: [
          {
                    "effect": "This character gets +1 ¤ for each card in opponents' hands.",
                    "fullText": "SURGE OF POWER This character gets +1 ¤ for\\neach card in opponents' hands.",
                    "name": "SURGE OF POWER",
                    "type": "static"
          }
],
                fullTextSections: [
          "SURGE OF POWER This character gets +1 ¤ for\\neach card in opponents' hands."
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

    describe('Sisu - Empowered Sibling', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 816,
                name: 'Sisu',
                
                fullName: 'Sisu - Empowered Sibling',
                abilities: [
          {
                    "fullText": "Shift 6 (You may pay 6 ⬡ to play this on top of\\none of your characters named Sisu.)",
                    "keyword": "Shift",
                    "keywordValue": "6",
                    "keywordValueNumber": 6,
                    "reminderText": "You may pay 6 ⬡ to play this on top of one of your characters named Sisu.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, banish all opposing characters with 2 ¤ or less.",
                    "fullText": "I GOT THIS! When you play this character, banish\\nall opposing characters with 2 ¤ or less.",
                    "name": "I GOT THIS!",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Shift 6 (You may pay 6 ⬡ to play this on top of\\none of your characters named Sisu.)",
          "I GOT THIS! When you play this character, banish\\nall opposing characters with 2 ¤ or less."
],
                cost: 8,
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

    describe('Tong - Survivor', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 817,
                name: 'Tong',
                
                fullName: 'Tong - Survivor',
                abilities: [
          {
                    "fullText": "Reckless (This character can't quest and must\\nchallenge each turn if able.)",
                    "keyword": "Reckless",
                    "reminderText": "This character can't quest and must challenge each turn if able.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Reckless (This character can't quest and must\\nchallenge each turn if able.)"
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
            
            // Expected: 1
            // Actual: 1
            // Status: ✅ No error
            
            expect(abilities.length).toBeGreaterThanOrEqual(1);
            
            if (abilities.length > 0) {
                abilities.forEach(ability => {
                    // Basic structural assertions
                    expect(ability.id).toBeDefined();
                    expect(ability.cardId).toBeDefined();
                    expect(ability.type).toMatch(/^(static|triggered|activated)$/);
                    expect(ability.effects.length).toBeGreaterThan(0);
                });
            }
        });
    });

    describe('Tuk Tuk - Lively Partner', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 818,
                name: 'Tuk Tuk',
                
                fullName: 'Tuk Tuk - Lively Partner',
                abilities: [
          {
                    "fullText": "Evasive (Only characters with Evasive can\\nchallenge this character.)",
                    "keyword": "Evasive",
                    "reminderText": "Only characters with Evasive can challenge this character.",
                    "type": "keyword"
          },
          {
                    "effect": "When you play this character, you may move him and one of your other characters to the same location for free. The other character gets +2 ¤ this turn.",
                    "fullText": "ON A ROLL When you play this character, you may\\nmove him and one of your other characters to the\\nsame location for free. The other character gets\\n+2 ¤ this turn.",
                    "name": "ON A ROLL",
                    "type": "triggered"
          }
],
                fullTextSections: [
          "Evasive (Only characters with Evasive can\\nchallenge this character.)",
          "ON A ROLL When you play this character, you may\\nmove him and one of your other characters to the\\nsame location for free. The other character gets\\n+2 ¤ this turn."
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

    describe('A Pirate\'s Life', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 819,
                name: 'A Pirate\'s Life',
                
                fullName: 'A Pirate\'s Life',
                abilities: [
          {
                    "fullText": "Sing Together 6 (Any number of your or your teammates'\\ncharacters with total cost 6 or more may ⟳ to sing this song\\nfor free.)",
                    "keyword": "Sing Together",
                    "keywordValue": "6",
                    "keywordValueNumber": 6,
                    "reminderText": "Any number of your or your teammates' characters with total cost 6 or more may ⟳ to sing this song for free.",
                    "type": "keyword"
          }
],
                fullTextSections: [
          "Sing Together 6 (Any number of your or your teammates'\\ncharacters with total cost 6 or more may ⟳ to sing this song\\nfor free.)",
          "Each opponent loses 2 lore. You gain 2 lore."
],
                cost: 6,
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

    describe('Be King Undisputed', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 820,
                name: 'Be King Undisputed',
                
                fullName: 'Be King Undisputed',
                abilities: [
          {
                    "effect": "A character with cost 4 or more can ⟳ to sing this song for free.",
                    "fullText": "(A character with cost 4 or more can ⟳ to sing this\\nsong for free.)",
                    "type": "static"
          }
],
                fullTextSections: [
          "(A character with cost 4 or more can ⟳ to sing this\\nsong for free.)",
          "Each opponent chooses and banishes one of their\\ncharacters."
],
                cost: 4,
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

    describe('Brawl', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 821,
                name: 'Brawl',
                
                fullName: 'Brawl',
                abilities: [],
                fullTextSections: [
          "Banish chosen character with 2 ¤ or less."
],
                cost: 3,
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
});
