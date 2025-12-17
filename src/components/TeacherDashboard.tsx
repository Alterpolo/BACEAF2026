import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Plus, Copy, Trash2, UserMinus, ClipboardList, TrendingUp, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './ui/Toast';
import {
  Class,
  Assignment,
  StudentProgress,
  getTeacherClasses,
  createClass,
  deleteClass,
  getClassMembers,
  removeStudentFromClass,
  getClassAssignments,
  createAssignment,
  deleteAssignment,
  getClassStudentsProgress,
  ClassMember,
} from '../services/teacher';
import {
  generateExercise,
  batchGenerateExercises,
  GeneratedExercise,
  ExerciseType as N8nExerciseType,
} from '../services/n8nExercises';
import { PROGRAM_2026 } from '../constants';
import { ExerciseType, Work } from '../types';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentsProgress, setStudentsProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'students' | 'assignments' | 'progress' | 'ai'>('students');

  // AI Generation state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiExerciseType, setAiExerciseType] = useState<N8nExerciseType>('Dissertation');
  const [aiSelectedWork, setAiSelectedWork] = useState<Work | null>(null);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [generatedSubjects, setGeneratedSubjects] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [batchWorks, setBatchWorks] = useState<Work[]>([]);

  // Modal states
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');

  // Assignment form
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentType, setAssignmentType] = useState<ExerciseType>(ExerciseType.DISSERTATION);
  const [assignmentWork, setAssignmentWork] = useState<Work | null>(null);
  const [assignmentDueDate, setAssignmentDueDate] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadClassData(selectedClass.id);
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    setLoading(true);
    const data = await getTeacherClasses();
    setClasses(data);
    if (data.length > 0 && !selectedClass) {
      setSelectedClass(data[0]);
    }
    setLoading(false);
  };

  const loadClassData = async (classId: string) => {
    const [membersData, assignmentsData, progressData] = await Promise.all([
      getClassMembers(classId),
      getClassAssignments(classId),
      getClassStudentsProgress(classId),
    ]);
    setMembers(membersData);
    setAssignments(assignmentsData);
    setStudentsProgress(progressData);
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return;
    const newClass = await createClass(newClassName, newClassDescription);
    if (newClass) {
      setClasses([newClass, ...classes]);
      setSelectedClass(newClass);
      setNewClassName('');
      setNewClassDescription('');
      setShowCreateClass(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Supprimer cette classe ? Cette action est irréversible.')) return;
    const success = await deleteClass(classId);
    if (success) {
      setClasses(classes.filter(c => c.id !== classId));
      if (selectedClass?.id === classId) {
        setSelectedClass(classes.find(c => c.id !== classId) || null);
      }
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedClass) return;
    if (!confirm('Retirer cet élève de la classe ?')) return;
    const success = await removeStudentFromClass(selectedClass.id, studentId);
    if (success) {
      setMembers(members.filter(m => m.student_id !== studentId));
    }
  };

  const handleCreateAssignment = async () => {
    if (!selectedClass || !assignmentTitle.trim()) return;
    const newAssignment = await createAssignment({
      classId: selectedClass.id,
      title: assignmentTitle,
      description: assignmentDescription,
      exerciseType: assignmentType,
      work: assignmentWork || undefined,
      dueDate: assignmentDueDate ? new Date(assignmentDueDate) : undefined,
    });
    if (newAssignment) {
      setAssignments([newAssignment, ...assignments]);
      setAssignmentTitle('');
      setAssignmentDescription('');
      setAssignmentWork(null);
      setAssignmentDueDate('');
      setShowCreateAssignment(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Supprimer ce devoir ?')) return;
    const success = await deleteAssignment(assignmentId);
    if (success) {
      setAssignments(assignments.filter(a => a.id !== assignmentId));
    }
  };

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié !');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Sujet copié !');
  };

  // AI Generation handlers
  const handleGenerateSingle = async () => {
    if (!aiSelectedWork) {
      toast.error('Veuillez sélectionner une œuvre');
      return;
    }

    setAiGenerating(true);
    try {
      const subject = await generateExercise({
        type: aiExerciseType,
        work: aiSelectedWork,
        customPrompt: aiCustomPrompt || undefined,
      });
      setGeneratedSubjects([subject]);
      toast.success('Sujet généré !');
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Erreur lors de la génération. Vérifiez que n8n est configuré.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleGenerateBatch = async () => {
    if (batchWorks.length === 0) {
      toast.error('Veuillez sélectionner au moins une œuvre');
      return;
    }

    setAiGenerating(true);
    try {
      const result = await batchGenerateExercises({
        works: batchWorks,
        type: aiExerciseType,
        exercisesPerWork: 3,
      });
      // Flatten all subjects from batch result
      const allSubjects = result.exercises.flatMap(e =>
        (e.subjects || []).map(s => `[${e.work.title}] ${s}`)
      );
      setGeneratedSubjects(allSubjects);
      toast.success(`${result.totalGenerated} sujets générés !`);
    } catch (error) {
      console.error('Batch generation error:', error);
      toast.error('Erreur lors de la génération en lot.');
    } finally {
      setAiGenerating(false);
    }
  };

  const toggleBatchWork = (work: Work) => {
    const exists = batchWorks.some(w => w.title === work.title);
    if (exists) {
      setBatchWorks(batchWorks.filter(w => w.title !== work.title));
    } else {
      setBatchWorks([...batchWorks, work]);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Espace Enseignant</h1>
          <p className="text-slate-600 mt-1">Gérez vos classes et suivez la progression de vos élèves.</p>
        </div>
        <button
          onClick={() => setShowCreateClass(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle classe
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Classes sidebar */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            Mes classes
          </h2>
          {classes.length === 0 ? (
            <p className="text-slate-500 text-sm">Aucune classe créée</p>
          ) : (
            <div className="space-y-2">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedClass?.id === cls.id
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="font-medium text-slate-900">{cls.name}</div>
                  <div className="text-sm text-slate-500">{cls.member_count || 0} élève(s)</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {selectedClass ? (
            <>
              {/* Class header */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedClass.name}</h2>
                    {selectedClass.description && (
                      <p className="text-slate-600 mt-1">{selectedClass.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 px-4 py-2 rounded-lg">
                      <span className="text-sm text-slate-500">Code : </span>
                      <span className="font-mono font-bold text-slate-900">{selectedClass.join_code}</span>
                      <button
                        onClick={() => copyJoinCode(selectedClass.join_code)}
                        className="ml-2 text-slate-400 hover:text-slate-600"
                        title="Copier le code"
                      >
                        <Copy className="w-4 h-4 inline" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteClass(selectedClass.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer la classe"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-6 border-b border-slate-200">
                  <button
                    onClick={() => setActiveTab('students')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'students'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Users className="w-4 h-4 inline mr-2" />
                    Élèves ({members.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'assignments'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4 inline mr-2" />
                    Devoirs ({assignments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('progress')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'progress'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Progression
                  </button>
                  <button
                    onClick={() => setActiveTab('ai')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'ai'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Génération IA
                  </button>
                </div>
              </div>

              {/* Tab content */}
              {activeTab === 'students' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {members.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Aucun élève inscrit</p>
                      <p className="text-sm mt-2">
                        Partagez le code <span className="font-mono font-bold">{selectedClass.join_code}</span> à vos élèves
                      </p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Élève</th>
                          <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Email</th>
                          <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Inscrit le</th>
                          <th className="text-right px-6 py-3 text-sm font-medium text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {members.map((member) => (
                          <tr key={member.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{member.student?.name}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{member.student?.email}</td>
                            <td className="px-6 py-4 text-slate-500 text-sm">{formatDate(member.joined_at)}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleRemoveStudent(member.student_id)}
                                className="text-red-500 hover:text-red-700"
                                title="Retirer de la classe"
                              >
                                <UserMinus className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === 'assignments' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowCreateAssignment(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Nouveau devoir
                  </button>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {assignments.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>Aucun devoir assigné</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {assignments.map((assignment) => (
                          <div key={assignment.id} className="p-4 hover:bg-slate-50">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-slate-900">{assignment.title}</h3>
                                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                    {assignment.exercise_type}
                                  </span>
                                  {assignment.work_title && (
                                    <span>{assignment.work_title}</span>
                                  )}
                                  {assignment.due_date && (
                                    <span>Échéance : {formatDate(assignment.due_date)}</span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteAssignment(assignment.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'progress' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {studentsProgress.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Aucune donnée de progression</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Élève</th>
                          <th className="text-center px-6 py-3 text-sm font-medium text-slate-500">Exercices</th>
                          <th className="text-center px-6 py-3 text-sm font-medium text-slate-500">Score moyen</th>
                          <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Dernière activité</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentsProgress.map((sp) => (
                          <tr key={sp.student.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{sp.student.name}</div>
                              <div className="text-sm text-slate-500">{sp.student.email}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="font-bold text-slate-900">{sp.exercises_count}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {sp.average_score !== null ? (
                                <span className={`font-bold ${sp.average_score >= 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {sp.average_score.toFixed(1)}/20
                                </span>
                              ) : (
                                <span className="text-slate-400">--</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-sm">
                              {sp.last_activity ? formatDate(sp.last_activity) : '--'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-6">
                  {/* Mode toggle */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBatchMode(false)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        !batchMode
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Génération simple
                    </button>
                    <button
                      onClick={() => setBatchMode(true)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        batchMode
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Génération en lot
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Generation form */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        {batchMode ? 'Génération en lot' : 'Générer un sujet'}
                      </h3>

                      <div className="space-y-4">
                        {/* Exercise type */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Type d'exercice
                          </label>
                          <select
                            value={aiExerciseType}
                            onChange={(e) => setAiExerciseType(e.target.value as N8nExerciseType)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="Dissertation">Dissertation</option>
                            <option value="Commentaire">Commentaire</option>
                            <option value="Oral">Oral</option>
                          </select>
                        </div>

                        {/* Work selection */}
                        {!batchMode ? (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Œuvre
                            </label>
                            <select
                              onChange={(e) => {
                                const [genreIdx, workIdx] = e.target.value.split('-').map(Number);
                                if (!isNaN(genreIdx) && PROGRAM_2026[genreIdx]?.works[workIdx]) {
                                  setAiSelectedWork(PROGRAM_2026[genreIdx].works[workIdx]);
                                } else {
                                  setAiSelectedWork(null);
                                }
                              }}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">-- Sélectionner une œuvre --</option>
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
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Œuvres ({batchWorks.length} sélectionnées)
                            </label>
                            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                              {PROGRAM_2026.flatMap((genre) =>
                                genre.works.map((work) => (
                                  <label
                                    key={work.title}
                                    className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={batchWorks.some(w => w.title === work.title)}
                                      onChange={() => toggleBatchWork(work)}
                                      className="w-4 h-4 text-purple-600 rounded"
                                    />
                                    <span className="text-sm text-slate-700">
                                      {work.title} - {work.author}
                                    </span>
                                  </label>
                                ))
                              )}
                            </div>
                          </div>
                        )}

                        {/* Custom prompt */}
                        {!batchMode && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Instructions personnalisées (optionnel)
                            </label>
                            <textarea
                              value={aiCustomPrompt}
                              onChange={(e) => setAiCustomPrompt(e.target.value)}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              rows={2}
                              placeholder="Ex: Sujet portant sur le thème de l'amour..."
                            />
                          </div>
                        )}

                        {/* Generate button */}
                        <button
                          onClick={batchMode ? handleGenerateBatch : handleGenerateSingle}
                          disabled={aiGenerating || (!batchMode && !aiSelectedWork) || (batchMode && batchWorks.length === 0)}
                          className="w-full py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          {aiGenerating ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Génération en cours...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              {batchMode ? `Générer (${batchWorks.length * 3} sujets)` : 'Générer le sujet'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Generated subjects */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-slate-400" />
                          Sujets générés ({generatedSubjects.length})
                        </h3>
                        {generatedSubjects.length > 0 && (
                          <button
                            onClick={() => setGeneratedSubjects([])}
                            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Effacer
                          </button>
                        )}
                      </div>

                      {generatedSubjects.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                          <p>Les sujets générés apparaîtront ici</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {generatedSubjects.map((subject, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-slate-50 rounded-lg border border-slate-200 group"
                            >
                              <p className="text-slate-700 text-sm whitespace-pre-wrap">{subject}</p>
                              <button
                                onClick={() => copyToClipboard(subject)}
                                className="mt-2 text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Copy className="w-3 h-3" />
                                Copier
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info banner */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-800">
                    <p className="font-medium mb-1">💡 Astuce</p>
                    <p>
                      Les sujets sont générés via n8n + DeepSeek. Vous pouvez les copier pour créer des devoirs
                      ou les partager directement avec vos élèves.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Créez votre première classe pour commencer</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Class Modal */}
      {showCreateClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setShowCreateClass(false)}></div>
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Créer une classe</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la classe</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: 1ère A - Français"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (optionnel)</label>
                <textarea
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  placeholder="Description de la classe..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateClass(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateClass}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setShowCreateAssignment(false)}></div>
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Nouveau devoir</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Dissertation sur Manon Lescaut"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type d'exercice</label>
                <select
                  value={assignmentType}
                  onChange={(e) => setAssignmentType(e.target.value as ExerciseType)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.values(ExerciseType).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Oeuvre (optionnel)</label>
                <select
                  onChange={(e) => {
                    const [genreIdx, workIdx] = e.target.value.split('-').map(Number);
                    if (!isNaN(genreIdx) && PROGRAM_2026[genreIdx]?.works[workIdx]) {
                      setAssignmentWork(PROGRAM_2026[genreIdx].works[workIdx]);
                    } else {
                      setAssignmentWork(null);
                    }
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Aucune oeuvre spécifique --</option>
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
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date limite (optionnel)</label>
                <input
                  type="datetime-local"
                  value={assignmentDueDate}
                  onChange={(e) => setAssignmentDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Consignes (optionnel)</label>
                <textarea
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Instructions pour les élèves..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateAssignment(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateAssignment}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Créer le devoir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
