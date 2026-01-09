import { BaseFamilyHandler } from './base-family-handler';
import type { GameContext } from '../executor';
import { ZoneType } from '../../models';

/**
 * Deck Manipulation Family Handler
 * Handles 12 deck/discard manipulation effect types:
 * - shuffle_into_deck
 * - put_from_discard_to_top
 * - put_from_discard_to_deck
 * - return_from_discard_to_hand
 * - play_from_discard
 * - look_at_top_cards
 * - rearrange_top_cards
 * - look_and_move_to_top_or_bottom
 * - discard_hand_draw
 * - can_put_from_discard_as_ink
 * - can_play_from_discard
 * - reveal_top_and_gain_lore
 */
export class DeckManipulationFamilyHandler extends BaseFamilyHandler {
    constructor(private executor: any) {
        super(executor.turnManager);
    }

    async execute(effect: any, context: GameContext): Promise<void> {
        const player = context.player;
        if (!player) return;

        switch (effect.type) {
            case 'shuffle_into_deck':
                // Shuffle cards from hand/discard/play into deck
                const source = effect.source || 'hand';
                let cardsToShuffle: any[] = [];

                if (source === 'hand') {
                    const amount = Math.min(effect.amount || 1, player.hand.length);
                    cardsToShuffle = player.hand.splice(0, amount);
                } else if (source === 'discard') {
                    const amount = Math.min(effect.amount || player.discard.length, player.discard.length);
                    cardsToShuffle = player.discard.splice(0, amount);
                }

                cardsToShuffle.forEach((card: any) => {
                    card.zone = ZoneType.Deck;
                    player.deck.push(card);
                });

                // Shuffle deck
                this.shuffleArray(player.deck);

                this.turnManager.logger.info(`[DeckManipulation] 🔀 Shuffled ${cardsToShuffle.length} card(s) into deck`, {
                    effectType: 'shuffle_into_deck',
                    source,
                    count: cardsToShuffle.length
                });
                break;

            case 'put_from_discard_to_top':
                // Put specific card from discard to top of deck
                if (player.discard.length > 0) {
                    // Simplified: take first matching card or any card
                    const card = player.discard.pop();
                    if (card) {
                        card.zone = ZoneType.Deck;
                        player.deck.push(card);

                        this.turnManager.logger.info(`[DeckManipulation] ⬆️ Put card from discard to top of deck`, {
                            effectType: 'put_from_discard_to_top',
                            card: card.name
                        });
                    }
                }
                break;

            case 'put_from_discard_to_deck':
                // Put cards from discard into deck (shuffled)
                const discardAmount = Math.min(effect.amount || 1, player.discard.length);
                const cardsFromDiscard = player.discard.splice(0, discardAmount);

                cardsFromDiscard.forEach((card: any) => {
                    card.zone = ZoneType.Deck;
                    player.deck.push(card);
                });

                this.shuffleArray(player.deck);

                this.turnManager.logger.info(`[DeckManipulation] 🔄 Put ${cardsFromDiscard.length} card(s) from discard to deck`, {
                    effectType: 'put_from_discard_to_deck',
                    count: cardsFromDiscard.length
                });
                break;

            case 'return_from_discard_to_hand':
                // Return cards from discard to hand
                const returnAmount = Math.min(effect.amount || 1, player.discard.length);
                const returnedCards = player.discard.splice(player.discard.length - returnAmount, returnAmount);

                returnedCards.forEach((card: any) => {
                    card.zone = ZoneType.Hand;
                    player.hand.push(card);
                });

                this.turnManager.logger.info(`[DeckManipulation] ↩️ Returned ${returnedCards.length} card(s) from discard to hand`, {
                    effectType: 'return_from_discard_to_hand',
                    count: returnedCards.length,
                    cards: returnedCards.map((c: any) => c.name)
                });
                break;



            case 'play_from_inkwell':
                // Play a card from inkwell
                // Usually triggered by an ability "You may play a card from your inkwell"
                const playInkTargets = await this.resolveTargets(effect.target, context);

                if (playInkTargets.length > 0) {
                    const cardToPlay = playInkTargets[0];
                    if (cardToPlay.zone === ZoneType.Inkwell) {
                        // Use turnManager logic to play the card
                        // We assume turnManager.playCard handles the generic "moves to play" logic
                        // and validation. We pass { fromZone: 'inkwell' } context.
                        await this.turnManager.playCard(player, cardToPlay, { fromZone: 'inkwell' });

                        this.turnManager.logger.info(`[DeckManipulation] 🎴 Played ${cardToPlay.name} from inkwell`, {
                            effectType: 'play_from_inkwell',
                            card: cardToPlay.name
                        });
                    }
                }
                break;

            case 'shuffle_from_discard':
                // Shuffle chosen cards from discard into deck
                const shuffleTargets = await this.resolveTargets(effect.target, context);
                if (shuffleTargets.length > 0) {
                    shuffleTargets.forEach((card: any) => {
                        // Remove from discard
                        const idx = player.discard.findIndex((c: any) => c.instanceId === card.instanceId);
                        if (idx !== -1) player.discard.splice(idx, 1);

                        // Add to deck
                        card.zone = ZoneType.Deck;
                        player.deck.push(card);
                    });
                    this.shuffleArray(player.deck);
                    this.turnManager.logger.info(`[DeckManipulation] 🔀 shuffled ${shuffleTargets.length} card(s) from discard into deck`, {
                        effectType: 'shuffle_from_discard',
                        count: shuffleTargets.length
                    });
                }
                break;

            case 'move_hand_to_bottom_deck':
                // Move entire hand to bottom of deck
                const handSize = player.hand.length;
                if (handSize > 0) {
                    const handCards = [...player.hand];
                    player.hand = [];

                    // Add to bottom (start of array)
                    // Note: If deck is [bottom ... top], unshfting puts at bottom.
                    // If deck is [top ... bottom], push puts at bottom.
                    // Lorai codebase convention: pop() draws from 'top' (end of array).
                    // So index 0 is bottom.
                    handCards.forEach((card: any) => {
                        card.zone = ZoneType.Deck;
                        player.deck.unshift(card);
                    });

                    this.turnManager.logger.info(`[DeckManipulation] ⬇️ Moved ${handSize} hand cards to bottom of deck`, {
                        effectType: 'move_hand_to_bottom_deck',
                        count: handSize
                    });
                }
                break;

            case 'balance_hand':
                // Draw until hand has X cards, or discard if too many
                const targetAmount = effect.amount;
                const currentHandSize = player.hand.length;

                if (currentHandSize < targetAmount) {
                    const drawAmount = targetAmount - currentHandSize;
                    await this.drawCards(player, drawAmount);
                    this.turnManager.logger.info(`[DeckManipulation] ⚖️ Balanced hand: Drew ${drawAmount} cards`, {
                        effectType: 'balance_hand',
                        action: 'draw',
                        amount: drawAmount
                    });
                } else if (currentHandSize > targetAmount) {
                    const discardCount = currentHandSize - targetAmount;
                    // Usually player chooses, but for auto-balance without target/choice specified,
                    // we might need a choice interaction. If not specified, we might just discard random or last?
                    // Assuming for now this effect implies a choice or automatic discard.
                    // Strategy: Discard last added (simple stack) or error if no choice provided?
                    // Let's implement pseudo-choice: discard last N cards for now if no interaction.
                    // TODO: Implement choice if required by specific card (usually "Choose X cards to discard")

                    const discarded = player.hand.splice(player.hand.length - discardCount, discardCount);
                    discarded.forEach((card: any) => {
                        card.zone = ZoneType.Discard;
                        player.discard.push(card);
                    });

                    this.turnManager.logger.info(`[DeckManipulation] ⚖️ Balanced hand: Discarded ${discardCount} cards`, {
                        effectType: 'balance_hand',
                        action: 'discard',
                        amount: discardCount
                    });
                }
                break;

            case 'move_to_top_or_bottom':
                // Move target cards to top or bottom of deck
                const moveTargets = await this.resolveTargets(effect.target, context);
                const destination = effect.destination || 'bottom';

                if (moveTargets.length > 0) {
                    moveTargets.forEach((card: any) => {
                        // Remove from current zone (simplified, assumes unique instance)
                        // This helper utility handles removal if registered properly, but here we do manual for safety
                        if (card.zone === ZoneType.Play) {
                            const idx = player.play.findIndex((c: any) => c.instanceId === card.instanceId);
                            if (idx !== -1) player.play.splice(idx, 1);
                        }
                        // Handle other zones if necessary

                        card.zone = ZoneType.Deck;
                        if (destination === 'top') {
                            player.deck.push(card);
                        } else {
                            player.deck.unshift(card);
                        }
                    });

                    this.turnManager.logger.info(`[DeckManipulation] ↕️ Moved ${moveTargets.length} cards to ${destination} of deck`, {
                        effectType: 'move_to_top_or_bottom',
                        destination,
                        count: moveTargets.length
                    });
                }
                break;

            case 'look_at_top_cards':
                // Look at top N cards (information effect)
                const lookAmount = effect.amount || 1;

                const topCards = player.deck.slice(-lookAmount);

                this.turnManager.logger.info(`[DeckManipulation] 👀 Looking at top ${topCards.length} card(s)`, {
                    effectType: 'look_at_top_cards',
                    cards: topCards.map((c: any) => c.name)
                });
                break;

            case 'rearrange_top_cards':
            case 'look_and_move_to_top_or_bottom':
                // Rearrange/move top cards (passive ability for UI)
                this.registerPassiveEffect({
                    type: effect.type,
                    amount: effect.amount,
                    sourceCardId: context.card?.instanceId
                }, context);

                this.turnManager.logger.info(`[DeckManipulation] 🔄 Rearrange ability registered`, {
                    effectType: effect.type
                });
                break;

            case 'discard_hand_draw':
                // Discard hand and draw new cards
                // Support multiple targets (e.g. "Each player") if specified
                let discardDrawTargets = [player]; // Default to self
                if (effect.target) {
                    console.log(`[DEBUG] Resolving targets for discard_hand_draw: ${JSON.stringify(effect.target)}`);
                    discardDrawTargets = await this.executor.resolveTargets(effect.target, context);
                    console.log(`[DEBUG] Resolved ${discardDrawTargets.length} targets.`);
                }

                for (const targetPlayer of discardDrawTargets) {
                    // Ensure target is a player (resolveTargets might return cards if misconfigured, but type: 'all_players' returns players)
                    if (!targetPlayer.hand || !targetPlayer.deck) continue;

                    const discardedCount = targetPlayer.hand.length;
                    targetPlayer.hand.forEach((card: any) => {
                        card.zone = ZoneType.Discard;
                        targetPlayer.discard.push(card);
                    });
                    targetPlayer.hand = [];

                    // Draw new cards
                    const drawAmount = effect.amount || discardedCount;

                    // Use turnManager if available for safe draw
                    if (this.turnManager && this.turnManager.drawCards) {
                        // We can't easily use turnManager.drawCards for opponent if it assumes context.
                        // But BaseFamilyHandler.drawCards uses turnManager.drawCards(player, amount).
                        await this.drawCards(targetPlayer, drawAmount);
                    } else {
                        // Fallback manual draw
                        for (let i = 0; i < drawAmount && targetPlayer.deck.length > 0; i++) {
                            const card = targetPlayer.deck.pop();
                            if (card) {
                                card.zone = ZoneType.Hand;
                                targetPlayer.hand.push(card);
                            }
                        }
                    }

                    this.turnManager.logger.info(`[DeckManipulation] 🔄 ${targetPlayer.name} discarded ${discardedCount}, drew ${drawAmount}`, {
                        effectType: 'discard_hand_draw',
                        player: targetPlayer.name,
                        discarded: discardedCount,
                        drew: drawAmount
                    });
                }
                break;

            case 'reveal_top_and_gain_lore':
                // Reveal top card and gain lore based on cost
                if (player.deck.length > 0) {
                    const revealedCard = player.deck[player.deck.length - 1];
                    const loreGained = revealedCard.cost || 0;
                    player.lore += loreGained;

                    this.turnManager.logger.info(`[DeckManipulation] 🎯 Revealed ${revealedCard.name}, gained ${loreGained} lore`, {
                        effectType: 'reveal_top_and_gain_lore',
                        card: revealedCard.name,
                        lore: loreGained
                    });
                }
                break;

            case 'can_put_from_discard_as_ink':
            case 'can_play_from_discard':
                // Passive abilities for discard interaction
                this.registerPassiveEffect({
                    type: effect.type,
                    filter: effect.filter,
                    sourceCardId: context.card?.instanceId
                }, context);

                this.turnManager.logger.info(`[DeckManipulation] 📖 Discard interaction ability registered`, {
                    effectType: effect.type
                });
                break;

            case 'headless_horseman_combo':
                // Shuffle hand into deck
                const handCards = [...player.hand];
                player.hand = [];
                handCards.forEach((c: any) => {
                    c.zone = ZoneType.Deck;
                    player.deck.push(c);
                });
                this.shuffleArray(player.deck);

                // Draw 3 cards
                await this.drawCards(player, 3);

                this.turnManager.logger.info(`[DeckManipulation] 🎃 Headless Horseman Combo: Shuffled hand, drew 3`, {
                    effectType: 'headless_horseman_combo',
                    shuffledCount: handCards.length
                });
                break;

            case 'search_deck':
                // Search deck for card matching filter
                const filter = effect.filter || {};
                const searchAmount = effect.amount || 1; // Number of cards to find

                // Filter deck
                const matches = player.deck.filter((c: any) => {
                    if (filter.name && c.name !== filter.name) return false;
                    if (filter.cardType && c.type.toLowerCase() !== filter.cardType.toLowerCase()) return false;
                    if (filter.subtype && !c.subtypes?.includes(filter.subtype)) return false;
                    return true;
                });

                if (matches.length > 0) {
                    let found: any[] = [];

                    if (this.turnManager) {
                        // Request choice
                        const options = matches.map((c: any) => ({
                            id: c.instanceId,
                            display: c.name,
                            card: c,
                            valid: true
                        }));

                        const response = await this.turnManager.requestChoice({
                            id: `search-${Date.now()}`,
                            type: 'choose_card_from_zone' as any,
                            playerId: player.id,
                            prompt: `Search deck found ${matches.length} cards matching ${filter.name || 'criteria'}. Choose up to ${searchAmount} to reveal.`,
                            options: options,
                            min: 1, // Usually optional? "Search... and you may..."
                            // Let's assume min=0 if text says "may", but without that info, 1 is safe default if matches found.
                            // Actually search usually requires finding if possible.
                            max: searchAmount,
                            timestamp: Date.now()
                        });

                        const selectedIds = response.selectedIds || [];
                        found = matches.filter((c: any) => selectedIds.includes(c.instanceId));

                    } else {
                        // Bot/Test logic: take first N matches
                        found = matches.slice(0, searchAmount);
                    }

                    found.forEach((card: any) => {
                        // Remove from deck
                        player.deck = player.deck.filter((c: any) => c.instanceId !== card.instanceId);

                        // Move to destination
                        const destination = effect.destination || 'hand';
                        if (destination === 'hand') {
                            card.zone = ZoneType.Hand;
                            player.hand.push(card);
                        } else if (destination === 'play') {
                            card.zone = ZoneType.Play;
                            player.play.push(card);
                        }
                    });

                    this.turnManager.logger.info(`[DeckManipulation] 🔍 Searched deck for ${filter.name || 'card'}, found and chose ${found.length}`, {
                        effectType: 'search_deck',
                        found: found.map((c: any) => c.name)
                    });
                }

                if (effect.shuffle !== false) {
                    this.shuffleArray(player.deck);
                }
                break;

            case 'reveal_top_card':
            case 'reveal_top_deck':
                const revealAmount = effect.amount || 1;
                const revealed = player.deck.slice(-revealAmount);
                this.turnManager.logger.info(`[DeckManipulation] 👁️ Revealed top ${revealed.length} card(s)`, {
                    effectType: 'reveal_top_card',
                    cards: revealed.map((c: any) => c.name)
                });
                if (revealed.length > 0) {
                    // Legacy support for chained effects check
                    (context.eventContext as any).revealedCard = revealed[revealed.length - 1];
                }
                break;

            case 'look_and_choose':
            case 'look_at_cards':
                // Look at top N, choose M to hand, rest to bottom (usually)
                const lookN = effect.amount || 1;
                const chooseM = effect.chooseAmount || 1;

                await this.handleLookAndChoose(player, lookN, chooseM, effect.destination || 'bottom');
                break;

            case 'look_and_distribute':
            case 'look_and_rearrange':
                // Scry: Look at top N, put any number on bottom/top
                await this.handleLookAndDistribute(player, effect.amount || 1, effect.destination || 'bottom');
                break;

            case 'play_with_top_card_revealed':
                this.registerPassiveEffect({
                    type: 'play_with_top_card_revealed',
                    sourceCardId: context.card?.instanceId
                }, context);
                this.turnManager.logger.info(`[DeckManipulation] 👁️ Play with top card revealed registered`);
                break;

            case 'reveal_hand_opponent_choice_discard':
            case 'play_reveal_opponent_hand_choice_discard':
                // Target opponent reveals hand, you choose card to discard
                // Since this is opponent interaction, usually handled by OpponentInteractionFamily
                // But if routed here, we handle it or delegate.
                // Given the name 'reveal_hand...', it fits DeckManipulation (info/discard).
                // But OpponentInteraction handles 'opponent_reveals_hand_you_choose_discard'.
                // We should probably alias or implement share logic.
                await this.handleRevealHandOpponentChoice(context, effect);
                break;


            case 'return_from_discard':
                // Return target from discard to hand
                // Targets usually resolved by executor via generic resolving? No, family handler resolves targets if specific logic needed.
                // But passed in 'effect' has target AST.
                // We need to resolve targets here if not passed in context.
                // context.targets might not be populated if routed deeply.
                // Let's assume we need to resolve.

                // Note: resolving targets in discard requires the resolver to search discard.
                const targets = await this.executor.resolveTargets(effect.target, context);

                targets.forEach((card: any) => {
                    // Remove from discard
                    player.discard = player.discard.filter((c: any) => c.instanceId !== card.instanceId);

                    // Add to hand
                    card.zone = ZoneType.Hand;
                    player.hand.push(card);

                    this.turnManager.logger.info(`[DeckManipulation] Returned ${card.name} from discard to hand`);
                });
                break;

            case 'put_from_discard':
                // Put target from discard into play
                const putTargets = await this.executor.resolveTargets(effect.target, context);

                putTargets.forEach((card: any) => {
                    player.discard = player.discard.filter((c: any) => c.instanceId !== card.instanceId);

                    card.zone = ZoneType.Play;
                    card.ready = !effect.exerted; // Exerted if specified
                    card.damage = 0; // Reset damage? Yes usually.

                    player.play.push(card); // Or use game.addCardToZone

                    // Trigger 'on_play' effects?
                    // Usually "put into play" triggers "enters play" abilities but NOT "play" triggers (cost payment etc).
                    // We should probably rely on game state manager to handle triggers if possible, but minimal for now.

                    this.turnManager.logger.info(`[DeckManipulation] Put ${card.name} from discard into play`);
                });
                break;

            case 'play_from_discard':
                // Play card from discard (paying cost or free)
                let playTargets = await this.executor.resolveTargets(effect.target, context);

                // If no target specified, check if context card is in discard (Self-targeting like Lilo)
                if (playTargets.length === 0 && context.card && (context.card.zone === ZoneType.Discard || context.card.zone === 'discard')) {
                    playTargets = [context.card];
                }

                if (playTargets.length > 0) {
                    const cardToPlay = playTargets[0]; // Usually only one

                    // Check if we have playCard method (production) or need fallback (test)
                    const hasPlayCard = this.turnManager && this.turnManager.playCard;

                    if (hasPlayCard) {
                        // Production path: Move to hand first, then call playCard
                        player.discard = player.discard.filter((c: any) => c.instanceId !== cardToPlay.instanceId);
                        cardToPlay.zone = ZoneType.Hand;
                        player.hand.push(cardToPlay);

                        this.turnManager.logger.info(`[DeckManipulation] Playing ${cardToPlay.name} from discard (via hand)`);
                        const options = effect.free ? { free: true } : undefined;
                        const success = await this.turnManager.playCard(player, cardToPlay.instanceId, undefined, undefined, undefined, undefined, undefined, options);

                        if (success && effect.enters_exerted) {
                            const playedCard = player.play.find((c: any) => c.instanceId === cardToPlay.instanceId);
                            if (playedCard) {
                                playedCard.ready = false;
                                this.turnManager.logger.info(`[DeckManipulation] ${playedCard.name} entered play exerted.`);
                            }
                        } else if (!success) {
                            // If failed, move back to discard
                            player.hand = player.hand.filter((c: any) => c.instanceId !== cardToPlay.instanceId);
                            cardToPlay.zone = ZoneType.Discard;
                            player.discard.push(cardToPlay);
                            this.turnManager.logger.warn(`[DeckManipulation] Failed to play ${cardToPlay.name} from discard.`);
                        }
                    } else {
                        // Test/Fallback path: Direct move from discard to play
                        player.discard = player.discard.filter((c: any) => c.instanceId !== cardToPlay.instanceId);
                        cardToPlay.zone = ZoneType.Play;
                        cardToPlay.ready = !effect.enters_exerted;
                        player.play.push(cardToPlay);
                    }
                }
                break;

            // === BATCH 13: Inkwell & Naming Mechanics ===
            case 'all_inkwell':
                // Move all cards from deck to inkwell
                const allCards = [...player.deck];
                player.deck = [];
                allCards.forEach((card: any) => {
                    card.zone = ZoneType.Inkwell;
                    card.exerted = true; // Cards enter inkwell exerted
                    player.inkwell.push(card);
                });
                this.turnManager.logger.info(`[DeckManipulation] 🎨 Moved ${allCards.length} cards from deck to inkwell`);
                break;

            case 'put_into_inkwell': {
                // Put card into inkwell (from deck top or generic target)
                // Ported from Executor legacy method
                const source = (effect as any).source;
                const exerted = (effect as any).exerted;

                // 1. Legacy support for 'source' property (e.g. One Jump Ahead)
                if (source === 'deck_top') {
                    if (player.deck.length > 0) {
                        const card = player.deck[player.deck.length - 1]; // Peek
                        const originalZone = card.zone || 'deck';

                        if (this.turnManager.game.addCardToZone) {
                            this.turnManager.game.addCardToZone(player, card, ZoneType.Inkwell);
                        } else {
                            // Fallback
                            player.deck.pop();
                            card.zone = ZoneType.Inkwell;
                            player.inkwell.push(card);
                        }

                        if (this.turnManager.trackZoneChange) {
                            this.turnManager.trackZoneChange(card, originalZone, ZoneType.Inkwell);
                        }

                        if (exerted) {
                            card.ready = false;
                        }

                        this.turnManager.logger.info(`[DeckManipulation] ${player.name} put top card of deck into inkwell (exerted: ${!!exerted}).`);
                    }
                    break;
                }

                // 2. Generic target support
                const inkTargets = await this.executor.resolveTargets(effect.target, context);

                if (inkTargets.length > 0) {
                    inkTargets.forEach((card: any) => {
                        // Determine owner
                        let owner = player;
                        if (card.ownerId !== player.id) {
                            const ownerPlayer = Object.values(this.turnManager.game.state.players).find((p: any) => p.id === card.ownerId);
                            if (ownerPlayer) owner = ownerPlayer;
                        }

                        const originalZone = card.zone || 'play';

                        if (this.turnManager.game.addCardToZone) {
                            this.turnManager.game.addCardToZone(owner, card, ZoneType.Inkwell);
                        } else {
                            // Fallback: Remove from current zone logic
                            // Ideally addCardToZone handles removal.
                            // For manual fallback we assume play/hand/discard
                            if (originalZone === 'play') {
                                owner.play = owner.play.filter((c: any) => c.instanceId !== card.instanceId);
                            } else if (originalZone === 'hand') {
                                owner.hand = owner.hand.filter((c: any) => c.instanceId !== card.instanceId);
                            } else if (originalZone === 'discard' || originalZone === ZoneType.Discard) {
                                owner.discard = owner.discard.filter((c: any) => c.instanceId !== card.instanceId);
                            } else if (originalZone === ZoneType.Deck) {
                                // Handle deck removal
                                const idx = owner.deck.findIndex((c: any) => c.instanceId === card.instanceId);
                                if (idx !== -1) owner.deck.splice(idx, 1);
                            }
                            card.zone = ZoneType.Inkwell;
                            owner.inkwell.push(card);
                        }

                        if (this.turnManager.trackZoneChange) {
                            this.turnManager.trackZoneChange(card, originalZone, ZoneType.Inkwell);
                        }

                        if (exerted) {
                            card.ready = false;
                        }

                        this.turnManager.logger.info(`[DeckManipulation] Put ${card.name} into inkwell (exerted: ${!!exerted}).`);
                    });
                }
                break;
            }

            case 'look_and_move': {
                // Ported logic from executeLookAndMove
                const amount = effect.amount;
                const filter = effect.filter;
                const destination = effect.destination;
                const moveAmount = effect.moveAmount || 1;
                const restDestination = effect.restDestination || 'bottom';

                if (player.deck.length === 0) return;

                const lookAmount = Math.min(amount, player.deck.length);
                const lookedCards: any[] = [];
                for (let i = 0; i < lookAmount; i++) {
                    lookedCards.push(player.deck.pop());
                }

                if (this.turnManager) {
                    this.turnManager.logger.info(`[DeckManipulation] ${player.name} looks at top ${lookedCards.length} cards`);
                }

                let cardsToMove: any[] = [];
                let cardsRemaining = [...lookedCards];

                if (filter || moveAmount < amount) {
                    // Choice required
                    // 1. Filtered choice
                    if (this.turnManager && this.turnManager.requestChoice) {
                        const options = lookedCards.map((c: any) => {
                            const isValid = filter ? this.executor.checkFilter(c, filter, context) : true;
                            return {
                                id: c.instanceId,
                                display: c.name,
                                valid: isValid,
                                invalidReason: isValid ? undefined : 'Not a valid selection',
                                card: c
                            };
                        });

                        const response = await this.turnManager.requestChoice({
                            id: `look-and-move-${Date.now()}`,
                            type: 'choose_card_from_zone' as any, // ChoiceType.CHOOSE_CARD_FROM_ZONE
                            playerId: player.id,
                            prompt: `Choose ${moveAmount} card(s) to put into ${destination}`,
                            options: options,
                            min: (effect as any).optional ? 0 : moveAmount,
                            max: moveAmount,
                            source: {
                                card: context.card,
                                abilityName: context.abilityName,
                                abilityText: context.abilityText,
                                player: player
                            },
                            context: { lookedCards }
                        });

                        if (response && response.selectedIds) {
                            response.selectedIds.forEach((id: string) => {
                                const card = lookedCards.find((c: any) => c.instanceId === id);
                                if (card) cardsToMove.push(card);
                            });
                        }
                    } else {
                        // Bot/Fallback
                        const matching = lookedCards.filter((c: any) => filter ? this.executor.checkFilter(c, filter, context) : true);
                        cardsToMove = matching.slice(0, moveAmount);
                    }
                } else {
                    // No choice (move all?)
                    // If moveAmount == amount, it's automatic.
                    cardsToMove = lookedCards;
                }

                // Process Moved Cards
                cardsToMove.forEach((card: any) => {
                    cardsRemaining = cardsRemaining.filter((c: any) => c.instanceId !== card.instanceId);

                    card.zone = destination === 'hand' ? ZoneType.Hand : ZoneType.Deck;
                    if (destination === 'hand') {
                        player.hand.push(card);
                    } else if (destination === 'top') {
                        player.deck.push(card);
                    } else if (destination === 'bottom') {
                        player.deck.unshift(card);
                    }

                    this.turnManager.logger.info(`[DeckManipulation] Moved ${card.name} to ${destination}`);
                });

                // Process Remaining Cards (Rest Destination)
                if (cardsRemaining.length > 0) {
                    if (restDestination === 'bottom') {
                        // Ordering logic omitted for brevity/safety - pushing to bottom
                        player.deck.unshift(...cardsRemaining);
                    } else if (restDestination === 'top') {
                        player.deck.push(...cardsRemaining);
                    } else if (restDestination === 'deck') {
                        // Shuffle?
                        player.deck.push(...cardsRemaining);
                    }
                }
                break;
            }



            case 'hand_to_inkwell_all':
                // Move entire hand to inkwell
                const handToInk = [...player.hand];
                player.hand = [];
                handToInk.forEach((card: any) => {
                    card.zone = ZoneType.Inkwell;
                    card.exerted = true;
                    player.inkwell.push(card);
                });
                this.turnManager.logger.info(`[DeckManipulation] 🎨 Moved ${handToInk.length} cards from hand to inkwell`);
                break;

            case 'inkwell_trigger_debuff':
                // Triggered when a card enters inkwell - debuff target
                const debuffTargets = await this.resolveTargets(effect.target, context);
                debuffTargets.forEach((target: any) => {
                    if (effect.stat === 'strength') {
                        target.strength -= effect.amount;
                    } else if (effect.stat === 'willpower') {
                        target.willpower -= effect.amount;
                    }
                });
                this.turnManager.logger.info(`[DeckManipulation] ⬇️ Inkwell trigger debuff applied to ${debuffTargets.length} target(s)`);
                break;

            case 'grant_inkable':
                // Grant inkwell ability to target cards
                const inkableTargets = await this.resolveTargets(effect.target, context);
                inkableTargets.forEach((target: any) => {
                    target.inkable = true;
                });
                this.turnManager.logger.info(`[DeckManipulation] ✨ Granted inkable to ${inkableTargets.length} card(s)`);
                break;

            case 'add_name':
            case 'add_name_for_shift':
                // Add card name to a tracking list (for shift mechanic)
                if (!this.turnManager.game.state.namedCards) {
                    this.turnManager.game.state.namedCards = [];
                }
                this.turnManager.game.state.namedCards.push(effect.name);
                this.turnManager.logger.info(`[DeckManipulation] 📝 Added name: ${effect.name}`);
                break;

            case 'name_and_reveal':
                // Name a card and check if it's revealed
                // This would typically require user input in a real game
                // For now, use payload or stub
                const namedCard = context.payload?.name || 'Unknown';
                this.turnManager.logger.info(`[DeckManipulation] 🎯 Name and reveal: Named "${namedCard}" (Stub implementation)`);
                break;

            default:
                this.turnManager.logger.warn(`[DeckManipulation] Unhandled effect: ${effect.type} `);
                break;
        }
    }

