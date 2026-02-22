export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getOptionalEnv(name: string): string | undefined {
  return process.env[name];
}

export function isCronRequest(req: { headers?: Record<string, string | string[] | undefined> }): boolean {
  const header = req.headers?.["x-vercel-cron"];
  if (Array.isArray(header)) {
    return header.length > 0;
  }
  return Boolean(header);
}

export function isAuthorized(req: { headers?: Record<string, string | string[] | undefined> }): boolean {
  const secret = getOptionalEnv("PUSH_DISPATCH_SECRET");
  if (!secret) {
    return true;
  }

  const authHeader = req.headers?.authorization;
  if (!authHeader || Array.isArray(authHeader)) {
    return false;
  }

  return authHeader === `Bearer ${secret}`;
}
