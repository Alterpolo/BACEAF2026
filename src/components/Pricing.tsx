import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  Sparkles,
  GraduationCap,
  Users,
  Zap,
  Clock,
  Star,
  ArrowRight,
  Settings,
  Quote,
  TrendingUp,
  Award,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
  createCheckout,
  openCustomerPortal,
  formatPrice,
  getYearlySavings,
  PlanType,
  BillingInterval,
} from '../services/payments';

// Plan configuration
const PLANS = [
  {
    id: 'free' as PlanType,
    name: 'Gratuit',
    description: 'Pour découvrir la plateforme',
    icon: Zap,
    color: 'slate',
    prices: { month: 0, year: 0 },
    features: [
      { text: '3 exercices par semaine', included: true },
      { text: 'Méthodologie complète', included: true },
      { text: 'Programme officiel', included: true },
      { text: 'Correction par IA', included: false },
      { text: 'Progression personnalisée', included: false },
      { text: 'Cours particuliers', included: false },
    ],
  },
  {
    id: 'student_premium' as PlanType,
    name: 'Élève Premium',
    description: 'L\'IA pour progresser rapidement',
    icon: Sparkles,
    color: 'indigo',
    popular: true,
    prices: { month: 999, year: 7999 },
    trialDays: 1,
    features: [
      { text: 'Exercices illimités', included: true },
      { text: 'Méthodologie complète', included: true },
      { text: 'Programme officiel', included: true },
      { text: 'Correction par IA', included: true },
      { text: 'Progression personnalisée', included: true },
      { text: 'Cours particuliers', included: false },
    ],
  },
  {
    id: 'student_tutoring' as PlanType,
    name: 'Premium + Cours',
    description: 'Accompagnement complet avec prof',
    icon: GraduationCap,
    color: 'purple',
    prices: { month: 4999, year: 39999 },
    trialDays: 1,
    features: [
      { text: 'Tout le Premium', included: true },
      { text: '2h de cours par mois', included: true },
      { text: 'Prof diplômé', included: true },
      { text: 'Suivi personnalisé', included: true },
      { text: 'Calendrier de réservation', included: true },
      { text: 'Support prioritaire', included: true },
    ],
  },
  {
    id: 'teacher_pro' as PlanType,
    name: 'Enseignant Pro',
    description: 'Pour les professeurs',
    icon: Users,
    color: 'emerald',
    prices: { month: 1999, year: 15999 },
    trialDays: 1,
    features: [
      { text: 'Classes illimitées', included: true },
      { text: 'Suivi des élèves', included: true },
      { text: 'Devoirs et évaluations', included: true },
      { text: 'Rapports de progression', included: true },
      { text: 'IA pour corrections', included: true },
      { text: 'Export des données', included: true },
    ],
  },
];

