import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Lock, Sparkles, AlertTriangle, Check, Zap, Clock, BookOpen, MessageSquare } from "lucide-react";
import { ExerciseType, Genre, Work } from "../types";
import { PROGRAM_2026 } from "../constants";
import {
  generateSubject,
  generateSubjectList,
  evaluateStudentWork,
} from "../services/api";
import { saveExercise, updateExercise } from "../services/database";
import { Button } from "./Button";
import { useSubscription } from "../contexts/SubscriptionContext";
import { useToast } from "./ui/Toast";
import { track } from "../services/analytics";

export const Training: React.FC = () => {
  const {
    subscription,
    isPremium,
    hasAI,
    canDoExercise,
    remainingExercises,
    refreshSubscription,
  } = useSubscription();
  const toast = useToast();
  const limitTrackedRef = useRef(false);

  const [exerciseType, setExerciseType] = useState<ExerciseType>(
    ExerciseType.DISSERTATION,
  );
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  // Data State
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [subject, setSubject] = useState<string>("");
  const [studentInput, setStudentInput] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(
    null,
  );

  // UI State
  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1); // 1: Config, 1.5: List Selection, 2: Writing, 3: Feedback

  // Track when user hits the limit (only once per session)
  useEffect(() => {
    if (!canDoExercise && step === 1 && !limitTrackedRef.current) {
      limitTrackedRef.current = true;
      track('limit_reached', { remaining_exercises: remainingExercises });
    }
  }, [canDoExercise, step, remainingExercises]);

  const handleGenerateSingle = async () => {
    // For oral and dissertation without list, we need a work.
    // For commentaire, if no work is selected, we can still generate a random text (legacy behavior),
    // but if a work is selected, we use it.
    if (exerciseType !== ExerciseType.COMMENTAIRE && !selectedWork) return;

    setLoading(true);
    setSubject("");
    setSubjectList([]);
    setFeedback("");
    setStudentInput("");

    try {
      const generated = await generateSubject(
        exerciseType,
        selectedWork || undefined,
      );
      setSubject(generated);
      setStep(2);
    } catch (err) {
      toast.error("Erreur lors de la génération du sujet.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateList = async () => {
    if (!selectedWork) return;

    setLoading(true);
    setSubjectList([]);
    try {
      const list = await generateSubjectList(selectedWork, exerciseType);
      setSubjectList(list);
      setStep(1.5);
    } catch (err) {
      toast.error("Erreur lors de la génération de la liste.");
    } finally {
      setLoading(false);
    }
  };

  const selectSubjectFromList = (subj: string) => {
    setSubject(subj);
    setStep(2);
  };

  const handleEvaluate = async () => {
    if (!studentInput.trim()) return;

    // Check if user has AI access
    if (!hasAI) {
      // Save without AI feedback for free users
      setLoading(true);
      try {
        const saved = await saveExercise({
          exerciseType,
          work: selectedWork || undefined,
          subject,
          studentAnswer: studentInput,
          aiFeedback: undefined,
        });
        if (saved) {
          setCurrentExerciseId(saved.id);
        }
        // Refresh subscription to update exercise count
        await refreshSubscription();
        setFeedback(
          "Pour obtenir une correction détaillée par IA, passez à un abonnement Premium.",
        );
        setStep(3);
      } catch (err) {
        toast.error("Erreur lors de la sauvegarde.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const result = await evaluateStudentWork(
        exerciseType,
        subject,
        studentInput,
      );
      setFeedback(result);
      setStep(3);

      // Save exercise to database
      if (currentExerciseId) {
        await updateExercise(currentExerciseId, {
          studentAnswer: studentInput,
          aiFeedback: result,
        });
      } else {
        const saved = await saveExercise({
          exerciseType,
          work: selectedWork || undefined,
          subject,
          studentAnswer: studentInput,
          aiFeedback: result,
        });
        if (saved) {
          setCurrentExerciseId(saved.id);
        }
      }
      // Refresh subscription to update exercise count
      await refreshSubscription();
    } catch (err) {
      toast.error("Erreur lors de l'évaluation.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSubject("");
    setSubjectList([]);
    setStudentInput("");
    setFeedback("");
    setCurrentExerciseId(null);
  };

  const getSelectedValue = () => {
    if (!selectedWork) return "";
    for (let g = 0; g < PROGRAM_2026.length; g++) {
      const works = PROGRAM_2026[g].works;
      const w = works.indexOf(selectedWork);
      if (w !== -1) return `${g}-${w}`;
    }
    return "";
  };

  // Check if user can do exercise (free plan limit)
  if (!canDoExercise && step === 1) {
    return (
      <div className="max-w-3xl mx-auto p-6 md:p-8">
        {/* Header with urgency */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-4">
            <Clock className="w-4 h-4" />
            Limite atteinte - Renouvellement dans 7 jours
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Tu as épuisé tes 3 exercices gratuits
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Ne laisse pas une semaine d'entraînement passer ! Les élèves Premium
            s'entraînent <strong>4x plus</strong> et obtiennent de meilleurs résultats.
          </p>
        </div>

        {/* Feature comparison cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Free plan (current) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-700">Plan Gratuit</h3>
                <p className="text-xs text-slate-500">Ce que tu as maintenant</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-slate-400" />
                3 exercices par semaine
              </li>
              <li className="flex items-center gap-2 opacity-50">
                <Lock className="w-4 h-4 text-slate-400" />
                <span className="line-through">Correction par IA</span>
              </li>
              <li className="flex items-center gap-2 opacity-50">
                <Lock className="w-4 h-4 text-slate-400" />
                <span className="line-through">Suivi de progression</span>
              </li>
            </ul>
          </div>

          {/* Premium plan (upgrade) */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              POPULAIRE
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900">Premium</h3>
                <p className="text-xs text-indigo-600">Débloquer maintenant</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-indigo-900">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-600" />
                <strong>Exercices illimités</strong>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                Correction IA instantanée
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Conseils personnalisés
              </li>
            </ul>
          </div>
        </div>

        {/* Social proof */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-emerald-800 text-sm">
            <strong>+2 400 élèves</strong> utilisent Bac Français 2026 pour préparer leur EAF
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/tarifs"
            onClick={() => track('upgrade_cta_clicked', { source: 'limit_reached', cta: 'premium_trial' })}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg shadow-indigo-200"
          >
            <Sparkles className="w-5 h-5" />
            Essayer Premium (1 jour gratuit)
          </Link>
          <Link
            to="/tarifs"
            onClick={() => track('upgrade_cta_clicked', { source: 'limit_reached', cta: 'view_plans' })}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Voir tous les plans
          </Link>
        </div>

        {/* Trust indicators */}
        <p className="text-center text-xs text-slate-500 mt-4">
          Annulation à tout moment · Paiement sécurisé · Satisfait ou remboursé
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-sm rounded-xl border border-slate-200">
      {/* Free plan warning */}
      {!isPremium && remainingExercises > 0 && remainingExercises <= 3 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              <strong>{remainingExercises}</strong> exercice
              {remainingExercises > 1 ? "s" : ""} restant
              {remainingExercises > 1 ? "s" : ""} cette semaine
              {!hasAI && " (sans correction IA)"}
            </p>
          </div>
          <Link
            to="/tarifs"
            className="text-sm font-medium text-amber-700 hover:text-amber-900"
          >
            Passer à Premium
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-100 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            Entraînement Guidé par IA
          </h2>
          <p className="text-slate-600 mt-2">
            Générez des sujets, choisissez parmi des propositions, et recevez
            une correction immédiate.
          </p>
          {!hasAI && (
            <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
              <Lock className="w-4 h-4" />
              La correction par IA nécessite un abonnement Premium
            </p>
          )}
        </div>
        {step > 1 && (
          <button
            onClick={reset}
            className="text-sm text-slate-500 hover:text-slate-800 underline"
          >
            Recommencer
          </button>
        )}
      </div>

      {/* Step 1: Configuration */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type d'exercice
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(ExerciseType).map((type) => (
                <button
                  key={type}
                  onClick={() => setExerciseType(type)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    exerciseType === type
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500"
                      : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="work-select" className="block text-sm font-medium text-slate-700 mb-2">
              Choisir une œuvre du programme
            </label>
            <div className="relative">
              <select
                id="work-select"
                className="w-full p-3 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 appearance-none pr-10 text-slate-900"
                aria-describedby={exerciseType === ExerciseType.COMMENTAIRE && !selectedWork ? "work-help" : undefined}
                onChange={(e) => {
                  const [genreIdx, workIdx] = e.target.value
                    .split("-")
                    .map(Number);
                  if (
                    !isNaN(genreIdx) &&
                    PROGRAM_2026[genreIdx]?.works[workIdx]
                  ) {
                    setSelectedWork(PROGRAM_2026[genreIdx].works[workIdx]);
                  }
                }}
                value={getSelectedValue()}
              >
                <option value="" disabled>
                  -- Sélectionner une œuvre --
                </option>
                {PROGRAM_2026.map((genre, gIdx) => (
                  <optgroup key={genre.genre} label={genre.genre}>
                    {genre.works.map((work, wIdx) => (
                      <option key={work.title} value={`${gIdx}-${wIdx}`}>
                        {work.title} - {work.author}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600" aria-hidden="true">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            {exerciseType === ExerciseType.COMMENTAIRE && !selectedWork && (
              <p id="work-help" className="text-xs text-slate-500 mt-1">
                Si aucune œuvre n'est sélectionnée, un texte aléatoire hors
                programme sera généré.
              </p>
            )}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleGenerateSingle}
              isLoading={loading}
              disabled={
                exerciseType !== ExerciseType.COMMENTAIRE && !selectedWork
              }
              className="w-full sm:w-auto"
            >
              {exerciseType === ExerciseType.COMMENTAIRE
                ? selectedWork
                  ? "Générer un Extrait de l'œuvre"
                  : "Générer un Texte Aléatoire"
                : "Générer un Sujet"}
            </Button>

            {selectedWork &&
              (exerciseType === ExerciseType.DISSERTATION ||
                exerciseType === ExerciseType.COMMENTAIRE) && (
                <Button
                  onClick={handleGenerateList}
                  isLoading={loading}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Proposer 3 Sujets (Choix)
                </Button>
              )}
          </div>
        </div>
      )}

      {/* Step 1.5: List Selection */}
      {step === 1.5 && (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-900">
            {exerciseType === ExerciseType.COMMENTAIRE
              ? "Choisissez un extrait à commenter :"
              : "Choisissez un sujet de dissertation :"}
            <span className="block text-indigo-600 italic text-base font-normal mt-1">
              {selectedWork?.title}
            </span>
          </h3>
          <div className="grid gap-4">
            {subjectList.map((subj, idx) => (
              <div
                key={idx}
                className="p-4 border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition-all group"
                onClick={() => selectSubjectFromList(subj)}
              >
                <div className="flex items-start">
                  <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                    {idx + 1}
                  </span>
                  <div className="text-slate-800 font-medium text-sm md:text-base leading-relaxed whitespace-pre-line line-clamp-6">
                    {subj}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={() => setStep(1)}>
            Retour
          </Button>
        </div>
      )}

      {/* Step 2: Subject & Input */}
      {step >= 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
              Sujet Sélectionné
            </h3>
            <div className="prose prose-slate max-w-none font-serif text-slate-800 whitespace-pre-wrap">
              {subject}
            </div>
          </div>

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="student-answer" className="block text-sm font-medium text-slate-700 mb-2">
                  {exerciseType === ExerciseType.ORAL
                    ? "Votre réponse à l'oral (résumée) :"
                    : "Votre Problématique et votre Plan détaillé :"}
                </label>
                <textarea
                  id="student-answer"
                  className="w-full h-48 p-4 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                  placeholder={
                    exerciseType === ExerciseType.DISSERTATION
                      ? "Problématique : ... \nI. ... \nII. ..."
                      : "Projet de lecture : ... \nI. ... \nII. ..."
                  }
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                  aria-label={
                    exerciseType === ExerciseType.ORAL
                      ? "Votre réponse à l'oral"
                      : "Votre problématique et plan détaillé"
                  }
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleEvaluate}
                  isLoading={loading}
                  variant="primary"
                >
                  Obtenir une correction
                </Button>
                <Button onClick={reset} variant="outline" disabled={loading}>
                  Changer de sujet
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Feedback */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
            <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              Correction et Conseils
            </h3>
            <div className="prose prose-indigo max-w-none whitespace-pre-wrap text-indigo-900/80">
              {feedback}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={reset} variant="secondary">
              Nouvel Exercice
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
