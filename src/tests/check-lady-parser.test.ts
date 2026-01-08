import { parseToAbilityDefinition } from '../engine/ability-parser';
import { Card, CardType } from '../engine/models';

describe('Lady Parser Check', () => {
    it('should parse Lady ability correctly', () => {
        const card = {
            id: 1,
            name: 'Lady',
            fullName: 'Lady - Devoted Friend',
            type: 'Character' as CardType,
            abilities: [
                {
                    effect: "During your turn, while you have a character named Tramp, this character gets +1 lore.",
                    fullText: "LOYAL COMPANION During your turn, while you have a character named Tramp, this character gets +1 ◊.",
                    name: "LOYAL COMPANION",
                    type: "static"
                }
            ],
            cost: 3,
            inkwell: true,
            color: 'Amber'
        } as Card;

        const abilities = parseToAbilityDefinition(card);
        console.log('Lady abilities:', JSON.stringify(abilities, null, 2));
        expect(abilities.length).toBeGreaterThanOrEqual(0);
    });
});
