"use client";

import * as React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "../ui/button";
import { GlassCard } from "../ui/glass-card";
import toast from "react-hot-toast";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
    bookingId: string;
    amount: number;
    onSuccess: () => void;
}

function CheckoutForm({ bookingId, amount, onSuccess }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/bookings/${bookingId}`,
                },
                redirect: "if_required",
            });

            if (error) {
                toast.error(error.message || "Payment failed");
            } else {
                toast.success("Payment successful!");
                onSuccess();
            }
        } catch (err: any) {
            toast.error(err.message || "Payment failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            <Button
                type="submit"
                disabled={!stripe || loading}
                className="w-full"
            >
                {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
            </Button>
        </form>
    );
}

export function PaymentForm({ bookingId, amount, onSuccess }: PaymentFormProps) {
    const [clientSecret, setClientSecret] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // Create payment intent
        const createPaymentIntent = async () => {
            try {
                const response = await fetch("/api/payments/create-intent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bookingId, amount }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to create payment intent");
                }

                setClientSecret(data.clientSecret);
            } catch (error: any) {
                toast.error(error.message || "Failed to initialize payment");
            } finally {
                setLoading(false);
            }
        };

        createPaymentIntent();
    }, [bookingId, amount]);

    if (loading) {
        return (
            <GlassCard className="p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </GlassCard>
        );
    }

    if (!clientSecret) {
        return (
            <GlassCard className="p-6">
                <p className="text-center text-muted-foreground">
                    Failed to initialize payment. Please try again.
                </p>
            </GlassCard>
        );
    }

    const options = {
        clientSecret,
        appearance: {
            theme: "stripe" as const,
        },
    };

    return (
        <GlassCard className="p-6">
            <Elements stripe={stripePromise} options={options}>
                <CheckoutForm bookingId={bookingId} amount={amount} onSuccess={onSuccess} />
            </Elements>
        </GlassCard>
    );
}
