"use client";

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { GlassCard } from '@/components/ui/glass-card';
import { HelpCircle, Mail, MessageCircle, FileText, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

import toast from 'react-hot-toast';

interface HelpSupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HelpSupportModal({ isOpen, onClose }: HelpSupportModalProps) {
    const [showTicketForm, setShowTicketForm] = React.useState(false);
    const [ticketForm, setTicketForm] = React.useState({
        subject: '',
        message: '',
        category: 'general',
        priority: 'medium'
    });
    const [loading, setLoading] = React.useState(false);

    const handleChatSupport = () => {
        setShowTicketForm(true);
    };

    const handleEmailSupport = () => {
        window.location.href = 'mailto:support@antigravity.com';
    };

    const handleDocumentation = () => {
        window.open('https://docs.antigravity.com', '_blank');
    };

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticketForm)
            });

            if (response.ok) {
                toast.success('Support ticket submitted successfully');
                setShowTicketForm(false);
                setTicketForm({ subject: '', message: '', category: 'general', priority: 'medium' });
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to submit ticket');
            }
        } catch (error) {
            toast.error('Failed to submit ticket. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const faqs = [
        {
            question: "How do I book a ride?",
            answer: "Search for your destination, select a ride that matches your schedule, and click 'Book Seat'. You'll need to complete your profile verification first."
        },
        {
            question: "How do I verify my identity?",
            answer: "Go to your Profile > Account > Verify Identity. Upload a valid government ID and a selfie. Verification usually takes 24-48 hours."
        },
        {
            question: "What is the cancellation policy?",
            answer: "You can cancel up to 24 hours before the ride for a full refund. Cancellations within 24 hours may be subject to a fee."
        },
        {
            question: "How do payments work?",
            answer: "We support credit cards and UPI. Payments are held securely and released to the driver after the ride is completed."
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Help & Support">
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">

                {showTicketForm ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">Submit Support Ticket</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowTicketForm(false)}>
                                Cancel
                            </Button>
                        </div>
                        <form onSubmit={handleSubmitTicket} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={ticketForm.subject}
                                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                    required
                                    placeholder="Brief description of the issue"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={ticketForm.category}
                                        onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                                    >
                                        <option value="general">General Inquiry</option>
                                        <option value="billing">Billing & Payments</option>
                                        <option value="technical">Technical Issue</option>
                                        <option value="ride_issue">Ride Issue</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Priority</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={ticketForm.priority}
                                        onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message</label>
                                <textarea
                                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={ticketForm.message}
                                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                                    required
                                    placeholder="Describe your issue in detail..."
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Ticket'}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <>
                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <GlassCard
                                className="p-4 hover:bg-white/50 transition-colors cursor-pointer group"
                                onClick={handleChatSupport}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <MessageCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium group-hover:text-primary transition-colors">Contact Support</h4>
                                        <p className="text-xs text-muted-foreground">Submit a ticket</p>
                                    </div>
                                </div>
                            </GlassCard>
                            <GlassCard
                                className="p-4 hover:bg-white/50 transition-colors cursor-pointer group"
                                onClick={handleEmailSupport}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium group-hover:text-primary transition-colors">Email Us</h4>
                                        <p className="text-xs text-muted-foreground">support@antigravity.com</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* FAQs */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <HelpCircle className="h-5 w-5 text-primary" />
                                Frequently Asked Questions
                            </h3>
                            <div className="space-y-3">
                                {faqs.map((faq, index) => (
                                    <GlassCard key={index} className="p-4">
                                        <h4 className="font-medium mb-2 text-sm">{faq.question}</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </GlassCard>
                                ))}
                            </div>
                        </div>

                        {/* Documentation Link */}
                        <GlassCard
                            className="p-4 bg-primary/5 border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"
                            onClick={handleDocumentation}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <div>
                                        <h4 className="font-medium text-sm">Read Documentation</h4>
                                        <p className="text-xs text-muted-foreground">Detailed guides and policies</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                        </GlassCard>
                    </>
                )}

            </div>
            <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={onClose}>
                    Close
                </Button>
            </div>
        </Modal>
    );
}
