import { GameStateManager } from '../engine/state';
import { TurnManager } from '../engine/actions';
import { CardLoader } from '../engine/card-loader';
import { CardInstance, ZoneType, CardType, ActionType } from '../engine/models';
import { parseToAbilityDefinition } from '../engine/ability-parser';

// Mock Logger for tests
class MockLogger {
    log(level: any, message: string, data?: unknown) { console.log(message, data); }
    debug(message: string, data?: unknown) { console.debug(message, data); }
    info(message: string, data?: unknown) { console.info(message, data); }
    warn(message: string, data?: unknown) { console.warn(message, data); }
    error(message: string, data?: unknown) { console.error(message, data); }
    action(player: string, action: string, details?: string) { console.log('[ACTION]', `${player} ${action}${details ? ': ' + details : ''}`); }
    effect(source: string, effect: string, target?: string) { console.log('[EFFECT]', `${source} -> ${effect}${target ? ' on ' + target : ''}`); }
}

export class TestHarness {
    game: GameStateManager;
    turnManager: TurnManager;
    loader: CardLoader;
    p1Id: string;
    p2Id: string;

    constructor() {
        this.loader = new CardLoader();
        this.game = new GameStateManager();
        this.turnManager = new TurnManager(this.game, new MockLogger());

        // Override emitChoiceRequest to auto-select for testing
        this.turnManager.emitChoiceRequest = async (choice: any) => {
            (this.game.state as any).pendingChoice = choice;

            // For optional effects: auto-accept with 'yes'
            // For target choices: auto-select first available option
            let selectedIds: string[] = [];

            if (choice.options && choice.options.length > 0) {
                // Auto-select first valid option
                const validOption = choice.options.find((o: any) => o.valid !== false);
                if (validOption) {
                    selectedIds = [validOption.id];
                }
            } else if (choice.type === 'optional_prompt' || choice.type === 'confirm') {
                // Auto-accept optional effects
                selectedIds = ['yes'];
            }

            return {
                requestId: choice.id,
                playerId: choice.playerId,
                selectedIds,
                timestamp: Date.now()
            };
        };
        this.p1Id = 'Player 1';
        this.p2Id = 'Player 2';

        // Register default handlers that route to emitChoiceRequest
        this.turnManager.registerChoiceHandler(this.p1Id, (req) => this.turnManager.emitChoiceRequest(req));
        this.turnManager.registerChoiceHandler(this.p2Id, (req) => this.turnManager.emitChoiceRequest(req));
    }

    async initialize() {
        await this.loader.loadCards();
        this.game.addPlayer(this.p1Id, 'Player 1');
        this.game.addPlayer(this.p2Id, 'Player 2');
        this.turnManager.startGame(this.p1Id);
    }

    // Backward compatibility: allow tests to call harness.getPlayer() instead of harness.game.getPlayer()
    getPlayer(playerId: string) {
        return this.game.getPlayer(playerId);
    }

    // Backward compatibility: setInk for tests that call harness.setInk(playerId, amount)
    setInk(playerId: string, amount: number) {
        const player = this.game.getPlayer(playerId);
        // Set inkwell cards to match amount needed
        player.inkwell = [];
        for (let i = 0; i < amount; i++) {
            const inkCard = {
                id: 9999,
                fullName: `Ink ${i}`,
                instanceId: `ink-${i}`,
                name: `Ink ${i}`,
                type: 'Character',
                cost: 0,
                inkwell: true,
                color: 'Amber',
                ownerId: playerId,
                zone: ZoneType.Inkwell,
                ready: true,
                damage: 0,
                turnPlayed: 0,
                subtypes: [],
                abilities: [],
                meta: {}
            } as any as CardInstance;
            player.inkwell.push(inkCard);
        }
    }

    async initGame(p1Hand: string[], p2Hand: string[]) {
        await this.initialize();
        this.setHand(this.p1Id, p1Hand);
        this.setHand(this.p2Id, p2Hand);
    }

