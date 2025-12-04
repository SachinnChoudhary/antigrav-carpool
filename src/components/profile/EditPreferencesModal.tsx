"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Music, Cigarette, Cat, MessageCircle } from "lucide-react";

interface EditPreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    initialPreferences: any;
    onUpdate: (prefs: any) => void;
}

const PREF_OPTIONS = {
    music: [
        { value: 'all', label: 'All kinds of music' },
        { value: 'pop', label: 'Pop music' },
        { value: 'rock', label: 'Rock music' },
        { value: 'quiet', label: 'Silence is golden' },
    ],
    smoking: [
        { value: 'no', label: 'No smoking please' },
        { value: 'ok', label: 'Smoking allowed' },
    ],
    pets: [
        { value: 'no', label: 'No pets please' },
        { value: 'ok', label: 'Pets welcome' },
    ],
    chat: [
        { value: 'chatty', label: 'I love to chat' },
        { value: 'quiet', label: 'I prefer quiet' },
        { value: 'mood', label: 'Depends on mood' },
    ]
};

export function EditPreferencesModal({ isOpen, onClose, userId, initialPreferences, onUpdate }: EditPreferencesModalProps) {
    const [loading, setLoading] = React.useState(false);
    const [prefs, setPrefs] = React.useState<any>({});

    React.useEffect(() => {
        if (initialPreferences) {
            setPrefs(initialPreferences);
        }
    }, [initialPreferences]);

    const handleToggle = (key: string, value: string) => {
        setPrefs((prev: any) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/profile/${userId}/preferences`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferences: prefs })
            });

            if (!response.ok) throw new Error('Failed to update preferences');

            const data = await response.json();
            // The API returns the full user object, so we extract preferences
            const newPreferences = data.preferences || data;
            onUpdate(newPreferences);
            toast.success('Preferences updated');
            onClose();
        } catch (error) {
            toast.error('Failed to update preferences');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Preferences">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Music */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 font-medium">
                        <Music className="h-4 w-4" />
                        <span>Music</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {PREF_OPTIONS.music.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleToggle('music', opt.value)}
                                className={`p-2 text-sm rounded-lg border transition-colors ${prefs.music === opt.value
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'hover:bg-secondary'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Smoking */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 font-medium">
                        <Cigarette className="h-4 w-4" />
                        <span>Smoking</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {PREF_OPTIONS.smoking.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleToggle('smoking', opt.value)}
                                className={`p-2 text-sm rounded-lg border transition-colors ${prefs.smoking === opt.value
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'hover:bg-secondary'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pets */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 font-medium">
                        <Cat className="h-4 w-4" />
                        <span>Pets</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {PREF_OPTIONS.pets.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleToggle('pets', opt.value)}
                                className={`p-2 text-sm rounded-lg border transition-colors ${prefs.pets === opt.value
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'hover:bg-secondary'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 font-medium">
                        <MessageCircle className="h-4 w-4" />
                        <span>Chat</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {PREF_OPTIONS.chat.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleToggle('chat', opt.value)}
                                className={`p-2 text-sm rounded-lg border transition-colors ${prefs.chat === opt.value
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'hover:bg-secondary'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Preferences'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
