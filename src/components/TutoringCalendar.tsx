import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Star,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  MessageSquare,
  Mic,
  Check,
  X,
  Video,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
  getTutors,
  getAvailableSlots,
  bookSession,
  getUserSessions,
  cancelSession,
  Tutor,
  TimeSlot,
  TutoringSession,
  formatSessionDate,
  formatShortDate,
  formatTime,
  groupSlotsByDate,
  isUpcoming,
  getStatusLabel,
} from '../services/tutoring';

export const TutoringCalendar: React.FC = () => {
  const { user } = useAuth();
  const { subscription, hasTutoring, refreshSubscription } = useSubscription();

  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Booking form
  const [topic, setTopic] = useState('');
  const [focusArea, setFocusArea] = useState<'dissertation' | 'commentaire' | 'oral' | ''>('');
  const [workTitle, setWorkTitle] = useState('');

  // Date navigation
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  useEffect(() => {
    loadData();
  }, [weekStart, selectedTutor]);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load tutors if not loaded
      if (tutors.length === 0) {
        const tutorList = await getTutors();
        setTutors(tutorList);
      }

      // Load slots for the week
      const startDate = weekStart.toISOString().split('T')[0];
      const endDate = new Date(weekStart);
      endDate.setDate(endDate.getDate() + 6);
      const endDateStr = endDate.toISOString().split('T')[0];

      const availableSlots = await getAvailableSlots({
        startDate,
        endDate: endDateStr,
        tutorId: selectedTutor?.id,
      });
      setSlots(availableSlots);
    } catch (err) {
      console.error('Error loading tutoring data:', err);
      setError('Erreur lors du chargement des créneaux');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    if (!user) return;
    try {
      const userSessions = await getUserSessions(user.id, { upcoming: true });
      setSessions(userSessions);
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  };

  const handleBook = async () => {
    if (!user || !selectedSlot) return;

    setBooking(true);
    setError(null);
    setSuccess(null);

    try {
      await bookSession({
        studentId: user.id,
        tutorId: selectedSlot.tutorId,
        scheduledAt: selectedSlot.start,
        durationMinutes: selectedSlot.duration,
        topic: topic || undefined,
        focusArea: focusArea || undefined,
        workTitle: workTitle || undefined,
      });

      setSuccess('Cours réservé avec succès !');
      setSelectedSlot(null);
      setTopic('');
      setFocusArea('');
      setWorkTitle('');

      // Refresh data
      await Promise.all([loadData(), loadSessions(), refreshSubscription()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la réservation');
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce cours ?')) return;

    try {
      await cancelSession(sessionId);
      setSuccess('Cours annulé, heures remboursées');
      await Promise.all([loadSessions(), refreshSubscription()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'annulation');
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));

    // Don't go before today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate < today) return;

    setWeekStart(newDate);
  };

  const slotsByDate = groupSlotsByDate(slots);

  // Generate week days
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    weekDays.push(day);
  }

  // Check access
  if (!hasTutoring) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Cours particuliers
        </h2>
        <p className="text-slate-600 mb-6">
          Réservez des cours avec un professeur diplômé pour un accompagnement personnalisé.
          Cette fonctionnalité est disponible avec l'abonnement Premium + Cours.
        </p>
        <Link
          to="/tarifs"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          Découvrir l'offre Premium + Cours
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">
            Réserver un cours particulier
          </h1>
          <p className="text-slate-600 mt-1">
            {subscription?.tutoringHoursRemaining || 0}h restante(s) ce mois-ci
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Upcoming sessions */}
      {sessions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Vos prochains cours
          </h2>
          <div className="space-y-3">
            {sessions.filter(isUpcoming).slice(0, 3).map(session => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{session.tutorName}</p>
                    <p className="text-sm text-slate-500">{formatSessionDate(session.scheduledAt)}</p>
                    {session.topic && (
                      <p className="text-sm text-purple-600">{session.topic}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.meetingUrl && (
                    <a
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 flex items-center gap-1"
                    >
                      <Video className="w-4 h-4" />
                      Rejoindre
                    </a>
                  )}
                  <button
                    onClick={() => handleCancel(session.id)}
                    className="px-3 py-1.5 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tutor filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Choisir un professeur</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedTutor(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              !selectedTutor
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
            }`}
          >
            Tous les professeurs
          </button>
          {tutors.map(tutor => (
            <button
              key={tutor.id}
              onClick={() => setSelectedTutor(tutor)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedTutor?.id === tutor.id
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                  : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
              }`}
            >
              {tutor.name}
              {tutor.rating && (
                <span className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3 h-3 fill-current" />
                  {tutor.rating.toFixed(1)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {/* Week navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateWeek('prev')}
            disabled={weekStart <= new Date()}
            className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-900">
            Semaine du {formatShortDate(weekStart.toISOString())}
          </h2>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
            <p className="mt-4 text-slate-500">Chargement des créneaux...</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {weekDays.map(day => (
              <div
                key={day.toISOString()}
                className="text-center p-2 border-b border-slate-200"
              >
                <p className="text-xs text-slate-500 uppercase">
                  {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {day.getDate()}
                </p>
              </div>
            ))}

            {/* Slots */}
            {weekDays.map(day => {
              const dateKey = day.toISOString().split('T')[0];
              const daySlots = slotsByDate.get(dateKey) || [];

              return (
                <div key={dateKey} className="min-h-[120px] p-1 space-y-1">
                  {daySlots.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">-</p>
                  ) : (
                    daySlots.slice(0, 4).map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full px-2 py-1 text-xs rounded transition-all ${
                          selectedSlot === slot
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                        }`}
                      >
                        {formatTime(slot.start)}
                      </button>
                    ))
                  )}
                  {daySlots.length > 4 && (
                    <p className="text-xs text-slate-400 text-center">
                      +{daySlots.length - 4}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking form */}
      {selectedSlot && (
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Réserver le créneau du {formatSessionDate(selectedSlot.start)}
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Avec {selectedSlot.tutorName} - {selectedSlot.duration} minutes
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sur quoi souhaitez-vous travailler ?
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Réviser la méthodologie de la dissertation"
                className="w-full p-3 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type d'exercice
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'dissertation', label: 'Dissertation', icon: BookOpen },
                  { value: 'commentaire', label: 'Commentaire', icon: MessageSquare },
                  { value: 'oral', label: 'Oral', icon: Mic },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setFocusArea(value as typeof focusArea)}
                    className={`flex-1 p-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                      focusArea === value
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Œuvre à travailler (optionnel)
              </label>
              <input
                type="text"
                value={workTitle}
                onChange={(e) => setWorkTitle(e.target.value)}
                placeholder="Ex: Les Fleurs du Mal"
                className="w-full p-3 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleBook}
                disabled={booking}
                className="flex-1 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {booking ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Confirmer la réservation
                  </>
                )}
              </button>
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-6 py-3 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutoringCalendar;