    logBoardState() {
        const p1 = this.game.getPlayer(this.p1Id);
        const p2 = this.game.getPlayer(this.p2Id);

        console.log('\n──────────────── Your Board ─────────────────');
        p1.play.forEach((c, i) => {
            console.log(`  ${i}: [${c.ready ? 'READY' : 'EXERTED'}]   ${c.name} (S:${c.strength}/W:${c.willpower}|L:${c.lore})`);
        });

        console.log('\n─────────────── Opponent\'s Board ───────────────');
        p2.play.forEach((c, i) => {
            console.log(`  ${i}: [${c.ready ? 'READY' : 'EXERTED'}]   ${c.name} (S:${c.strength}/W:${c.willpower}|L:${c.lore})`);
        });
        console.log('────────────────────────────────────────────\n');
    }

    getCard(name: string) {
        const allCards = this.loader.getAllCards();
        const exact = allCards.find(c => c.name === name || c.fullName === name);
        if (exact) return exact;
        return allCards.find(c => c.name.includes(name) || c.fullName.includes(name));
    }

    setHand(playerId: string, cards: (string | Partial<CardInstance>)[]) {
        const player = this.game.getPlayer(playerId);
        player.hand = cards.map((cardData, index) => {
            let baseCard: Partial<CardInstance> | undefined;

            if (typeof cardData === 'string') {
                baseCard = this.getCard(cardData);
                if (!baseCard) throw new Error(`Card not found: ${cardData}`);
            } else {
                baseCard = cardData;
                if (!baseCard.name) throw new Error(`Card object must have a 'name' property: ${JSON.stringify(cardData)}`);
                if (!baseCard.type) throw new Error(`Card object must have a 'type' property: ${JSON.stringify(cardData)}`);
            }


            const cardInstance = {
                ...baseCard,
                instanceId: baseCard.instanceId || `hand-${index}-${baseCard.name?.replace(/\s/g, '-') || 'unknown'}`,
                ownerId: playerId,
                zone: ZoneType.Hand,
                ready: baseCard.ready !== undefined ? baseCard.ready : true,
                damage: baseCard.damage !== undefined ? baseCard.damage : 0,
                turnPlayed: baseCard.turnPlayed !== undefined ? baseCard.turnPlayed : 0,
                meta: baseCard.meta || {},
                baseStrength: baseCard.strength,
                baseWillpower: baseCard.willpower,
                baseLore: baseCard.lore,
                baseCost: baseCard.cost,
                subtypes: baseCard.subtypes || [],
                parsedEffects: baseCard.parsedEffects || [],
            } as CardInstance;

            // CRITICAL FIX: Parse abilities just like setPlay does
            // This ensures test cards with 'abilities' array get properly parsed
            if (!cardInstance.parsedEffects || cardInstance.parsedEffects.length === 0) {
                if (cardInstance.abilities && cardInstance.abilities.length > 0) {
                    cardInstance.parsedEffects = parseToAbilityDefinition(cardInstance) as any;
                }
            }

            return cardInstance;
        });
    }

    setInkwell(playerId: string, cardNames: string[], ready: boolean = true) {
        const player = this.game.getPlayer(playerId);
        player.inkwell = cardNames.map((name, index) => {
            const card = this.getCard(name);
            if (!card) throw new Error(`Card not found: ${name}`);
            return {
                ...card,
                instanceId: `ink-${index}`,
                ownerId: playerId,
                zone: ZoneType.Inkwell,
                ready: ready,
                damage: 0,
                turnPlayed: 0,
                meta: {},
                baseStrength: card.strength,
                baseWillpower: card.willpower,
                baseLore: card.lore,
                baseCost: card.cost
            } as CardInstance;
        });
    }

