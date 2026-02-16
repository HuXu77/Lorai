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
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-900">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80"></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>

            {/* Colorful Orbs */}
            <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-purple-600 blur-[100px] animate-float opacity-40"></div>
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-600 blur-[100px] animate-float-delayed opacity-40"></div>

            <div className="relative z-10 text-center max-w-4xl px-6">
                {/* Logo / Title Area */}
                <div className="mb-8 animate-float">
                    <h1 className="text-7xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-2xl">
                        Lorai Engine
                    </h1>
                </div>

                {/* Subtitle */}
                <p className="text-2xl md:text-3xl text-blue-100/90 font-light mb-12 tracking-wide leading-relaxed drop-shadow-md">
                    Experience the magic of Disney Lorcana TCG <br />
                    <span className="text-amber-300 font-medium">Play against advanced AI</span>
                </p>

                {/* Call to Action */}
                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={handleStartGame}
                        disabled={isLoading}
                        className="group relative inline-flex items-center justify-center min-w-[320px] px-10 py-5 text-xl font-bold text-white transition-all duration-300 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full hover:from-indigo-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-3 w-full">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span className="tracking-widest uppercase text-lg">Summoning...</span>
                            </div>
                        ) : (
                            <span className="flex items-center gap-3">
                                <span>✨</span>
                                <span>Start Your Journey</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 transition-transform group-hover:translate-x-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </span>
                        )}

                        {/* Button Glow Effect */}
                        <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
                    </button>

                    <p className="text-sm text-slate-400 font-medium tracking-widest uppercase opacity-80 mt-8">
                        Ready to Challenge the Illumineers?
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-xs text-slate-600">
                Lorcana is a trademark of Disney. Lorai Engine is an unofficial fan project.
            </div>
        </main>
    )
}
