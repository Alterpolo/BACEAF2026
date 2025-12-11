/**
 * Payment Routes
 * Endpoints Stripe pour checkout, webhooks, et portail client
 */

import { Hono } from 'hono';
import { z } from 'zod';
import {
  getOrCreateCustomer,
  createCheckoutSession,
  createPortalSession,
  constructWebhookEvent,
  getPlanFromPriceId,
  getPriceId,
  PLANS,
  PlanType,
  BillingInterval,
} from '../services/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const payments = new Hono();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const CheckoutSchema = z.object({
  plan: z.enum(['student_premium', 'student_tutoring', 'teacher_pro']),
  interval: z.enum(['month', 'year']),
  userId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

const PortalSchema = z.object({
  userId: z.string().uuid(),
  returnUrl: z.string().url(),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function parseBody<T>(c: any, schema: z.ZodSchema<T>): Promise<T> {
  const body = await c.req.json();
  return schema.parse(body);
}

// ============================================
// ROUTES
// ============================================

/**
 * GET /api/payments/plans
 * Liste des plans disponibles
 */
payments.get('/plans', (c) => {
  const plans = Object.entries(PLANS).map(([key, config]) => ({
    id: key,
    name: config.name,
    features: config.features,
    prices: 'prices' in config ? {
      month: config.prices.month.amount,
      year: config.prices.year.amount,
    } : null,
    hasAI: config.hasAI,
    hasTutoring: config.hasTutoring,
    trialDays: 'trialDays' in config ? config.trialDays : 0,
  }));

  return c.json({ plans });
});

/**
 * POST /api/payments/create-checkout
 * Crée une session Stripe Checkout
 */
payments.post('/create-checkout', async (c) => {
  try {
    const data = await parseBody(c, CheckoutSchema);

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer(data.email, data.userId, data.name);

    // Get price ID
    const priceId = getPriceId(data.plan as PlanType, data.interval as BillingInterval);
    if (!priceId) {
      return c.json({ error: 'Plan ou intervalle invalide' }, 400);
    }

    // Get trial days
    const planConfig = PLANS[data.plan as PlanType];
    const trialDays = 'trialDays' in planConfig ? planConfig.trialDays : 0;

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: customer.id,
      priceId,
      successUrl: data.successUrl,
      cancelUrl: data.cancelUrl,
      trialDays,
      userId: data.userId,
    });

    // Update subscription with Stripe customer ID
    await supabase
      .from('subscriptions')
      .update({ stripe_customer_id: customer.id })
      .eq('user_id', data.userId);

    return c.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Données invalides', details: error.errors }, 400);
    }
    return c.json({ error: 'Erreur lors de la création du checkout' }, 500);
  }
});

/**
 * POST /api/payments/portal
 * Crée une session pour le portail client Stripe
 */
payments.post('/portal', async (c) => {
  try {
    const data = await parseBody(c, PortalSchema);

    // Get subscription to find Stripe customer ID
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', data.userId)
      .single();

    if (error || !subscription?.stripe_customer_id) {
      return c.json({ error: 'Aucun abonnement trouvé' }, 404);
    }

    // Create portal session
    const session = await createPortalSession(
      subscription.stripe_customer_id,
      data.returnUrl
    );

    return c.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    return c.json({ error: 'Erreur lors de la création du portail' }, 500);
  }
});

/**
 * GET /api/payments/subscription/:userId
 * Récupère le statut d'abonnement d'un utilisateur
 */
payments.get('/subscription/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return c.json({ error: 'Abonnement non trouvé' }, 404);
    }

    // Get plan config
    const planConfig = PLANS[subscription.plan as PlanType] || PLANS.free;

    return c.json({
      plan: subscription.plan,
      planName: planConfig.name,
      status: subscription.status,
      billingInterval: subscription.billing_interval,
      currentPeriodEnd: subscription.current_period_end,
      trialEnd: subscription.trial_end,
      exercisesThisWeek: subscription.exercises_this_week,
      exercisesLimit: planConfig.exercisesPerWeek,
      tutoringHoursRemaining: subscription.tutoring_hours_remaining,
      hasAI: planConfig.hasAI,
      hasTutoring: planConfig.hasTutoring,
      features: planConfig.features,
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

/**
 * POST /api/payments/webhook
 * Webhook Stripe pour gérer les événements
 */
payments.post('/webhook', async (c) => {
  try {
    const signature = c.req.header('stripe-signature');
    if (!signature) {
      return c.json({ error: 'Signature manquante' }, 400);
    }

    const body = await c.req.text();
    const event = constructWebhookEvent(body, signature);

    // Check if event already processed (idempotency)
    const { data: existingEvent } = await supabase
      .from('stripe_events')
      .select('id')
      .eq('id', event.id)
      .single();

    if (existingEvent) {
      return c.json({ received: true, message: 'Event already processed' });
    }

    // Store event
    await supabase.from('stripe_events').insert({
      id: event.id,
      event_type: event.type,
      stripe_customer_id: (event.data.object as any).customer,
      data: event.data.object,
    });

    // Handle event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        await handlePaymentFailed(invoice);
        break;
      }
    }

    // Mark event as processed
    await supabase
      .from('stripe_events')
      .update({ processed: true })
      .eq('id', event.id);

    return c.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook error' }, 400);
  }
});

