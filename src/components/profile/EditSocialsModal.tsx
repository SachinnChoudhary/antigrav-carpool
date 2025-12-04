"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Trash2, Plus } from "lucide-react";

interface EditSocialsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    initialProfiles: any[];
    onUpdate: (profiles: any[]) => void;
}

export function EditSocialsModal({ isOpen, onClose, userId, initialProfiles, onUpdate }: EditSocialsModalProps) {
    const [loading, setLoading] = React.useState(false);
    const [profiles, setProfiles] = React.useState<any[]>([]);
    const [newProfile, setNewProfile] = React.useState({ provider: 'Instagram', profileUrl: '' });

    React.useEffect(() => {
        setProfiles(initialProfiles || []);
    }, [initialProfiles]);

    const handleAdd = async () => {
        if (!newProfile.profileUrl) return;
        setLoading(true);

        try {
            const response = await fetch(`/api/profile/${userId}/social-profiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProfile)
            });

            if (!response.ok) throw new Error('Failed to add profile');

            const added = await response.json();
            const updated = [...profiles, added];
            setProfiles(updated);
            onUpdate(updated);
            setNewProfile({ provider: 'Instagram', profileUrl: '' });
            toast.success('Profile added');
        } catch (error) {
            toast.error('Failed to add profile');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/profile/${userId}/social-profiles`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (!response.ok) throw new Error('Failed to delete profile');

            const updated = profiles.filter(p => p.id !== id);
            setProfiles(updated);
            onUpdate(updated);
            toast.success('Profile removed');
        } catch (error) {
            toast.error('Failed to remove profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Social Profiles">
            <div className="space-y-6">
                {/* List existing */}
                <div className="space-y-2">
                    {profiles.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                            <div>
                                <span className="font-medium block">{p.provider}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{p.profileUrl}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(p.id)}
                                className="text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {profiles.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No social profiles added yet.</p>
                    )}
                </div>

                {/* Add new */}
                <div className="space-y-3 pt-4 border-t">
                    <h3 className="text-sm font-medium">Add New Profile</h3>
                    <div className="flex gap-2">
                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={newProfile.provider}
                            onChange={(e) => setNewProfile({ ...newProfile, provider: e.target.value })}
                        >
                            <option value="Instagram">Instagram</option>
                            <option value="Twitter">Twitter</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Facebook">Facebook</option>
                        </select>
                        <Input
                            placeholder="Profile URL"
                            value={newProfile.profileUrl}
                            onChange={(e) => setNewProfile({ ...newProfile, profileUrl: e.target.value })}
                        />
                    </div>
                    <Button onClick={handleAdd} disabled={loading || !newProfile.profileUrl} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Profile
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
