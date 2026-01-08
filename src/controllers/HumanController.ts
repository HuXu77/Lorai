import { PlayerController, ChoiceRequest, ChoiceResponse, GameState, GameAction } from '../engine/models';

/**
 * Human player controller that bridges the UI and game engine.
 * Implements PlayerController interface to handle choices and state updates.
 */
export class HumanController implements PlayerController {
    id: string;
    name: string;

    // State synchronization
    private gameState: GameState | null = null;
    private onStateUpdate: (state: GameState) => void;

    // Choice handling - for SYNCHRONOUS choice responses
    private pendingChoiceRequest: ChoiceRequest | null = null;
    private pendingChoiceResolver: ((response: ChoiceResponse) => void) | null = null;

    // Choice callback for UI
    private choiceCallback?: (choice: ChoiceRequest | null) => void;

    // Log callback
    private logCallback?: (category: string, message: string, details?: any) => void;

    constructor(
        name: string,
        onStateUpdate: (state: GameState) => void
    ) {
        this.id = `human_${Date.now()}`;
        this.name = name;
        this.onStateUpdate = onStateUpdate;
    }

    /**
     * Set callback for when a choice is requested (for UI to display modals)
     */
    setChoiceCallback(callback: (choice: ChoiceRequest | null) => void) {
        this.choiceCallback = callback;
    }

    /**
     * Called by engine when player needs to make a choice.
     * This is SYNCHRONOUS in the engine interface.
     */
    respondToChoiceRequest(request: ChoiceRequest): ChoiceResponse {
        // Store the request for UI to display
        this.pendingChoiceRequest = request;

        // Push to UI via callback
        if (this.choiceCallback) {
            this.choiceCallback(request);
        }

        // Trigger UI update to show choice modal
        if (this.gameState) {
            this.onStateUpdate({ ...this.gameState });
        }

        // For now, return a default response selecting the first valid option
        // TODO: Make this properly async or queue-based for true user choice
        const validOptions = request.options.filter(o => o.valid);

        if (validOptions.length > 0) {
            console.log('HumanController: Auto-selecting first valid option:', validOptions[0].display);
            return {
                requestId: request.id,
                playerId: this.id,
                selectedIds: [validOptions[0].id],
                declined: false,  // Don't decline when we have valid options!
                timestamp: Date.now()
            };
        }

        // Only decline if there are no valid options and it's optional
        console.warn('HumanController: No valid options, declining optional choice');
        return {
            requestId: request.id,
            playerId: this.id,
            selectedIds: [],
            declined: true,
            timestamp: Date.now()
        };
    }

    /**
     * ASYNC version that properly waits for user input via UI.
     * Returns a Promise that resolves when user makes a selection via submitChoice.
     */
    respondToChoiceRequestAsync(request: ChoiceRequest): Promise<ChoiceResponse> {
        // Store the request for UI to display
        this.pendingChoiceRequest = request;

        // Push to UI via callback
        if (this.choiceCallback) {
            this.choiceCallback(request);
        }

        // Trigger UI update to show choice modal
        if (this.gameState) {
            this.onStateUpdate({ ...this.gameState });
        }

        // Return a Promise that resolves when user makes a selection via submitChoice
        return new Promise<ChoiceResponse>((resolve) => {
            this.pendingChoiceResolver = resolve;
        });
    }

    /**
     * Called by UI when user makes a choice
     */
    submitChoice(response: ChoiceResponse) {
        this.pendingChoiceRequest = null;

        // Clear UI via callback
        if (this.choiceCallback) {
            this.choiceCallback(null);
        }

        // Resolve promise if async
        if (this.pendingChoiceResolver) {
            this.pendingChoiceResolver(response);
            this.pendingChoiceResolver = null;
        }

        // Trigger state update to hide modal
        if (this.gameState) {
            this.onStateUpdate({ ...this.gameState });
        }
    }

    /**
     * Get current pending choice request (for UI to display)
     */
    getPendingChoice(): ChoiceRequest | null {
        return this.pendingChoiceRequest;
    }

    /**
     * Called by engine when game starts
     */
    onGameStart(playerId: string, gameState: GameState): void {
        this.id = playerId;
        this.gameState = gameState;
        this.onStateUpdate(gameState);
        this.log('SYSTEM', `Game started! You are ${this.name}`, { playerId });
    }

    /**
     * Called by engine at start of each turn
     */
    onTurnStart(gameState: GameState): void {
        this.gameState = gameState;
        this.onStateUpdate(gameState);

        if (gameState.turnPlayerId === this.id) {
            this.log('TURN', `Your turn ${gameState.turnCount} started`, { turn: gameState.turnCount });
        }
    }

    /**
     * Update game state (called whenever state changes)
     */
    updateState(gameState: GameState): void {
        this.gameState = gameState;
        this.onStateUpdate(gameState);
    }

    /**
     * Set log callback for UI
     */
    setLogCallback(callback: (category: string, message: string, details?: any) => void) {
        this.logCallback = callback;
    }

    /**
     * Log an event to the UI
     */
    log(category: string, message: string, details?: any) {
        if (this.logCallback) {
            this.logCallback(category, message, details);
        }
    }
}
