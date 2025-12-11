import React, { useState } from 'react';
import { ExerciseType, Genre, Work } from '../types';
import { PROGRAM_2026 } from '../constants';
import { generateSubject, evaluateStudentWork } from '../services/geminiService';
import { Button } from './Button';

export const Training: React.FC = () => {
  const [exerciseType, setExerciseType] = useState<ExerciseType>(ExerciseType.DISSERTATION);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [subject, setSubject] = useState<string>("");
  const [studentInput, setStudentInput] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1); // 1: Config, 2: Subject/Input, 3: Feedback

  const handleGenerate = async () => {
    if (exerciseType !== ExerciseType.COMMENTAIRE && !selectedWork) return;
    
    setLoading(true);
    setSubject("");
    setFeedback("");
    setStudentInput("");
    
    try {
      const generated = await generateSubject(exerciseType, selectedWork || undefined);
      setSubject(generated);
      setStep(2);
    } catch (err) {
      alert("Erreur lors de la génération du sujet.");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!studentInput.trim()) return;
    setLoading(true);
    try {
      const result = await evaluateStudentWork(exerciseType, subject, studentInput);
      setFeedback(result);
      setStep(3);
    } catch (err) {
      alert("Erreur lors de l'évaluation.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSubject("");
    setStudentInput("");
    setFeedback("");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-sm rounded-xl border border-slate-200">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-900 font-serif">Entraînement Guidé par IA</h2>
        <p className="text-slate-600 mt-2">
          Générez des sujets, rédigez vos plans ou problématiques, et recevez une correction immédiate.
        </p>
      </div>

      {/* Step 1: Configuration */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type d'exercice</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(ExerciseType).map((type) => (
                <button
                  key={type}
                  onClick={() => setExerciseType(type)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    exerciseType === type
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {exerciseType !== ExerciseType.COMMENTAIRE && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Choisir une œuvre du programme</label>
              <select
                className="w-full p-3 bg-white border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                onChange={(e) => {
                    const [genreIdx, workIdx] = e.target.value.split('-').map(Number);
                    if (!isNaN(genreIdx)) {
                        setSelectedWork(PROGRAM_2026[genreIdx].works[workIdx]);
                    }
                }}
                defaultValue=""
              >
                <option value="" disabled>-- Sélectionner une œuvre --</option>
                {PROGRAM_2026.map((genre, gIdx) => (
                  <optgroup key={genre.genre} label={genre.genre}>
                    {genre.works.map((work, wIdx) => (
                      <option key={work.title} value={`${gIdx}-${wIdx}`}>
                        {work.title} ({work.author})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4">
            <Button 
              onClick={handleGenerate} 
              isLoading={loading}
              disabled={exerciseType !== ExerciseType.COMMENTAIRE && !selectedWork}
              className="w-full md:w-auto"
            >
              Générer un Sujet
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Subject & Input */}
      {step >= 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Sujet / Support</h3>
            <div className="prose prose-slate max-w-none font-serif text-slate-800 whitespace-pre-wrap">
              {subject}
            </div>
          </div>

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                   {exerciseType === ExerciseType.ORAL 
                    ? "Votre réponse à l'oral (résumée) :" 
                    : "Votre Problématique et votre Plan détaillé :"}
                </label>
                <textarea
                  className="w-full h-48 p-4 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                  placeholder={exerciseType === ExerciseType.DISSERTATION 
                    ? "Problématique : ... \nI. ... \nII. ..." 
                    : "Entrez votre analyse ici..."}
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                 <Button onClick={handleEvaluate} isLoading={loading} variant="primary">
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
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
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