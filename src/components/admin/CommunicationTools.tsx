"use client";

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Megaphone, Mail, Send, RefreshCw, Plus } from 'lucide-react';
import { SendNotificationModal } from './SendNotificationModal';
import toast from 'react-hot-toast';

export function CommunicationTools() {
    const [activeTab, setActiveTab] = useState<'notifications' | 'announcements' | 'messages' | 'tickets'>('notifications');
    const [stats, setStats] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [notificationModalOpen, setNotificationModalOpen] = useState(false);

    // Announcement form
    const [announcementForm, setAnnouncementForm] = useState({
        title: '',
        content: '',
        priority: 'medium',
        type: 'info',
    });

    // Message form
    const [messageForm, setMessageForm] = useState({
        userId: '',
        subject: '',
        message: '',
    });

    useEffect(() => {
        loadStats();
        loadData();
    }, [activeTab]);

    const loadStats = async () => {
        try {
            const response = await fetch('/api/admin/communications/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to load stats');
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'notifications') {
                const response = await fetch('/api/admin/notifications');
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data.notifications);
                }
            } else if (activeTab === 'announcements') {
                const response = await fetch('/api/admin/announcements');
                if (response.ok) {
                    const data = await response.json();
                    setAnnouncements(data.announcements);
                }
            } else if (activeTab === 'messages') {
                const response = await fetch('/api/admin/messages');
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data.messages);
                }
            } else if (activeTab === 'tickets') {
                const response = await fetch('/api/support/tickets');
                if (response.ok) {
                    const data = await response.json();
                    setTickets(data.tickets);
                }
            }
        } catch (error) {
            console.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/admin/support/tickets/${ticketId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                toast.success('Ticket status updated');
                loadData();
            } else {
                toast.error('Failed to update ticket status');
            }
        } catch (error) {
            toast.error('Failed to update ticket status');
        }
    };

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(announcementForm),
            });

            if (!response.ok) throw new Error('Failed to create announcement');

            toast.success('Announcement created successfully');
            setAnnouncementForm({ title: '', content: '', priority: 'medium', type: 'info' });
            loadData();
            loadStats();
        } catch (error) {
            toast.error('Failed to create announcement');
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageForm),
            });

            if (!response.ok) throw new Error('Failed to send message');

            toast.success('Message sent successfully');
            setMessageForm({ userId: '', subject: '', message: '' });
            loadData();
            loadStats();
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;

        try {
            const response = await fetch(`/api/admin/announcements/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete announcement');

            toast.success('Announcement deleted');
            loadData();
            loadStats();
        } catch (error) {
            toast.error('Failed to delete announcement');
        }
    };

    const getTypeBadge = (type: string) => {
        const variants: any = {
            info: 'default',
            success: 'default',
            warning: 'secondary',
            error: 'destructive',
        };
        return <Badge variant={variants[type] || 'default'}>{type}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
        const colors: any = {
            low: 'bg-blue-100 text-blue-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${colors[priority] || colors.medium}`}>
                {priority}
            </span>
        );
    };

    return (
        <div className="space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Notifications</p>
                                <p className="text-2xl font-bold">{stats.totalNotifications}</p>
                                <p className="text-xs text-green-600 mt-1">
                                    +{stats.recentActivity.notifications} this week
                                </p>
                            </div>
                            <Bell className="h-8 w-8 text-blue-600" />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Announcements</p>
                                <p className="text-2xl font-bold">{stats.totalAnnouncements}</p>
                                <p className="text-xs text-blue-600 mt-1">
                                    {stats.activeAnnouncements} active
                                </p>
                            </div>
                            <Megaphone className="h-8 w-8 text-purple-600" />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Messages</p>
                                <p className="text-2xl font-bold">{stats.totalMessages}</p>
                                <p className="text-xs text-orange-600 mt-1">
                                    {stats.unreadMessages} unread
                                </p>
                            </div>
                            <Mail className="h-8 w-8 text-green-600" />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">This Week</p>
                                <p className="text-2xl font-bold">
                                    {stats.recentActivity.notifications +
                                        stats.recentActivity.announcements +
                                        stats.recentActivity.messages}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Total sent</p>
                            </div>
                            <Send className="h-8 w-8 text-indigo-600" />
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Tabs */}
            <GlassCard className="p-4">
                <div className="flex gap-2">
                    <Button
                        variant={activeTab === 'notifications' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                    </Button>
                    <Button
                        variant={activeTab === 'announcements' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('announcements')}
                    >
                        <Megaphone className="h-4 w-4 mr-2" />
                        Announcements
                    </Button>
                    <Button
                        variant={activeTab === 'messages' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('messages')}
                    >
                        <Mail className="h-4 w-4 mr-2" />
                        Messages
                    </Button>
                    <Button
                        variant={activeTab === 'tickets' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('tickets')}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Support Tickets
                    </Button>
                    <div className="ml-auto flex gap-2">
                        <Button onClick={loadData} variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        {activeTab === 'notifications' && (
                            <Button onClick={() => setNotificationModalOpen(true)} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                New Notification
                            </Button>
                        )}
                    </div>
                </div>
            </GlassCard>

            {/* Content */}
            {activeTab === 'notifications' && (
                <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Notification History</h3>
                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-center text-muted-foreground py-8">Loading...</p>
                        ) : notifications.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No notifications sent yet</p>
                        ) : (
                            notifications.map((notif) => (
                                <div key={notif.id} className="border-b pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold">{notif.title}</h4>
                                                {getTypeBadge(notif.type)}
                                                <Badge variant="outline">{notif.targetType}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Sent by {notif.sender.name} • {new Date(notif.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>
            )}

            {activeTab === 'announcements' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Create Announcement</h3>
                        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={announcementForm.title}
                                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content</label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={announcementForm.content}
                                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Priority</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={announcementForm.priority}
                                        onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Type</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={announcementForm.type}
                                        onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                                    >
                                        <option value="info">Info</option>
                                        <option value="warning">Warning</option>
                                        <option value="success">Success</option>
                                    </select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full">
                                <Megaphone className="h-4 w-4 mr-2" />
                                Create Announcement
                            </Button>
                        </form>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Active Announcements</h3>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto">
                            {loading ? (
                                <p className="text-center text-muted-foreground py-8">Loading...</p>
                            ) : announcements.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No announcements yet</p>
                            ) : (
                                announcements.map((announcement) => (
                                    <div key={announcement.id} className="border-b pb-4 last:border-b-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-semibold">{announcement.title}</h4>
                                                {getPriorityBadge(announcement.priority)}
                                                {getTypeBadge(announcement.type)}
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{announcement.content}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(announcement.createdAt).toLocaleString()} • {announcement._count.dismissals} dismissals
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Send Message</h3>
                        <form onSubmit={handleSendMessage} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">User ID</label>
                                <Input
                                    value={messageForm.userId}
                                    onChange={(e) => setMessageForm({ ...messageForm, userId: e.target.value })}
                                    placeholder="Enter user ID"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <Input
                                    value={messageForm.subject}
                                    onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message</label>
                                <textarea
                                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={messageForm.message}
                                    onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Mail className="h-4 w-4 mr-2" />
                                Send Message
                            </Button>
                        </form>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Message History</h3>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto">
                            {loading ? (
                                <p className="text-center text-muted-foreground py-8">Loading...</p>
                            ) : messages.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No messages sent yet</p>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id} className="border-b pb-4 last:border-b-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold truncate">{msg.subject}</h4>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    To: {msg.user.name} ({msg.user.email})
                                                </p>
                                            </div>
                                            <Badge variant={msg.read ? 'default' : 'secondary'}>
                                                {msg.read ? 'Read' : 'Unread'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{msg.message}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(msg.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>
                </div>
            )}

            {activeTab === 'tickets' && (
                <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Support Tickets</h3>
                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-center text-muted-foreground py-8">Loading...</p>
                        ) : tickets.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No support tickets found</p>
                        ) : (
                            tickets.map((ticket) => (
                                <div key={ticket.id} className="border-b pb-4 last:border-b-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold">{ticket.subject}</h4>
                                                <Badge variant={ticket.status === 'resolved' ? 'default' : ticket.status === 'closed' ? 'secondary' : 'outline'}>
                                                    {ticket.status}
                                                </Badge>
                                                {getPriorityBadge(ticket.priority)}
                                                <Badge variant="outline">{ticket.category}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">{ticket.message}</p>
                                            <p className="text-xs text-muted-foreground">
                                                From: {ticket.user.name} ({ticket.user.email}) • {new Date(ticket.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {ticket.status !== 'resolved' && (
                                                <Button size="sm" variant="outline" onClick={() => handleUpdateTicketStatus(ticket.id, 'resolved')}>
                                                    Mark Resolved
                                                </Button>
                                            )}
                                            {ticket.status !== 'closed' && (
                                                <Button size="sm" variant="outline" onClick={() => handleUpdateTicketStatus(ticket.id, 'closed')}>
                                                    Close
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>
            )}

            {/* Modals */}
            <SendNotificationModal
                isOpen={notificationModalOpen}
                onClose={() => setNotificationModalOpen(false)}
                onSent={() => {
                    loadData();
                    loadStats();
                }}
            />
        </div>
    );
}
