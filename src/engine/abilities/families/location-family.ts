import { BaseFamilyHandler } from './base-family-handler';
import { GameContext } from '../executor';
import { EffectAST } from '../effect-ast';
import { ZoneType } from '../../models';

export class LocationFamilyHandler extends BaseFamilyHandler {
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
        if (!player) return;

        switch (effect.type) {
            case 'move_to_location':
            case 'move_characters':
            case 'free_move_to_location':
                await this.handleMoveToLocation(effect, context);
                break;

            default:
                this.turnManager.logger.warn(`[LocationFamily] Unknown effect type: ${effect.type}`);
        }
    }

    // -- Implementation --

    private async handleMoveToLocation(effect: any, context: GameContext) {
        // Resolve characters to move
        const characters = await this.resolveTargets(effect.target, context);
        if (!characters || characters.length === 0) return;

        // Resolve Destination
        // Destination might be 'self' (the card with the ability, if it's a location), 
        // or a chosen location.
        let destinationLocation: any = null;

        if (effect.destination === 'self') {
            if (context.card && context.card.type.toLowerCase() === 'location') {
                destinationLocation = context.card;
            } else {
                this.turnManager.logger.warn(`[LocationFamily] destination 'self' invalid: source is not a location`);
                return;
            }
        } else if (effect.destination) {
            const locParams = effect.destination;

            // If destination is a target resolver AST
            if (locParams.type && (locParams.type.includes('chosen') || locParams.type.includes('location'))) {
                const dests = await this.resolveTargets(locParams, context);
                if (dests.length > 0) destinationLocation = dests[0];
            }
        } else if (effect.destinationId) {
            // Find in play
            destinationLocation = context.player.play.find((c: any) => c.instanceId === effect.destinationId);
        }

        if (!destinationLocation) {
            this.turnManager.logger.warn(`[LocationFamily] No valid destination location found`);
            return;
        }

        // Perform Move
        characters.forEach((char: any) => {
            // Validate: must be character
            if (!char.type || char.type.toLowerCase() !== 'character') {
                return;
            }
            // Validate: must be in play
            if (char.zone !== ZoneType.Play) {
                return;
            }

            // Move logic
            // Usually moving costs ink, BUT effects usually "move for free" unless specified.
            // If effect explicitly says "pay cost to move", that's different.
            // But 'move_to_location' effect usually IMPLIES the action happens.

            char.locationId = destinationLocation.instanceId;

            this.turnManager.logger.info(`[LocationFamily] Moved ${char.name} to ${destinationLocation.name}`);
        });
    }
}
