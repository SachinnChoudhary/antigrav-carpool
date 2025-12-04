"use client";

import * as React from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { format, addDays, isToday, isTomorrow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    className?: string;
    placeholder?: string;
}

export function DatePicker({ value, onChange, className, placeholder = "Select Date" }: DatePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [showCustomPicker, setShowCustomPicker] = React.useState(false);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowCustomPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDateSelect = (date: Date) => {
        onChange(format(date, "yyyy-MM-dd"));
        setIsOpen(false);
        setShowCustomPicker(false);
    };

    const getDisplayText = () => {
        if (!value) return placeholder;
        const date = parseISO(value);
        if (isToday(date)) return `Today, ${format(date, "EEE d")}`;
        if (isTomorrow(date)) return `Tomorrow, ${format(date, "EEE d")}`;
        return format(date, "EEE, MMM d");
    };

    return (
        <div className={cn("relative flex-1", className)} ref={wrapperRef}>
            <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none z-10" />

            <div
                className="flex h-12 w-full items-center rounded-xl border border-input bg-background/50 px-3 py-2 pl-10 text-sm ring-offset-background cursor-pointer hover:bg-zinc-800/50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={cn("flex-1", !value && "text-muted-foreground")}>
                    {getDisplayText()}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-xl overflow-hidden">
                    {!showCustomPicker ? (
                        <div className="py-1">
                            <button
                                className="w-full px-4 py-3 text-left hover:bg-zinc-800 text-sm text-zinc-100 transition-colors flex items-center justify-between group"
                                onClick={() => handleDateSelect(new Date())}
                            >
                                <span>Today</span>
                                <span className="text-xs text-zinc-500 group-hover:text-zinc-400">{format(new Date(), "EEE, MMM d")}</span>
                            </button>
                            <button
                                className="w-full px-4 py-3 text-left hover:bg-zinc-800 text-sm text-zinc-100 transition-colors flex items-center justify-between group"
                                onClick={() => handleDateSelect(addDays(new Date(), 1))}
                            >
                                <span>Tomorrow</span>
                                <span className="text-xs text-zinc-500 group-hover:text-zinc-400">{format(addDays(new Date(), 1), "EEE, MMM d")}</span>
                            </button>
                            <div className="h-px bg-zinc-800 my-1" />
                            <button
                                className="w-full px-4 py-3 text-left hover:bg-zinc-800 text-sm text-zinc-100 transition-colors"
                                onClick={() => setShowCustomPicker(true)}
                            >
                                Pick a specific date...
                            </button>
                        </div>
                    ) : (
                        <div className="p-2">
                            <Input
                                type="date"
                                value={value}
                                onChange={(e) => {
                                    onChange(e.target.value);
                                    setIsOpen(false);
                                    setShowCustomPicker(false);
                                }}
                                className="bg-zinc-950 border-zinc-800 focus-visible:ring-zinc-700"
                                style={{ colorScheme: "dark" }}
                                autoFocus
                                min={format(new Date(), "yyyy-MM-dd")}
                            />
                            <button
                                className="w-full mt-2 py-2 text-xs text-zinc-400 hover:text-zinc-200"
                                onClick={() => setShowCustomPicker(false)}
                            >
                                Back to options
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
