"use node";

interface RetryOptions {
  baseMs?: number;
  maxAttempts?: number;
}

const CAP_MS = 10_000;

function parseRetryAfterMs(header: string | null): number | null {
  if (!header) {
    return null;
  }
  const seconds = Number(header);
  if (!Number.isNaN(seconds)) {
    return seconds * 1000;
  }
  // HTTP-date format
  const date = new Date(header);
  if (!Number.isNaN(date.getTime())) {
    const ms = date.getTime() - Date.now();
    return ms > 0 ? ms : null;
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wraps fetch with exponential backoff retries on 429 and 5xx responses.
 * Does NOT retry on other 4xx (caller gets the response as-is).
 * After maxAttempts, throws an Error with status info.
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options: RetryOptions = {}
): Promise<Response> {
  const maxAttempts = options.maxAttempts ?? 5;
  const baseMs = options.baseMs ?? 500;

  let lastRes: Response | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(url, init);

    if (
      res.ok ||
      (res.status >= 400 && res.status < 500 && res.status !== 429)
    ) {
      // Success or non-retriable 4xx — return immediately
      return res;
    }

    lastRes = res;
    const isLastAttempt = attempt === maxAttempts - 1;

    if (isLastAttempt) {
      break;
    }

    // Determine wait duration
    let waitMs: number;
    if (res.status === 429) {
      const retryAfter = parseRetryAfterMs(res.headers.get("Retry-After"));
      waitMs = retryAfter ?? Math.min(baseMs * 2 ** attempt, CAP_MS);
    } else {
      // 5xx
      waitMs = Math.min(baseMs * 2 ** attempt, CAP_MS);
    }

    // Add jitter: ±10%
    waitMs *= 0.9 + Math.random() * 0.2;

    console.warn(
      `[fetchWithRetry] HTTP ${res.status} on attempt ${attempt + 1}/${maxAttempts}. Retrying in ${Math.round(waitMs)}ms — ${url}`
    );

    await sleep(waitMs);
  }

  throw new Error(
    `[fetchWithRetry] Failed after ${maxAttempts} attempts: HTTP ${lastRes?.status} — ${url}`
  );
}
