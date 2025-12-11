/**
 * Stripe Service
 * Gestion des abonnements et paiements
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Plan configuration
export const PLANS = {
  free: {
    name: 'Gratuit',
    features: ['3 exercices/semaine', 'Méthodologie', 'Sans IA'],
    exercisesPerWeek: 3,
    hasAI: false,
    hasTutoring: false,
  },
  student_premium: {
    name: 'Élève Premium',
    features: ['IA illimitée', 'Progression', 'Badges', 'Recommandations'],
    prices: {
      month: { amount: 999, priceId: process.env.STRIPE_PRICE_STUDENT_PREMIUM_MONTHLY || '' },
      year: { amount: 7999, priceId: process.env.STRIPE_PRICE_STUDENT_PREMIUM_YEARLY || '' },
    },
    exercisesPerWeek: -1, // unlimited
    hasAI: true,
    hasTutoring: false,
    trialDays: 1,
  },
  student_tutoring: {
    name: 'Premium + Cours',
    features: ['Tout Premium', '2h de cours/mois', 'Prof diplômé', 'Suivi personnalisé'],
    prices: {
      month: { amount: 4999, priceId: process.env.STRIPE_PRICE_STUDENT_TUTORING_MONTHLY || '' },
      year: { amount: 39999, priceId: process.env.STRIPE_PRICE_STUDENT_TUTORING_YEARLY || '' },
    },
    exercisesPerWeek: -1,
    hasAI: true,
    hasTutoring: true,
    tutoringHoursPerMonth: 2,
    trialDays: 1,
  },
  teacher_pro: {
    name: 'Enseignant Pro',
    features: ['Gestion classes illimitée', 'Suivi élèves', 'Rapports', 'Devoirs'],
    prices: {
      month: { amount: 1999, priceId: process.env.STRIPE_PRICE_TEACHER_PRO_MONTHLY || '' },
      year: { amount: 15999, priceId: process.env.STRIPE_PRICE_TEACHER_PRO_YEARLY || '' },
    },
    exercisesPerWeek: -1,
    hasAI: true,
    hasTutoring: false,
    trialDays: 1,
  },
} as const;

export type PlanType = keyof typeof PLANS;
export type BillingInterval = 'month' | 'year';

/**
 * Create or get Stripe customer
 */
export async function getOrCreateCustomer(
  email: string,
  userId: string,
  name?: string
): Promise<Stripe.Customer> {
  // Check if customer exists
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  return stripe.customers.create({
    email,
    name,
    metadata: {
      supabaseUserId: userId,
    },
  });
}

/**
 * Create checkout session for subscription
 */
export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
  userId: string;
}): Promise<Stripe.Checkout.Session> {
  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    customer: params.customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      supabaseUserId: params.userId,
    },
    subscription_data: {
      metadata: {
        supabaseUserId: params.userId,
      },
    },
    locale: 'fr',
    allow_promotion_codes: true,
  };

  // Add trial if specified
  if (params.trialDays && params.trialDays > 0) {
    sessionConfig.subscription_data = {
      ...sessionConfig.subscription_data,
      trial_period_days: params.trialDays,
    };
  }

  return stripe.checkout.sessions.create(sessionConfig);
}

/**
 * Create customer portal session
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
    locale: 'fr',
  });
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch {
    return null;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately = false
): Promise<Stripe.Subscription> {
  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId);
  }
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || ''
  );
}

/**
 * Get plan from price ID
 */
export function getPlanFromPriceId(priceId: string): { plan: PlanType; interval: BillingInterval } | null {
  for (const [planKey, planConfig] of Object.entries(PLANS)) {
    if ('prices' in planConfig) {
      if (planConfig.prices.month.priceId === priceId) {
        return { plan: planKey as PlanType, interval: 'month' };
      }
      if (planConfig.prices.year.priceId === priceId) {
        return { plan: planKey as PlanType, interval: 'year' };
      }
    }
  }
  return null;
}

/**
 * Get price ID for plan and interval
 */
export function getPriceId(plan: PlanType, interval: BillingInterval): string | null {
  const planConfig = PLANS[plan];
  if ('prices' in planConfig) {
    return planConfig.prices[interval].priceId || null;
  }
  return null;
}

/**
 * Format amount for display (cents to euros)
 */
export function formatAmount(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €';
}

export { stripe };
