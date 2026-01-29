import { TestHarness } from '../../engine-test-utils';

describe('Generated Execution Tests Batch 1', () => {

    describe('Merlin - Goat - Gain Lore', () => {
        it('should gain 1 lore when played', async () => {
            const test = new TestHarness();
            await test.initialize();
            const player = test.getPlayer('Player 1');
            
            // Setup
            test.setHand('Player 1', ['Merlin - Goat']);
            test.setInk('Player 1', 10); // sufficient ink
            
            const initialLore = player.lore;
            
            // Execute
            await test.playCard('Player 1', 'Merlin - Goat');
            
            // Verify
            expect(player.lore).toBe(initialLore + 1);
        });
    });

    describe('Hans - Noble Scoundrel - Gain Lore', () => {
        it('should gain 1 lore when played', async () => {
            const test = new TestHarness();
            await test.initialize();
            const player = test.getPlayer('Player 1');
            
            // Setup
            test.setHand('Player 1', ['Hans - Noble Scoundrel']);
            test.setInk('Player 1', 10); // sufficient ink
            
            const initialLore = player.lore;
            
            // Execute
            await test.playCard('Player 1', 'Hans - Noble Scoundrel');
            
            // Verify
            expect(player.lore).toBe(initialLore + 1);
        });
    });

    describe('Robin Hood - Archery Contestant - Gain Lore', () => {
        it('should gain 1 lore when played', async () => {
            const test = new TestHarness();
            await test.initialize();
            const player = test.getPlayer('Player 1');
            
            // Setup
            test.setHand('Player 1', ['Robin Hood - Archery Contestant']);
            test.setInk('Player 1', 10); // sufficient ink
            
            const initialLore = player.lore;
            
            // Execute
            await test.playCard('Player 1', 'Robin Hood - Archery Contestant');
            
            // Verify
            expect(player.lore).toBe(initialLore + 1);
        });
    });

    describe('The White Rose - Jewel of the Garden - Gain Lore', () => {
        it('should gain 1 lore when played', async () => {
            const test = new TestHarness();
            await test.initialize();
            const player = test.getPlayer('Player 1');
            
            // Setup
            test.setHand('Player 1', ['The White Rose - Jewel of the Garden']);
            test.setInk('Player 1', 10); // sufficient ink
            
            const initialLore = player.lore;
            
            // Execute
            await test.playCard('Player 1', 'The White Rose - Jewel of the Garden');
            
            // Verify
            expect(player.lore).toBe(initialLore + 1);
        });
    });

    describe('Alistair Krei - Ambitious Entrepreneur - Gain Lore', () => {
        it('should gain 1 lore when played', async () => {
            const test = new TestHarness();
            await test.initialize();
            const player = test.getPlayer('Player 1');
            
            // Setup
            test.setHand('Player 1', ['Alistair Krei - Ambitious Entrepreneur']);
            test.setInk('Player 1', 10); // sufficient ink
            
            const initialLore = player.lore;
            
            // Execute
            await test.playCard('Player 1', 'Alistair Krei - Ambitious Entrepreneur');
            
            // Verify
            expect(player.lore).toBe(initialLore + 1);
        });
    });

    describe('Moana - Kakamora Leader - Gain Lore', () => {
        it('should gain 1 lore when played', async () => {
            const test = new TestHarness();
            await test.initialize();
            const player = test.getPlayer('Player 1');
            
            // Setup
            test.setHand('Player 1', ['Moana - Kakamora Leader']);
            test.setInk('Player 1', 10); // sufficient ink
            
            const initialLore = player.lore;
            
            // Execute
            await test.playCard('Player 1', 'Moana - Kakamora Leader');
            
            // Verify
            expect(player.lore).toBe(initialLore + 1);
        });
    });

    describe('Cinderella - The Right One - Gain Lore', () => {
        it('should gain 3 lore when played', async () => {
            const test = new TestHarness();
            await test.initialize();
            const player = test.getPlayer('Player 1');
            
            // Setup
            test.setHand('Player 1', ['Cinderella - The Right One']);
            test.setInk('Player 1', 10); // sufficient ink
            
            const initialLore = player.lore;
            
            // Execute
            await test.playCard('Player 1', 'Cinderella - The Right One');
            
            // Verify
            expect(player.lore).toBe(initialLore + 3);
        });
    });

    describe('Honeymaren - Northuldra Guide - Gain Lore', () => {
        it('should gain 1 lore when played', async () => {
            const test = new TestHarness();
            await test.initialize();
            const player = test.getPlayer('Player 1');
            
            // Setup
            test.setHand('Player 1', ['Honeymaren - Northuldra Guide']);
            test.setInk('Player 1', 10); // sufficient ink
            
            const initialLore = player.lore;
            
            // Execute
            await test.playCard('Player 1', 'Honeymaren - Northuldra Guide');
            
            // Verify
            expect(player.lore).toBe(initialLore + 1);
        });
    });

    describe('Mirabel Madrigal - Curious Child - Gain Lore', () => {
        it('should gain 1 lore when played', async () => {
            const test = new TestHarness();
            await test.initialize();
            const player = test.getPlayer('Player 1');
            
            // Setup
            test.setHand('Player 1', ['Mirabel Madrigal - Curious Child']);
            test.setInk('Player 1', 10); // sufficient ink
            
            const initialLore = player.lore;
            
            // Execute
            await test.playCard('Player 1', 'Mirabel Madrigal - Curious Child');
            
            // Verify
            expect(player.lore).toBe(initialLore + 1);
        });
    });

    describe('Bambi - Little Prince - Gain Lore', () => {
        it('should gain 1 lore when played', async () => {
            const test = new TestHarness();
            await test.initialize();
            const player = test.getPlayer('Player 1');
            
            // Setup
            test.setHand('Player 1', ['Bambi - Little Prince']);
            test.setInk('Player 1', 10); // sufficient ink
            
            const initialLore = player.lore;
            
            // Execute
            await test.playCard('Player 1', 'Bambi - Little Prince');
            
            // Verify
            expect(player.lore).toBe(initialLore + 1);
        });
    });

    describe('Bambi - Little Prince - Gain Lore', () => {
        it('should gain 1 lore when played', async () => {
            const test = new TestHarness();
            await test.initialize();
            const player = test.getPlayer('Player 1');
            
            // Setup
            test.setHand('Player 1', ['Bambi - Little Prince']);
            test.setInk('Player 1', 10); // sufficient ink
            
            const initialLore = player.lore;
            
            // Execute
            await test.playCard('Player 1', 'Bambi - Little Prince');
            
            // Verify
            expect(player.lore).toBe(initialLore + 1);
        });
    });

    describe('Genie - Towering Phantasm - Gain Lore', () => {
        it('should gain 3 lore when played', async () => {
            const test = new TestHarness();
            await test.initialize();
            const player = test.getPlayer('Player 1');
            
            // Setup
            test.setHand('Player 1', ['Genie - Towering Phantasm']);
            test.setInk('Player 1', 10); // sufficient ink
            
            const initialLore = player.lore;
            
            // Execute
            await test.playCard('Player 1', 'Genie - Towering Phantasm');
            
            // Verify
            expect(player.lore).toBe(initialLore + 3);
        });
    });

    describe('Hans - Noble Scoundrel - Gain Lore', () => {
        it('should gain 1 lore when played', async () => {
            const test = new TestHarness();
            await test.initialize();
            const player = test.getPlayer('Player 1');
            
            // Setup
            test.setHand('Player 1', ['Hans - Noble Scoundrel']);
            test.setInk('Player 1', 10); // sufficient ink
            
            const initialLore = player.lore;
            
            // Execute
            await test.playCard('Player 1', 'Hans - Noble Scoundrel');
            
            // Verify
            expect(player.lore).toBe(initialLore + 1);
        });
    });

    describe('Lena Sabrewing - Mysterious Duck - Gain Lore', () => {
        it('should gain 1 lore when played', async () => {
            const test = new TestHarness();
            await test.initialize();
            const player = test.getPlayer('Player 1');
            
            // Setup
            test.setHand('Player 1', ['Lena Sabrewing - Mysterious Duck']);
            test.setInk('Player 1', 10); // sufficient ink
            
            const initialLore = player.lore;
            
            // Execute
            await test.playCard('Player 1', 'Lena Sabrewing - Mysterious Duck');
            
            // Verify
            expect(player.lore).toBe(initialLore + 1);
        });
    });

    describe('Coldstone - Reincarnated Cyborg - Gain Lore', () => {
        it('should gain 2 lore when played', async () => {
            const test = new TestHarness();
            await test.initialize();
            const player = test.getPlayer('Player 1');
            
            // Setup
            test.setHand('Player 1', ['Coldstone - Reincarnated Cyborg']);
            test.setInk('Player 1', 10); // sufficient ink
            
            const initialLore = player.lore;
            
            // Execute
            await test.playCard('Player 1', 'Coldstone - Reincarnated Cyborg');
            
            // Verify
            expect(player.lore).toBe(initialLore + 2);
        });
    });
});
