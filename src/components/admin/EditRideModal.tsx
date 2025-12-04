import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EditRideModalProps {
    isOpen: boolean;
    onClose: () => void;
    ride: any;
    onUpdate: () => void;
}

export function EditRideModal({ isOpen, onClose, ride, onUpdate }: EditRideModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        from: '',
        to: '',
        date: '',
        time: '',
        seats: 1,
        price: 0,
        status: 'active',
    });

    // Update form data when ride changes
    useEffect(() => {
        if (ride) {
            setFormData({
                from: ride.from || '',
                to: ride.to || '',
                date: ride.date ? new Date(ride.date).toISOString().split('T')[0] : '',
                time: ride.time || '',
                seats: ride.seats || 1,
                price: ride.price || 0,
                status: ride.status || 'active',
            });
        }
    }, [ride]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/admin/rides/${ride.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to update ride');

            toast.success('Ride updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update ride');
        } finally {
            setLoading(false);
        }
    };

    if (!ride) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Ride">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">From</label>
                        <Input
                            value={formData.from}
                            onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">To</label>
                        <Input
                            value={formData.to}
                            onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Time</label>
                        <Input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Seats</label>
                        <Input
                            type="number"
                            min="1"
                            value={formData.seats}
                            onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Price (₹)</label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
