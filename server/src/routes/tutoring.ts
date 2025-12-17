/**
 * Tutoring Routes
 * Endpoints pour la gestion des cours particuliers
 *
 * Security:
 * - Public routes: /tutors, /slots (read-only listings)
 * - Protected routes: /sessions/* (require auth + userId validation)
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/subscription';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Type for context with our custom variables
type Variables = {
  userId: string;
};

const tutoring = new Hono<{ Variables: Variables }>();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const GetSlotsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tutorId: z.string().uuid().optional(),
});

const BookSessionSchema = z.object({
  studentId: z.string().uuid(),
  tutorId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().min(30).max(120).default(60),
  topic: z.string().optional(),
  focusArea: z.enum(['dissertation', 'commentaire', 'oral']).optional(),
  workTitle: z.string().optional(),
});

const UpdateSessionSchema = z.object({
  status: z.enum(['scheduled', 'completed', 'canceled', 'no_show']).optional(),
  meetingUrl: z.string().url().optional(),
  meetingNotes: z.string().optional(),
  studentRating: z.number().min(1).max(5).optional(),
  studentFeedback: z.string().optional(),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function parseBody<T>(c: any, schema: z.ZodSchema<T>): Promise<T> {
  const body = await c.req.json();
  return schema.parse(body);
}

// ============================================
// TUTOR ROUTES
// ============================================

/**
 * GET /api/tutoring/tutors
 * Liste des tuteurs disponibles
 */
