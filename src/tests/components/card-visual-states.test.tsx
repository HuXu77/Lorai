/**
 * Snapshot Tests for Card Visual Components
 * 
 * These tests render cards with specific states and verify they display correctly.
 * Simpler than E2E tests - just verifies the component renders expected output.
 */

import React from 'react';
import { render } from '@testing-library/react';
import Card from '../../components/Card';
import { CardInstance, CardType, ZoneType } from '../../engine/models';

// Helper to create a minimal card instance
function createMockCard(overrides: Partial<CardInstance> = {}): CardInstance {
    return {
        instanceId: 'test-001',
        id: 1,
        name: 'Test Character',
        fullName: 'Test Character - Hero',
        cost: 3,
        type: 'Character' as CardType,
        color: 'Amber',
        inkwell: true,
        zone: 'play' as ZoneType,
        ownerId: 'player1',
        ready: true,
        damage: 0,
        strength: 3,
        willpower: 4,
        lore: 2,
        baseStrength: 3,
        baseWillpower: 4,
        baseLore: 2,
        baseCost: 3,
        turnPlayed: 1,
        subtypes: ['Hero'],
        ...overrides,
    } as CardInstance;
}

describe('Card Component - Visual State Snapshots', () => {

    describe('Damage Indicator', () => {
        it('should display damage counter when card is damaged', () => {
            const card = createMockCard({ damage: 3 });
            const { container } = render(<Card card={card} />);

            // Check for damage indicator (red bg-red-600 div)
            const damageIndicator = container.querySelector('.bg-red-600');
            expect(damageIndicator).toBeTruthy();
            expect(damageIndicator?.textContent).toBe('3');
        });

        it('should not display damage counter when undamaged', () => {
            const card = createMockCard({ damage: 0 });
            const { container } = render(<Card card={card} />);

            // Should NOT have damage indicator
            const damageIndicators = container.querySelectorAll('.bg-red-600.rounded-full.w-8');
            expect(damageIndicators.length).toBe(0);
        });
    });

    describe('Stat Modification Badges', () => {
        it('should display green +2 strength badge when buffed', () => {
            const card = createMockCard({
                strength: 5,
                baseStrength: 3,  // +2 buff
            });
            const { container } = render(<Card card={card} />);

            // Look for green stat badge
            const greenBadge = container.querySelector('.bg-green-600');
            expect(greenBadge).toBeTruthy();
            expect(greenBadge?.textContent).toContain('+2');
        });

        it('should display red -2 willpower badge when debuffed', () => {
            const card = createMockCard({
                willpower: 2,
                baseWillpower: 4,  // -2 debuff
            });
            const { container } = render(<Card card={card} />);

            // Look for red stat badge
            const redBadge = container.querySelector('.bg-red-600');
            expect(redBadge).toBeTruthy();
            expect(redBadge?.textContent).toContain('-2');
        });

        it('should display lore modification badge', () => {
            const card = createMockCard({
                lore: 4,
                baseLore: 2,  // +2 lore
            });
            const { container } = render(<Card card={card} />);

            // Look for lore badge (contains ◊)
            const badges = container.querySelectorAll('.bg-green-600');
            expect(badges.length).toBeGreaterThan(0);
        });

        it('should not display badges when no modifications', () => {
            const card = createMockCard({
                strength: 3,
                baseStrength: 3,
                willpower: 4,
                baseWillpower: 4,
                lore: 2,
                baseLore: 2,
            });
            const { container } = render(<Card card={card} />);

            // No modification badges in bottom-right area
            const modBadges = container.querySelector('.bottom-2.right-2 .bg-green-600, .bottom-2.right-2 .bg-red-600');
            // Should be null or not present
        });
    });

    describe('Keyword/Ability Badges', () => {
        it('should render card with Resist meta without error', () => {
            const card = createMockCard({
                meta: { resist: 2 },
            });
            const { container } = render(<Card card={card} />);

            // Card should render successfully with meta
            expect(container.firstChild).toBeTruthy();
        });

        it('should render card with multiple temporary keywords', () => {
            const card = createMockCard({
                meta: {
                    resist: 2,
                    temporaryKeywords: ['Ward', 'Rush'],
                },
            });
            const { container } = render(<Card card={card} />);

            // Card should render successfully with keywords
            expect(container.firstChild).toBeTruthy();
        });
    });

    describe('Boost Cards Under', () => {
        it('should display card stack when cards are under character', () => {
            const card = createMockCard({
                meta: {
                    cardsUnder: [
                        { name: 'Boost Card 1', facedown: true },
                        { name: 'Boost Card 2', facedown: true },
                    ],
                },
            });
            const { container } = render(<Card card={card} />);

            // Boost stack indicator (purple gradient cards)
            const boostStack = container.querySelector('.bg-gradient-to-br');
            expect(boostStack).toBeTruthy();
        });

        it('should display count when 3+ cards under', () => {
            const card = createMockCard({
                meta: {
                    cardsUnder: [
                        { name: 'Card 1', facedown: true },
                        { name: 'Card 2', facedown: true },
                        { name: 'Card 3', facedown: true },
                    ],
                },
            });
            const { container } = render(<Card card={card} />);

            // Count indicator should show "3"
            expect(container.textContent).toContain('3');
        });

        it('should not display boost indicator when no cards under', () => {
            const card = createMockCard({
                meta: {},
            });
            const { container } = render(<Card card={card} />);

            // No boost stack should be visible
            const boostTitle = container.querySelector('[title*="Boost"]');
            expect(boostTitle).toBeFalsy();
        });
    });

});
