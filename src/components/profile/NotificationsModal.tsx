"use client";

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { GlassCard } from '@/components/ui/glass-card';
import { Bell, Calendar, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
    // Mock notifications for now
    const notifications = [
        {
            id: '1',
            title: 'Welcome to Antigravity!',
            message: 'Thanks for joining our community. Complete your profile to get started.',
            type: 'info',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
            read: true
        },
        {
            id: '2',
            title: 'Profile Verified',
            message: 'Your identity verification has been approved. You can now book rides.',
            type: 'success',
            date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
            read: false
        },
        {
            id: '3',
            title: 'Ride Reminder',
            message: 'You have a ride scheduled for tomorrow at 9:00 AM.',
            type: 'warning',
            date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
            read: false
        }
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'info': default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Notifications">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <GlassCard
                            key={notification.id}
                            className={`p-4 transition-colors ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}
                        >
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {new Date(notification.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {notification.message}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>
            <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                    Close
                </Button>
            </div>
        </Modal>
    );
}
