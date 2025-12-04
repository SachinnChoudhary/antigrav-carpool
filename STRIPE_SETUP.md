# Stripe Setup Guide

## 1. Create Stripe Account

1. Go to https://stripe.com
2. Sign up for a free account
3. Complete verification (for production)

## 2. Get API Keys

1. Go to Stripe Dashboard
2. Click "Developers" → "API keys"
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

## 3. Add to Environment Variables

Create or update `.env.local`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## 4. Test Cards

Use these test cards in development:

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined |
| 4000 0025 0000 3155 | Requires authentication |

- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **ZIP:** Any 5 digits

## 5. Webhook Setup (Optional for now)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.com/api/payments/webhook`
4. Events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy webhook signing secret to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

## 6. Testing

1. Restart your dev server: `npm run dev`
2. Create a booking
3. Use test card: 4242 4242 4242 4242
4. Verify payment in Stripe Dashboard

## Production Checklist

- [ ] Complete Stripe account verification
- [ ] Switch to live API keys
- [ ] Set up webhooks for production URL
- [ ] Enable 3D Secure authentication
- [ ] Set up payout schedule
- [ ] Configure tax settings
- [ ] Add business information

## Support

- Stripe Docs: https://stripe.com/docs
- Test Cards: https://stripe.com/docs/testing
- API Reference: https://stripe.com/docs/api
