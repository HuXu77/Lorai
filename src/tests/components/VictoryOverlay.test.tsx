import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VictoryOverlay from '../../components/VictoryOverlay';

describe('VictoryOverlay', () => {
    it('renders Victory message when player wins', () => {
        render(<VictoryOverlay winnerId="player1" currentPlayerId="player1" />);
        expect(screen.getByText('Victory')).toBeInTheDocument();
        expect(screen.getByText('Congratulations! You are a Lore Master!')).toBeInTheDocument();
    });

    it('renders Defeat message when player loses', () => {
        render(<VictoryOverlay winnerId="player2" currentPlayerId="player1" />);
        expect(screen.getByText('Defeat')).toBeInTheDocument();
        expect(screen.getByText('Better luck next time...')).toBeInTheDocument();
    });

    it('calls onDismiss when close button is clicked', () => {
        const handleDismiss = jest.fn();
        render(<VictoryOverlay winnerId="player1" currentPlayerId="player1" onDismiss={handleDismiss} />);

        const button = screen.getByText('Close');
        fireEvent.click(button);

        expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
});
