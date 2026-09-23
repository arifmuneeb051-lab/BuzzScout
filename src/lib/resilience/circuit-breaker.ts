/**
 * BuzzScout Production Resilience Suite
 * Implements:
 * 1. Three-State Circuit Breaker (CLOSED, OPEN, HALF_OPEN)
 * 2. Exponential Backoff with Jitter for Rate Limits (429) & Server Outages (500/503)
 */

export enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export interface CircuitBreakerOptions {
  name?: string;
  failureThreshold?: number; // e.g. 3 consecutive failures to open
  recoveryTimeMs?: number; // Cool-off period before HALF_OPEN probe (default 5000ms)
  halfOpenMaxSuccesses?: number; // Consecutive successes needed in HALF_OPEN to close
}

export interface CircuitMetrics {
  state: CircuitState;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  totalCalls: number;
  totalFailures: number;
  lastStateChange: Date;
  nextAttemptAllowedAt: Date | null;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private consecutiveFailures = 0;
  private consecutiveSuccesses = 0;
  private totalCalls = 0;
  private totalFailures = 0;
  private lastStateChange: Date = new Date();
  private nextAttemptAllowedAt: Date | null = null;

  public readonly name: string;
  public readonly failureThreshold: number;
  public readonly recoveryTimeMs: number;
  public readonly halfOpenMaxSuccesses: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.name = options.name || "DefaultService";
    this.failureThreshold = options.failureThreshold || 3;
    this.recoveryTimeMs = options.recoveryTimeMs || 5000;
    this.halfOpenMaxSuccesses = options.halfOpenMaxSuccesses || 2;
  }

  public getState(): CircuitState {
    if (this.state === CircuitState.OPEN && this.nextAttemptAllowedAt && Date.now() >= this.nextAttemptAllowedAt.getTime()) {
      this.state = CircuitState.HALF_OPEN;
      this.consecutiveSuccesses = 0;
      this.lastStateChange = new Date();
    }
    return this.state;
  }

  public async execute<T>(action: () => Promise<T>): Promise<T> {
    const currentState = this.getState();
    this.totalCalls++;

    if (currentState === CircuitState.OPEN) {
      const waitRemaining = Math.max(0, (this.nextAttemptAllowedAt?.getTime() || 0) - Date.now());
      throw new CircuitBreakerError(
        `[CircuitBreaker:${this.name}] Circuit is OPEN. Fast-failing to prevent thread starvation. Try again in ${waitRemaining}ms.`,
        this.name,
        currentState
      );
    }

    try {
      const result = await action();
      this.recordSuccess();
      return result;
    } catch (error: any) {
      this.recordFailure(error);
      throw error;
    }
  }

  private recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.consecutiveSuccesses++;
      if (this.consecutiveSuccesses >= this.halfOpenMaxSuccesses) {
        this.state = CircuitState.CLOSED;
        this.consecutiveFailures = 0;
        this.consecutiveSuccesses = 0;
        this.nextAttemptAllowedAt = null;
        this.lastStateChange = new Date();
      }
    } else if (this.state === CircuitState.CLOSED) {
      this.consecutiveFailures = 0;
    }
  }

  private recordFailure(error: any): void {
    this.totalFailures++;
    this.consecutiveFailures++;

    if (this.state === CircuitState.HALF_OPEN) {
      this.tripCircuit();
    } else if (this.state === CircuitState.CLOSED && this.consecutiveFailures >= this.failureThreshold) {
      this.tripCircuit();
    }
  }

  private tripCircuit(): void {
    this.state = CircuitState.OPEN;
    this.consecutiveSuccesses = 0;
    this.nextAttemptAllowedAt = new Date(Date.now() + this.recoveryTimeMs);
    this.lastStateChange = new Date();
  }

  public reset(): void {
    this.state = CircuitState.CLOSED;
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.nextAttemptAllowedAt = null;
    this.lastStateChange = new Date();
  }

  public getMetrics(): CircuitMetrics {
    return {
      state: this.getState(),
      consecutiveFailures: this.consecutiveFailures,
      consecutiveSuccesses: this.consecutiveSuccesses,
      totalCalls: this.totalCalls,
      totalFailures: this.totalFailures,
      lastStateChange: this.lastStateChange,
      nextAttemptAllowedAt: this.nextAttemptAllowedAt,
    };
  }
}

export class CircuitBreakerError extends Error {
  constructor(message: string, public serviceName: string, public circuitState: CircuitState) {
    super(message);
    this.name = "CircuitBreakerError";
  }
}

export const redditBreaker = new CircuitBreaker({ name: "RedditAPI", failureThreshold: 3, recoveryTimeMs: 4000 });
export const twitterBreaker = new CircuitBreaker({ name: "TwitterAPI", failureThreshold: 3, recoveryTimeMs: 4000 });
export const discordBreaker = new CircuitBreaker({ name: "DiscordWebhook", failureThreshold: 3, recoveryTimeMs: 3000 });
export const telegramBreaker = new CircuitBreaker({ name: "TelegramAPI", failureThreshold: 3, recoveryTimeMs: 3000 });

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  retryOnStatus?: number[];
  onRetry?: (error: any, attempt: number, delayMs: number) => void;
}

export async function withExponentialBackoff<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 300;
  const maxDelayMs = options.maxDelayMs ?? 4000;
  const backoffFactor = options.backoffFactor ?? 2;
  const retryOnStatus = options.retryOnStatus ?? [429, 500, 502, 503, 504];

  let attempt = 0;

  while (true) {
    try {
      return await fn(attempt);
    } catch (err: any) {
      attempt++;

      const status = err?.status || err?.statusCode || (err?.response && err.response.status);
      const isRetryable =
        retryOnStatus.includes(status) ||
        err?.code === "ECONNRESET" ||
        err?.code === "ETIMEDOUT" ||
        err?.name === "FetchError" ||
        err?.message?.includes("fetch failed");

      if (attempt > maxRetries || !isRetryable) {
        throw err;
      }

      let delayMs = 0;
      const retryAfterSec = err?.headers?.get?.("retry-after") || err?.retryAfter;
      if (retryAfterSec) {
        delayMs = parseInt(retryAfterSec, 10) * 1000;
      }

      if (!delayMs) {
        const calculatedDelay = Math.min(maxDelayMs, initialDelayMs * Math.pow(backoffFactor, attempt - 1));
        delayMs = Math.floor(Math.random() * calculatedDelay) + 50;
      }

      if (options.onRetry) {
        options.onRetry(err, attempt, delayMs);
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}