    setDeck(playerId: string, cardNames: string[]) {
        const player = this.game.getPlayer(playerId);
        player.deck = cardNames.map((name, index) => {
            const card = this.getCard(name);
            if (!card) throw new Error(`Card not found: ${name}`);
            return {
                ...card,
                instanceId: `deck-${index}`,
                ownerId: playerId,
                zone: ZoneType.Deck,
                ready: true,
                damage: 0,
                turnPlayed: 0,
                meta: {},
                baseStrength: card.strength,
                baseWillpower: card.willpower,
                baseLore: card.lore,
                baseCost: card.cost
            } as CardInstance;
        });
    }

    setPlay(playerId: string, cards: (string | Partial<CardInstance>)[], ready: boolean = true) {
        const player = this.game.getPlayer(playerId);
        player.play = cards.map((cardData, index) => {
            let baseCard: Partial<CardInstance> | undefined;

            if (typeof cardData === 'string') {
                baseCard = this.getCard(cardData);
                if (!baseCard) throw new Error(`Card not found: ${cardData}`);
            } else {
                baseCard = cardData;
                if (!baseCard.name) throw new Error(`Card object must have a 'name' property`);
                if (!baseCard.type) throw new Error(`Card object must have a 'type' property`);
            }

            const cardInstance = {
                ...baseCard,
                instanceId: baseCard.instanceId || `play-${index}-${baseCard.name?.replace(/\s/g, '-') || 'unknown'}`,
                ownerId: playerId,
                zone: ZoneType.Play,
                ready: baseCard.ready !== undefined ? baseCard.ready : ready,
                damage: baseCard.damage !== undefined ? baseCard.damage : 0,
                turnPlayed: baseCard.turnPlayed !== undefined ? baseCard.turnPlayed : 0,
                meta: baseCard.meta || {},
                baseStrength: baseCard.strength,
                baseWillpower: baseCard.willpower,
                baseLore: baseCard.lore,
                baseCost: baseCard.cost,
                subtypes: baseCard.subtypes || [],
                parsedEffects: baseCard.parsedEffects || [],
            } as CardInstance;

            // CRITICAL FIX: Parse abilities and register with ability system
            if (!cardInstance.parsedEffects || cardInstance.parsedEffects.length === 0) {
                cardInstance.parsedEffects = parseToAbilityDefinition(cardInstance) as any;
            }

            // Register card with ability system so triggers fire
            if (this.turnManager && (this.turnManager as any).abilitySystem) {
                (this.turnManager as any).abilitySystem.registerCard(cardInstance);
            }

            return cardInstance;
        });
    }

    // --- Helper Methods for Unit Tests ---

    createPlayer(name: string) {
        const id = this.game.addPlayer(name);
        return this.game.getPlayer(id);
    }

    setTurn(playerId: string) {
        this.turnManager.startTurn(playerId);
    }

    createCard(player: any, data: Partial<CardInstance> & { name: string, type: CardType }): CardInstance {
        // Handle player as either string (playerId) or object with id
        const playerId = typeof player === 'string' ? player : player.id || player;

        const baseCard: CardInstance = {
            id: 9999, // Mock ID
            slug: data.name.toLowerCase().replace(/\s+/g, '-'),
            fullName: data.name,
            cost: 0,
            inkwell: false,
            strength: 0,
            willpower: 0,
            lore: 0,
            abilities: [],
            // Instance properties
            instanceId: `mock-${Date.now()}-${Math.random()}`,
            ownerId: playerId,
            zone: ZoneType.Hand, // Default to hand
            ready: true,
            damage: 0,
            turnPlayed: 0,
            meta: {},
            baseStrength: data.strength || 0,
            baseWillpower: data.willpower || 0,
            baseLore: data.lore || 0,
            baseCost: data.cost || 0,
            subtypes: [],
            parsedEffects: [],
            ...data
        } as CardInstance;

        // Parse abilities immediately if provided (unless already parsed)
        if ((!baseCard.parsedEffects || baseCard.parsedEffects.length === 0) && baseCard.abilities && baseCard.abilities.length > 0) {
            // Use new AbilityParser
            baseCard.parsedEffects = parseToAbilityDefinition(baseCard) as any[];
        }

        return baseCard;
    }

