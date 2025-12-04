"use client";

import * as React from "react";
import { GlassCard } from "../ui/glass-card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import toast from "react-hot-toast";

interface PrivacySettings {
    profileVisibility: 'public' | 'friends' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    showRideHistory: boolean;
}

interface PrivacySettingsProps {
    userId: string;
}

export function PrivacySettings({ userId }: PrivacySettingsProps) {
    const [settings, setSettings] = React.useState<PrivacySettings>({
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        showRideHistory: true,
    });
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        loadSettings();
    }, [userId]);

    const loadSettings = async () => {
        try {
            const response = await fetch(`/api/users/${userId}/privacy`);
            const data = await response.json();

            if (response.ok) {
                setSettings(data);
            }
        } catch (error) {
            toast.error('Failed to load privacy settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`/api/users/${userId}/privacy`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                toast.success('Privacy settings updated');
            } else {
                throw new Error('Failed to update settings');
            }
        } catch (error) {
            toast.error('Failed to save privacy settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <GlassCard className="p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-6 space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Control who can see your information
                </p>
            </div>

            {/* Profile Visibility */}
            <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select
                    value={settings.profileVisibility}
                    onValueChange={(value: any) =>
                        setSettings({ ...settings, profileVisibility: value })
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="public">Public - Anyone can view</SelectItem>
                        <SelectItem value="friends">Friends - Only connections</SelectItem>
                        <SelectItem value="private">Private - Only you</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Show Email */}
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label>Show Email Address</Label>
                    <p className="text-sm text-muted-foreground">
                        Display your email on your profile
                    </p>
                </div>
                <Switch
                    checked={settings.showEmail}
                    onCheckedChange={(checked) =>
                        setSettings({ ...settings, showEmail: checked })
                    }
                />
            </div>

            {/* Show Phone */}
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label>Show Phone Number</Label>
                    <p className="text-sm text-muted-foreground">
                        Display your phone number on your profile
                    </p>
                </div>
                <Switch
                    checked={settings.showPhone}
                    onCheckedChange={(checked) =>
                        setSettings({ ...settings, showPhone: checked })
                    }
                />
            </div>

            {/* Show Ride History */}
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label>Show Ride History</Label>
                    <p className="text-sm text-muted-foreground">
                        Display your past rides on your profile
                    </p>
                </div>
                <Switch
                    checked={settings.showRideHistory}
                    onCheckedChange={(checked) =>
                        setSettings({ ...settings, showRideHistory: checked })
                    }
                />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Privacy Settings'}
            </Button>
        </GlassCard>
    );
}
