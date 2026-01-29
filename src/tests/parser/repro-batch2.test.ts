import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { Card } from '../../engine/models';

describe('Batch 2 Reproduction Tests', () => {
    describe('Musketeer Tabard (Batch 22)', () => {
        it('should parse whenever bodyguard banished', () => {
            const card: Card = {
                id: 'musketeer-tabard-1',
                name: 'Musketeer Tabard',
                abilities: [
                    {
                        type: 'triggered',
                        fullText: "All for One Whenever one of your characters with Bodyguard is banished, you may draw a card."
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_banished');
            expect((abilities[0] as any).condition.type).toBe('character_with_keyword_banished');
            expect((abilities[0] as any).condition.keyword).toBe('bodyguard');
        });
    });

    describe('Genie - Phenomenal Showman (Batch 47)', () => {
        it('should parse while exerted opposing ready prevention', () => {
            const card: Card = {
                id: 'genie-showman-1',
                name: 'Genie - Phenomenal Showman',
                abilities: [
                    {
                        type: 'static',
                        fullText: "As Long as I'm Here While this character is exerted, opposing characters can't ready at the start of their turn."
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).effects[0].type).toBe('cant_ready');
            // expect((abilities[0] as any).effects[0].restriction).toBe('cant_ready');
            expect((abilities[0] as any).condition.type).toBe('self_exerted');
        });
    });

    describe('Rise of the Titans (Batch 40)', () => {
        it('should parse each player chooses and banishes', () => {
            const card: Card = {
                id: 'rise-titans-1',
                name: 'Rise of the Titans',
                type: 'Action',
                abilities: [
                    {
                        type: 'static', // Action card effect
                        fullText: "Each player chooses and banishes one of their characters, items, or locations."
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated'); // Action cards are activated
            expect((abilities[0] as any).effects[0].type).toBe('each_player_chooses_action');
            expect((abilities[0] as any).effects[0].action).toBe('banish');
        });
    });

    describe('Pooh Pirate Ship (Batch 38)', () => {
        it('should parse activated return specific type from discard', () => {
            const card: Card = {
                id: 'pooh-pirate-ship-1',
                name: 'Pooh Pirate Ship',
                abilities: [
                    {
                        type: 'activated',
                        fullText: "Make a Rescue ⟳, 3 ⬡ — Return a Pirate character card from your discard to your hand."
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated');
            expect((abilities[0] as any).effects[0].type).toBe('return_from_discard');
            expect((abilities[0] as any).effects[0].target.type).toBe('chosen_card_in_discard');
            expect((abilities[0] as any).effects[0].target.filter.cardType).toBe('character');
            expect((abilities[0] as any).effects[0].target.filter.subtype).toBe('pirate');
        });
    });

    describe('Chief Bogo (Batch 38)', () => {
        it('should parse while you have a character named X in play', () => {
            const card: Card = {
                id: 'chief-bogo-1',
                name: 'Chief Bogo',
                abilities: [
                    {
                        type: 'static',
                        fullText: "You Like Gazelle Too? While you have a character named Gazelle in play, this character gains Singer 6."
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).effects[0].condition.type).toBe('presence');
            expect((abilities[0] as any).effects[0].condition.filter.name).toBe('Gazelle');
            expect((abilities[0] as any).effects[0].type).toBe('grant_keyword');
            expect((abilities[0] as any).effects[0].keyword).toBe('Singer');
        });
    });
});
