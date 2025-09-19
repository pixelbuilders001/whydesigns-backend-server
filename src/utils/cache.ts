import crypto from "crypto";

interface CacheKeyOptions {
  version: string; // API version like 'v1', 'v10'
  module: string; // Resource or module like 'users'
  action: string; // Action name like 'getPlayersList'
  query?: Record<string, any>; // Optional query parameters
  body?: Record<string, any>; // Optional request body
}

/**
 * Generates a consistent, version-aware cache key suitable for Redis.
 */
export function generateCacheKey({
  version,
  module,
  action,
  query = {},
  body = {},
}: CacheKeyOptions): string {
  const baseKey = `api:${version}:${module}:${action}`;

  const dataToHash = {
    query: sortObject(query),
    body: sortObject(body),
  };

  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(dataToHash))
    .digest("hex")
    .slice(0, 16); // Keep key short for Redis friendliness

  return `${baseKey}:hash:${hash}`;
}

/**
 * Recursively sorts object keys to ensure deterministic hash generation.
 */
function sortObject<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sortObject) as T;
  }

  const sorted: Record<string, any> = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortObject((obj as Record<string, any>)[key]);
  }

  return sorted as T;
}