    /**
     * Shuffle array in place (Fisher-Yates algorithm)
     */
    private async drawCards(player: any, amount: number): Promise<void> {
        // Use turnManager if available, otherwise manual fallback
        if (this.turnManager.drawCards) {
            await this.turnManager.drawCards(player.id, amount);
        } else {
            // Fallback logic
            for (let i = 0; i < amount; i++) {
                if (player.deck.length > 0) {
                    const card = player.deck.pop();
                    card.zone = ZoneType.Hand;
                    player.hand.push(card);
                }
            }
        }
    }

    private shuffleArray(array: any[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // === Helpers ===

    /**
     * Look at top N, choose M to hand, rest to destination
     */
    private async handleLookAndChoose(player: any, lookN: number, chooseM: number, destination: string) {
        if (player.deck.length === 0) return;

        // Take top N
        const lookedAt = player.deck.splice(-lookN); // Removed from deck temporarily

        // If no turn manager, fallback to auto-pick
        if (!this.turnManager) {
            const chosen = lookedAt.splice(0, chooseM);
            const rest = lookedAt;

            chosen.forEach((c: any) => {
                c.zone = ZoneType.Hand;
                player.hand.push(c);
            });

            rest.forEach((c: any) => {
                c.zone = ZoneType.Deck;
                if (destination === 'top') player.deck.push(c);
                else player.deck.unshift(c);
            });
            return;
        }

        // Create options
        const options = lookedAt.map((c: any) => ({
            id: c.instanceId,
            display: c.name,
            card: c, // Include card for rendering
            valid: true
        }));

        // Request choice
        const response = await this.turnManager.requestChoice({
            id: `look-choose-${Date.now()}`,
            type: 'choose_card_from_zone' as any, // ChoiceType.CHOOSE_CARD_FROM_ZONE
            playerId: player.id,
            prompt: `Look at top ${lookN} cards. Choose up to ${chooseM} to put into your hand.`,
            options: options,
            // "Up to 2" -> min 0 (or 1?), max 2.
            // If chooseM is fixed (e.g. 1), min=1, max=1.
            // Let's use min=1, max=chooseM. If player wants fewer, they can pick fewer if UI supports it?
            // UI enforces min.
            // I'll set min=1 for now.
            min: 1,
            max: chooseM,
            timestamp: Date.now()
        });

        const selectedIds = response.selectedIds || [];

        // Process chosen
        const chosen: any[] = [];
        const rest: any[] = [];

        lookedAt.forEach((c: any) => {
            if (selectedIds.includes(c.instanceId)) {
                chosen.push(c);
            } else {
                rest.push(c);
            }
        });

        // Move chosen to hand
        chosen.forEach((c: any) => {
            c.zone = ZoneType.Hand;
            player.hand.push(c);
        });

        // Move rest to destination
        rest.forEach((c: any) => {
            c.zone = ZoneType.Deck;
            if (destination === 'top') {
                player.deck.push(c);
            } else {
                player.deck.unshift(c);
            }
        });

        this.turnManager.logger.info(`[DeckManipulation] 👀 Looked at ${lookN} cards, chose ${chosen.length} to hand`, {
            chosen: chosen.map((c: any) => c.name)
        });
    }

    /**
     * Look and Distribute (Scry)
     * Look at top N, put any number on bottom/top
     */
    /**
     * Look and Distribute (Scry)
     * Look at top N, put any number on bottom/top
     */
    private async handleLookAndDistribute(player: any, amount: number, defaultDestination: string) {
        if (player.deck.length === 0) return;

        // Take top N
        // NOTE: splice removes them. If query is cancelled/timeouts, we must restore them!
        // But requestChoice awaits indefinitely.
        const lookedAt = player.deck.splice(-amount);

        if (this.turnManager) {
            const options = lookedAt.map((c: any) => ({
                id: c.instanceId,
                display: c.name,
                valid: true
            }));

            // Request Scry choice
            const response = await this.turnManager.requestChoice({
                id: `scry-${Date.now()}`,
                type: 'scry' as any, // ChoiceType.SCRY
                playerId: player.id,
                prompt: `Look at top ${amount} cards. Rearrange them or put on bottom.`,
                options: options,
                min: amount,
                max: amount,
                timestamp: Date.now(),
                context: {
                    amount,
                    defaultDestination
                }
            });

            // Process response
            if (response.payload && response.payload.top && response.payload.bottom) {
                const topIds = response.payload.top;
                const bottomIds = response.payload.bottom;

                // Reconstruct card lists
                const topCards: any[] = [];
                const bottomCards: any[] = [];

                // Helper to find card in lookedAt
                const findCard = (id: string) => lookedAt.find((c: any) => c.instanceId === id);

                topIds.forEach((id: string) => {
                    const c = findCard(id);
                    if (c) topCards.push(c);
                });

                bottomIds.forEach((id: string) => {
                    const c = findCard(id);
                    if (c) bottomCards.push(c);
                });

                // Put bottom cards on bottom of deck (unshift)
                // Note: bottomCards order matters. Usually we push them to bottom?
                // If bottomCards = [A, B], is A deeper than B? 
                // Scry usually says "Put on bottom in any order".
                // "Bottom of deck" in Lorai array logic (where pop() is top) is index 0.
                // So unpacking [A, B]... 
                // If we want [Top ... Bottom] => [TopCards ... Deck ... BottomCards]
                // Deck is an array. Top is end. Bottom is start.
                // So push TopCards to end. Unshift BottomCards to start.

                // BottomCards list from UI: index 0 is "top-most of bottom zone" or "bottom-most"?
                // ScryChoice UI: "Bottom of Deck (Ordered list)". 
                // Usually list matches visual order. 1. A, 2. B.
                // If A is 1st, it's closer to the middle? Or closer to absolute bottom?
                // "Bottom of Deck" list usually implies 1 is top-most of that pile.
                // So if we put [A, B] on bottom, and A is "top" of that stack...
                // Deck structure: [AbsoluteBottom, ... , AbsoluteTop]
                // We want [B, A, ...DeckOriginalMiddle... ] if A is top of bottom stack.
                // So we unshift A, then unshift B? No, unshift inserts at 0.
                // unshift(A) -> [A, ...]
                // unshift(B) -> [B, A, ...] -> B is bottom-most.
                // If list is [A, B] where A is top-most of bottom stack:
                // We want A to be closer to middle.
                // So we needs to construct [ ...BottomCards.reverse(), ...Deck... ] ?
                // Let's assume list order: Index 0 is "Top" of that list (visually).
                // So A is "Top" of bottom pile. B is "Bottom".
                // Resulting Deck: [ B, A, ... others ... ]
                // So we need to insert A at 0, then insert B at 0 (pushing A to 1).
                // So we iterate list in REVERSE and unshift?
                // Or iterate forward and... wait.
                // List: [A, B]. A is top-most. B is bottom-most (deepest).
                // unshift(A) -> [A, ...]
                // unshift(B) -> [B, A, ...] -> B is at 0 (Deepest). Correct.
                // So if we iterate top-to-bottom of list, and unshift, we get reverse order?
                // Wait. Unshift adds to start.
                // If I unshift A: [A]
                // If I unshift B: [B, A]
                // Result: B is at 0 (Deepest). A is at 1 (Closer to middle).
                // If list was [A, B] (A top, B bottom), this is CORRECT.

                // Verify UI ScryChoice:
                // "Bottom of Deck": 1. Option A, 2. Option B.
                // 1 is top. 2 is bottom.
                // Yes. So implementation: iterate options and unshift. 
                // Actually, if I iterate [A, B] and unshift A, then unshift B... I get [B, A]. Correct.

                bottomCards.forEach(c => {
                    c.zone = ZoneType.Deck;
                    player.deck.unshift(c);
                });

                // Top cards: Push to end.
                // List: [C, D]. C is top-most (absolut top). D is below it.
                // Deck: [ ... , D, C ] (since pop() takes C).
                // So we need to push D, then push C.
                // List [C, D].
                // We want Deck end to be C.
                // So we push D, then push C.
                // That means iterate REVERSE and push?
                // Or iterate forward and... ?
                // If I push C: [..., C]
                // If I push D: [..., C, D] -> D is top-most.
                // Incorrect.
                // We need to push the "bottom-most of top stack" first.
                // List [C, D] -> C is top (1), D is below (2).
                // We want stack to be [..., D, C].
                // So we must push D, then C.
                // So iterate list in REVERSE.

                for (let i = topCards.length - 1; i >= 0; i--) {
                    const c = topCards[i];
                    c.zone = ZoneType.Deck;
                    player.deck.push(c);
                }

                this.turnManager.logger.info(`[DeckManipulation] 🔮 Scry completed: ${topCards.length} on top, ${bottomCards.length} on bottom`);

            } else {
                // Fallback / Bot / No payload: Put all on top (default)
                // Need to restore cards
                lookedAt.forEach((c: any) => {
                    c.zone = ZoneType.Deck;
                    if (defaultDestination === 'top') {
                        player.deck.push(c);
                    } else {
                        player.deck.unshift(c);
                    }
                });
            }

        } else {
            // No turn manager (e.g. tests)
            lookedAt.forEach((c: any) => {
                c.zone = ZoneType.Deck;
                if (defaultDestination === 'top') {
                    player.deck.push(c);
                } else {
                    player.deck.unshift(c);
                }
            });
        }
    }

    /**
     * Reveal opponent hand and choose discard
     */
    private async handleRevealHandOpponentChoice(context: GameContext, effect: any) {
        // Resolve opponent
        const opponents = this.turnManager.game.getOpponents(context.player.id);
        if (opponents.length === 0) return;
        const opponent = opponents[0]; // Logic stub

        // Reveal hand
        this.turnManager.logger.info(`[DeckManipulation] 👁️ Opponent ${opponent.name} reveals hand: ${opponent.hand.map((c: any) => c.name).join(', ')}`);

        let discarded: any = null;

        if (this.turnManager && opponent.hand.length > 0) {
            const options = opponent.hand.map((c: any) => ({
                id: c.instanceId,
                display: c.name,
                card: c,
                valid: true
            }));

            const response = await this.turnManager.requestChoice({
                id: `reveal-discard-${Date.now()}`,
                type: 'choose_card_from_zone' as any,
                playerId: context.player.id,
                prompt: `Opponent ${opponent.name} revealed their hand. Choose a card to discard.`,
                options: options,
                min: 1, // Usually mandatory if able
                max: 1,
                timestamp: Date.now()
            });

            const selectedIds = response.selectedIds || [];
            if (selectedIds.length > 0) {
                discarded = opponent.hand.find((c: any) => c.instanceId === selectedIds[0]);
            }

        } else if (opponent.hand.length > 0) {
            // Bot/Stub logic: discard first
            discarded = opponent.hand[0];
        }

        if (discarded) {
            opponent.hand = opponent.hand.filter((c: any) => c.instanceId !== discarded.instanceId);
            discarded.zone = ZoneType.Discard;
            opponent.discard.push(discarded);

            this.turnManager.logger.info(`[DeckManipulation] 🗑️ You chose to discard ${discarded.name} from opponent hand`);
        }
    }

}
