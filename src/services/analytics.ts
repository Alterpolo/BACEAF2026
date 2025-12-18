/**
 * Analytics Service
 *
 * Simple event tracking for conversion funnel analysis.
 * Events are sent to Supabase asynchronously (fire-and-forget).
 * Respects RGPD cookie consent preferences.
 */

import { supabase } from '../lib/supabase';
import { hasConsentedToAnalytics } from '../components/ui/CookieConsent';

// Event names for type safety
export type AnalyticsEventName =
  | 'signup'
  | 'login'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  | 'first_exercise'
  | 'exercise_completed'
  | 'limit_reached'
  | 'upgrade_cta_clicked'
  | 'checkout_started'
  | 'subscription_created'
  | 'subscription_cancelled'
  | 'page_view';

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

// Session ID for grouping events (persisted for browser session)
let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
  }
  return sessionId;
}

/**
 * Track an analytics event
 *
 * @param eventName - The name of the event to track
 * @param properties - Optional additional properties
 *
 * @example
 * track('signup');
 * track('exercise_completed', { type: 'commentaire', work_id: 'moliere-dom-juan' });
 * track('limit_reached', { exercises_this_week: 3 });
 */
export async function track(
  eventName: AnalyticsEventName,
  properties: EventProperties = {}
): Promise<void> {
  // RGPD: Check if user has consented to analytics cookies
  // Essential events (signup, login) are always tracked for security/anti-fraud
  const isEssentialEvent = ['signup', 'login'].includes(eventName);
  if (!isEssentialEvent && !hasConsentedToAnalytics()) {
    if (import.meta.env.DEV) {
      console.log('[Analytics] Skipping event (no consent):', eventName);
    }
    return;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Fire and forget - don't block UI
    supabase
      .from('analytics_events')
      .insert({
        user_id: user?.id || null,
        event_name: eventName,
        event_properties: properties,
        session_id: getSessionId(),
        page_url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      })
      .then(({ error }) => {
        if (error && import.meta.env.DEV) {
          console.warn('[Analytics] Failed to track event:', eventName, error.message);
        }
      });
  } catch (error) {
    // Silently fail - analytics should never break the app
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Error tracking event:', eventName, error);
    }
  }
}

/**
 * Track a page view
 *
 * @param pageName - Human-readable page name
 */
export function trackPageView(pageName: string): void {
  track('page_view', { page: pageName });
}

/**
 * Identify user after login/signup
 * Updates any anonymous events with the user ID
 */
export async function identifyUser(userId: string): Promise<void> {
  const currentSessionId = getSessionId();

  // Update any anonymous events from this session with the user ID
  try {
    await supabase
      .from('analytics_events')
      .update({ user_id: userId })
      .eq('session_id', currentSessionId)
      .is('user_id', null);
  } catch (error) {
    // Silently fail
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Error identifying user:', error);
    }
  }
}
