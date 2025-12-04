import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { CreditCard, History, Plus, Trash2, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export function PaymentSettingsModal({ isOpen, onClose, userId }: PaymentSettingsModalProps) {
    const [activeTab, setActiveTab] = useState<'methods' | 'history'>('methods');
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Mock payment methods for now
    const [paymentMethods, setPaymentMethods] = useState([
        { id: '1', type: 'card', last4: '4242', brand: 'Visa', expiry: '12/24' },
        { id: '2', type: 'upi', vpa: 'user@upi', provider: 'Google Pay' }
    ]);

    useEffect(() => {
        if (isOpen && activeTab === 'history') {
            fetchPayments();
        }
    }, [isOpen, activeTab]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/profile/${userId}/payments`);
            if (res.ok) {
                const data = await res.json();
                setPayments(data);
            }
        } catch (error) {
            console.error('Failed to fetch payments', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Payments & Wallets">
            <div className="flex space-x-1 bg-secondary/20 p-1 rounded-lg mb-6">
                <button
                    onClick={() => setActiveTab('methods')}
                    className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'methods'
                        ? 'bg-white shadow text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Payment Methods
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'history'
                        ? 'bg-white shadow text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <History className="w-4 h-4 mr-2" />
                    History
                </button>
            </div>

            <div className="space-y-4">
                {activeTab === 'methods' ? (
                    <div className="space-y-4">
                        {paymentMethods.map((method) => (
                            <GlassCard key={method.id} className="flex items-center justify-between p-4">
                                <div className="flex items-center space-x-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {method.type === 'card'
                                                ? `${method.brand} •••• ${method.last4}`
                                                : method.vpa}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {method.type === 'card'
                                                ? `Expires ${method.expiry}`
                                                : method.provider}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => {
                                    setPaymentMethods(prev => prev.filter(m => m.id !== method.id));
                                }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </GlassCard>
                        ))}

                        <Button className="w-full" variant="outline" onClick={() => {
                            const type = window.prompt('Enter payment type (card/upi):');
                            if (!type) return;
                            if (type === 'card') {
                                const brand = window.prompt('Enter card brand (e.g., Visa):') || 'Visa';
                                const last4 = window.prompt('Enter last 4 digits:') || '0000';
                                const expiry = window.prompt('Enter expiry (MM/YY):') || '01/30';
                                setPaymentMethods(prev => [...prev, { id: Date.now().toString(), type: 'card', brand, last4, expiry }]);
                            } else if (type === 'upi') {
                                const vpa = window.prompt('Enter UPI VPA:') || 'user@upi';
                                const provider = window.prompt('Enter provider (e.g., Google Pay):') || 'Google Pay';
                                setPaymentMethods(prev => [...prev, { id: Date.now().toString(), type: 'upi', vpa, provider }]);
                            } else {
                                alert('Unsupported payment type');
                            }
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Payment Method
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">Loading history...</div>
                        ) : payments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No payment history found</p>
                            </div>
                        ) : (
                            payments.map((payment) => (
                                <GlassCard key={payment.id} className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            {payment.payerId === userId ? (
                                                <div className="p-1.5 bg-red-100 text-red-600 rounded-full">
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </div>
                                            ) : (
                                                <div className="p-1.5 bg-green-100 text-green-600 rounded-full">
                                                    <ArrowDownLeft className="h-4 w-4" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium">
                                                    {payment.payerId === userId
                                                        ? `Paid to ${payment.receiver?.name || 'User'}`
                                                        : `Received from ${payment.payer?.name || 'User'}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(payment.createdAt), 'MMM d, yyyy • h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`font-bold ${payment.payerId === userId ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                            {payment.payerId === userId ? '-' : '+'}₹{payment.amount}
                                        </span>
                                    </div>
                                    {payment.booking?.ride && (
                                        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                                Ride: {payment.booking.ride.from} → {payment.booking.ride.to}
                                            </span>
                                        </div>
                                    )}
                                    <div className="mt-2 flex justify-between items-center">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {payment.status}
                                        </span>
                                        <span className="text-xs text-muted-foreground uppercase">{payment.method || 'Wallet'}</span>
                                    </div>
                                </GlassCard>
                            ))
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