    async playCard(playerOrId: any, cardOrName: any, targetOrCard?: string | CardInstance): Promise<boolean> {
        let player: any;
        let card: CardInstance;
        let targetCard: CardInstance | undefined;

        // Handle legacy API: playCard(playerId: string, cardName: string)
        if (typeof playerOrId === 'string' && typeof cardOrName === 'string') {
            player = this.game.getPlayer(playerOrId);
            const cardInHand = player.hand.find((c: CardInstance) => c.name === cardOrName || c.fullName === cardOrName || c.instanceId === cardOrName);
            if (!cardInHand) {
                throw new Error(`Card "${cardOrName}" not found in ${playerOrId}'s hand. Hand contains: ${player.hand.map((c: any) => c.name).join(', ')}`);
            }
            card = cardInHand;
        } else {
            // New API: playCard(player: PlayerState, card: CardInstance, targetCard?: CardInstance)
            player = playerOrId;
            card = cardOrName as CardInstance;
            if (targetOrCard && typeof targetOrCard !== 'string') {
                targetCard = targetOrCard;
            }
        }

        // Ensure card is in hand
        if (!player.hand.find((c: any) => c.instanceId === card.instanceId)) {
            player.hand.push(card);
        }

        // CRITICAL FIX: Parse abilities if not already parsed
        if (!card.parsedEffects || card.parsedEffects.length === 0) {
            card.parsedEffects = parseToAbilityDefinition(card) as any;
        }

        // Determine targetId
        let targetId: string | undefined;
        if (typeof targetOrCard === 'string') {
            targetId = targetOrCard;
        } else if (targetCard) {
            targetId = targetCard.instanceId;
        }

        // Mock the action
        await this.turnManager.resolveAction({
            type: ActionType.PlayCard,
            playerId: player.id,
            cardId: card.instanceId,
            targetId: targetId,
            payload: { targetId }
        });

        // Return success/failure based on where the card ended up
        return card.zone === ZoneType.Play || card.zone === ZoneType.Discard;
    }

    async resolveEffect(player: any, effect: any, sourceCard?: CardInstance, targetCard?: CardInstance) {
        // Access private method via any cast
        return (this.turnManager as any).resolveEffect(player, effect, sourceCard, targetCard);
    }

    mockChoice(playerId: string, choices: string[]) {
        // This assumes the TurnManager or GameStateManager has a way to queue choices
        // For now, we'll try to set it on the game state if that's how it's handled
        // Or we might need to mock the prompt system.
        // Looking at previous tests, it seems we might need to intercept the choice request.

        // Actually, let's check how other tests handle choices.
        // They often use `(harness.turnManager as any).pendingChoice = ...` or similar.
        // But let's implement a simple version that sets a property on the turn manager that the executor checks.

        // For now, let's assume the executor checks `context.payload` or similar.
        // But `resolveAction` takes a payload.
        // Wait, the test calls `resolveAction` which triggers the ability.
        // If the ability requires a choice, it usually pauses or expects the choice in the payload?
        // The current system seems to handle choices via `resolvePendingEffect` or similar.

        // Let's look at `tdd-batch1-modal-effects.test.ts` to see how it handled choices.
        // It used `ActionType.PlayCard` with `payload: { choice: 0 }`.

        // But for "chosen character", the choice is usually made *during* resolution if it's a target.
        // Or if it's "deal damage to chosen character", it might be a `Target` selection.

        // Let's add a simple helper that sets a global mock choice on the game state if possible,
        // or just documented that we need to pass it in the action payload.

        // Ideally, we should update the test to pass the choice in the action payload if that's supported.
        // But `TestHarness` should provide a clean API.

        // Let's implement a simple mock that sets a property on the game/turn manager that we can read.
        (this.turnManager as any).mockPendingChoice = choices;
    }
}
