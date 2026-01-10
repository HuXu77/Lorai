'use client';

import { ChoiceRequest, ChoiceResponse, ChoiceType } from '../engine/models';
import ModalChoice from './ModalChoice';
import MayChoiceModal from './MayChoiceModal';
import CardSelectionChoice from './CardSelectionChoice';
import DistributeDamageChoice from './DistributeDamageChoice';
import ScryChoice from './ScryChoice';
import RevealModal from './RevealModal';
import RevealHandModal from './RevealHandModal';
import OrderCardsChoice from './OrderCardsChoice';

interface PlayerChoiceHandlerProps {
    choice: ChoiceRequest | null;
    onResponse: (response: ChoiceResponse) => void;
}

export default function PlayerChoiceHandler({ choice, onResponse }: PlayerChoiceHandlerProps) {
    if (choice) {
        console.log('[PlayerChoiceHandler] Rendering choice:', choice.type, choice.id);
    }
    if (!choice) return null;

    // Route to appropriate component based on choice type
    switch (choice.type) {
        // Yes/No choices use unified MayChoiceModal for "may" abilities
        case ChoiceType.YES_NO:
            return <MayChoiceModal choice={choice} onResponse={onResponse} />;

        // Modal choices
        case ChoiceType.MODAL_CHOICE:
        case ChoiceType.MODAL_OPTION:
        case ChoiceType.CHOOSE_EFFECT:
            return <ModalChoice choice={choice} onResponse={onResponse} />;

        // Damage distribution
        case ChoiceType.DISTRIBUTE_DAMAGE:
            return <DistributeDamageChoice choice={choice} onResponse={onResponse} />;

        // Scry / Card arrangement
        case ChoiceType.SCRY:
        case ChoiceType.REARRANGE_HAND:
            return <ScryChoice choice={choice} onResponse={onResponse} />;

        case ChoiceType.ORDER_CARDS:
            return <OrderCardsChoice choice={choice} onResponse={onResponse} />;

        // Special UI for Reveal & Decide
        case ChoiceType.REVEAL_AND_DECIDE:
            return <RevealModal choice={choice} onResponse={onResponse} />;

        // Reveal full hand (Mowgli - Man Cub and similar abilities)
        case 'reveal_hand' as any:
            return <RevealHandModal choice={choice} onResponse={onResponse} />;

        // Reveal opponent's hand and choose a card to discard (The Bare Necessities, etc.)
        case 'reveal_opponent_hand_choose_discard' as any:
            return <CardSelectionChoice choice={choice} onResponse={onResponse} />;

        // Card targeting / selection
        case ChoiceType.TARGET_CHARACTER:
        case ChoiceType.TARGET_OPPOSING_CHARACTER:
        case ChoiceType.TARGET_ITEM:
        case ChoiceType.TARGET_LOCATION:
        case ChoiceType.TARGET_CARD:
        case ChoiceType.TARGET_CARD_IN_HAND:
        case ChoiceType.TARGET_CARD_IN_DISCARD:
        case ChoiceType.CHOOSE_CARD_FROM_ZONE:
        case ChoiceType.DISCARD_FROM_HAND:
        case ChoiceType.SELECT_TARGET:
            return <CardSelectionChoice choice={choice} onResponse={onResponse} />;

        default:
            // Fallback to modal choice for unknown types
            console.warn(`[PlayerChoiceHandler] Unknown choice type: ${choice.type}, falling back to ModalChoice`);
            return <ModalChoice choice={choice} onResponse={onResponse} />;
    }
}
