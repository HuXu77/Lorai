
import { TurnManager } from '../actions';
import { PlayerState } from '../state';
import { CardInstance, ZoneType } from '../models';

/**
 * Execute Move Action
 * Moves a character to a location by paying the move cost
 */
export async function executeMove(
    turnManager: TurnManager,
    player: PlayerState,
    characterId: string,
    locationId: string
): Promise<boolean> {
    const character = player.play.find(c => c.instanceId === characterId);
    const location = player.play.find(c => c.instanceId === locationId);

    if (!character || !location) {
        turnManager.logger.warn(`Invalid move target or source: Character ${characterId}, Location ${locationId}`);
        return false;
    }

    // Validation
    if (character.type !== 'Character') {
        turnManager.logger.warn(`Can only move Characters to locations. Target is ${character.type}`);
        return false;
    }

    if (location.type !== 'Location') {
        turnManager.logger.warn(`Can only move to Locations. Target is ${location.type}`);
        return false;
    }

    if (character.locationId === location.instanceId) {
        turnManager.logger.warn(`Character ${character.name} is already at ${location.name}`);
        return false;
    }

    // Check cost
    // Use ability system to get modified move cost
    let moveCost = location.moveCost || 0;
    if (turnManager.abilitySystem) {
        moveCost = turnManager.abilitySystem.getModifiedMoveCost(character, location);
    }

    // Check ink availability
    const availableInk = player.inkwell.filter(c => c.ready).length;
    if (availableInk < moveCost) {
        turnManager.logger.warn(`Not enough ink to move. Need ${moveCost}, have ${availableInk}`);
        return false;
    }

    // Pay cost (Exert ink)
    let costPaid = 0;
    for (const ink of player.inkwell) {
        if (ink.ready && costPaid < moveCost) {
            ink.ready = false;
            costPaid++;
        }
    }

    // Move character
    // Update character's locationId property
    const oldLocationId = character.locationId;
    character.locationId = location.instanceId;

    turnManager.logger.action(player.name, `Moves ${character.name} to ${location.name} (Cost: ${moveCost}⬡)`);

    // Trigger events? "When a character moves here"
    // TODO: Emit move event for ability triggers

    return true;
}
