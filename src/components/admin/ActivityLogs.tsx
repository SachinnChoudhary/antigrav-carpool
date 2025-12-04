"use client";

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Activity, Download, RefreshCw, Search, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export function ActivityLogs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        actionType: 'all',
        actorType: 'all',
        status: 'all',
        search: '',
        startDate: '',
        endDate: '',
    });
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    useEffect(() => {
        loadLogs();
        loadStats();
    }, [page, filters.actionType, filters.actorType, filters.status]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '50',
            });

            if (filters.actionType !== 'all') params.append('actionType', filters.actionType);
            if (filters.actorType !== 'all') params.append('actorType', filters.actorType);
            if (filters.status !== 'all') params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await fetch(`/api/admin/activity-logs?${params}`);
            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await fetch('/api/admin/activity-logs/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to load stats');
        }
    };

    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.actionType !== 'all') params.append('actionType', filters.actionType);
            if (filters.actorType !== 'all') params.append('actorType', filters.actorType);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await fetch(`/api/admin/activity-logs/export?${params}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Logs exported successfully');
            }
        } catch (error) {
            toast.error('Failed to export logs');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'failure':
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            default:
                return <Activity className="h-4 w-4 text-gray-600" />;
        }
    };

    const getActorTypeBadge = (type: string) => {
        const variants: any = {
            admin: 'destructive',
            user: 'default',
            system: 'secondary',
        };
        return <Badge variant={variants[type] || 'default'}>{type}</Badge>;
    };

    return (
        <div className="space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Logs</p>
                                <p className="text-2xl font-bold">{stats.totalLogs}</p>
                                <p className="text-xs text-green-600 mt-1">
                                    +{stats.todayLogs} today
                                </p>
                            </div>
                            <Activity className="h-8 w-8 text-blue-600" />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Failed Actions</p>
                                <p className="text-2xl font-bold text-red-600">{stats.failedActions}</p>
                                <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Top Action</p>
                                <p className="text-lg font-bold">
                                    {stats.byType[0]?.type.replace('_', ' ') || 'N/A'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.byType[0]?.count || 0} times
                                </p>
                            </div>
                            <Activity className="h-8 w-8 text-purple-600" />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Most Active User</p>
                                <p className="text-sm font-bold truncate">
                                    {stats.topUsers[0]?.user?.name || 'N/A'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.topUsers[0]?.count || 0} actions
                                </p>
                            </div>
                            <Activity className="h-8 w-8 text-green-600" />
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Filters */}
            <GlassCard className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && loadLogs()}
                            className="pl-9"
                        />
                    </div>

                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={filters.actorType}
                        onChange={(e) => setFilters({ ...filters, actorType: e.target.value })}
                    >
                        <option value="all">All Actors</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="system">System</option>
                    </select>

                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="all">All Status</option>
                        <option value="success">Success</option>
                        <option value="failure">Failure</option>
                        <option value="pending">Pending</option>
                    </select>

                    <Input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />

                    <Input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />

                    <div className="flex gap-2">
                        <Button onClick={loadLogs} className="flex-1">
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                        <Button onClick={handleExport} variant="outline">
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => { loadLogs(); loadStats(); }} variant="outline">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </GlassCard>

            {/* Activity Logs Table */}
            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                    Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                    Actor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                    Action
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                                    IP
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        No activity logs found
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-muted/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getActorTypeBadge(log.actorType)}
                                                <div className="text-sm">
                                                    <div className="font-medium">{log.user?.name || 'System'}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {log.user?.email || 'Automated'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                {log.actionType}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm max-w-md truncate">{log.description}</p>
                                            {log.targetType && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Target: {log.targetType} ({log.targetId?.slice(0, 8)}...)
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(log.status)}
                                                <span className="text-sm capitalize">{log.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {log.ipAddress || 'N/A'}
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
                            {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} logs
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
        </div>
    );
}
