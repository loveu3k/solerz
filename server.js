const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// This simplified logic loads .env variables only if NOT in production.
// In production (on cPanel), it will use the variables you set in the server environment.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Initialize Stripe with the key from your environment
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);
const app = express();

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// This middleware is for the webhook and must come before express.json()
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }));

app.use(cors({ origin: process.env.VITE_SITE_URL || 'http://localhost:5173' }));
app.use(express.json());

// --- API Endpoints ---

app.post('/api/create-stripe-checkout-session', async (req, res) => {
  try {
    const { priceId, userEmail, userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }
    const siteURL = process.env.VITE_SITE_URL || 'http://localhost:5173';
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${siteURL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteURL}/pricing`,
      customer_email: userEmail,
      metadata: { user_id: userId }
    });
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({ error: 'Failed to create Stripe session.' });
  }
});

app.post('/api/cancel-subscription', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('stripe_subscription_id')
            .eq('id', userId)
            .single();

        if (profileError || !profile || !profile.stripe_subscription_id) {
            throw new Error('Could not find a subscription for this user.');
        }

        await stripe.subscriptions.update(profile.stripe_subscription_id, {
            cancel_at_period_end: true,
        });
        
        res.status(200).json({ message: 'Subscription scheduled for cancellation.' });
    } catch (error) {
        console.error('Error scheduling subscription cancellation:', error);
        res.status(500).json({ error: 'Failed to schedule cancellation.' });
    }
});


// Listen for events from Stripe
app.post('/api/stripe-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.VITE_STRIPE_WEBHOOK_SECRET;
    let event;
  
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const session = event.data.object;
  
    if (event.type === 'checkout.session.completed') {
        const userId = session.metadata.user_id;
        const stripeCustomerId = session.customer;
        const stripeSubscriptionId = session.subscription;

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ 
                stripe_customer_id: stripeCustomerId,
                stripe_subscription_id: stripeSubscriptionId,
                tier: 'pro'
            })
            .eq('id', userId);
        if (error) console.error('Webhook DB Error (checkout.session.completed):', error);
    }

    if (event.type === 'customer.subscription.updated') {
        const subscription = session;
        let proAccessEndsAt = null;

        if (subscription.cancel_at_period_end && subscription.cancel_at) {
            proAccessEndsAt = new Date(subscription.cancel_at * 1000).toISOString();
        }

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ pro_access_ends_at: proAccessEndsAt })
            .eq('stripe_customer_id', subscription.customer);
        
        if (error) {
            console.error('[Webhook] Supabase update error:', error);
        } else {
            console.log(`[Webhook] Successfully processed 'customer.subscription.updated' for customer ${subscription.customer}.`);
        }
    }
    
    if (event.type === 'customer.subscription.deleted') {
        const subscription = session;
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({
                tier: 'free',
                stripe_subscription_id: null,
                pro_access_ends_at: null
            })
            .eq('stripe_subscription_id', subscription.id);
        if (error) console.error('Webhook DB Error (customer.subscription.deleted):', error);
    }
  
    res.status(200).json({ received: true });
});

if (process.env.NODE_ENV !== 'production') {
  const port = 4000;
  app.listen(port, () => {
    console.log(`API server listening for local development at http://localhost:${port}`);
  });
}

module.exports = app;
