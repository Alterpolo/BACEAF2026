/**
 * Service Tutoring Frontend
 * Appels API pour les cours particuliers
 *
 * Security:
 * - Public routes (tutors, slots): No auth required
 * - Session routes: Require auth, server validates userId
 */

import { get, post, patch, del } from './apiClient';

// ============================================
// TYPES
// ============================================

export interface Tutor {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  specialties: string[];
  totalSessions: number;
  rating: number | null;
}

export interface TimeSlot {
  tutorId: string;
  tutorName: string;
  start: string;
  end: string;
  duration: number;
}

export interface TutoringSession {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar: string | null;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'canceled' | 'no_show';
  topic: string | null;
  focusArea: string | null;
  workTitle: string | null;
  meetingUrl: string | null;
  meetingNotes: string | null;
  rating: number | null;
  feedback: string | null;
}

export interface BookingParams {
  studentId: string;
  tutorId: string;
  scheduledAt: string;
  durationMinutes?: number;
  topic?: string;
  focusArea?: 'dissertation' | 'commentaire' | 'oral';
  workTitle?: string;
}

// ============================================
// API CALLS
// ============================================

/**
 * Get available tutors (public, no auth required)
 */
export async function getTutors(): Promise<Tutor[]> {
  const data = await get<{ tutors: Tutor[] }>('/api/tutoring/tutors', false);
  return data.tutors;
}

/**
 * Get available time slots (public, no auth required)
 */
export async function getAvailableSlots(params: {
  startDate: string;
  endDate: string;
  tutorId?: string;
}): Promise<TimeSlot[]> {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  });
  if (params.tutorId) {
    queryParams.set('tutorId', params.tutorId);
  }

  const data = await get<{ slots: TimeSlot[] }>(`/api/tutoring/slots?${queryParams}`, false);
  return data.slots;
}

/**
 * Book a tutoring session (requires auth)
 * Note: Server validates studentId matches authenticated user
 */
export async function bookSession(params: BookingParams): Promise<{ sessionId: string }> {
  return post<{ sessionId: string }>('/api/tutoring/sessions', params);
}

/**
 * Get user's tutoring sessions (requires auth)
 * Note: Server validates userId matches authenticated user
 */
export async function getUserSessions(userId: string, options?: {
  status?: string;
  upcoming?: boolean;
}): Promise<TutoringSession[]> {
  const queryParams = new URLSearchParams();
  if (options?.status) queryParams.set('status', options.status);
  if (options?.upcoming) queryParams.set('upcoming', 'true');

  const data = await get<{ sessions: TutoringSession[] }>(
    `/api/tutoring/sessions/${userId}?${queryParams}`
  );
  return data.sessions;
}

/**
 * Update a session (requires auth)
 * Note: Server validates user owns the session
 */
export async function updateSession(sessionId: string, params: {
  status?: 'scheduled' | 'completed' | 'canceled' | 'no_show';
  meetingUrl?: string;
  meetingNotes?: string;
  studentRating?: number;
  studentFeedback?: string;
}): Promise<void> {
  await patch<{ session: unknown }>(`/api/tutoring/sessions/${sessionId}`, params);
}

/**
 * Cancel a session (requires auth)
 * Note: Server validates user is the student who booked
 */
export async function cancelSession(sessionId: string): Promise<void> {
  await del<{ message: string }>(`/api/tutoring/sessions/${sessionId}`);
}

// ============================================
// HELPERS
// ============================================

/**
 * Format date for display
 */
export function formatSessionDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format short date
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Format time
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Group slots by date
 */
export function groupSlotsByDate(slots: TimeSlot[]): Map<string, TimeSlot[]> {
  const grouped = new Map<string, TimeSlot[]>();

  slots.forEach(slot => {
    const date = new Date(slot.start).toISOString().split('T')[0];
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(slot);
  });

  return grouped;
}

/**
 * Get next 7 days as date strings
 */
export function getNext7Days(): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

/**
 * Check if session is upcoming
 */
export function isUpcoming(session: TutoringSession): boolean {
  return session.status === 'scheduled' && new Date(session.scheduledAt) > new Date();
}

/**
 * Get status label
 */
export function getStatusLabel(status: TutoringSession['status']): string {
  const labels: Record<TutoringSession['status'], string> = {
    scheduled: 'Programmé',
    completed: 'Terminé',
    canceled: 'Annulé',
    no_show: 'Absent',
  };
  return labels[status];
}
