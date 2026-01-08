interface GameStatePanelProps {
    playerName: string
    lore: number
    deckSize: number
    isActive: boolean
    deckRef?: React.RefObject<HTMLDivElement>
}

export default function GameStatePanel({
    playerName,
    lore,
    deckSize,
    isActive,
    deckRef
}: GameStatePanelProps) {
    return (
        <div className={`
      p-4 rounded-lg border-2
      ${isActive ? 'border-yellow-400 bg-yellow-900 bg-opacity-20' : 'border-gray-700 bg-gray-900 bg-opacity-40'}
    `}>
            {/* Player Name */}
            <div className="flex items-center justify-between mb-3">
                <h3 className={`font-bold text-lg ${isActive ? 'text-yellow-300' : 'text-white'}`}>
                    {playerName}
                    {isActive && <span className="ml-2 text-sm">(Active)</span>}
                </h3>
            </div>

            {/* Lore Progress */}
            <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Lore</span>
                    <span className="text-yellow-300 font bold">{lore} / 20</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-500"
                        style={{ width: `${(lore / 20) * 100}%` }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center">
                <div
                    ref={deckRef}
                    className="bg-gray-800 p-3 rounded w-24 relative"
                >
                    <div className="text-gray-400 text-xs text-center">Deck</div>
                    <div className="text-white font-bold text-2xl text-center">{deckSize}</div>
                </div>
            </div>
        </div>
    )
}
