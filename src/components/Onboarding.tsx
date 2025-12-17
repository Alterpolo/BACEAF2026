import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
} from 'lucide-react';
import { PROGRAM_2026 } from '../constants';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { track } from '../services/analytics';

// Types
interface OnboardingData {
  classLevel: string;
  examDate: string;
  focusWork: {
    title: string;
    author: string;
    genre: string;
  } | null;
}

// Class level options
const CLASS_LEVELS = [
  { id: 'premiere_generale', label: 'Première Générale', description: 'Voie générale (L, ES, S)' },
  { id: 'premiere_techno', label: 'Première Technologique', description: 'STMG, STI2D, STL, etc.' },
  { id: 'premiere_pro', label: 'Première Professionnelle', description: 'Bac Pro' },
];

// Exam date options (2026)
const EXAM_DATES = [
  { id: 'juin_2026', label: 'Juin 2026', description: 'Session normale' },
  { id: 'septembre_2026', label: 'Septembre 2026', description: 'Session de rattrapage' },
];

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    classLevel: '',
    examDate: 'juin_2026',
    focusWork: null,
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update profile with onboarding data
      const { error } = await supabase
        .from('profiles')
        .update({
          class_level: data.classLevel,
          exam_date: data.examDate,
          focus_work: data.focusWork,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Track completion
      track('onboarding_completed', {
        class_level: data.classLevel,
        exam_date: data.examDate,
        has_focus_work: !!data.focusWork,
      });

      // Refresh profile to update context
      await refreshProfile();

      // Navigate to dashboard
      navigate('/');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Just mark onboarding as completed
      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      // Track skip
      track('onboarding_skipped', { step });

      await refreshProfile();
      navigate('/');
    } catch (error) {
      console.error('Skip onboarding error:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.classLevel !== '';
      case 2:
        return data.examDate !== '';
      case 3:
        return true; // Work selection is optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Bienvenue sur Bac Français 2026
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
            Personnalisons ton expérience
          </h1>
          <p className="text-slate-600">
            Quelques questions pour adapter le contenu à tes besoins
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-all ${
                s === step
                  ? 'bg-indigo-600 scale-125'
                  : s < step
                  ? 'bg-indigo-400'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
          {/* Step 1: Class Level */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Quelle est ta classe ?
                  </h2>
                  <p className="text-sm text-slate-500">
                    Pour adapter le contenu à ton niveau
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {CLASS_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setData({ ...data, classLevel: level.id })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      data.classLevel === level.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{level.label}</p>
                        <p className="text-sm text-slate-500">{level.description}</p>
                      </div>
                      {data.classLevel === level.id && (
                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Exam Date */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Quand passes-tu le bac ?
                  </h2>
                  <p className="text-sm text-slate-500">
                    Pour planifier ta progression
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {EXAM_DATES.map((date) => (
                  <button
                    key={date.id}
                    onClick={() => setData({ ...data, examDate: date.id })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      data.examDate === date.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{date.label}</p>
                        <p className="text-sm text-slate-500">{date.description}</p>
                      </div>
                      {data.examDate === date.id && (
                        <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Days countdown */}
              {data.examDate && (
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-600">
                    {data.examDate === 'juin_2026' ? (
                      <>
                        Il te reste environ <strong className="text-indigo-600">
                          {Math.ceil((new Date('2026-06-15').getTime() - Date.now()) / (1000 * 60 * 60 * 24))} jours
                        </strong> pour te préparer !
                      </>
                    ) : (
                      <>
                        Il te reste environ <strong className="text-indigo-600">
                          {Math.ceil((new Date('2026-09-01').getTime() - Date.now()) / (1000 * 60 * 60 * 24))} jours
                        </strong> pour te préparer !
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Focus Work */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Par quelle œuvre commencer ?
                  </h2>
                  <p className="text-sm text-slate-500">
                    Optionnel - tu pourras changer plus tard
                  </p>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {PROGRAM_2026.map((genre) =>
                  genre.works.map((work) => (
                    <button
                      key={`${work.author}-${work.title}`}
                      onClick={() =>
                        setData({
                          ...data,
                          focusWork:
                            data.focusWork?.title === work.title
                              ? null
                              : { title: work.title, author: work.author, genre: genre.genre },
                        })
                      }
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        data.focusWork?.title === work.title
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {work.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {work.author} • {genre.genre}
                          </p>
                        </div>
                        {data.focusWork?.title === work.title && (
                          <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {!data.focusWork && (
                <p className="text-center text-sm text-slate-500">
                  Tu peux passer cette étape et choisir plus tard
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <div>
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Retour
                </button>
              ) : (
                <button
                  onClick={handleSkip}
                  disabled={loading}
                  className="text-slate-500 hover:text-slate-700 text-sm"
                >
                  Passer cette étape
                </button>
              )}
            </div>

            <div>
              {step < totalSteps ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                    canProceed()
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Continuer
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Commencer
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Skip link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          <button onClick={handleSkip} className="hover:text-slate-700 underline">
            Passer et explorer librement
          </button>
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
