/**
 * API Client - Centralized HTTP client with auth
 *
 * All API calls should go through this client to ensure:
 * - Consistent auth headers (Bearer token)
 * - Standardized error handling
 * - Request/response logging in dev
 */

import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
  requestId?: string;
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly requestId?: string;

  constructor(message: string, status: number, code?: string, requestId?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

/**
 * Get current auth token from Supabase session
 */
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    requireAuth?: boolean;
  } = {}
): Promise<T> {
  const { method = 'GET', body, requireAuth = true } = options;

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth header if required
  if (requireAuth) {
    const token = await getAuthToken();
    if (!token) {
      throw new ApiClientError('Non authentifié', 401, 'UNAUTHORIZED');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Parse response
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  // Handle errors
  if (!response.ok) {
    const error = isJson ? data as ApiError : { error: data || `HTTP ${response.status}` };

    if (import.meta.env.DEV) {
      console.error(`[API] ${method} ${endpoint} → ${response.status}`, error);
    }

    throw new ApiClientError(
      error.error || `Erreur HTTP ${response.status}`,
      response.status,
      error.code,
      error.requestId
    );
  }

  if (import.meta.env.DEV) {
    console.log(`[API] ${method} ${endpoint} → ${response.status}`);
  }

  return data as T;
}

/**
 * GET request with auth
 */
export function get<T>(endpoint: string, requireAuth = true): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET', requireAuth });
}

/**
 * POST request with auth
 */
export function post<T>(endpoint: string, body: unknown, requireAuth = true): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'POST', body, requireAuth });
}

/**
 * Helper: Check if error is auth-related
 */
export function isAuthError(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 401;
}

/**
 * Helper: Check if error is subscription-related
 */
export function isSubscriptionError(error: unknown): error is ApiClientError {
  if (!(error instanceof ApiClientError)) return false;
  return ['PREMIUM_REQUIRED', 'AI_NOT_AVAILABLE', 'EXERCISE_LIMIT_REACHED', 'NO_SUBSCRIPTION'].includes(error.code || '');
}
