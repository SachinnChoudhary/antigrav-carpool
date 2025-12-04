"use client";

import * as React from "react";
import { GlassCard } from "../ui/glass-card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { Filter, X } from "lucide-react";

interface AdvancedFiltersProps {
    onApply: (filters: SearchFilters) => void;
    onClose: () => void;
}

export interface SearchFilters {
    maxPrice?: number;
    minSeats?: number;
    flexibleDates?: boolean;
    flexibleDays?: number;
    amenities?: string[];
    minRating?: number;
    verifiedOnly?: boolean;
    sortBy?: 'price' | 'rating' | 'departure' | 'seats';
}

const AMENITIES = [
    'AC',
    'WiFi',
    'Music',
    'Pets Allowed',
    'Luggage Space',
    'Child Seat',
    'Non-Smoking',
];

export function AdvancedFilters({ onApply, onClose }: AdvancedFiltersProps) {
    const [filters, setFilters] = React.useState<SearchFilters>({
        maxPrice: 100,
        minSeats: 1,
        flexibleDates: false,
        flexibleDays: 0,
        amenities: [],
        minRating: 0,
        verifiedOnly: false,
        sortBy: 'departure',
    });

    const handleAmenityToggle = (amenity: string) => {
        const current = filters.amenities || [];
        const updated = current.includes(amenity)
            ? current.filter(a => a !== amenity)
            : [...current, amenity];
        setFilters({ ...filters, amenities: updated });
    };

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleReset = () => {
        setFilters({
            maxPrice: 100,
            minSeats: 1,
            flexibleDates: false,
            flexibleDays: 0,
            amenities: [],
            minRating: 0,
            verifiedOnly: false,
            sortBy: 'departure',
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold">Advanced Filters</h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-2">
                        <Label>Maximum Price: ₹{filters.maxPrice}</Label>
                        <Slider
                            value={[filters.maxPrice || 100]}
                            onValueChange={([value]) => setFilters({ ...filters, maxPrice: value })}
                            max={200}
                            step={5}
                        />
                    </div>

                    {/* Minimum Seats */}
                    <div className="space-y-2">
                        <Label>Minimum Available Seats</Label>
                        <Select
                            value={filters.minSeats?.toString()}
                            onValueChange={(value) => setFilters({ ...filters, minSeats: parseInt(value) })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                    <SelectItem key={num} value={num.toString()}>
                                        {num} {num === 1 ? 'seat' : 'seats'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Flexible Dates */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={filters.flexibleDates}
                                onCheckedChange={(checked) =>
                                    setFilters({ ...filters, flexibleDates: checked as boolean })
                                }
                            />
                            <Label>Flexible Dates</Label>
                        </div>
                        {filters.flexibleDates && (
                            <div className="ml-6 space-y-2">
                                <Label>±{filters.flexibleDays} days</Label>
                                <Slider
                                    value={[filters.flexibleDays || 0]}
                                    onValueChange={([value]) => setFilters({ ...filters, flexibleDays: value })}
                                    max={7}
                                    step={1}
                                />
                            </div>
                        )}
                    </div>

                    {/* Amenities */}
                    <div className="space-y-3">
                        <Label>Amenities</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {AMENITIES.map((amenity) => (
                                <div key={amenity} className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={filters.amenities?.includes(amenity)}
                                        onCheckedChange={() => handleAmenityToggle(amenity)}
                                    />
                                    <Label className="text-sm font-normal">{amenity}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Minimum Rating */}
                    <div className="space-y-2">
                        <Label>Minimum Driver Rating: {filters.minRating?.toFixed(1)} ⭐</Label>
                        <Slider
                            value={[filters.minRating || 0]}
                            onValueChange={([value]) => setFilters({ ...filters, minRating: value })}
                            max={5}
                            step={0.5}
                        />
                    </div>

                    {/* Verified Only */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={filters.verifiedOnly}
                            onCheckedChange={(checked) =>
                                setFilters({ ...filters, verifiedOnly: checked as boolean })
                            }
                        />
                        <Label>Verified Drivers Only</Label>
                    </div>

                    {/* Sort By */}
                    <div className="space-y-2">
                        <Label>Sort By</Label>
                        <Select
                            value={filters.sortBy}
                            onValueChange={(value: any) => setFilters({ ...filters, sortBy: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="departure">Departure Time</SelectItem>
                                <SelectItem value="price">Price (Low to High)</SelectItem>
                                <SelectItem value="rating">Driver Rating</SelectItem>
                                <SelectItem value="seats">Available Seats</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <Button variant="outline" onClick={handleReset} className="flex-1">
                            Reset
                        </Button>
                        <Button onClick={handleApply} className="flex-1">
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
