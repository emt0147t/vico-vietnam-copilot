/**
 * External API Utility - Robust error handling & retry logic
 * 
 * Provides:
 * - Exponential backoff with jitter
 * - Rate limiting per provider
 * - Timeout handling
 * - Structured error logging
 */

// ============================================================================
// TYPES
// ============================================================================

export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  timeoutMs?: number;
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

export interface RateLimitConfig {
  requestsPerSecond: number;
  burstLimit?: number;
}

export class ExternalApiError extends Error {
  public readonly statusCode?: number;
  public readonly provider: string;
  public readonly isRetryable: boolean;
  public readonly originalError?: Error;

  constructor(
    message: string,
    provider: string,
    options?: {
      statusCode?: number;
      isRetryable?: boolean;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'ExternalApiError';
    this.provider = provider;
    this.statusCode = options?.statusCode;
    this.isRetryable = options?.isRetryable ?? true;
    this.originalError = options?.originalError;
  }
}

// ============================================================================
// RETRY WRAPPER
// ============================================================================

/**
 * Wraps an async function with retry logic using exponential backoff + jitter
 * 
 * @example
 * const data = await withRetries(
 *   () => fetchGoogleNews(query),
 *   { retries: 3, baseDelayMs: 500 }
 * );
 */
export async function withRetries<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    baseDelayMs = 400,
    maxDelayMs = 8000,
    timeoutMs = 30000,
    onRetry,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      // Wrap with timeout
      const result = await withTimeout(fn(), timeoutMs);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      if (error instanceof ExternalApiError && !error.isRetryable) {
        throw error;
      }

      // If this was the last attempt, throw
      if (attempt > retries) {
        throw lastError;
      }

      // Calculate delay with exponential backoff + jitter
      const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 0.3 + 0.85; // 0.85 - 1.15
      const delay = Math.min(maxDelayMs, exponentialDelay * jitter);

      // Notify about retry
      if (onRetry) {
        onRetry(attempt, lastError, delay);
      } else {
        console.warn(
          `[Retry ${attempt}/${retries}] ${lastError.message} - waiting ${Math.round(delay)}ms`
        );
      }

      await sleep(delay);
    }
  }

  throw lastError ?? new Error('Unknown error in withRetries');
}

// ============================================================================
// TIMEOUT WRAPPER
// ============================================================================

/**
 * Wraps a promise with a timeout
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new ExternalApiError(
        `Request timed out after ${timeoutMs}ms`,
        'timeout',
        { isRetryable: true }
      ));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

// ============================================================================
// RATE LIMITER (Token Bucket)
// ============================================================================

class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per ms

  constructor(config: RateLimitConfig) {
    this.maxTokens = config.burstLimit ?? config.requestsPerSecond * 2;
    this.tokens = this.maxTokens;
    this.refillRate = config.requestsPerSecond / 1000;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Calculate wait time for next token
    const waitMs = (1 - this.tokens) / this.refillRate;
    await sleep(waitMs);
    this.refill();
    this.tokens -= 1;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}

// Provider-specific rate limiters
const rateLimiters = new Map<string, TokenBucket>();

/**
 * Get or create a rate limiter for a specific provider
 */
export function getRateLimiter(provider: string, config?: RateLimitConfig): TokenBucket {
  if (!rateLimiters.has(provider)) {
    const defaultConfig: RateLimitConfig = config ?? getDefaultRateLimit(provider);
    rateLimiters.set(provider, new TokenBucket(defaultConfig));
  }
  return rateLimiters.get(provider)!;
}

function getDefaultRateLimit(provider: string): RateLimitConfig {
  const limits: Record<string, RateLimitConfig> = {
    google_news: { requestsPerSecond: 5, burstLimit: 10 },
    crunchbase: { requestsPerSecond: 2, burstLimit: 5 },
    vnexpress: { requestsPerSecond: 10, burstLimit: 20 },
    default: { requestsPerSecond: 5, burstLimit: 10 },
  };
  return limits[provider] ?? limits.default;
}

/**
 * Wraps an async function with rate limiting
 * 
 * @example
 * const data = await withRateLimit('google_news', () => fetchNews(query));
 */
export async function withRateLimit<T>(
  provider: string,
  fn: () => Promise<T>,
  config?: RateLimitConfig
): Promise<T> {
  const limiter = getRateLimiter(provider, config);
  await limiter.acquire();
  return fn();
}

// ============================================================================
// COMBINED WRAPPER (Rate Limit + Retry)
// ============================================================================

/**
 * Wraps an async function with both rate limiting and retry logic
 * This is the recommended wrapper for all external API calls
 * 
 * @example
 * const news = await safeExternalCall(
 *   'google_news',
 *   () => fetchGoogleNews(query),
 *   { retries: 3 }
 * );
 */
export async function safeExternalCall<T>(
  provider: string,
  fn: () => Promise<T>,
  options?: RetryOptions & { rateLimit?: RateLimitConfig }
): Promise<T> {
  return withRateLimit(
    provider,
    () => withRetries(fn, options),
    options?.rateLimit
  );
}

// ============================================================================
// FETCH WRAPPER
// ============================================================================

export interface SafeFetchOptions extends RetryOptions {
  provider: string;
  headers?: Record<string, string>;
  body?: unknown;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

/**
 * Safe fetch wrapper with retry, rate limiting, and error handling
 */
export async function safeFetch<T>(
  url: string,
  options: SafeFetchOptions
): Promise<T> {
  const { provider, headers, body, method = 'GET', ...retryOpts } = options;

  return safeExternalCall(provider, async () => {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const isRetryable = response.status >= 500 || response.status === 429;
      throw new ExternalApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        provider,
        { statusCode: response.status, isRetryable }
      );
    }

    return response.json() as Promise<T>;
  }, retryOpts);
}

// ============================================================================
// HELPERS
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Batch processor with concurrency control
 * 
 * @example
 * const results = await batchProcess(
 *   companies,
 *   (company) => fetchCompanyNews(company.name),
 *   { concurrency: 4 }
 * );
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: { concurrency?: number; onProgress?: (completed: number, total: number) => void } = {}
): Promise<R[]> {
  const { concurrency = 4, onProgress } = options;
  const results: R[] = [];
  let completed = 0;

  // Process in batches
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((item, batchIndex) => processor(item, i + batchIndex))
    );
    results.push(...batchResults);
    completed += batch.length;

    if (onProgress) {
      onProgress(completed, items.length);
    }
  }

  return results;
}
