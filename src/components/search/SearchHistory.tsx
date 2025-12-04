"use client";

import * as React from "react";
import { Clock, MapPin, Star, X } from "lucide-react";
import { GlassCard } from "../ui/glass-card";
import { Button } from "../ui/button";

interface SearchHistoryItem {
    id: string;
    from: string;
    to: string;
    date?: string;
    timestamp: number;
}

interface SearchHistoryProps {
    onSelect: (from: string, to: string, date?: string) => void;
}

export function SearchHistory({ onSelect }: SearchHistoryProps) {
    const [history, setHistory] = React.useState<SearchHistoryItem[]>([]);
    const [favorites, setFavorites] = React.useState<SearchHistoryItem[]>([]);

    React.useEffect(() => {
        // Load from localStorage
        const savedHistory = localStorage.getItem('searchHistory');
        const savedFavorites = localStorage.getItem('searchFavorites');

        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, []);

    const removeFromHistory = (id: string) => {
        const updated = history.filter(item => item.id !== id);
        setHistory(updated);
        localStorage.setItem('searchHistory', JSON.stringify(updated));
    };

    const toggleFavorite = (item: SearchHistoryItem) => {
        const isFavorite = favorites.some(fav => fav.id === item.id);
        let updated;

        if (isFavorite) {
            updated = favorites.filter(fav => fav.id !== item.id);
        } else {
            updated = [...favorites, item];
        }

        setFavorites(updated);
        localStorage.setItem('searchFavorites', JSON.stringify(updated));
    };

    const isFavorite = (id: string) => favorites.some(fav => fav.id === id);

    if (history.length === 0 && favorites.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Favorites */}
            {favorites.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        Favorite Routes
                    </h3>
                    <div className="space-y-2">
                        {favorites.map((item) => (
                            <GlassCard
                                key={item.id}
                                className="p-3 cursor-pointer hover:bg-white/60 transition-colors"
                                onClick={() => onSelect(item.from, item.to, item.date)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <span className="font-medium">{item.from}</span>
                                            <span className="text-muted-foreground">→</span>
                                            <span className="font-medium">{item.to}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(item);
                                        }}
                                        className="p-1 hover:bg-white/50 rounded"
                                    >
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    </button>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Searches */}
            {history.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Recent Searches
                    </h3>
                    <div className="space-y-2">
                        {history.slice(0, 5).map((item) => (
                            <GlassCard
                                key={item.id}
                                className="p-3 cursor-pointer hover:bg-white/60 transition-colors"
                                onClick={() => onSelect(item.from, item.to, item.date)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{item.from}</span>
                                            <span className="text-muted-foreground">→</span>
                                            <span className="font-medium">{item.to}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(item);
                                            }}
                                            className="p-1 hover:bg-white/50 rounded"
                                        >
                                            <Star
                                                className={`h-4 w-4 ${isFavorite(item.id)
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-muted-foreground"
                                                    }`}
                                            />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFromHistory(item.id);
                                            }}
                                            className="p-1 hover:bg-white/50 rounded"
                                        >
                                            <X className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper function to save search to history
export function saveSearchToHistory(from: string, to: string, date?: string) {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');

    const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        from,
        to,
        date,
        timestamp: Date.now()
    };

    // Add to beginning, keep only last 10
    const updated = [newItem, ...history].slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
}
