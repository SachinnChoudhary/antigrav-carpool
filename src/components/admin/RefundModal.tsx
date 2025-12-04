import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IndianRupee } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: any;
    onRefund: () => void;
}

export function RefundModal({ isOpen, onClose, payment, onRefund }: RefundModalProps) {
    const [loading, setLoading] = useState(false);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');

    const maxRefundAmount = payment ? payment.amount - (payment.refundAmount || 0) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const amount = parseFloat(refundAmount);

        if (amount <= 0 || amount > maxRefundAmount) {
            toast.error(`Refund amount must be between ₹0 and ₹${maxRefundAmount}`);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/admin/payments/${payment.id}/refund`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    refundAmount: amount,
                    refundReason,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to process refund');
            }

            toast.success('Refund processed successfully');
            onRefund();
            onClose();
            setRefundAmount('');
            setRefundReason('');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to process refund');
        } finally {
            setLoading(false);
        }
    };

    if (!payment) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Process Refund">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Original Amount:</span>
                        <span className="font-semibold">₹{payment.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Already Refunded:</span>
                        <span className="font-semibold text-red-600">
                            ₹{(payment.refundAmount || 0).toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                        <span className="text-gray-600">Max Refund:</span>
                        <span className="font-bold text-green-600">
                            ₹{maxRefundAmount.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Refund Amount (₹)</label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={maxRefundAmount}
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        placeholder="0.00"
                        required
                    />
                    <p className="text-xs text-gray-500">
                        Enter amount between ₹0.01 and ₹{maxRefundAmount.toFixed(2)}
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Refund Reason</label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="Enter reason for refund..."
                        required
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} variant="destructive">
                        {loading ? 'Processing...' : 'Process Refund'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
