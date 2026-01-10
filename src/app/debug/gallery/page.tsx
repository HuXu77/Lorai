'use client';

import { useEffect, useState } from 'react';
import Card from '../../../components/Card';


export default function CardGalleryPage() {
    const [cards, setCards] = useState<any[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState<string>('');
    const [page, setPage] = useState(0);
    const pageSize = 50;

    useEffect(() => {
        // Client-side: fetch from API or use pre-loaded data
        fetch('/api/cards')
            .then(res => res.json())
            .then(data => setCards(data))
            .catch(() => {
                console.log('Could not load cards from API');
            });
    }, []);

    const filteredCards = cards.filter(card => {
        if (filter !== 'all' && card.type !== filter) return false;
        if (search && !card.fullName?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const pageCards = filteredCards.slice(page * pageSize, (page + 1) * pageSize);
    const totalPages = Math.ceil(filteredCards.length / pageSize);

    const renderErrors: string[] = [];

    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <h1 className="text-3xl font-bold text-white mb-6">Card Gallery ({filteredCards.length} cards)</h1>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <select
                    value={filter}
                    onChange={(e) => { setFilter(e.target.value); setPage(0); }}
                    className="bg-slate-700 text-white px-4 py-2 rounded"
                >
                    <option value="all">All Types</option>
                    <option value="Character">Characters</option>
                    <option value="Action">Actions</option>
                    <option value="Item">Items</option>
                    <option value="Location">Locations</option>
                </select>

                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="bg-slate-700 text-white px-4 py-2 rounded flex-1 max-w-md"
                />
            </div>

            {/* Pagination */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-white py-2">
                    Page {page + 1} of {totalPages}
                </span>
                <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {pageCards.map((card, index) => (
                    <div key={card.id || index} className="relative">
                        <ErrorBoundary
                            fallback={<div className="bg-red-900 text-white p-2 rounded text-xs">Error: {card.fullName}</div>}
                            onError={() => renderErrors.push(card.fullName)}
                        >
                            <Card
                                card={{
                                    instanceId: `gallery-${card.id}`,
                                    ...card,
                                    ownerId: 'gallery',
                                    zone: 'hand',
                                    ready: true,
                                    damage: 0,
                                    turnPlayed: 0,
                                    meta: {}
                                }}
                                disableHoverZoom={true}
                            />
                        </ErrorBoundary>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                            {card.fullName}
                        </div>
                    </div>
                ))}
            </div>

            {/* Render Error Summary */}
            {renderErrors.length > 0 && (
                <div className="mt-8 bg-red-900/50 p-4 rounded">
                    <h2 className="text-red-400 font-bold">Render Errors ({renderErrors.length})</h2>
                    <ul className="text-red-300 text-sm">
                        {renderErrors.map((name, i) => (
                            <li key={i}>• {name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// Simple Error Boundary component
function ErrorBoundary({ children, fallback, onError }: {
    children: React.ReactNode;
    fallback: React.ReactNode;
    onError?: () => void;
}) {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const handleError = () => {
            setHasError(true);
            onError?.();
        };
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, [onError]);

    if (hasError) return <>{fallback}</>;
    return <>{children}</>;
}
