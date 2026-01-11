import React from 'react';
import { CardInstance } from '../engine/models';
import LocationWithCharacters from './LocationWithCharacters';

interface LocationsZoneProps {
    /** All locations in this zone */
    locations: CardInstance[];
    /** All characters that belongs to the same controller (some may be at these locations) */
    characters: CardInstance[];
    currentTurn?: number;
    onCardClick?: (card: CardInstance, position: { x: number; y: number }) => void;
    label?: string;
}

export default function LocationsZone({
    locations,
    characters,
    currentTurn,
    onCardClick,
    label
}: LocationsZoneProps) {
    if (locations.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 w-full">
            {label && (
                <div className="text-xs text-gray-400 font-semibold px-1 mb-1">{label}</div>
            )}
            <div className="flex flex-col gap-2">
                {locations.map((location) => {
                    // Find characters at this location
                    const charsAtLocation = characters.filter(c => c.locationId === location.instanceId);

                    // Handle duplicate naming logic
                    const sameNameLocs = locations.filter(l => l.name === location.name);
                    const duplicateIndex = sameNameLocs.length > 1
                        ? sameNameLocs.findIndex(l => l.instanceId === location.instanceId) + 1
                        : undefined;

                    return (
                        <LocationWithCharacters
                            key={location.instanceId}
                            location={location}
                            characters={charsAtLocation}
                            duplicateIndex={duplicateIndex}
                            currentTurn={currentTurn}
                            onCardClick={onCardClick}
                        />
                    );
                })}
            </div>
        </div>
    );
}
