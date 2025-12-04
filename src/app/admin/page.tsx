"use client";

import * as React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Ban, Search, ChevronLeft, ChevronRight, FileCheck, Car, BarChart3, MapPin, IndianRupee, TrendingUp, Edit, Bell, User, LogOut, Settings, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { EditRideModal } from "@/components/admin/EditRideModal";
import { EditUserModal } from "@/components/admin/EditUserModal";
import { PaymentManagement } from "@/components/admin/PaymentManagement";
import { CommunicationTools } from "@/components/admin/CommunicationTools";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { ActivityLogs } from "@/components/admin/ActivityLogs";
import { SupportChatManagement } from "@/components/admin/SupportChatManagement";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    suspended: boolean;
    suspendedAt?: string;
    suspensionReason?: string;
    verified: boolean;
    createdAt: string;
    totalRides: number;
    rating: number;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export default function AdminPage() {
    const router = useRouter();
    const [users, setUsers] = React.useState<User[]>([]);
    const [pagination, setPagination] = React.useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    });
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [showRoleModal, setShowRoleModal] = React.useState(false);
    const [showSuspendModal, setShowSuspendModal] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<'dashboard' | 'users' | 'verifications' | 'rides' | 'payments' | 'communications' | 'support-chats' | 'logs'>('dashboard');
    const [verificationRequests, setVerificationRequests] = React.useState<any[]>([]);
    const [analytics, setAnalytics] = React.useState<any>(null);
    const [rides, setRides] = React.useState<any[]>([]);
    const [rideFilter, setRideFilter] = React.useState('all');
    const [editRideModalOpen, setEditRideModalOpen] = React.useState(false);
    const [selectedRide, setSelectedRide] = React.useState<any>(null);
    const [editUserModalOpen, setEditUserModalOpen] = React.useState(false);

    // Bulk action states
    const [selectedUsers, setSelectedUsers] = React.useState<Set<string>>(new Set());
    const [selectedRides, setSelectedRides] = React.useState<string[]>([]);
    const [bulkActionLoading, setBulkActionLoading] = React.useState(false);
    const [adminInfo, setAdminInfo] = React.useState<any>(null);

    React.useEffect(() => {
        loadAdminInfo();
        loadUsers();
        loadVerificationRequests();
        loadAnalytics();
        loadRides();
    }, []); // Initial load for admin info, users, verifications, analytics, and rides

    React.useEffect(() => {
        // This useEffect handles pagination, activeTab, and rideFilter changes
        if (activeTab === 'users') {
            loadUsers();
        } else if (activeTab === 'rides') {
            loadRides();
        }
    }, [pagination.page, activeTab, rideFilter]);

    const loadAdminInfo = async () => {
        try {
            const response = await fetch('/api/profile');
            if (response.ok) {
                const data = await response.json();
                setAdminInfo(data.user);
            }
        } catch (error) {
            console.error('Failed to load admin info');
        }
    };

    const handleLogout = () => {
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/admin/login');
    };

    const loadUsers = async () => {
        try {
            const response = await fetch(`/api/admin/users?page=${pagination.page}&limit=${pagination.limit}`);

            if (response.status === 403) {
                toast.error('Access denied. Admin privileges required.');
                router.push('/');
                return;
            }

            const data = await response.json();

            if (response.ok) {
                setUsers(data.users);
                setPagination(data.pagination);
            } else {
                toast.error(data.error || 'Failed to load users');
            }
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const loadVerificationRequests = async () => {
        try {
            const response = await fetch('/api/admin/verification-requests');
            if (response.ok) {
                const data = await response.json();
                setVerificationRequests(data.verificationRequests || []);
            }
        } catch (error) {
            console.error('Failed to load verification requests');
        }
    };

    const handleVerificationApproval = async (userId: string, verificationType: 'id' | 'driverLicense', approved: boolean) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/${userId}/verify`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verificationType, approved }),
            });

            if (response.ok) {
                toast.success(approved ? 'Verification approved' : 'Verification rejected');
                loadVerificationRequests();
                loadUsers();
            } else {
                toast.error('Failed to update verification');
            }
        } catch (error) {
            toast.error('Failed to update verification');
        }
    };

    const loadAnalytics = async () => {
        try {
            const response = await fetch('/api/admin/analytics');
            if (response.ok) {
                const data = await response.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Failed to load analytics');
        }
    };

    const loadRides = async () => {
        try {
            const response = await fetch(`/api/admin/rides?status=${rideFilter}`);
            if (response.ok) {
                const data = await response.json();
                setRides(data);
            }
        } catch (error) {
            console.error('Failed to load rides');
        }
    };

    const handleRideStatusChange = async (rideId: string, status: string) => {
        try {
            const response = await fetch('/api/admin/rides', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rideId, status }),
            });

            if (response.ok) {
                toast.success('Ride status updated');
                loadRides();
            } else {
                toast.error('Failed to update ride');
            }
        } catch (error) {
            toast.error('Failed to update ride');
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });

            if (response.ok) {
                toast.success('Role updated successfully');
                loadUsers();
                setShowRoleModal(false);
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to update role');
            }
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const handleSuspend = async (userId: string, suspend: boolean, reason?: string) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/suspend`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ suspend, reason }),
            });

            if (response.ok) {
                toast.success(suspend ? 'User suspended' : 'User unsuspended');
                loadUsers();
                setShowSuspendModal(false);
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to update suspension');
            }
        } catch (error) {
            toast.error('Failed to update suspension');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: pagination.total,
        admins: users.filter(u => u.role === 'admin').length,
        drivers: users.filter(u => u.role === 'driver').length,
        suspended: users.filter(u => u.suspended).length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-3">
                                <Shield className="h-8 w-8 text-purple-600" />
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                                    <p className="text-xs text-gray-500">Carpooling Platform</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Admin Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo/Title */}
                        <div className="flex items-center gap-3">
                            <Shield className="h-8 w-8 text-purple-600" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                                <p className="text-xs text-gray-500">Carpooling Platform</p>
                            </div>
                        </div>

                        {/* Admin Profile & Actions */}
                        <div className="flex items-center gap-4">
                            {adminInfo && (
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{adminInfo.name}</p>
                                        <p className="text-xs text-gray-500">{adminInfo.email}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                                        {adminInfo.name?.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage users, roles, and permissions</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    <Button
                        variant={activeTab === 'dashboard' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Dashboard
                    </Button>
                    <Button
                        variant={activeTab === 'users' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users className="h-4 w-4 mr-2" />
                        Users
                    </Button>
                    <Button
                        variant={activeTab === 'verifications' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('verifications')}
                    >
                        <FileCheck className="h-4 w-4 mr-2" />
                        Verifications ({verificationRequests.length})
                    </Button>
                    <Button
                        variant={activeTab === 'rides' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('rides')}
                    >
                        <MapPin className="h-4 w-4 mr-2" />
                        Rides
                    </Button>
                    <Button
                        variant={activeTab === 'payments' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('payments')}
                    >
                        <IndianRupee className="h-4 w-4 mr-2" />
                        Payments
                    </Button>
                    <Button
                        variant={activeTab === 'communications' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('communications')}
                    >
                        <Bell className="h-4 w-4 mr-2" />
                        Communications
                    </Button>
                    <Button
                        variant={activeTab === 'support-chats' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('support-chats')}
                    >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Support Chats
                    </Button>
                    <Button
                        variant={activeTab === 'logs' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('logs')}
                    >
                        <FileCheck className="h-4 w-4 mr-2" />
                        Activity Logs
                    </Button>
                </div>

                {/* Stats - Enhanced */}
                {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <GlassCard className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Users</p>
                                    <p className="text-2xl font-bold">{analytics.totalUsers}</p>
                                    <p className="text-xs text-green-600 mt-1">+{analytics.recentUsers} this month</p>
                                </div>
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Rides</p>
                                    <p className="text-2xl font-bold">{analytics.totalRides}</p>
                                    <p className="text-xs text-blue-600 mt-1">{analytics.activeRides} active</p>
                                </div>
                                <MapPin className="h-8 w-8 text-blue-600" />
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                                    <p className="text-2xl font-bold">{analytics.totalBookings}</p>
                                    <p className="text-xs text-purple-600 mt-1">All time</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-purple-600" />
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Revenue</p>
                                    <p className="text-2xl font-bold">₹{analytics.totalRevenue?.toFixed(2) || '0.00'}</p>
                                    <p className="text-xs text-green-600 mt-1">{analytics.totalPayments} payments</p>
                                </div>
                                <IndianRupee className="h-8 w-8 text-green-600" />
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Content based on active tab */}
                {activeTab === 'dashboard' && analytics && (
                    <div className="space-y-6">
                        <GlassCard className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Completed Rides</p>
                                    <p className="text-xl font-bold">{analytics.completedRides}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Rides</p>
                                    <p className="text-xl font-bold">{analytics.activeRides}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">New Users (30d)</p>
                                    <p className="text-xl font-bold">{analytics.recentUsers}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">New Rides (30d)</p>
                                    <p className="text-xl font-bold">{analytics.recentRides}</p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <ActivityLogs />
                )}

                {activeTab === 'communications' && (
                    <CommunicationTools />
                )}

                {activeTab === 'support-chats' && (
                    <SupportChatManagement />
                )}

                {activeTab === 'payments' && (
                    <PaymentManagement />
                )}

                {activeTab === 'rides' && (
                    <div className="space-y-4">
                        {/* Ride Filters */}
                        <GlassCard className="p-4">
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={rideFilter === 'all' ? 'default' : 'outline'}
                                    onClick={() => setRideFilter('all')}
                                >
                                    All
                                </Button>
                                <Button
                                    size="sm"
                                    variant={rideFilter === 'active' ? 'default' : 'outline'}
                                    onClick={() => setRideFilter('active')}
                                >
                                    Active
                                </Button>
                                <Button
                                    size="sm"
                                    variant={rideFilter === 'completed' ? 'default' : 'outline'}
                                    onClick={() => setRideFilter('completed')}
                                >
                                    Completed
                                </Button>
                                <Button
                                    size="sm"
                                    variant={rideFilter === 'cancelled' ? 'default' : 'outline'}
                                    onClick={() => setRideFilter('cancelled')}
                                >
                                    Cancelled
                                </Button>
                            </div>
                        </GlassCard>

                        {/* Rides List */}
                        {rides.length === 0 ? (
                            <GlassCard className="p-12 text-center">
                                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">No rides found</p>
                            </GlassCard>
                        ) : (
                            rides.map((ride) => (
                                <GlassCard key={ride.id} className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <MapPin className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{ride.from} → {ride.to}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Driver: {ride.driver.name}
                                                    </p>
                                                </div>
                                                <Badge variant={ride.status === 'active' ? 'default' : ride.status === 'completed' ? 'secondary' : 'destructive'}>
                                                    {ride.status}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Date</p>
                                                    <p className="font-medium">{new Date(ride.date).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Time</p>
                                                    <p className="font-medium">{ride.time}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Seats</p>
                                                    <p className="font-medium">{ride.seats}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Price</p>
                                                    <p className="font-medium">${ride.price}</p>
                                                </div>
                                            </div>
                                            {ride.bookings.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-sm text-muted-foreground mb-1">Passengers:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {ride.bookings.map((booking: any) => (
                                                            <Badge key={booking.id} variant="outline">
                                                                {booking.passenger.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedRide(ride);
                                                    setEditRideModalOpen(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                            {ride.status === 'active' && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleRideStatusChange(ride.id, 'cancelled')}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            ))
                        )}
                    </div>
                )}

                {/* Search */}
                {activeTab === 'users' && (
                    <GlassCard className="p-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search users by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </GlassCard>
                )}

                {activeTab === 'users' ? (
                    /* Users Table */
                    <GlassCard className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stats
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge
                                                    variant={
                                                        user.role === 'admin' ? 'default' :
                                                            user.role === 'driver' ? 'secondary' :
                                                                'outline'
                                                    }
                                                >
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.suspended ? (
                                                    <Badge variant="destructive">Suspended</Badge>
                                                ) : user.verified ? (
                                                    <Badge variant="default" className="bg-green-600">Verified</Badge>
                                                ) : (
                                                    <Badge variant="outline">Active</Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <div>{user.totalRides} rides</div>
                                                    <div className="text-muted-foreground">
                                                        ⭐ {user.rating.toFixed(1)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            console.log('Edit button clicked for user:', user);
                                                            setSelectedUser(user);
                                                            setEditUserModalOpen(true);
                                                            console.log('Modal state set to true');
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowRoleModal(true);
                                                        }}
                                                    >
                                                        Change Role
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={user.suspended ? "default" : "destructive"}
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            if (user.suspended) {
                                                                handleSuspend(user.id, false);
                                                            } else {
                                                                setShowSuspendModal(true);
                                                            }
                                                        }}
                                                    >
                                                        {user.suspended ? 'Unsuspend' : 'Suspend'}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                {pagination.total} users
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                ) : (
                    /* Verification Requests */
                    <div className="space-y-4">
                        {verificationRequests.length === 0 ? (
                            <GlassCard className="p-12 text-center">
                                <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">No pending verification requests</p>
                            </GlassCard>
                        ) : (
                            verificationRequests.map((req) => (
                                <GlassCard key={req.id} className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Users className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{req.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{req.email}</p>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* ID Verification */}
                                                {req.idDocumentUrl && !req.idVerified && (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <FileCheck className="h-5 w-5 text-blue-600" />
                                                            <h4 className="font-medium">Identity Document</h4>
                                                        </div>
                                                        <div className="bg-secondary/20 rounded-lg p-3 space-y-2">
                                                            <div className="text-sm">
                                                                <span className="text-muted-foreground">Type:</span>{' '}
                                                                <span className="font-medium capitalize">{req.idType || 'N/A'}</span>
                                                            </div>
                                                            <div className="text-sm">
                                                                <span className="text-muted-foreground">Number:</span>{' '}
                                                                <span className="font-medium">{req.idNumber || 'N/A'}</span>
                                                            </div>
                                                            {req.idDocumentUrl && (
                                                                <a
                                                                    href={req.idDocumentUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-block mt-2"
                                                                >
                                                                    <img
                                                                        src={req.idDocumentUrl}
                                                                        alt="ID Document"
                                                                        className="max-h-40 rounded border"
                                                                    />
                                                                </a>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleVerificationApproval(req.id, 'id', true)}
                                                                className="flex-1"
                                                            >
                                                                Approve ID
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleVerificationApproval(req.id, 'id', false)}
                                                                className="flex-1"
                                                            >
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Driver License Verification */}
                                                {req.driverLicenseUrl && !req.driverLicenseVerified && (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <Car className="h-5 w-5 text-green-600" />
                                                            <h4 className="font-medium">Driver's License</h4>
                                                        </div>
                                                        <div className="bg-secondary/20 rounded-lg p-3 space-y-2">
                                                            <div className="text-sm">
                                                                <span className="text-muted-foreground">License Number:</span>{' '}
                                                                <span className="font-medium">{req.driverLicenseNumber || 'N/A'}</span>
                                                            </div>
                                                            {req.driverLicenseUrl && (
                                                                <a
                                                                    href={req.driverLicenseUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-block mt-2"
                                                                >
                                                                    <img
                                                                        src={req.driverLicenseUrl}
                                                                        alt="Driver License"
                                                                        className="max-h-40 rounded border"
                                                                    />
                                                                </a>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleVerificationApproval(req.id, 'driverLicense', true)}
                                                                className="flex-1"
                                                            >
                                                                Approve License
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleVerificationApproval(req.id, 'driverLicense', false)}
                                                                className="flex-1"
                                                            >
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Role Change Modal */}
            {
                showRoleModal && selectedUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <GlassCard className="w-full max-w-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Change User Role</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Change role for {selectedUser.name}
                            </p>
                            <div className="space-y-2 mb-6">
                                {['admin', 'driver', 'passenger'].map((role) => (
                                    <Button
                                        key={role}
                                        variant={selectedUser.role === role ? 'default' : 'outline'}
                                        className="w-full justify-start"
                                        onClick={() => handleRoleChange(selectedUser.id, role)}
                                    >
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </Button>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => setShowRoleModal(false)}>
                                Cancel
                            </Button>
                        </GlassCard>
                    </div>
                )
            }

            {/* Suspend Modal */}
            {
                showSuspendModal && selectedUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <GlassCard className="w-full max-w-md p-6">
                            <h3 className="text-lg font-semibold mb-4">Suspend User</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Suspend {selectedUser.name}?
                            </p>
                            <Input
                                placeholder="Reason for suspension..."
                                className="mb-6"
                                id="suspendReason"
                            />
                            <div className="flex gap-2">
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => {
                                        const reason = (document.getElementById('suspendReason') as HTMLInputElement)?.value;
                                        handleSuspend(selectedUser.id, true, reason);
                                    }}
                                >
                                    Suspend
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowSuspendModal(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </GlassCard>
                    </div>
                )
            }

            {/* Edit Ride Modal */}
            {editRideModalOpen && selectedRide && (
                <EditRideModal
                    isOpen={editRideModalOpen}
                    onClose={() => {
                        setEditRideModalOpen(false);
                        setSelectedRide(null);
                    }}
                    ride={selectedRide}
                    onUpdate={() => {
                        loadRides();
                        loadAnalytics();
                    }}
                />
            )}

            {/* Edit User Modal */}
            {editUserModalOpen && selectedUser && (
                <EditUserModal
                    isOpen={editUserModalOpen}
                    onClose={() => {
                        setEditUserModalOpen(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                    onUpdate={() => {
                        loadUsers();
                        loadAnalytics();
                    }}
                />
            )}
        </div>
    );
}
