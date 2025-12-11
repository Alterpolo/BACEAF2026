/**
 * Subscription Middleware
 * Vérifie les accès selon le plan d'abonnement
 */

import { Context, Next } from 'hono';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface SubscriptionInfo {
  userId: string;
  plan: 'free' | 'student_premium' | 'student_tutoring' | 'teacher_pro';
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  hasAI: boolean;
  hasTutoring: boolean;
  exercisesThisWeek: number;
  exercisesLimit: number;
  canDoExercise: boolean;
}

/**
 * Extract user ID from Authorization header (Supabase JWT)
 */
async function getUserIdFromToken(authHeader: string | undefined): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user.id;
  } catch {
    return null;
  }
}

/**
 * Get subscription info for a user
 */
async function getSubscriptionInfo(userId: string): Promise<SubscriptionInfo | null> {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !subscription) {
    return null;
  }

  const planLimits: Record<string, { hasAI: boolean; hasTutoring: boolean; exercisesLimit: number }> = {
    free: { hasAI: false, hasTutoring: false, exercisesLimit: 3 },
    student_premium: { hasAI: true, hasTutoring: false, exercisesLimit: -1 },
    student_tutoring: { hasAI: true, hasTutoring: true, exercisesLimit: -1 },
    teacher_pro: { hasAI: true, hasTutoring: false, exercisesLimit: -1 },
  };

  const limits = planLimits[subscription.plan] || planLimits.free;

  // Check if week needs reset
  const weekStart = new Date(subscription.week_start);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));

  let exercisesThisWeek = subscription.exercises_this_week;
  if (daysDiff >= 7) {
    // Reset week
    exercisesThisWeek = 0;
    await supabase
      .from('subscriptions')
      .update({
        exercises_this_week: 0,
        week_start: now.toISOString().split('T')[0]
      })
      .eq('user_id', userId);
  }

  const isActive = ['active', 'trialing'].includes(subscription.status);
  const canDoExercise = isActive && (limits.exercisesLimit === -1 || exercisesThisWeek < limits.exercisesLimit);

  return {
    userId,
    plan: subscription.plan,
    status: subscription.status,
    hasAI: isActive && limits.hasAI,
    hasTutoring: isActive && limits.hasTutoring,
    exercisesThisWeek,
    exercisesLimit: limits.exercisesLimit,
    canDoExercise,
  };
}

/**
 * Middleware: Require authentication
 */
export const requireAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  const userId = await getUserIdFromToken(authHeader);

  if (!userId) {
    return c.json({ error: 'Authentification requise', code: 'UNAUTHORIZED' }, 401);
  }

  c.set('userId', userId);
  await next();
};

/**
 * Middleware: Load subscription info (does not block)
 */
export const loadSubscription = async (c: Context, next: Next) => {
  const userId = c.get('userId');

  if (userId) {
    const subscription = await getSubscriptionInfo(userId);
    c.set('subscription', subscription);
  }

  await next();
};

/**
 * Middleware: Require active subscription (any paid plan)
 */
export const requirePremium = async (c: Context, next: Next) => {
  const subscription = c.get('subscription') as SubscriptionInfo | null;

  if (!subscription) {
    return c.json({ error: 'Abonnement non trouvé', code: 'NO_SUBSCRIPTION' }, 403);
  }

  if (subscription.plan === 'free') {
    return c.json({
      error: 'Abonnement Premium requis',
      code: 'PREMIUM_REQUIRED',
      currentPlan: subscription.plan,
    }, 403);
  }

  if (!['active', 'trialing'].includes(subscription.status)) {
    return c.json({
      error: 'Abonnement inactif',
      code: 'SUBSCRIPTION_INACTIVE',
      status: subscription.status,
    }, 403);
  }

  await next();
};

/**
 * Middleware: Require AI access (premium plans only)
 */
export const requireAI = async (c: Context, next: Next) => {
  const subscription = c.get('subscription') as SubscriptionInfo | null;

  if (!subscription) {
    return c.json({ error: 'Abonnement non trouvé', code: 'NO_SUBSCRIPTION' }, 403);
  }

  if (!subscription.hasAI) {
    return c.json({
      error: 'Accès IA non disponible avec votre plan',
      code: 'AI_NOT_AVAILABLE',
      currentPlan: subscription.plan,
      upgrade: '/tarifs',
    }, 403);
  }

  await next();
};

/**
 * Middleware: Require tutoring access
 */
export const requireTutoring = async (c: Context, next: Next) => {
  const subscription = c.get('subscription') as SubscriptionInfo | null;

  if (!subscription) {
    return c.json({ error: 'Abonnement non trouvé', code: 'NO_SUBSCRIPTION' }, 403);
  }

  if (!subscription.hasTutoring) {
    return c.json({
      error: 'Accès cours particuliers non disponible',
      code: 'TUTORING_NOT_AVAILABLE',
      currentPlan: subscription.plan,
      requiredPlan: 'student_tutoring',
      upgrade: '/tarifs',
    }, 403);
  }

  await next();
};

/**
 * Middleware: Check exercise limit (for free plan)
 */
export const checkExerciseLimit = async (c: Context, next: Next) => {
  const subscription = c.get('subscription') as SubscriptionInfo | null;

  if (!subscription) {
    return c.json({ error: 'Abonnement non trouvé', code: 'NO_SUBSCRIPTION' }, 403);
  }

  if (!subscription.canDoExercise) {
    return c.json({
      error: 'Limite d\'exercices atteinte pour cette semaine',
      code: 'EXERCISE_LIMIT_REACHED',
      exercisesThisWeek: subscription.exercisesThisWeek,
      limit: subscription.exercisesLimit,
      upgrade: '/tarifs',
    }, 403);
  }

  await next();
};

/**
 * Increment exercise count after successful exercise
 */
export async function incrementExerciseCount(userId: string): Promise<void> {
  await supabase.rpc('increment_exercise_count', { p_user_id: userId });
}

export { getSubscriptionInfo };
