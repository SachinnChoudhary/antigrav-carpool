"use client";

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, IndianRupee, Users, MapPin, CreditCard } from 'lucide-react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AnalyticsDashboard() {
    const [timeRange, setTimeRange] = useState('month');
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/analytics/advanced?timeRange=${timeRange}`);
            if (response.ok) {
                const data = await response.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !analytics) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading analytics...</p>
            </div>
        );
    }

    const getTrendIcon = (trend: number) => {
        return trend >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
        ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
        );
    };

    const getTrendColor = (trend: number) => {
        return trend >= 0 ? 'text-green-600' : 'text-red-600';
    };

    return (
        <div className="space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
            {/* Time Range Selector */}
            <div className="flex justify-end gap-2">
                <Button
                    size="sm"
                    variant={timeRange === 'day' ? 'default' : 'outline'}
                    onClick={() => setTimeRange('day')}
                >
                    Day
                </Button>
                <Button
                    size="sm"
                    variant={timeRange === 'week' ? 'default' : 'outline'}
                    onClick={() => setTimeRange('week')}
                >
                    Week
                </Button>
                <Button
                    size="sm"
                    variant={timeRange === 'month' ? 'default' : 'outline'}
                    onClick={() => setTimeRange('month')}
                >
                    Month
                </Button>
                <Button
                    size="sm"
                    variant={timeRange === 'year' ? 'default' : 'outline'}
                    onClick={() => setTimeRange('year')}
                >
                    Year
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold">₹{analytics.summary.totalRevenue.toFixed(2)}</p>
                            <div className="flex items-center gap-1 mt-1">
                                {getTrendIcon(analytics.trends.revenue)}
                                <span className={`text-xs font-medium ${getTrendColor(analytics.trends.revenue)}`}>
                                    {Math.abs(analytics.trends.revenue).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <IndianRupee className="h-8 w-8 text-green-600" />
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">New Users</p>
                            <p className="text-2xl font-bold">{analytics.summary.newUsers}</p>
                            <div className="flex items-center gap-1 mt-1">
                                {getTrendIcon(analytics.trends.users)}
                                <span className={`text-xs font-medium ${getTrendColor(analytics.trends.users)}`}>
                                    {Math.abs(analytics.trends.users).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Rides</p>
                            <p className="text-2xl font-bold">{analytics.summary.totalRides}</p>
                            <p className="text-xs text-muted-foreground mt-1">All statuses</p>
                        </div>
                        <MapPin className="h-8 w-8 text-purple-600" />
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Bookings</p>
                            <p className="text-2xl font-bold">{analytics.summary.totalBookings}</p>
                            <p className="text-xs text-muted-foreground mt-1">Period total</p>
                        </div>
                        <CreditCard className="h-8 w-8 text-orange-600" />
                    </div>
                </GlassCard>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </GlassCard>

                {/* User Growth Chart */}
                <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analytics.userGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="users"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassCard>

                {/* Ride Statistics */}
                <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Ride Statistics</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.rideStatsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="status" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Bar dataKey="count" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </GlassCard>

                {/* Payment Distribution */}
                <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Payment Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={analytics.paymentDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {analytics.paymentDistribution.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </GlassCard>
            </div>

            {/* Booking Trends */}
            {analytics.bookingTrendsData.length > 0 && (
                <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Booking Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.bookingTrendsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="bookings"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={{ fill: '#f59e0b' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </GlassCard>
            )}
        </div>
    );
}
