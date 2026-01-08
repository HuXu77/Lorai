import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Batch 11: Activated Abilities & Temporary Effects', () => {
    describe("Ready + Can't Quest Combo", () => {
        it("should parse ready chosen character + can't quest (Fan the Flames)", () => {
            const card = {
                id: 'test-fan',
                name: 'Fan the Flames',
                type: 'Action',
                abilities: [{ fullText: "Ready chosen character. they can't quest for the rest of this turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect(abilities[0].type).toBe('activated');
            expect((abilities[0] as any).effects.length).toBe(2);
            expect((abilities[0] as any).effects[0].type).toBe('ready');
            expect((abilities[0] as any).effects[1].type).toBe('restriction');
            expect((abilities[0] as any).effects[1].restriction).toBe('cant_quest');
        });
    });

    describe('Temporary Keyword Grants', () => {
        it('should parse temporary rush (Cut to the Chase)', () => {
            const card = {
                id: 'test-cut',
                name: 'Cut to the Chase',
                type: 'Action',
                abilities: [{ fullText: "Chosen character gains rush this turn. (they can challenge the turn they're played.)" }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('grant_keyword');
            expect((abilities[0] as any).effects[0].keyword).toBe('rush');
            expect((abilities[0] as any).effects[0].duration).toBe('turn');
        });
    });

    describe('Activated Cost Reduction', () => {
        it('should parse cost reduction (Lantern)', () => {
            const card = {
                id: 'test-lantern',
                name: 'Lantern',
                type: 'Item',
                abilities: [{ fullText: "Birthday Lights ⟳ — you pay 1 ⬡ less for the next character you play this turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect(abilities[0].type).toBe('activated');
            expect((abilities[0] as any).effects[0].type).toBe('cost_reduction');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
        });
    });

    describe('Temporary Stat Buffs', () => {
        it('should parse temporary lore buff (Eye of the Fates)', () => {
            const card = {
                id: 'test-eye',
                name: 'Eye of the Fates',
                type: 'Item',
                abilities: [{ fullText: "See the Future ⟳ — chosen character gets +1 ◊ this turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('modify_stats');
            expect((abilities[0] as any).effects[0].stat).toBe('lore');
            expect((abilities[0] as any).effects[0].amount).toBe(1);
        });
    });

    describe('Damaged Filter', () => {
        it('should parse damage to chosen damaged character (Stampede)', () => {
            const card = {
                id: 'test-stampede',
                name: 'Stampede',
                type: 'Action',
                abilities: [{ fullText: "Deal 2 damage to chosen damaged character." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('damage');
            expect((abilities[0] as any).effects[0].amount).toBe(2);
            expect((abilities[0] as any).effects[0].target.type).toBe('chosen_character');
            expect((abilities[0] as any).effects[0].target.filter.damaged).toBe(true);
        });
    });

    describe('Each Opponent Effects', () => {
        it('should parse each opponent loses lore (Tangle)', () => {
            const card = {
                id: 'test-tangle',
                name: 'Tangle',
                type: 'Action',
                abilities: [{ fullText: "Each opponent loses 1 lore." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('lore_loss');
            expect((abilities[0] as any).effects[0].target.type).toBe('all_opponents');
        });

        it('should parse each opponent discards (You Have Forgotten Me)', () => {
            const card = {
                id: 'test-forgotten',
                name: 'You Have Forgotten Me',
                type: 'Action',
                abilities: [{ fullText: "Each opponent chooses and discards 2 cards." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).effects[0].type).toBe('opponent_discard_choice');
            expect((abilities[0] as any).effects[0].amount).toBe(2);
        });
    });
});
