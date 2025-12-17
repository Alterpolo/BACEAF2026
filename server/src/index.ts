import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { aiRoutes } from "./routes/ai";
import payments from "./routes/payments";
import tutoring from "./routes/tutoring";
import { rateLimiter } from "./middleware/rateLimiter";
import { structuredLogger } from "./middleware/logger";

const app = new Hono();

// Use structured logger in production, simpler format in development
const isDev = process.env.NODE_ENV !== 'production';

// Middleware
app.use("*", structuredLogger);
app.use(
  "*",
  cors({
    origin: isDev
      ? ["http://localhost:3000", "http://localhost:5173"]
      : [process.env.FRONTEND_URL || "https://app.neodromes.eu"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // Cache preflight for 24 hours
  }),
);

// Rate limiting sur les routes AI
app.use("/api/ai/*", rateLimiter);

// Routes
app.route("/api/ai", aiRoutes);
app.route("/api/payments", payments);
app.route("/api/tutoring", tutoring);

// Health check
app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() }),
);

// 404 handler
app.notFound((c) => c.json({ error: "Not found" }, 404));

// Error handler with request context
app.onError((err, c) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestId = (c as any).get('requestId') || 'unknown';
  console.error(JSON.stringify({
    type: 'unhandled_error',
    requestId,
    timestamp: new Date().toISOString(),
    path: c.req.path,
    method: c.req.method,
    error: err.message,
    stack: err.stack?.split('\n').slice(0, 10),
  }));
  return c.json({
    error: "Internal server error",
    requestId, // Include for debugging
  }, 500);
});

const port = parseInt(process.env.PORT || "3001");

console.log(`Server starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running at http://localhost:${port}`);