tutoring.get('/tutors', async (c) => {
  try {
    const { data: tutors, error } = await supabase
      .from('tutors')
      .select(`
        *,
        profile:profiles(name, avatar_url)
      `)
      .eq('is_active', true)
      .order('average_rating', { ascending: false });

    if (error) throw error;

    return c.json({
      tutors: tutors?.map(t => ({
        id: t.id,
        name: t.profile?.name,
        avatar: t.profile?.avatar_url,
        bio: t.bio,
        specialties: t.specialties,
        totalSessions: t.total_sessions,
        rating: t.average_rating,
      })) || [],
    });
  } catch (error) {
    console.error('Tutors fetch error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

/**
 * GET /api/tutoring/slots
 * Créneaux disponibles
 */
tutoring.get('/slots', async (c) => {
  try {
    const query = c.req.query();
    const params = GetSlotsSchema.parse({
      startDate: query.startDate,
      endDate: query.endDate,
      tutorId: query.tutorId,
    });

    const { data: slots, error } = await supabase.rpc('get_available_slots', {
      p_start_date: params.startDate,
      p_end_date: params.endDate,
      p_tutor_id: params.tutorId || null,
    });

    if (error) throw error;

    return c.json({
      slots: slots?.map((s: any) => ({
        tutorId: s.tutor_id,
        tutorName: s.tutor_name,
        start: s.slot_start,
        end: s.slot_end,
        duration: s.duration_minutes,
      })) || [],
    });
  } catch (error) {
    console.error('Slots fetch error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Paramètres invalides', details: error.errors }, 400);
    }
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// ============================================
// SESSION ROUTES
// ============================================

/**
 * POST /api/tutoring/sessions
 * Réserver un cours
 * SECURED: Requires authentication and validates studentId matches authenticated user
 */
tutoring.post('/sessions', requireAuth, async (c) => {
  try {
    const data = await parseBody(c, BookSessionSchema);
    const authenticatedUserId = c.get('userId');

    // Security: Verify studentId in body matches authenticated user
    if (data.studentId !== authenticatedUserId) {
      return c.json({ error: 'Accès non autorisé', code: 'FORBIDDEN' }, 403);
    }

    // Check if student has tutoring plan
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, tutoring_hours_remaining')
      .eq('user_id', authenticatedUserId)
      .single();

    if (!subscription || subscription.plan !== 'student_tutoring') {
      return c.json({
        error: 'Abonnement Premium + Cours requis',
        code: 'NO_TUTORING_PLAN',
      }, 403);
    }

    const hoursNeeded = (data.durationMinutes ?? 60) / 60;
    if ((subscription.tutoring_hours_remaining || 0) < hoursNeeded) {
      return c.json({
        error: 'Heures de cours insuffisantes',
        code: 'INSUFFICIENT_HOURS',
        remaining: subscription.tutoring_hours_remaining,
        needed: hoursNeeded,
      }, 403);
    }

    // Book session using stored function
    const { data: sessionId, error } = await supabase.rpc('book_tutoring_session', {
      p_student_id: data.studentId,
      p_tutor_id: data.tutorId,
      p_scheduled_at: data.scheduledAt,
      p_duration_minutes: data.durationMinutes,
      p_topic: data.topic || null,
      p_focus_area: data.focusArea || null,
      p_work_title: data.workTitle || null,
    });

    if (error) throw error;

    // Get tutor info for notification
    const { data: tutor } = await supabase
      .from('tutors')
      .select('user_id, profile:profiles(name)')
      .eq('id', data.tutorId)
      .single();

    // Extract tutor name from profile relation (array from join)
    const tutorName = (tutor?.profile as { name: string }[] | null)?.[0]?.name ?? 'votre tuteur';

    // Notify student
    await supabase.from('notifications').insert({
      user_id: data.studentId,
      type: 'tutoring',
      title: 'Cours réservé',
      message: `Cours avec ${tutorName} le ${new Date(data.scheduledAt).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      link: '/cours',
    });

    // Notify tutor
    if (tutor?.user_id) {
      await supabase.from('notifications').insert({
        user_id: tutor.user_id,
        type: 'tutoring',
        title: 'Nouveau cours',
        message: `Un élève a réservé un cours le ${new Date(data.scheduledAt).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        link: '/enseignant',
      });
    }

    return c.json({
      sessionId,
      message: 'Cours réservé avec succès',
    });
  } catch (error) {
    console.error('Session booking error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Données invalides', details: error.errors }, 400);
    }
    return c.json({ error: 'Erreur lors de la réservation' }, 500);
  }
});

/**
 * GET /api/tutoring/sessions/:userId
 * Sessions d'un utilisateur (élève ou tuteur)
 * SECURED: Requires authentication and user can only access their own sessions
 */
tutoring.get('/sessions/:userId', requireAuth, async (c) => {
  try {
    const requestedUserId = c.req.param('userId');
    const authenticatedUserId = c.get('userId');
    const status = c.req.query('status');
    const upcoming = c.req.query('upcoming') === 'true';

    // Security: Users can only access their own sessions
    if (requestedUserId !== authenticatedUserId) {
      return c.json({ error: 'Accès non autorisé', code: 'FORBIDDEN' }, 403);
    }

    // Get sessions as student
    let query = supabase
      .from('tutoring_sessions')
      .select(`
        *,
        tutor:tutors(
          id,
          profile:profiles(name, avatar_url)
        )
      `)
      .eq('student_id', requestedUserId);

    if (status) {
      query = query.eq('status', status);
    }

    if (upcoming) {
      query = query
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });
    } else {
      query = query.order('scheduled_at', { ascending: false });
    }

    const { data: sessions, error } = await query;

    if (error) throw error;

    return c.json({
      sessions: sessions?.map(s => ({
        id: s.id,
        tutorId: s.tutor?.id,
        tutorName: s.tutor?.profile?.name,
        tutorAvatar: s.tutor?.profile?.avatar_url,
        scheduledAt: s.scheduled_at,
        duration: s.duration_minutes,
        status: s.status,
        topic: s.topic,
        focusArea: s.focus_area,
        workTitle: s.work_title,
        meetingUrl: s.meeting_url,
        meetingNotes: s.meeting_notes,
        rating: s.student_rating,
        feedback: s.student_feedback,
      })) || [],
    });
  } catch (error) {
    console.error('Sessions fetch error:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

/**
 * PATCH /api/tutoring/sessions/:sessionId
 * Mettre à jour une session
 * SECURED: Requires authentication and user must be session owner (student or tutor)
 */
tutoring.patch('/sessions/:sessionId', requireAuth, async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const authenticatedUserId = c.get('userId');
    const data = await parseBody(c, UpdateSessionSchema);

    // First, verify the user owns this session (as student or tutor)
    const { data: existingSession } = await supabase
      .from('tutoring_sessions')
      .select('student_id, tutor_id')
      .eq('id', sessionId)
      .single();

    if (!existingSession) {
      return c.json({ error: 'Session non trouvée', code: 'NOT_FOUND' }, 404);
    }

    // Get tutor's user_id to check ownership
    const { data: tutor } = await supabase
      .from('tutors')
      .select('user_id')
      .eq('id', existingSession.tutor_id)
      .single();

    const isStudent = existingSession.student_id === authenticatedUserId;
    const isTutor = tutor?.user_id === authenticatedUserId;

    if (!isStudent && !isTutor) {
      return c.json({ error: 'Accès non autorisé', code: 'FORBIDDEN' }, 403);
    }

    const updateData: Record<string, any> = {};

    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (data.status === 'canceled') {
        updateData.canceled_at = new Date().toISOString();
      }
    }

    if (data.meetingUrl) updateData.meeting_url = data.meetingUrl;
    if (data.meetingNotes) updateData.meeting_notes = data.meetingNotes;
    if (data.studentRating) updateData.student_rating = data.studentRating;
    if (data.studentFeedback) updateData.student_feedback = data.studentFeedback;

    const { data: session, error } = await supabase
      .from('tutoring_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;

    // If completed with rating, update tutor's average
    if (data.status === 'completed' && data.studentRating) {
      // Get tutor's new average rating
      const { data: stats } = await supabase
        .from('tutoring_sessions')
        .select('student_rating')
        .eq('tutor_id', session.tutor_id)
        .not('student_rating', 'is', null);

      if (stats && stats.length > 0) {
        const avgRating = stats.reduce((sum, s) => sum + s.student_rating, 0) / stats.length;

        await supabase
          .from('tutors')
          .update({
            average_rating: Math.round(avgRating * 100) / 100,
            total_sessions: stats.length,
          })
          .eq('id', session.tutor_id);
      }
    }

    // If canceled, refund hours
    if (data.status === 'canceled') {
      const hoursToRefund = session.duration_minutes / 60;

      await supabase.rpc('increment_tutoring_hours', {
        p_user_id: session.student_id,
        p_hours: hoursToRefund,
      });
    }

    return c.json({
      session,
      message: 'Session mise à jour',
    });
  } catch (error) {
    console.error('Session update error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Données invalides', details: error.errors }, 400);
    }
    return c.json({ error: 'Erreur lors de la mise à jour' }, 500);
  }
});

/**
 * DELETE /api/tutoring/sessions/:sessionId
 * Annuler une session
 * SECURED: Requires authentication and user must be the student who booked the session
 */
tutoring.delete('/sessions/:sessionId', requireAuth, async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const authenticatedUserId = c.get('userId');

    // Get session details first
    const { data: session } = await supabase
      .from('tutoring_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) {
      return c.json({ error: 'Session non trouvée', code: 'NOT_FOUND' }, 404);
    }

    // Security: Only the student who booked can cancel
    if (session.student_id !== authenticatedUserId) {
      return c.json({ error: 'Accès non autorisé', code: 'FORBIDDEN' }, 403);
    }

    // Check if can be canceled (e.g., at least 24h before)
    const scheduledAt = new Date(session.scheduled_at);
    const now = new Date();
    const hoursUntil = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil < 24) {
      return c.json({
        error: 'Annulation impossible moins de 24h avant le cours',
        code: 'TOO_LATE_TO_CANCEL',
      }, 400);
    }

    // Update to canceled status
    await supabase
      .from('tutoring_sessions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    // Refund hours using atomic RPC (prevents race condition)
    const hoursToRefund = session.duration_minutes / 60;
    await supabase.rpc('increment_tutoring_hours', {
      p_user_id: session.student_id,
      p_hours: hoursToRefund,
    });

    return c.json({ message: 'Session annulée, heures remboursées' });
  } catch (error) {
    console.error('Session delete error:', error);
    return c.json({ error: 'Erreur lors de l\'annulation' }, 500);
  }
});

export default tutoring;
