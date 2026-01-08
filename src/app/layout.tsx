import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Lorai - Lorcana TCG Engine',
    description: 'Play Disney Lorcana against AI opponents',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen">
                {children}
            </body>
        </html>
    )
}
