export const ADMIN_PASSWORD = "admin123";
export const ADMIN_TOKEN = "shapino-admin-token-2024";

/**
 * Check an incoming admin request. The token must be provided via the
 * `x-admin-token` header (used by all admin API calls from the panel).
 */
export function requireAdmin(req: Request): boolean {
  const token = req.headers.get("x-admin-token");
  return token === ADMIN_TOKEN;
}
