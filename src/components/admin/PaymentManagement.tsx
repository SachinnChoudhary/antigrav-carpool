"use client";

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, Download, RefreshCw, Search, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { RefundModal } from './RefundModal';
import toast from 'react-hot-toast';

export function PaymentManagement() {
    const [payments, setPayments] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);

    useEffect(() => {
        loadPayments();
        loadAnalytics();
    }, [statusFilter, page]);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
            });

            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (searchQuery) params.append('search', searchQuery);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`/api/admin/payments?${params}`);
            if (response.ok) {
                const data = await response.json();
                setPayments(data.payments);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        try {
            const response = await fetch('/api/admin/payments/analytics');
            if (response.ok) {
                const data = await response.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Failed to load analytics');
        }
    };

    const handleSearch = () => {
        setPage(1);
        loadPayments();
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`/api/admin/payments/export?${params}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Payments exported successfully');
            }
        } catch (error) {
            toast.error('Failed to export payments');
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: any = {
            completed: 'default',
            pending: 'secondary',
            failed: 'destructive',
            refunded: 'outline',
            partially_refunded: 'outline',
        };
        return <Badge variant={variants[status] || 'secondary'}>{status.replace('_', ' ')}</Badge>;
    };

    return (
        <div className="space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
            {/* Analytics Cards */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold">₹{analytics.totalRevenue?.toFixed(2)}</p>
                                <p className="text-xs text-green-600 mt-1">
                                    {analytics.completedPayments} completed
                                </p>
                            </div>
                            <IndianRupee className="h-8 w-8 text-green-600" />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Refunds</p>
                                <p className="text-2xl font-bold text-red-600">
                                    ₹{analytics.totalRefunds?.toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Issued</p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-red-600" />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Net Revenue</p>
                                <p className="text-2xl font-bold">₹{analytics.netRevenue?.toFixed(2)}</p>
                                <p className="text-xs text-blue-600 mt-1">After refunds</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-blue-600" />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Success Rate</p>
                                <p className="text-2xl font-bold">{analytics.successRate}%</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Avg: ₹{analytics.averageTransaction}
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-purple-600" />
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Filters */}
            <GlassCard className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-9"
                        />
                    </div>

                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                        <option value="partially_refunded">Partially Refunded</option>
                    </select>

                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Start Date"
                    />

                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="End Date"
                    />

                    <div className="flex gap-2">
                        <Button onClick={handleSearch} className="flex-1">
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                        <Button onClick={handleExport} variant="outline">
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => { loadPayments(); loadAnalytics(); }} variant="outline">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </GlassCard>

            {/* Payments Table */}
            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Transaction
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Payer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Receiver
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        Loading payments...
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        No payments found
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-muted/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="font-medium">{payment.id.slice(0, 8)}...</div>
                                                {payment.booking && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {payment.booking.ride?.from} → {payment.booking.ride?.to}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="font-medium">{payment.payer.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {payment.payer.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="font-medium">{payment.receiver.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {payment.receiver.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="font-bold">₹{payment.amount.toFixed(2)}</div>
                                                {payment.refundAmount > 0 && (
                                                    <div className="text-xs text-red-600">
                                                        -₹{payment.refundAmount.toFixed(2)} refunded
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {payment.status === 'completed' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedPayment(payment);
                                                        setRefundModalOpen(true);
                                                    }}
                                                >
                                                    Refund
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t">
                        <div className="text-sm text-muted-foreground">
                            Showing {(page - 1) * pagination.limit + 1} to{' '}
                            {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} payments
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPage(page + 1)}
                                disabled={page === pagination.totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </GlassCard>

            {/* Refund Modal */}
            {refundModalOpen && selectedPayment && (
                <RefundModal
                    isOpen={refundModalOpen}
                    onClose={() => {
                        setRefundModalOpen(false);
                        setSelectedPayment(null);
                    }}
                    payment={selectedPayment}
                    onRefund={() => {
                        loadPayments();
                        loadAnalytics();
                    }}
                />
            )}
        </div>
    );
}
