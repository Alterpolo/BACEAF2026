import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

export const SubscriptionBanner: React.FC = () => {
  const {
    subscription,
    isPremium,
    isTrialing,
    trialDaysRemaining,
    remainingExercises,
    loading,
  } = useSubscription();

  if (loading || !subscription) {
    return null;
  }

  // Premium user in trial
  if (isTrialing && trialDaysRemaining > 0) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-900">
                Période d'essai - {trialDaysRemaining} jour{trialDaysRemaining > 1 ? 's' : ''} restant{trialDaysRemaining > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-amber-700">
                Profitez de toutes les fonctionnalités Premium !
              </p>
            </div>
          </div>
          <Link
            to="/tarifs"
            className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
          >
            Continuer après l'essai
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Premium user with past_due status
  if (subscription.status === 'past_due') {
    return (
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-900">
                Problème de paiement
              </p>
              <p className="text-sm text-red-700">
                Mettez à jour vos informations de paiement pour continuer.
              </p>
            </div>
          </div>
          <Link
            to="/tarifs"
            className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
          >
            Mettre à jour
          </Link>
        </div>
      </div>
    );
  }

  // Free user - show upgrade prompt
  if (!isPremium) {
    const exercisesLeft = remainingExercises;
    const isLow = exercisesLeft <= 1;

    return (
      <div className={`bg-gradient-to-r ${
        isLow
          ? 'from-orange-50 to-red-50 border-orange-200'
          : 'from-indigo-50 to-purple-50 border-indigo-200'
      } border rounded-xl p-4 mb-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${isLow ? 'bg-orange-100' : 'bg-indigo-100'} rounded-lg flex items-center justify-center`}>
              <Sparkles className={`w-5 h-5 ${isLow ? 'text-orange-600' : 'text-indigo-600'}`} />
            </div>
            <div>
              <p className={`font-medium ${isLow ? 'text-orange-900' : 'text-indigo-900'}`}>
                {exercisesLeft === 0
                  ? 'Limite atteinte cette semaine !'
                  : `${exercisesLeft} exercice${exercisesLeft > 1 ? 's' : ''} restant${exercisesLeft > 1 ? 's' : ''} cette semaine`
                }
              </p>
              <p className={`text-sm ${isLow ? 'text-orange-700' : 'text-indigo-700'}`}>
                Passez à Premium pour un accès illimité et la correction par IA.
              </p>
            </div>
          </div>
          <Link
            to="/tarifs"
            className={`px-4 py-2 ${
              isLow
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white font-medium rounded-lg transition-colors flex items-center gap-2`}
          >
            Passer à Premium
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Premium user - no banner needed
  return null;
};

// Small badge for header or compact spaces
export const SubscriptionBadge: React.FC = () => {
  const { subscription, isPremium, isTrialing } = useSubscription();

  if (!subscription) return null;

  if (isPremium) {
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
        isTrialing
          ? 'bg-amber-100 text-amber-700'
          : 'bg-indigo-100 text-indigo-700'
      }`}>
        {isTrialing ? 'Essai' : subscription.planName}
      </span>
    );
  }

  return (
    <Link
      to="/tarifs"
      className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
    >
      Gratuit
    </Link>
  );
};

export default SubscriptionBanner;