export const Pricing: React.FC = () => {
  const { user } = useAuth();
  const { subscription, isPremium, refreshSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [interval, setInterval] = useState<BillingInterval>('year');
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handle success/cancel from Stripe
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setMessage({ type: 'success', text: 'Abonnement activé avec succès !' });
      refreshSubscription();
    } else if (searchParams.get('canceled') === 'true') {
      setMessage({ type: 'error', text: 'Paiement annulé.' });
    }
  }, [searchParams, refreshSubscription]);

  const handleSubscribe = async (planId: PlanType) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (planId === 'free') {
      return;
    }

    setLoading(planId);
    setMessage(null);

    try {
      await createCheckout({
        plan: planId,
        interval,
        userId: user.id,
        email: user.email,
        name: user.name,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors du paiement',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setLoading('manage');
    try {
      await openCustomerPortal(user.id);
    } catch (error) {
      console.error('Portal error:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'ouverture du portail',
      });
    } finally {
      setLoading(null);
    }
  };

  const getButtonText = (plan: typeof PLANS[0]) => {
    if (!user) return 'Se connecter';
    if (subscription?.plan === plan.id) return 'Plan actuel';
    if (plan.id === 'free') return 'Plan de base';
    if (plan.trialDays) return `Essai gratuit ${plan.trialDays}j`;
    return 'Choisir ce plan';
  };

  const getButtonDisabled = (plan: typeof PLANS[0]) => {
    return subscription?.plan === plan.id || plan.id === 'free';
  };

  const colorClasses: Record<string, { bg: string; text: string; border: string; button: string }> = {
    slate: {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-200',
      button: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      button: 'bg-indigo-600 text-white hover:bg-indigo-700',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      button: 'bg-purple-600 text-white hover:bg-purple-700',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      button: 'bg-emerald-600 text-white hover:bg-emerald-700',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">
          Choisissez votre formule
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Préparez votre bac français avec les meilleurs outils.
          Essai gratuit de 1 jour pour tester les fonctionnalités Premium.
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className={`max-w-md mx-auto mb-8 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Current subscription banner */}
      {isPremium && subscription && (
        <div className="max-w-md mx-auto mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-indigo-900">
                Abonnement {subscription.planName}
              </p>
              <p className="text-sm text-indigo-600">
                {subscription.status === 'trialing'
                  ? 'Période d\'essai en cours'
                  : `Renouvellement le ${new Date(subscription.currentPeriodEnd!).toLocaleDateString('fr-FR')}`
                }
              </p>
            </div>
            <button
              onClick={handleManageSubscription}
              disabled={loading === 'manage'}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              <Settings className="w-4 h-4" />
              Gérer
            </button>
          </div>
        </div>
      )}

      {/* Billing interval toggle */}
      <div className="flex justify-center mb-10">
        <div className="bg-slate-100 p-1 rounded-xl inline-flex">
          <button
            onClick={() => setInterval('month')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              interval === 'month'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setInterval('year')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              interval === 'year'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Annuel
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
              -33%
            </span>
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const colors = colorClasses[plan.color];
          const price = interval === 'year' ? plan.prices.year : plan.prices.month;
          const isCurrentPlan = subscription?.plan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-lg ${
                plan.popular ? 'border-indigo-500 shadow-lg' : colors.border
              } ${isCurrentPlan ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-indigo-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Populaire
                  </span>
                </div>
              )}

              {/* Current plan badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                    Actuel
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                <plan.icon className={`w-6 h-6 ${colors.text}`} />
              </div>

              {/* Name & description */}
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{plan.description}</p>

              {/* Price */}
              <div className="mt-4 mb-6">
                {price === 0 ? (
                  <p className="text-3xl font-bold text-slate-900">Gratuit</p>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-slate-900">
                      {formatPrice(price)}
                      <span className="text-base font-normal text-slate-500">
                        /{interval === 'year' ? 'an' : 'mois'}
                      </span>
                    </p>
                    {interval === 'year' && plan.prices.month > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Économisez {getYearlySavings(plan.prices.month, plan.prices.year)}%
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Trial badge */}
              {plan.trialDays && plan.trialDays > 0 && !isCurrentPlan && (
                <div className="flex items-center gap-2 mb-4 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  <Clock className="w-4 h-4" />
                  Essai gratuit {plan.trialDays} jour
                </div>
              )}

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={getButtonDisabled(plan) || loading === plan.id}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  isCurrentPlan
                    ? 'bg-slate-100 text-slate-500 cursor-default'
                    : plan.id === 'free'
                    ? colors.button
                    : colors.button
                } ${loading === plan.id ? 'opacity-50 cursor-wait' : ''}`}
              >
                {loading === plan.id ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                ) : (
                  <>
                    {getButtonText(plan)}
                    {!isCurrentPlan && plan.id !== 'free' && (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Stats section */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">2 400+</p>
          <p className="text-sm text-slate-600">Élèves inscrits</p>
        </div>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">15 000+</p>
          <p className="text-sm text-slate-600">Exercices corrigés</p>
        </div>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">+2.5 pts</p>
          <p className="text-sm text-slate-600">Progression moyenne</p>
        </div>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">94%</p>
          <p className="text-sm text-slate-600">Satisfaction</p>
        </div>
      </div>

      {/* Testimonials section */}
      <div className="mt-16">
        <h2 className="text-2xl font-serif font-bold text-slate-900 text-center mb-10">
          Ce qu'en disent nos élèves
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Testimonial 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <Quote className="w-8 h-8 text-indigo-200 mb-2" />
            <p className="text-slate-700 mb-4">
              "J'ai gagné <strong>4 points</strong> sur ma dissertation grâce aux corrections IA.
              Les conseils sont précis et m'ont aidé à comprendre mes erreurs de méthodologie."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                L
              </div>
              <div>
                <p className="font-medium text-slate-900">Léa M.</p>
                <p className="text-sm text-slate-500">Première générale, Lyon</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <Quote className="w-8 h-8 text-indigo-200 mb-2" />
            <p className="text-slate-700 mb-4">
              "Le cours particulier avec mon tuteur a été décisif pour mon oral.
              Il m'a appris à <strong>structurer mes réponses</strong> et à gérer mon stress."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                T
              </div>
              <div>
                <p className="font-medium text-slate-900">Thomas B.</p>
                <p className="text-sm text-slate-500">Première techno, Nantes</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <Quote className="w-8 h-8 text-indigo-200 mb-2" />
            <p className="text-slate-700 mb-4">
              "En tant que prof, je recommande cette app à tous mes élèves.
              L'IA corrige comme moi mais est disponible <strong>24h/24</strong> !"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                M
              </div>
              <div>
                <p className="font-medium text-slate-900">Mme Dupont</p>
                <p className="text-sm text-slate-500">Prof de français, Paris</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust elements */}
      <div className="mt-16 text-center">
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <div className="flex items-center gap-2 text-slate-500">
            <Check className="w-5 h-5 text-green-500" />
            Paiement sécurisé par Stripe
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Check className="w-5 h-5 text-green-500" />
            Annulation à tout moment
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Check className="w-5 h-5 text-green-500" />
            Satisfait ou remboursé
          </div>
        </div>
        <p className="text-sm text-slate-400">
          Des questions ? Contactez-nous à support@neodromes.eu
        </p>
      </div>
    </div>
  );
};

export default Pricing;
