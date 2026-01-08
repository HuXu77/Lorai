'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleStartGame = () => {
        setIsLoading(true)
        router.push('/game')
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
                    ✨ Lorai Engine
                </h1>
                <p className="text-xl text-blue-200 mb-8">
                    Disney Lorcana TCG • Play Against AI
                </p>

                <button
                    onClick={handleStartGame}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 mx-auto"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading...</span>
                        </>
                    ) : (
                        <>🎮 Start Game</>
                    )}
                </button>

                <div className="mt-12 text-sm text-blue-300">
                    <p>• 2,500+ cards • 100% parser coverage • AI opponents</p>
                </div>
            </div>
        </main>
    )
}
