import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Trash2, UserX, UserCheck, Users } from 'lucide-react';

interface BulkActionBarProps {
    selectedCount: number;
    onClear: () => void;
    actions: {
        label: string;
        icon: React.ReactNode;
        onClick: () => void;
        variant?: 'default' | 'destructive' | 'outline';
    }[];
}

export function BulkActionBar({ selectedCount, onClear, actions }: BulkActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 px-6 py-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {selectedCount} selected
                    </div>
                </div>

                <div className="h-6 w-px bg-gray-300" />

                <div className="flex items-center gap-2">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            size="sm"
                            variant={action.variant || 'outline'}
                            onClick={action.onClick}
                        >
                            {action.icon}
                            <span className="ml-2">{action.label}</span>
                        </Button>
                    ))}
                </div>

                <div className="h-6 w-px bg-gray-300" />

                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClear}
                >
                    <X className="h-4 w-4" />
                    <span className="ml-2">Clear</span>
                </Button>
            </div>
        </div>
    );
}
