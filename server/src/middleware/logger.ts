/**
 * Structured Request Logger Middleware
 * Provides JSON logging with request IDs for production debugging
 */

import { Context, Next } from 'hono';
import { v4 as uuidv4 } from 'uuid';

// Request context store
const requestContext = new Map<string, { requestId: string; startTime: number }>();

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return uuidv4().slice(0, 8);
}

/**
 * Format duration in human-readable form
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Structured logger middleware
 * Adds request ID, timing, and structured JSON output
 */
export async function structuredLogger(c: Context, next: Next) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  // Store context for this request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (c as any).set('requestId', requestId);

  // Get request info
  const method = c.req.method;
  const path = c.req.path;
  const userAgent = c.req.header('user-agent') || 'unknown';
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';

  // Log request start
  const requestLog = {
    type: 'request',
    requestId,
    timestamp: new Date().toISOString(),
    method,
    path,
    ip: ip.split(',')[0].trim(), // Handle X-Forwarded-For with multiple IPs
    userAgent: userAgent.slice(0, 100), // Truncate long user agents
  };
  console.log(JSON.stringify(requestLog));

  try {
    await next();

    // Log response
    const duration = Date.now() - startTime;
    const responseLog = {
      type: 'response',
      requestId,
      timestamp: new Date().toISOString(),
      method,
      path,
      status: c.res.status,
      duration: formatDuration(duration),
      durationMs: duration,
    };
    console.log(JSON.stringify(responseLog));
  } catch (error) {
    // Log error
    const duration = Date.now() - startTime;
    const errorLog = {
      type: 'error',
      requestId,
      timestamp: new Date().toISOString(),
      method,
      path,
      duration: formatDuration(duration),
      durationMs: duration,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined,
    };
    console.error(JSON.stringify(errorLog));
    throw error;
  }
}

/**
 * Create a logger function for a specific context
 */
export function createLogger(c: Context) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestId = (c as any).get('requestId') || 'no-request-id';

  return {
    info: (message: string, data?: Record<string, any>) => {
      console.log(JSON.stringify({
        type: 'info',
        requestId,
        timestamp: new Date().toISOString(),
        message,
        ...data,
      }));
    },
    warn: (message: string, data?: Record<string, any>) => {
      console.warn(JSON.stringify({
        type: 'warn',
        requestId,
        timestamp: new Date().toISOString(),
        message,
        ...data,
      }));
    },
    error: (message: string, error?: Error, data?: Record<string, any>) => {
      console.error(JSON.stringify({
        type: 'error',
        requestId,
        timestamp: new Date().toISOString(),
        message,
        error: error?.message,
        stack: error?.stack?.split('\n').slice(0, 5),
        ...data,
      }));
    },
  };
}
