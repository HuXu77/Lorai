import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Batch 49: Complex Quest Triggers & Keywords', () => {

    // 1. Complex Quest Triggers (Reveal / If / Else)
    it('should parse complex quest trigger with reveal and conditional logic (Sisu)', () => {
        const mockCard = {
            id: 1,
            name: 'Sisu',
            abilities: [{
                type: 'triggered',
                fullText: "trust builds trust whenever this character quests, reveal the top card of your deck. if it's a dragon character card, put it into your hand and repeat this effect. otherwise, put it on either the top or the bottom of your deck."
            }]
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');
        expect((abilities[0] as any).event).toBe('card_quested');
        // This is complex, might be parsed as a script or compound effect
        // For now, checking basic structure
        expect((abilities[0] as any).effects.length).toBeGreaterThan(0);
    });

    it('should parse quest trigger with inkwell interaction (Mufasa)', () => {
        const mockCard = {
            id: 2,
            name: 'Mufasa',
            abilities: [{
                type: 'triggered',
                fullText: "a delicate balance when you play this character, exert all cards in your inkwell, then return 2 cards at random from your inkwell to your hand."
            }]
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');
        expect((abilities[0] as any).event).toBe('card_played');
        expect((abilities[0] as any).effects[0].type).toBe('exert');
        expect((abilities[0] as any).effects[0].target.type).toBe('all_ink');
    });

    // 2. Shift Keyword
    it('should parse Shift keyword', () => {
        const mockCard = {
            id: 3,
            name: 'Stitch',
            abilities: [{
                type: 'static', // Keywords often marked as static or just in fullText
                fullText: "Shift 4 ⬡ (You may pay 4 ⬡ to play this on top of one of your characters named Stitch.)"
            }]
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('static'); // Or keyword type if we define one
        expect((abilities[0] as any).keyword).toBe('shift');
        expect((abilities[0] as any).value).toBe(4);
    });

    // 3. Boost Keyword
    it('should parse Boost keyword', () => {
        const mockCard = {
            id: 4,
            name: 'Gaston',
            abilities: [{
                type: 'activated', // Boost is technically activated "Once per turn..."
                fullText: "Boost 2 ⬡ (Once during your turn, you may pay 2 ⬡ to put the top card of your deck facedown under this character.)"
            }]
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('activated');
        expect((abilities[0] as any).keyword).toBe('boost');
        expect((abilities[0] as any).costs[0].amount).toBe(2);
    });

    // 4. Quest Trigger with Negative Effect (Isabela)
    it('should parse quest trigger with negative effect on others', () => {
        const mockCard = {
            id: 5,
            name: 'Isabela Madrigal',
            abilities: [{
                type: 'triggered',
                fullText: "whenever this character quests, your other characters can't quest for the rest of this turn."
            }]
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');
        expect((abilities[0] as any).event).toBe('card_quested');
        expect((abilities[0] as any).effects[0].type).toBe('restriction');
        expect((abilities[0] as any).effects[0].restriction).toBe('cant_quest');
    });
});
