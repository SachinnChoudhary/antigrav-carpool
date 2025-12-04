import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SendNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSent: () => void;
}

export function SendNotificationModal({ isOpen, onClose, onSent }: SendNotificationModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        targetType: 'all',
        targetUserId: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/admin/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to send notification');

            toast.success('Notification sent successfully');
            onSent();
            onClose();
            setFormData({
                title: '',
                message: '',
                type: 'info',
                targetType: 'all',
                targetUserId: '',
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Send Notification">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Notification title"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Notification message"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Target Audience</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.targetType}
                        onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                    >
                        <option value="all">All Users</option>
                        <option value="drivers">Drivers Only</option>
                        <option value="passengers">Passengers Only</option>
                        <option value="verified">Verified Users</option>
                        <option value="individual">Individual User</option>
                    </select>
                </div>

                {formData.targetType === 'individual' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">User ID</label>
                        <Input
                            value={formData.targetUserId}
                            onChange={(e) => setFormData({ ...formData, targetUserId: e.target.value })}
                            placeholder="Enter user ID"
                            required
                        />
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        <Bell className="h-4 w-4 mr-2" />
                        {loading ? 'Sending...' : 'Send Notification'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
