import { Context, Next } from "hono";
import { logger } from "../utils/logger.ts";

/**
 * Simple API key authentication middleware.
 * Reads CCOS_API_KEY from environment or falls back to a default.
 * In production, users should set their own key via the web UI or env.
 */
const DEFAULT_API_KEY = "ccos-changeme";

export function getApiKey(): string {
  return process.env.CCOS_API_KEY || DEFAULT_API_KEY;
}

export async function authMiddleware(c: Context, next: Next) {
  // Skip auth for web UI and health checks
  const path = c.req.path;
  if (path === "/" || path.startsWith("/assets/") || path === "/api/health") {
    return next();
  }

  const authHeader = c.req.header("x-api-key");
  const expectedKey = getApiKey();

  if (expectedKey !== DEFAULT_API_KEY && authHeader !== expectedKey) {
    logger.app.warn("Unauthorized API request from {ip}", {
      ip: c.req.header("x-forwarded-for") || "unknown",
    });
    return c.json({ error: "Unauthorized. Set x-api-key header." }, 401);
  }

  return next();
}
