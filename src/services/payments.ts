/**
 * Service Payments Frontend
 * Appels API pour Stripe et abonnements
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { track } from './analytics';
import { get, post } from './apiClient';
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise && STRIPE_KEY) {
    stripePromise = loadStripe(STRIPE_KEY);
  }
  return stripePromise || Promise.resolve(null);
}

// ============================================
// TYPES
// ============================================

export type PlanType = 'free' | 'student_premium' | 'student_tutoring' | 'teacher_pro';
export type BillingInterval = 'month' | 'year';

export interface Plan {
  id: PlanType;
  name: string;
  features: string[];
  prices: {
    month: number;
    year: number;
  } | null;
  hasAI: boolean;
  hasTutoring: boolean;
  trialDays: number;
}

export interface Subscription {
  plan: PlanType;
  planName: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  billingInterval: BillingInterval | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  exercisesThisWeek: number;
  exercisesLimit: number;
  tutoringHoursRemaining: number;
  hasAI: boolean;
  hasTutoring: boolean;
  features: string[];
}

// ============================================
// API CALLS
// ============================================

/**
 * Get available plans (public, no auth required)
 */
export async function getPlans(): Promise<Plan[]> {
  const data = await get<{ plans: Plan[] }>('/api/payments/plans', false);
  return data.plans;
}

/**
 * Get user subscription (requires auth)
 */
export async function getSubscription(userId: string): Promise<Subscription> {
  return get<Subscription>(`/api/payments/subscription/${userId}`);
}

/**
 * Create checkout session and redirect to Stripe (requires auth)
 * Note: userId is validated server-side against the authenticated user
 */
export async function createCheckout(params: {
  plan: PlanType;
  interval: BillingInterval;
  userId: string;
  email: string;
  name?: string;
}): Promise<void> {
  const successUrl = `${window.location.origin}/#/tarifs?success=true`;
  const cancelUrl = `${window.location.origin}/#/tarifs?canceled=true`;

  const { url } = await post<{ sessionId: string; url: string }>(
    '/api/payments/create-checkout',
    { ...params, successUrl, cancelUrl }
  );

  // Track checkout started before redirect
  track('checkout_started', {
    plan: params.plan,
    interval: params.interval,
  });

  // Redirect to Stripe Checkout
  if (url) {
    window.location.href = url;
  }
}

/**
 * Open Stripe customer portal (requires auth)
 * Note: userId is validated server-side against the authenticated user
 */
export async function openCustomerPortal(userId: string): Promise<void> {
  const returnUrl = `${window.location.origin}/#/tarifs`;

  const { url } = await post<{ url: string }>(
    '/api/payments/portal',
    { userId, returnUrl }
  );

  if (url) {
    window.location.href = url;
  }
}

// ============================================
// HELPERS
// ============================================

/**
 * Format price in euros
 */
export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
}

/**
 * Calculate yearly savings percentage
 */
export function getYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
  const monthlyTotal = monthlyPrice * 12;
  return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
}

/**
 * Check if user can do an exercise
 */
export function canDoExercise(subscription: Subscription): boolean {
  if (!['active', 'trialing'].includes(subscription.status)) {
    return false;
  }
  if (subscription.exercisesLimit === -1) {
    return true; // Unlimited
  }
  return subscription.exercisesThisWeek < subscription.exercisesLimit;
}

/**
 * Get remaining exercises for free plan
 */
export function getRemainingExercises(subscription: Subscription): number {
  if (subscription.exercisesLimit === -1) {
    return Infinity;
  }
  return Math.max(0, subscription.exercisesLimit - subscription.exercisesThisWeek);
}

/**
 * Check if subscription is in trial
 */
export function isInTrial(subscription: Subscription): boolean {
  return subscription.status === 'trialing' && subscription.trialEnd !== null;
}

/**
 * Get trial days remaining
 */
export function getTrialDaysRemaining(subscription: Subscription): number {
  if (!subscription.trialEnd) return 0;
  const trialEnd = new Date(subscription.trialEnd);
  const now = new Date();
  const diff = trialEnd.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
