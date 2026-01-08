import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayArea from '../../components/PlayArea';
import { CardInstance, CardType, InkColor, ZoneType } from '../../engine/models';

// Mock CardInstance
const mockCard: CardInstance = {
    instanceId: 'card-1',
    name: 'Mickey Mouse',
    cost: 1,
    inkwell: true,
    type: CardType.Character,
    subtypes: ['Storyborn', 'Hero'],
    color: InkColor.Ruby,
    strength: 2,
    willpower: 3,
    lore: 1,
    ready: true,
    zone: ZoneType.Play,
    baseCost: 1,
    ownerId: 'player-1',
    turnPlayed: 0,
    damage: 0,
    meta: {},
    id: 1,
    number: 1,
    setCode: '1',
    fullName: 'Mickey Mouse',
    abilities: []
};

describe('PlayArea Regression Test', () => {

    // Regression Test: Verify PlayArea updates when cards prop changes
    // This catches the bug where React.memo + useMemo prevented updates
    it('updates display when new card is added to props', () => {
        const { rerender } = render(
            <PlayArea
                cards={[]}
                label="Test Area"
            />
        );

        // Verify empty state
        expect(screen.getByText('No characters in play')).toBeInTheDocument();

        // Simulate card added
        rerender(
            <PlayArea
                cards={[mockCard]}
                label="Test Area"
            />
        );

        // Verify card appears and empty message is gone
        expect(screen.queryByText('No characters in play')).not.toBeInTheDocument();
        expect(screen.getByAltText('Mickey Mouse')).toBeInTheDocument();
    });

    it('updates display when multiple cards are added', () => {
        const { rerender } = render(<PlayArea cards={[mockCard]} label="Test Area" />);

        expect(screen.getByAltText('Mickey Mouse')).toBeInTheDocument();

        const mockCard2 = { ...mockCard, instanceId: 'card-2', name: 'Donald Duck', fullName: 'Donald Duck' };

        rerender(<PlayArea cards={[mockCard, mockCard2]} label="Test Area" />);

        expect(screen.getByAltText('Mickey Mouse')).toBeInTheDocument();
        expect(screen.getByAltText('Donald Duck')).toBeInTheDocument();
    });
});
