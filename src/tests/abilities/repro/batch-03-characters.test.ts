import { parseToAbilityDefinition } from '../../../engine/ability-parser';
import { CardType } from '../../../engine/models';

describe('Batch 3: Characters Reproduction Tests', () => {

    describe('Go Go Tomago - Mechanical Engineer', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1823,
                name: 'Go Go Tomago',
                fullName: 'Go Go Tomago - Mechanical Engineer',
                abilities: [
                    {
                        "effect": "When you play a Floodborn character on this card, you may put the top card of your deck into your inkwell facedown and exerted.",
                        "fullText": "NEED THIS! When you play a Floodborn character\\non this card, you may put the top card of your\\ndeck into your inkwell facedown and exerted.",
                        "name": "NEED THIS!",
                        "type": "triggered"
                    }
                ],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
        });
    });

    describe('Aladdin - Vigilant Guard', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1834,
                name: 'Aladdin',
                fullName: 'Aladdin - Vigilant Guard',
                abilities: [
                    {
                        "fullText": "Bodyguard (This character may enter play exerted.\\nAn opposing character who challenges one of your\\ncharacters must choose one with Bodyguard if able.)",
                        "keyword": "Bodyguard",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever one of your Ally characters quests, you may remove up to 2 damage from this character.",
                        "fullText": "SAFE PASSAGE Whenever one of your Ally characters\\nquests, you may remove up to 2 damage from this\\ncharacter.",
                        "name": "SAFE PASSAGE",
                        "type": "triggered"
                    }
                ],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Sapphire-Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(2);
        });
    });

    describe('Namaari - Single-Minded Rival', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1862,
                name: 'Namaari',
                fullName: 'Namaari - Single-Minded Rival',
                abilities: [
                    {
                        "effect": "When you play this character and at the start of your turn, you may draw a card, then choose and discard a card.",
                        "fullText": "STRATEGIC EDGE When you play this character\\nand at the start of your turn, you may draw a card,\\nthen choose and discard a card.",
                        "name": "STRATEGIC EDGE",
                        "type": "triggered"
                    },
                    {
                        "effect": "This character gets +1 ¤ for each card in your discard.",
                        "fullText": "EXTREME FOCUS This character gets +1 ¤ for\\neach card in your discard.",
                        "name": "EXTREME FOCUS",
                        "type": "static"
                    }
                ],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(2);
        });
    });

    describe('Goofy - Emerald Champion', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 2280,
                name: 'Goofy',
                fullName: 'Goofy - Emerald Champion',
                abilities: [
                    {
                        "effect": "Whenever one of your other Emerald characters is challenged and banished, banish the challenging character.",
                        "fullText": "EVEN THE SCORE Whenever one of your other\\nEmerald characters is challenged and banished,\\nbanish the challenging character.",
                        "name": "EVEN THE SCORE",
                        "type": "triggered"
                    },
                    {
                        "effect": "Your other Emerald characters gain Ward. (Opponents can't choose them except to challenge.)",
                        "fullText": "PROVIDE COVER Your other Emerald characters\\ngain Ward. (Opponents can't choose them except\\nto challenge.)",
                        "name": "PROVIDE COVER",
                        "type": "static"
                    }
                ],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(2);
        });
    });

    describe('Rama - Vigilant Father', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 2298,
                name: 'Rama',
                fullName: 'Rama - Vigilant Father',
                abilities: [
                    {
                        "effect": "Whenever you play another character with 5 ¤ or more, you may ready this character. If you do, he can't quest for the rest of this turn.",
                        "fullText": "PROTECTION OF THE PACK Whenever you play\\nanother character with 5 ¤ or more, you may\\nready this character. If you do, he can't quest for\\nthe rest of this turn.",
                        "name": "PROTECTION OF THE PACK",
                        "type": "triggered"
                    }
                ],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
        });
    });

    describe('Goliath - Guardian of Castle Wyvern', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 2308,
                name: 'Goliath',
                fullName: 'Goliath - Guardian of Castle Wyvern',
                abilities: [
                    {
                        "effect": "Whenever one of your Gargoyle characters challenges another character, gain 1 lore.",
                        "fullText": "BE CAREFUL, ALL OF YOU Whenever one of\\nyour Gargoyle characters challenges another\\ncharacter, gain 1 lore.",
                        "name": "BE CAREFUL, ALL OF YOU",
                        "type": "triggered"
                    },
                    {
                        "effect": "If you have 3 or more cards in your hand, this character can't ready.",
                        "fullText": "STONE BY DAY If you have 3 or more cards in your\\nhand, this character can't ready.",
                        "name": "STONE BY DAY",
                        "type": "static"
                    }
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(2);
        });
    });

    describe('Brom Bones - Burly Bully', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 2316,
                name: 'Brom Bones',
                fullName: 'Brom Bones - Burly Bully',
                abilities: [
                    {
                        "effect": "Whenever this character challenges a character with 2 ¤ or less, each opponent loses 1 lore.",
                        "fullText": "ROUGH AND TUMBLE Whenever this character\\nchallenges a character with 2 ¤ or less, each\\nopponent loses 1 lore.",
                        "name": "ROUGH AND TUMBLE",
                        "type": "triggered"
                    }
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
        });
    });

    describe('Daisy Duck - Sapphire Champion', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 2347,
                name: 'Daisy Duck',
                fullName: 'Daisy Duck - Sapphire Champion',
                abilities: [
                    {
                        "effect": "Your other Sapphire characters gain Resist +1. (Damage dealt to them is reduced by 1.)",
                        "fullText": "STAND FAST Your other Sapphire characters gain\\nResist +1. (Damage dealt to them is reduced by 1.)",
                        "name": "STAND FAST",
                        "type": "static"
                    },
                    {
                        "effect": "Whenever one of your other Sapphire characters quests, you may look at the top card of your deck. Put it on either the top or the bottom of your deck.",
                        "fullText": "LOOK AHEAD Whenever one of your other\\nSapphire characters quests, you may look at the\\ntop card of your deck. Put it on either the top or\\nthe bottom of your deck.",
                        "name": "LOOK AHEAD",
                        "type": "triggered"
                    }
                ],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(2);
        });
    });

    describe('Goliath - Clan Leader', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 2362,
                name: 'Goliath',
                fullName: 'Goliath - Clan Leader',
                abilities: [
                    {
                        "effect": "At the end of each player's turn, if they have more than 2 cards in their hand, they choose and discard cards until they have 2. If they have fewer than 2 cards in their hand, they draw until they have 2.",
                        "fullText": "DUSK TO DAWN At the end of each player's turn, if they\\nhave more than 2 cards in their hand, they choose and\\ndiscard cards until they have 2. If they have fewer than 2\\ncards in their hand, they draw until they have 2.",
                        "name": "DUSK TO DAWN",
                        "type": "triggered"
                    },
                    {
                        "effect": "If you have 3 or more cards in your hand, this character can't ready.",
                        "fullText": "STONE BY DAY If you have 3 or more cards in your hand,\\nthis character can't ready.",
                        "name": "STONE BY DAY",
                        "type": "static"
                    }
                ],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(2);
        });
    });

    describe('Basil - Tenacious Mouse', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 2368,
                name: 'Basil',
                fullName: 'Basil - Tenacious Mouse',
                abilities: [
                    {
                        "effect": "Whenever you play another Detective character, this character gains Resist +1 until the start of your next turn. (Damage dealt to them is reduced by 1.)",
                        "fullText": "HOLD YOUR GROUND Whenever you play another\\nDetective character, this character gains Resist +1\\nuntil the start of your next turn. (Damage dealt to\\nthem is reduced by 1.)",
                        "name": "HOLD YOUR GROUND",
                        "type": "triggered"
                    }
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
        });
    });

});
