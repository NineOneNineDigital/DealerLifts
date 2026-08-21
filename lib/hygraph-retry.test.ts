import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hygraphFetch, hygraphFetchSafe, RETRY_DELAYS_MS } from "@/lib/hygraph";

const QUERY = /* GraphQL */ `
  query Ping {
    __typename
  }
`;

/** A minimal Response stand-in — only the fields hygraphFetch reads. */
function response(status: number, body: unknown, retryAfter?: string) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: `status ${status}`,
    headers: { get: (k: string) => (k === "retry-after" ? retryAfter : null) },
    json: () => Promise.resolve(body),
  };
}

const OK = () => response(200, { data: { __typename: "Query" } });

beforeEach(() => {
  vi.stubEnv("HYGRAPH_CONTENT_API_URL", "https://example.test/graphql");
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Run a fetch to completion while auto-advancing the backoff timers. */
async function runWithTimers<T>(promise: Promise<T>): Promise<T> {
  const settled = promise.then(
    (v) => ({ ok: true as const, v }),
    (e) => ({ ok: false as const, e })
  );
  await vi.runAllTimersAsync();
  const result = await settled;
  if (result.ok) {
    return result.v;
  }
  throw result.e;
}

describe("hygraphFetch retry", () => {
  it("retries a 429 and succeeds when the next attempt works", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(429, {}))
      .mockResolvedValueOnce(OK());
    vi.stubGlobal("fetch", fetchMock);

    await expect(runWithTimers(hygraphFetch(QUERY))).resolves.toEqual({
      __typename: "Query",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries transient gateway errors too", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(503, {}))
      .mockResolvedValueOnce(OK());
    vi.stubGlobal("fetch", fetchMock);

    await expect(runWithTimers(hygraphFetch(QUERY))).resolves.toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("gives up after the configured number of retries and throws the last status", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(429, {}));
    vi.stubGlobal("fetch", fetchMock);

    await expect(runWithTimers(hygraphFetch(QUERY))).rejects.toThrow(
      "Hygraph request failed: 429"
    );
    expect(fetchMock).toHaveBeenCalledTimes(RETRY_DELAYS_MS.length + 1);
  });

  it("does NOT retry a non-transient error — retrying a 401 only delays a certain failure", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(401, {}));
    vi.stubGlobal("fetch", fetchMock);

    await expect(runWithTimers(hygraphFetch(QUERY))).rejects.toThrow(
      "Hygraph request failed: 401"
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not retry a successful response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(OK());
    vi.stubGlobal("fetch", fetchMock);

    await runWithTimers(hygraphFetch(QUERY));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("degrades to null through hygraphFetchSafe once retries are exhausted", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(429, {}));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {
      // silence the expected fallback warning
    });

    await expect(runWithTimers(hygraphFetchSafe(QUERY))).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(RETRY_DELAYS_MS.length + 1);
  });

  it("honours a Retry-After header over the default backoff", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(429, {}, "2"))
      .mockResolvedValueOnce(OK());
    vi.stubGlobal("fetch", fetchMock);

    const promise = hygraphFetch(QUERY).catch(() => null);

    // The default first backoff is 300ms; Retry-After said 2s, so nothing
    // should have been retried yet at 1s.
    await vi.advanceTimersByTimeAsync(1000);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1500);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await promise;
  });
});
