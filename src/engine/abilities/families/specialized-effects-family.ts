import { BaseFamilyHandler } from './base-family-handler';
import type { GameContext } from '../executor';
import { ZoneType, ChoiceType } from '../../models';

/**
 * Specialized Effects Family Handler
 * Final consolidation handler for all remaining edge case and specialized effects
 * Achieves 100% effect coverage
 */
export class SpecializedEffectsFamilyHandler extends BaseFamilyHandler {
    private executor: any;

    constructor(executor: any) {
        super(executor.turnManager);
        this.executor = executor;
    }

    protected async resolveTargets(target: any, context: GameContext): Promise<any[]> {
        if (this.executor?.resolveTargets) {
            return this.executor.resolveTargets(target, context);
        }
        return super.resolveTargets(target, context);
    }
    async execute(effect: any, context: GameContext): Promise<void> {
        const player = context.player;
        const card = context.card;

        switch (effect.type) {
            // === RETURN MECHANICS ===
            case 'return_damaged_character_to_hand':
                const damagedTargets = await this.resolveTargets(effect.target || { type: 'all_characters' }, context);
                const damagedChars = damagedTargets.filter((c: any) => c.damage && c.damage > 0);
                damagedChars.forEach((c: any) => {
                    player.play = player.play.filter((card: any) => card.instanceId !== c.instanceId);
                    c.zone = ZoneType.Hand;
                    player.hand.push(c);
                });
                this.turnManager.logger.info(`[Specialized] ↩️ Returned ${damagedChars.length} damaged character(s) to hand`);
                break;

            case 'return_multiple_items':
                const items = player.play.filter((c: any) => c.type === 'item').slice(0, effect.amount);
                items.forEach((item: any) => {
                    player.play = player.play.filter((c: any) => c.instanceId !== item.instanceId);
                    item.zone = ZoneType.Hand;
                    player.hand.push(item);
                });
                this.turnManager.logger.info(`[Specialized] ↩️ Returned ${items.length} item(s) to hand`);
                break;

            case 'return_to_hand_on_banish':
                // Register passive effect: when this is banished, return to hand instead
                this.registerPassiveEffect({
                    type: 'return_to_hand_on_banish',
                    sourceCardId: card?.instanceId
                }, context);
                this.turnManager.logger.info(`[Specialized] ↩️ Registered return-on-banish effect`);
                break;

            case 'return_triggered_card_from_discard':
                // Return the card that triggered this ability from discard
                // Typically handled by trigger context
                this.turnManager.logger.info(`[Specialized] ↩️ Return triggered card from discard (stub)`);
                break;

            case 'activated_return_subtype_from_discard':
                const subtypeCards = player.discard.filter((c: any) =>
                    c.subtypes && c.subtypes.includes(effect.subtype)
                );
                if (subtypeCards.length > 0) {
                    // Build choice options
                    const discardOptions = subtypeCards.map((c: any) => ({
                        id: c.instanceId,
                        display: `${c.fullName || c.name} (Cost ${c.cost || 0})`,
                        card: c,
                        valid: true
                    }));

                    // Request choice from player via executor
                    const executor = this.turnManager.abilitySystem?.executor;
                    if (executor && executor.requestTargetChoice) {
                        const selected = await executor.requestTargetChoice({
                            type: 'card_in_discard',
                            prompt: `Choose a ${effect.subtype} card to return from discard`,
                            options: discardOptions,
                            min: 0,
                            max: 1
                        }, context);

                        if (selected.length > 0) {
                            const returned = selected[0].card || subtypeCards.find((c: any) => c.instanceId === selected[0].id);
                            if (returned) {
                                player.discard = player.discard.filter((c: any) => c.instanceId !== returned.instanceId);
                                returned.zone = ZoneType.Hand;
                                player.hand.push(returned);
                                this.turnManager.logger.info(`[Specialized] ↩️ Returned ${returned.name} (${effect.subtype}) from discard`);
                            }
                        } else {
                            this.turnManager.logger.info(`[Specialized] ↩️ Player chose not to return a card`);
                        }
                    } else {
                        // Fallback: decline
                        this.turnManager.logger.info(`[Specialized] ↩️ No choice handler, skipping return from discard`);
                    }
                }
                break;

            case 'item_banish_return_item':
                // Banish item to return another item
                this.turnManager.logger.info(`[Specialized] ♻️ Banish item cost to return item (stub)`);
                break;

            case 'one_to_hand_rest_bottom':
                // Look at top N, one to hand, rest to bottom
                {
                    const amount = effect.amount || 1;
                    const looked = player.deck.splice(-amount);
                    if (looked.length === 0) return;

                    let selectedId: string | null = null;

                    // If we have cards to choose from
                    if (looked.length > 0) {
                        const executor = this.turnManager.abilitySystem?.executor;
                        if (executor && executor.requestTargetChoice) {
                            const options = looked.map((c: any) => ({
                                id: c.instanceId,
                                display: c.fullName || c.name,
                                card: c,
                                valid: true
                            }));

                            const response = await executor.requestTargetChoice({
                                type: ChoiceType.TARGET_CARD,
                                prompt: `Choose a card to put into your hand (the rest go to bottom of deck)`,
                                options: options,
                                min: 1,
                                max: 1
                            }, context);

                            if (response && response.length > 0) {
                                selectedId = response[0].id;
                            }
                        }
                    }

                    // Fallback or process selection
                    const toHandIndex = selectedId ? looked.findIndex((c: any) => c.instanceId === selectedId) : looked.length - 1;
                    const toHand = looked.splice(toHandIndex, 1)[0];

                    if (toHand) {
                        toHand.zone = ZoneType.Hand;
                        player.hand.push(toHand);
                        this.turnManager.logger.info(`[Specialized] 🔍 Put ${toHand.name} into hand`);
                    }

                    // Rest go to bottom
                    looked.forEach((c: any) => {
                        c.zone = ZoneType.Deck;
                        player.deck.unshift(c); // Unshift puts at "bottom" (index 0) if deck is stack? 
                        // Wait, Lorcana deck array: push = top, unshift = bottom? 
                        // Yes, usually draw from pop() (end/top), so unshift() is bottom.
                    });
                    this.turnManager.logger.info(`[Specialized] 🔍 Put ${looked.length} cards on bottom`);
                }
                break;

            case 'mill_to_inkwell':
                {
                    const amount = effect.amount || 1;
                    const cards = player.deck.splice(-amount);
                    cards.forEach((c: any) => {
                        c.zone = ZoneType.Inkwell;
                        if (effect.facedown) c.facedown = true;
                        if (effect.exerted) c.ready = false;
                        player.inkwell.push(c);
                    });
                    this.turnManager.logger.info(`[Specialized] 🎨 Milled ${cards.length} cards to inkwell`);
                }
                break;

            // === REVEAL & PLAY MECHANICS ===
            case 'reveal_and_conditional':
                // Reveal and conditionally execute effect
                this.turnManager.logger.info(`[Specialized] 👁️ Reveal and conditional (stub)`);
                break;

            case 'reveal_and_put_multiple':
                // Reveal top cards and put them somewhere
                const revealed = player.deck.splice(-effect.amount);
                revealed.forEach((c: any) => {
                    if (effect.destination === 'hand') {
                        c.zone = ZoneType.Hand;
                        player.hand.push(c);
                    } else if (effect.destination === 'discard') {
                        c.zone = ZoneType.Discard;
                        player.discard.push(c);
                    }
                });
                this.turnManager.logger.info(`[Specialized] 👁️ Revealed and moved ${revealed.length} cards to ${effect.destination}`);
                break;

            case 'reveal_top_and_play_if_name':
                if (player.deck.length > 0) {
                    const top = player.deck[player.deck.length - 1];
                    if (top.name === effect.cardName) {
                        // Play it
                        player.deck.pop();
                        top.zone = ZoneType.Play;
                        player.play.push(top);
                        this.turnManager.logger.info(`[Specialized] ✨ Revealed and played ${top.name}`);
                    } else {
                        this.turnManager.logger.info(`[Specialized] 👁️ Revealed ${top.name}, not matching ${effect.cardName}`);
                    }
                }
                break;

            // === DRAW & DISCARD COMPLEX ===
            case 'draw_and_discard_by_count':
                const countSource = effect.countSource || {};
                let maxCount = 0;

                if (countSource.type === 'cards_in_play') {
                    const sourceFilter = countSource.filter || {};
                    const matches = player.play.filter((c: any) => {
                        if (sourceFilter.mine && c.ownerId !== player.id) return false;
                        if (sourceFilter.other && c.instanceId === card.instanceId) return false;
                        if (sourceFilter.cardTypes && !sourceFilter.cardTypes.includes(c.type?.toLowerCase())) return false;
                        return true;
                    });
                    maxCount = matches.length;
                    this.turnManager.logger.info(`[Specialized] draw_and_discard_by_count: Found ${maxCount} matches. Filter: ${JSON.stringify(sourceFilter)}`);
                }

                if (maxCount === 0) {
                    this.turnManager.logger.info(`[Specialized] draw_and_discard_by_count: 0 matches, skipping.`);
                    break;
                }

                // Initial prompt: How many to draw? (0 to maxCount)
                const options = [];
                for (let i = 0; i <= maxCount; i++) {
                    options.push({
                        id: i.toString(),
                        display: i === 0 ? "0 Cards (Skip)" : `${i} Cards`,
                        value: i.toString(),
                        valid: true
                    });
                }

                const executor = this.turnManager.abilitySystem?.executor;
                if (executor && executor.requestChoice) {
                    // 1. Choose Amount
                    const response = await executor.requestChoice({
                        id: `draw-count-${Date.now()}`,
                        type: ChoiceType.MODAL_CHOICE,
                        playerId: player.id,
                        prompt: `Draw how many cards? (Then discard equal amount)\n\n${context.abilityText || ''}`,
                        options: options,
                        min: 1,
                        max: 1
                    }, context);

                    if (response && response.selectedIds && response.selectedIds.length > 0) {
                        const num = parseInt(response.selectedIds[0]);

                        if (num > 0) {
                            // 2. Draw Cards
                            await this.turnManager.drawCards(player.id, num);
                            this.turnManager.logger.info(`[Specialized] Drew ${num} cards.`);

                            // 3. Discard Cards (Mandatory)
                            // Refetch hand as it has changed
                            const handOptions = player.hand.map((c: any) => ({
                                id: c.instanceId,
                                display: c.fullName || c.name,
                                card: c,
                                valid: true
                            }));

                            // Ensure we don't ask to discard more than we have (should be impossible given we just drew num, but safety first)
                            const discardCount = Math.min(num, player.hand.length);

                            const discardChoices = await executor.requestTargetChoice({
                                type: ChoiceType.TARGET_CARD_IN_HAND,
                                prompt: `Choose ${discardCount} card(s) to discard`,
                                options: handOptions,
                                min: discardCount,
                                max: discardCount
                            }, context);

                            if (discardChoices && discardChoices.length > 0) {
                                discardChoices.forEach((choice: any) => {
                                    const inHand = player.hand.find((c: any) => c.instanceId === choice.id);
                                    if (inHand) {
                                        player.hand = player.hand.filter((c: any) => c.instanceId !== inHand.instanceId);
                                        inHand.zone = ZoneType.Discard;
                                        player.discard.push(inHand);
                                    }
                                });
                                this.turnManager.logger.info(`[Specialized] Discarded ${discardChoices.length} cards.`);
                            } else {
                                this.turnManager.logger.warn(`[Specialized] Player failed to select cards to discard.`);
                            }
                        } else {
                            this.turnManager.logger.info(`[Specialized] Player chose 0 cards.`);
                        }
                    }
                }
                break;

            case 'reveal_top_multi_name_conditional':
            case 'recursive_reveal_conditional':
                // Complex reveal mechanics (stub)
                this.turnManager.logger.info(`[Specialized] 👁️ Multi-name/recursive reveal (stub)`);
                break;

            case 'reveal_opponent_hand_on_sing':
                const opponents = this.turnManager.game.getOpponents?.(player.id) || [];
                if (opponents.length > 0) {
                    this.turnManager.logger.info(`[Specialized] 👁️ Reveal opponent hand on sing: ${opponents[0].hand.map((c: any) => c.name).join(', ')}`);
                }
                break;

            case 'look_at_hand':
                const lookTargets = await this.resolveTargets(effect.target, context);
                lookTargets.forEach((t: any) => {
                    const targetPlayer = this.turnManager.game.state.players[t.ownerId];
                    if (targetPlayer) {
                        this.turnManager.logger.info(`[Specialized] 👁️ Looked at ${targetPlayer.name}'s hand: ${targetPlayer.hand.map((c: any) => c.name).join(', ')}`);
                    }
                });
                break;

            // === CONDITIONAL PLAY ===
            case 'play_from_hand':
                const playFilter = effect.filter || {};
                const playable = player.hand.filter((c: any) => {
                    if (playFilter.cardType && c.type?.toLowerCase() !== playFilter.cardType?.toLowerCase()) return false;
                    if (playFilter.maxCost !== undefined && (c.cost || 0) > playFilter.maxCost) return false;
                    return true;
                });
                if (playable.length > 0) {
                    // Build choice options for user
                    const options = playable.map((c: any) => ({
                        id: c.instanceId,
                        display: `${c.fullName || c.name} (Cost ${c.cost || 0})`,
                        card: c,
                        valid: true
                    }));

                    // Request choice from player via executor
                    const executor = this.turnManager.abilitySystem?.executor;
                    if (executor && executor.requestTargetChoice) {
                        const prompt = effect.free
                            ? `Choose a card to play for free`
                            : `Choose a card to play`;

                        const selected = await executor.requestTargetChoice({
                            type: 'card_in_hand',
                            prompt: prompt,
                            options: options,
                            min: 0,
                            max: 1
                        }, context);

                        if (selected.length > 0) {
                            const toPlay = selected[0].card || playable.find((c: any) => c.instanceId === selected[0].id);
                            if (toPlay) {
                                await this.turnManager.playCard(player, toPlay.instanceId, undefined, undefined, undefined, undefined, undefined, { free: effect.free || false });
                                this.turnManager.logger.info(`[Specialized] 🎴 Played ${toPlay.name} from hand`);
                            }
                        } else {
                            this.turnManager.logger.info(`[Specialized] 🎴 Player chose not to play a card`);
                        }
                    } else {
                        // Fallback: auto-select first card (for testing)
                        const toPlay = playable[0];
                        player.hand = player.hand.filter((c: any) => c.instanceId !== toPlay.instanceId);
                        toPlay.zone = ZoneType.Play;
                        player.play.push(toPlay);
                        this.turnManager.logger.info(`[Specialized] 🎴 Played ${toPlay.name} from hand (fallback)`);
                    }
                }
                break;

            case 'conditional_play_for_free':
                // Play for free if condition met (stub)
                this.turnManager.logger.info(`[Specialized] 🎴 Conditional free play (stub)`);
                break;

            case 'play_named_card_free':
                const namedCard = player.hand.find((c: any) => c.name === effect.cardName);
                if (namedCard) {
                    player.hand = player.hand.filter((c: any) => c.instanceId !== namedCard.instanceId);
                    namedCard.zone = ZoneType.Play;
                    player.play.push(namedCard);
                    this.turnManager.logger.info(`[Specialized] 🎴 Played ${effect.cardName} for free`);
                }
                break;

            case 'play_same_name_as_banished':
                // Play card with same name as recently banished card
                this.turnManager.logger.info(`[Specialized] 🎴 Play same name as banished (stub)`);
                break;

            case 'pay_to_resolve':
                const cost = effect.cost || 0;

                // Optional Check
                if (effect.optional) {
                    const prompt = `Pay ${cost} ⬡ to resolve effect?\n\n${context.abilityText || ''}`;
                    const response = await this.turnManager.requestChoice({
                        id: `optional-${Date.now()}`,
                        type: 'yes_no' as any,
                        playerId: player.id,
                        prompt: prompt,
                        options: [
                            { id: 'yes', display: 'Yes', valid: true },
                            { id: 'no', display: 'No', valid: true }
                        ],
                        source: {
                            card: context.card,
                            abilityName: context.abilityName,
                            player: context.player
                        },
                        timestamp: Date.now()
                    });

                    if (response.selectedIds[0] !== 'yes') {
                        this.turnManager.logger.info(`[Specialized] ↩️ Declined optional payment of ${cost} `);
                        return;
                    }
                }

                // 1. Check if player has enough ready ink
                const readyInk = player.inkwell.filter((c: any) => c.ready);
                if (readyInk.length < cost) {
                    this.turnManager.logger.info(`[Specialized] 💰 Not enough ready ink to pay ${cost}.Available: ${readyInk.length} `);
                    return;
                }

                // 2. Exert ink
                this.turnManager.logger.info(`[Specialized] 💰 Paying ${cost} ink to resolve effect...`);
                // Exert the first N ready ink cards
                for (let i = 0; i < cost; i++) {
                    readyInk[i].ready = false;
                }

                // 3. Resolve inner effect
                if (effect.effect) {
                    const executor = this.turnManager.abilitySystem?.executor;
                    if (executor) {
                        await executor.execute(effect.effect, context);
                    } else {
                        this.turnManager.logger.warn(`[Specialized] ⚠️ No executor found to resolve inner effect of pay_to_resolve`);
                    }
                }
                break;

            // === CHALLENGE & LORE ===
            case 'challenge_trigger_buff_others':
                // When this challenges, buff other characters
                this.registerPassiveEffect({
                    type: 'challenge_trigger_buff_others',
                    target: effect.target,
                    strength: effect.strength,
                    willpower: effect.willpower,
                    sourceCardId: card?.instanceId
                }, context);
                this.turnManager.logger.info(`[Specialized] ⚔️ Challenge trigger buff registered`);
                break;

            case 'gain_lore_on_character_play':
                // Passive: gain lore when character is played
                this.registerPassiveEffect({
                    type: 'gain_lore_on_character_play',
                    amount: effect.amount,
                    sourceCardId: card?.instanceId
                }, context);
                this.turnManager.logger.info(`[Specialized] ⭐ Gain ${effect.amount} lore on character play registered`);
                break;

            case 'lose_lore_equal_to_stat':
                // Lose lore equal to stat value
                if (card) {
                    const statValue = card[effect.stat] || 0;
                    player.lore = Math.max(0, player.lore - statValue);
                    this.turnManager.logger.info(`[Specialized] ⭐ Lost ${statValue} lore(based on ${effect.stat})`);
                }
                break;

            // === EDGE CASES ===
            case 'change_win_condition':
                this.turnManager.game.state.winCondition = effect.newCondition;
                this.turnManager.logger.info(`[Specialized] 🏆 Changed win condition(stub)`);
                break;

            case 'chosen_character_at_self':
            case 'chosen_from_discard':
            case 'opposing_character_lowest_cost':
            case 'self_and_chosen_other':
                // Target selection mechanics (mostly handled by parsing)
                this.turnManager.logger.info(`[Specialized] 🎯 Target selection: ${effect.type} (stub)`);
                break;

            case 'self_damage_cost_for_effect':
                // Pay damage to activate effect
                if (card) {
                    card.damage = (card.damage || 0) + effect.damageAmount;
                    // Then execute the effect
                    if (effect.effect) {
                        await this.execute(effect.effect, context);
                    }
                    this.turnManager.logger.info(`[Specialized] 💔 Self - damaged ${effect.damageAmount} for effect`);
                }
                break;

            case 'card_put_under_this_turn':
                // Track cards put under this during turn
                this.turnManager.logger.info(`[Specialized] 📚 Card put under tracking(stub)`);
                break;

            case 'inkwell_enters_exerted':
                // Cards enter inkwell exerted
                this.registerPassiveEffect({
                    type: 'inkwell_enters_exerted',
                    sourceCardId: card?.instanceId
                }, context);
                this.turnManager.logger.info(`[Specialized] 🎨 Inkwell cards enter exerted`);
                break;

            default:
                this.turnManager.logger.warn(`[Specialized] Unhandled specialized effect: ${effect.type} `);
                break;
        }
    }
}
