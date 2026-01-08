import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 13: Conditional Effects & Special Triggers', () => {
    describe('Activated: Put Card into Inkwell', () => {
        it('should parse put card from hand into inkwell (Fishbone Quill)', () => {
            const card = {
                id: 'test-quill',
                name: 'Fishbone Quill',
                type: 'Item' as CardType,
                abilities: [{ fullText: "Go Ahead and Sign ⟳ — put any card from your hand into your inkwell facedown." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect(abilities[0].type).toBe('activated');
            expect((abilities[0] as any).effects[0].type).toBe('ink_from_hand');
        });
    });

    describe('Activated: Look and Rearrange', () => {
        it("should parse look at top X, rearrange (Ursula's Cauldron)", () => {
            const card = {
                id: 'test-cauldron',
                name: "Ursula's Cauldron",
                type: 'Item' as CardType,
                abilities: [{ fullText: "Peer into the Depths ⟳ — look at the top 2 cards of your deck. put one on the top of your deck and the other on the bottom." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('scry');
            expect((abilities[0] as any).effects[0].count).toBe(2);
            expect((abilities[0] as any).effects[0].action).toBe('one_top_one_bottom');
        });
    });

    describe('Activated: Ready + Cant Quest', () => {
        it('should parse activated ready + cant quest (Shield of Virtue)', () => {
            const card = {
                id: 'test-shield',
                name: 'Shield of Virtue',
                type: 'Item' as CardType,
                abilities: [{ fullText: "Fireproof ⟳, 3 ⬡ — ready chosen character. they can't quest for the rest of this turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects.length).toBe(2);
            expect((abilities[0] as any).effects[0].type).toBe('ready');
            expect((abilities[0] as any).effects[1].restriction).toBe('cant_quest');
        });
    });

    describe('Activated: Conditional If', () => {
        it("should parse conditional if (Beast's Mirror)", () => {
            const card = {
                id: 'test-mirror',
                name: "Beast's Mirror",
                type: 'Item' as CardType,
                abilities: [{ fullText: "Show Me ⟳, 3 ⬡ — if you have no cards in your hand, draw a card." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('conditional');
            expect((abilities[0] as any).effects[0].condition.type).toBe('hand_empty');
            expect((abilities[0] as any).effects[0].then.type).toBe('draw');
        });
    });

    describe("Activated: Can't Challenge", () => {
        it('should parse cant challenge restriction (Frying Pan)', () => {
            const card = {
                id: 'test-pan',
                name: 'Frying Pan',
                type: 'Item' as CardType,
                abilities: [{ fullText: "Clang! Banish this item — chosen character can't challenge during their next turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].restriction).toBe('cant_challenge');
        });
    });

    describe('When Banished in Challenge', () => {
        it('should parse return to hand when banished (Marshmallow)', () => {
            const card = {
                id: 'test-marshmallow',
                name: 'Marshmallow',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Durable When this character is banished in a challenge, you may return this card to your hand." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('return_to_hand');
            expect((abilities[0] as any).effects[0].optional).toBe(true);
        });
    });

    describe('Whenever You Play Named Character', () => {
        it('should parse whenever you play named character (Elsa → Anna)', () => {
            const card = {
                id: 'test-elsa',
                name: 'Elsa',
                type: 'Character' as CardType,
                abilities: [{ fullText: "That's No Blizzard Whenever you play a character named anna, ready this character. this character can't quest for the rest of this turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).triggerFilter.name).toBe('anna');
            expect((abilities[0] as any).effects.length).toBe(2);
            expect((abilities[0] as any).effects[0].type).toBe('ready');
            expect((abilities[0] as any).effects[1].restriction).toBe('cant_quest');
        });

        it('should parse whenever you play named character with exert (Fairy Godmother)', () => {
            const card = {
                id: 'test-fairy',
                name: 'Fairy Godmother',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Just Leave It to Me Whenever you play a character named cinderella, you may exert chosen character." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).triggerFilter.name).toBe('cinderella');
            expect((abilities[0] as any).effects[0].type).toBe('exert');
        });
    });
});
