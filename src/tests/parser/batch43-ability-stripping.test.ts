import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Batch 43: Ability Name Stripping', () => {
    it('should strip "animate broom" ability name (Mickey Mouse)', () => {
        const mockCard = {
            id: 1,
            name: 'Mickey Mouse',
            abilities: ['animate broom you pay 1 ⬡ less to play broom\ncharacters.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('static');
        // Should parse as cost reduction effect
    });

    it('should strip "fervent address" ability name (Lumiere)', () => {
        const mockCard = {
            id: 2,
            name: 'Lumiere',
            abilities: ['fervent address your other characters get +1 ¤.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('static');
        // Should parse as global stat buff
    });

    it('should strip "to the rescue" ability name (Pluto)', () => {
        const mockCard = {
            id: 3,
            name: 'Pluto',
            abilities: ['to the rescue when you play this character,\nyou may remove up to 3 damage from one of your\ncharacters.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');
        expect((abilities[0] as any).event).toBe('card_played');
    });

    it('should strip "here\'s the trade-off" ability name (Hades)', () => {
        const mockCard = {
            id: 4,
            name: 'Hades',
            abilities: ['here\'s the trade-off ⟳, banish one of your\nother characters — play a character with the same\nname as the banished character for free.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('activated');
    });

    it('should strip "how do you do?" ability name (Snow White)', () => {
        const mockCard = {
            id: 5,
            name: 'Snow White',
            abilities: ['how do you do? you pay 1 ⬡ less to play seven\ndwarfs characters.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('static');
    });

    it('should strip "under arrest" ability name (Gantu)', () => {
        const mockCard = {
            id: 6,
            name: 'Gantu',
            abilities: ['under arrest characters with cost 2 or less\ncan\'t challenge your characters.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('static');
    });

    it('should strip "stolen away" ability name (Golden Harp)', () => {
        const mockCard = {
            id: 7,
            name: 'Golden Harp',
            abilities: ['stolen away at the end of your turn, if you\ndidn\'t play a song this turn, banish this character.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');
    });

    it('should strip "we have to come together" ability name (Raya)', () => {
        const mockCard = {
            id: 8,
            name: 'Raya',
            abilities: ['we have to come together when you play this\ncharacter, ready chosen character of yours at a\nlocation. they can\'t quest for the rest of this turn.']
        } as any;

        const abilities = parseToAbilityDefinition(mockCard);

        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');
    });
});
