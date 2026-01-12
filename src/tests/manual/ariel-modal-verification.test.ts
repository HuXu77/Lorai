
import { TestHarness } from '../engine-test-utils';
import { CardInstance } from '../../engine/models';
import { EffectExecutor } from '../../engine/abilities/executor';

describe('Ariel - Spectacular Singer Modal Verification', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should present all cards in look_and_move choice with correct validity and ability text', async () => {
        const player = harness.getPlayer(harness.p1Id);

        // Mock requestChoice on turnManager
        const mockRequestChoice = vi.fn().mockImplementation(async (request: any) => {
            return {
                requestId: request.id,
                playerId: request.playerId,
                selectedIds: [],
                declined: true
            };
        });

        (harness.turnManager as any).requestChoice = mockRequestChoice;

        const ariel = {
            instanceId: 'ariel-instance',
            name: 'Ariel - Spectacular Singer',
            fullName: 'Ariel - Spectacular Singer',
            ownerId: player.id
        } as CardInstance;

        // Create deck cards (Songs and not Songs)
        const song1 = { instanceId: 'song-1', name: 'Song 1', type: 'Action', subtypes: ['Song'], ownerId: player.id } as CardInstance;
        const char1 = { instanceId: 'char-1', name: 'Char 1', type: 'Character', subtypes: ['Storyborn'], ownerId: player.id } as CardInstance;

        // executeLookAndMove pops from end of array
        player.deck = [char1, song1]; // Pop order: song1, char1

        // Mock Context
        const context = {
            game: harness.game,
            player: player,
            card: ariel,
            abilityName: 'Musical Debut',
            abilityText: 'Full ability text for Ariel'
        };

        // Effect definition
        const effect = {
            type: 'look_and_move',
            amount: 2,
            filter: { cardType: 'song' }, // Filter for Songs
            destination: 'hand',
            optional: true
        };

        const executor = new EffectExecutor(harness.turnManager);

        // Call execute. It delegates to executeLookAndMove
        await executor.execute(effect, context);

        expect(mockRequestChoice).toHaveBeenCalled();
        const request = mockRequestChoice.mock.calls[0][0];

        // VALIDATION

        // 1. Check Ability Text
        expect(request.source.abilityText).toBe('Full ability text for Ariel');

        // 2. Check Options
        const options = request.options;
        expect(options.length).toBe(2);

        // Song should be valid
        const songOpt = options.find((o: any) => o.id === 'song-1');
        expect(songOpt.valid).toBe(true);
        expect(songOpt.card).toBeDefined(); // Should pass card for full display
        expect(songOpt.card.instanceId).toBe('song-1');

        // Char should be invalid
        const charOpt = options.find((o: any) => o.id === 'char-1');
        expect(charOpt.valid).toBe(false); // Filter is 'song'
        expect(charOpt.invalidReason).toBeDefined();
        expect(charOpt.card).toBeDefined(); // Should still pass card
    });
});
