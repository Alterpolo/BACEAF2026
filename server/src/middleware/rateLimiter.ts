import { Context, Next } from 'hono';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Simple in-memory rate limiter
// Pour production, utiliser Redis
const requests = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20; // 20 requêtes par minute

export const rateLimiter = async (c: Context, next: Next) => {
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  const now = Date.now();

  const entry = requests.get(ip);

  if (!entry || now > entry.resetTime) {
    // Nouvelle fenêtre
    requests.set(ip, { count: 1, resetTime: now + WINDOW_MS });
  } else if (entry.count >= MAX_REQUESTS) {
    // Limite atteinte
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    c.header('Retry-After', retryAfter.toString());
    return c.json(
      { error: 'Trop de requêtes. Réessayez dans quelques instants.' },
      429
    );
  } else {
    // Incrémenter le compteur
    entry.count++;
  }

  // Nettoyer les vieilles entrées périodiquement
  if (Math.random() < 0.01) {
    for (const [key, value] of requests.entries()) {
      if (now > value.resetTime) {
        requests.delete(key);
      }
    }
  }

  await next();
};
