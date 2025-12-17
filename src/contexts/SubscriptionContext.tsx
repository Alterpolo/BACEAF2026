import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getSubscription,
  Subscription,
  PlanType,
  canDoExercise as checkCanDoExercise,
  getRemainingExercises,
  isInTrial,
  getTrialDaysRemaining,
} from '../services/payments';

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;

  // Helpers
  isPremium: boolean;
  hasTutoring: boolean;
  hasAI: boolean;
  canDoExercise: boolean;
  remainingExercises: number;
  isTrialing: boolean;
  trialDaysRemaining: number;

  // Actions
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const sub = await getSubscription(user.id);
      setSubscription(sub);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Impossible de charger l\'abonnement');
      // Set default free subscription on error
      setSubscription({
        plan: 'free',
        planName: 'Gratuit',
        status: 'active',
        billingInterval: null,
        currentPeriodEnd: null,
        trialEnd: null,
        exercisesThisWeek: 0,
        exercisesLimit: 3,
        tutoringHoursRemaining: 0,
        hasAI: true, // Free users have LIMITED AI access (3 exercises/week)
        hasTutoring: false,
        features: ['3 exercices IA/semaine', 'Méthodologie', 'Fiches de révision'],
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  // Computed values
  const isPremium = subscription?.plan !== 'free' &&
    ['active', 'trialing'].includes(subscription?.status || '');

  const hasAI = subscription?.hasAI || false;
  const hasTutoring = subscription?.hasTutoring || false;

  const canDoExercise = subscription ? checkCanDoExercise(subscription) : false;
  const remainingExercises = subscription ? getRemainingExercises(subscription) : 0;

  const isTrialing = subscription ? isInTrial(subscription) : false;
  const trialDaysRemaining = subscription ? getTrialDaysRemaining(subscription) : 0;

  const value: SubscriptionContextType = {
    subscription,
    loading,
    error,
    isPremium,
    hasTutoring,
    hasAI,
    canDoExercise,
    remainingExercises,
    isTrialing,
    trialDaysRemaining,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// HOC for requiring premium access
export function withPremium<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<P>
) {
  return function WithPremiumComponent(props: P) {
    const { isPremium, loading } = useSubscription();

    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      );
    }

    if (!isPremium && FallbackComponent) {
      return <FallbackComponent {...props} />;
    }

    if (!isPremium) {
      return (
        <div className="text-center p-8">
          <p className="text-slate-600">Cette fonctionnalité nécessite un abonnement Premium.</p>
          <a href="/#/tarifs" className="text-indigo-600 hover:underline mt-2 inline-block">
            Voir les tarifs
          </a>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
