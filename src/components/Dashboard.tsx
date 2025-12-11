import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, FileText, TrendingUp, Clock, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getStats, getProgress, getExercises, Exercise, Progress } from '../services/database';
import { ExerciseType } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    totalExercises: number;
    averageScore: number | null;
    exercisesByType: Record<string, number>;
    recentActivity: Exercise[];
  } | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsData, progressData] = await Promise.all([
          getStats(),
          getProgress(),
        ]);
        setStats(statsData);
        setProgress(progressData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getExerciseTypeColor = (type: string) => {
    switch (type) {
      case 'Dissertation':
        return 'bg-indigo-100 text-indigo-700';
      case 'Commentaire':
        return 'bg-emerald-100 text-emerald-700';
      case 'Oral':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Chargement du tableau de bord...</p>
      </div>
    );
  }

  const hasData = stats && stats.totalExercises > 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
            Bonjour, {user?.name?.split(' ')[0] || 'Élève'} !
          </h1>
          <p className="text-slate-600 mt-1">
            {hasData
              ? 'Voici votre progression et vos dernières activités.'
              : 'Commencez à vous entraîner pour voir votre progression ici.'}
          </p>
        </div>
        <Link
          to="/entrainement"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <GraduationCap className="w-5 h-5" />
          Nouvel exercice
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Exercices réalisés</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.totalExercises || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Score moyen</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats?.averageScore !== null ? `${stats.averageScore.toFixed(1)}/20` : '--'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Oeuvres travaillées</p>
              <p className="text-3xl font-bold text-slate-900">{progress.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Type Breakdown */}
      {hasData && stats.exercisesByType && Object.keys(stats.exercisesByType).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Répartition par type</h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(stats.exercisesByType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getExerciseTypeColor(type)}`}>
                  {type}
                </span>
                <span className="text-slate-700 font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Activité récente
            </h2>
          </div>

          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getExerciseTypeColor(exercise.exercise_type)}`}>
                    {exercise.exercise_type.substring(0, 4)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {exercise.work_title || 'Exercice libre'}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(exercise.created_at)}</p>
                  </div>
                  {exercise.score !== null && (
                    <span className="text-sm font-bold text-indigo-600">{exercise.score}/20</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Aucune activité pour le moment</p>
              <Link to="/entrainement" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
                Commencer un exercice
              </Link>
            </div>
          )}
        </div>

        {/* Progress by Work */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-slate-400" />
              Progression par oeuvre
            </h2>
          </div>

          {progress.length > 0 ? (
            <div className="space-y-3">
              {progress.slice(0, 5).map((prog) => (
                <div
                  key={prog.id}
                  className="p-3 rounded-lg bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{prog.work_title}</p>
                      <p className="text-xs text-slate-500">{prog.work_author}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {prog.exercises_completed} exercice{prog.exercises_completed > 1 ? 's' : ''}
                    </span>
                  </div>
                  {prog.average_score !== null && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>Score moyen</span>
                        <span className="font-medium text-slate-700">{prog.average_score.toFixed(1)}/20</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${(prog.average_score / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Aucune progression enregistrée</p>
              <Link to="/programme" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
                Découvrir le programme
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          to="/methodologie"
          className="group bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Méthodologie</h3>
              <p className="text-sm text-slate-500">Revoir les méthodes</p>
            </div>
          </div>
        </Link>

        <Link
          to="/entrainement"
          className="group bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Entraînement</h3>
              <p className="text-sm text-slate-500">Pratiquer avec l'IA</p>
            </div>
          </div>
        </Link>

        <Link
          to="/programme"
          className="group bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Programme</h3>
              <p className="text-sm text-slate-500">Consulter les oeuvres</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