// ============================================
// WEBHOOK HANDLERS
// ============================================

async function handleCheckoutComplete(session: any) {
  const userId = session.metadata?.supabaseUserId;
  if (!userId) return;

  const subscriptionId = session.subscription;
  const customerId = session.customer;

  // Get subscription details from Stripe
  const { getSubscription } = await import('../services/stripe');
  const stripeSubscription = await getSubscription(subscriptionId);
  if (!stripeSubscription) return;

  const priceId = stripeSubscription.items.data[0]?.price.id;
  const planInfo = getPlanFromPriceId(priceId);

  // Update subscription in database
  const updateData: Record<string, any> = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: priceId,
    plan: planInfo?.plan || 'student_premium',
    billing_interval: planInfo?.interval || 'month',
    status: stripeSubscription.status === 'trialing' ? 'trialing' : 'active',
    current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
  };

  // Handle trial
  if (stripeSubscription.trial_end) {
    updateData.trial_start = new Date(stripeSubscription.trial_start! * 1000).toISOString();
    updateData.trial_end = new Date(stripeSubscription.trial_end * 1000).toISOString();
  }

  // Set tutoring hours for tutoring plan
  if (planInfo?.plan === 'student_tutoring') {
    updateData.tutoring_hours_remaining = 2;
    updateData.tutoring_hours_reset_date = new Date(stripeSubscription.current_period_end * 1000).toISOString();
  }

  await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('user_id', userId);

  // Create notification
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'subscription',
    title: 'Bienvenue !',
    message: `Votre abonnement ${PLANS[planInfo?.plan as PlanType]?.name || 'Premium'} est maintenant actif.`,
    link: '/progression',
  });
}

async function handleSubscriptionUpdate(subscription: any) {
  const userId = subscription.metadata?.supabaseUserId;
  if (!userId) return;

  const priceId = subscription.items.data[0]?.price.id;
  const planInfo = getPlanFromPriceId(priceId);

  const status = subscription.cancel_at_period_end ? 'canceled' : subscription.status;

  await supabase
    .from('subscriptions')
    .update({
      status,
      plan: planInfo?.plan || 'student_premium',
      billing_interval: planInfo?.interval,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
    })
    .eq('user_id', userId);
}

async function handleSubscriptionDeleted(subscription: any) {
  const userId = subscription.metadata?.supabaseUserId;
  if (!userId) return;

  await supabase
    .from('subscriptions')
    .update({
      plan: 'free',
      status: 'canceled',
      stripe_subscription_id: null,
      stripe_price_id: null,
      tutoring_hours_remaining: 0,
    })
    .eq('user_id', userId);

  // Notify user
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'subscription',
    title: 'Abonnement terminé',
    message: 'Votre abonnement a pris fin. Vous êtes passé au plan Gratuit.',
    link: '/tarifs',
  });
}

async function handlePaymentSucceeded(invoice: any) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  // Find user by subscription ID
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id, plan')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (!subscription) return;

  // Reset tutoring hours for tutoring plan
  if (subscription.plan === 'student_tutoring') {
    await supabase
      .from('subscriptions')
      .update({
        tutoring_hours_remaining: 2,
        tutoring_hours_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('user_id', subscription.user_id);
  }
}

async function handlePaymentFailed(invoice: any) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  // Find user by subscription ID
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (!subscription) return;

  // Update status and notify
  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('user_id', subscription.user_id);

  await supabase.from('notifications').insert({
    user_id: subscription.user_id,
    type: 'payment',
    title: 'Échec de paiement',
    message: 'Le paiement de votre abonnement a échoué. Veuillez mettre à jour vos informations de paiement.',
    link: '/tarifs',
  });
}

export default payments;
