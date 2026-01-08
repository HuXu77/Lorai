import { TurnManager } from '../actions';
import { PlayerState } from '../state';
import { CardInstance, ZoneType } from '../models';
import { executeResolveEffect } from '../effects/resolve';
import { GameEvent } from '../abilities/events';

/**
 * Get the effective singing value of a character (Cost or Singer value).
 */
export function getSingingValue(character: CardInstance): number {
    // 1. Check parsedEffects for Singer ability
    const singerEffect = character.parsedEffects?.find(e =>
        e.action === 'keyword_singer' ||
        e.action === 'singer' ||
        ((e as any).type === 'keyword' && (e as any).keyword === 'Singer') ||
        ((e as any).type === 'static' && ((e as any).keyword === 'singer' || (e as any).keyword === 'Singer'))
    );
    if (singerEffect) {
        // Check for value in different places (amount, value, params.value, keywordValue)
        let singerValue: number = 0;

        if ((singerEffect as any).keywordValue) {
            singerValue = parseInt((singerEffect as any).keywordValue);
        } else if ((singerEffect as any).keywordValueNumber) {
            singerValue = (singerEffect as any).keywordValueNumber;
        } else {
            singerValue = (singerEffect.amount || (singerEffect as any).value || (singerEffect.params as any)?.value) as number;
        }

        if (singerValue) {
            // Use the higher of cost or Singer value (beneficial interpretation)
            return Math.max(character.cost || 0, singerValue);
        }
    }

    // 2. Check keywordAbilities array (e.g. ["Singer"])
    if ((character as any).keywordAbilities?.includes('Singer')) {
        // Parse Singer value from fullText (e.g. "Singer 3 (This character counts as cost 3 to sing songs.)")
        const fullText = (character as any).fullText || '';
        const singerMatch = fullText.match(/Singer\s+(\d+)/i);
        if (singerMatch) {
            const singerValue = parseInt(singerMatch[1]);
            return Math.max(character.cost || 0, singerValue);
        }
        // If Singer with no number found, default to character cost
        return character.cost || 0;
    }

    // 3. Fallback: Parse Singer from abilities array text
    const abilities = (character as any).abilities || [];
    for (const ability of abilities) {
        const abilityText = ability.fullText || ability.effect || '';
        const singerMatch = abilityText.match(/Singer\s+(\d+)/i);
        if (singerMatch) {
            const singerValue = parseInt(singerMatch[1]);
            return Math.max(character.cost || 0, singerValue);
        }
    }

    return character.cost || 0;
}

/**
 * Check if a character can sing a song with the given cost requirement
 */
export function canCharacterSingSong(character: CardInstance, requiredCost: number): boolean {
    return getSingingValue(character) >= requiredCost;
}

/**
 * Sing a song using a character
 */
export async function executeSingSong(
    turnManager: TurnManager,
    player: PlayerState,
    songId: string,
    singerId: string,
    payload?: any
): Promise<boolean> {
    // Find the song card in hand
    const songIndex = player.hand.findIndex(c => c.instanceId === songId);
    if (songIndex === -1) {
        turnManager.logger.debug(`[${player.name}] Song not found in hand.`);
        return false;
    }
    const songCard = player.hand[songIndex];

    // Find the singer character in play
    const singer = player.play.find(c => c.instanceId === singerId);
    if (!singer) {
        turnManager.logger.debug(`[${player.name}] Singer character not found in play.`);
        return false;
    }

    // Verify singer is ready (not exerted)
    if (!singer.ready) {
        turnManager.logger.debug(`[${player.name}] Singer must be ready to sing.`);
        return false;
    }

    // Get song cost requirement (default is 3 per Lorcana rules)
    const songCostEffect = songCard.parsedEffects?.find(e => e.action === 'song_cost_requirement');
    const requiredCost = songCostEffect ? (songCostEffect.amount as number) : 3;

    // Check if singer meets requirements
    const singerCanSing = canCharacterSingSong(singer, requiredCost);
    if (!singerCanSing) {
        turnManager.logger.debug(`[${player.name}] Singer does not meet cost requirement (need ${requiredCost}, singer has cost ${singer.cost}).`);
        return false;
    }

    // Exert the singer
    singer.ready = false;
    turnManager.logger.action(player.name, `${singer.name} sings "${songCard.name}"`);

    // Emit CARD_SINGS_SONG event for triggered abilities
    await turnManager.abilitySystem.emitEvent(GameEvent.CARD_SINGS_SONG, {
        event: GameEvent.CARD_SINGS_SONG,
        card: singer,
        sourceCard: singer,
        player: player,
        songCard: songCard,
        timestamp: Date.now()
    });

    // Remove from hand
    player.hand.splice(songIndex, 1);

    // Resolve song effects
    const songEffects = songCard.parsedEffects?.filter(e => e.action !== 'song_cost_requirement');
    if (songEffects) {
        for (const effect of songEffects) {
            // resolveEffect delegated to module
            await executeResolveEffect(turnManager, player, effect, undefined, undefined, payload);
        }
    }

    // Move song to discard
    songCard.zone = ZoneType.Discard;
    player.discard.push(songCard);
    turnManager.logger.debug(`[${player.name}] "${songCard.name}" goes to discard.`);

    return true;
}
