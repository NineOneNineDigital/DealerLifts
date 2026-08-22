import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hygraphFetchSafe } from "@/lib/hygraph";

const QUERY = /* GraphQL */ `
  query Ping {
    __typename
  }
`;

beforeEach(() => {
  vi.stubEnv("HYGRAPH_CONTENT_API_URL", "https://example.test/graphql");
  vi.stubEnv("HYGRAPH_STRICT", "");
  vi.spyOn(console, "warn").mockImplementation(() => {
    // silence expected fallback warnings
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function stubFetch(impl: () => Promise<unknown>) {
  vi.stubGlobal("fetch", vi.fn(impl));
}

describe("hygraphFetchSafe", () => {
  it("returns data on success", async () => {
    stubFetch(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { __typename: "Query" } }),
      })
    );

    await expect(hygraphFetchSafe(QUERY)).resolves.toEqual({
      __typename: "Query",
    });
  });

  it("returns null when the network request rejects", async () => {
    stubFetch(() => Promise.reject(new Error("ECONNREFUSED")));

    await expect(hygraphFetchSafe(QUERY)).resolves.toBeNull();
  });

  it("returns null on a non-2xx response", async () => {
    // 500 rather than 503: 503 is retryable, so it would sleep through the
    // full backoff chain here. Retry behaviour has its own suite with fake
    // timers in lib/hygraph-retry.test.ts, including a retryable status that
    // exhausts its attempts.
    stubFetch(() =>
      Promise.resolve({ ok: false, status: 500, statusText: "Server Error" })
    );

    await expect(hygraphFetchSafe(QUERY)).resolves.toBeNull();
  });

  it("returns null when Hygraph reports GraphQL errors", async () => {
    stubFetch(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ errors: [{ message: "Unknown field" }] }),
      })
    );

    await expect(hygraphFetchSafe(QUERY)).resolves.toBeNull();
  });

  it("warns when falling back so the failure is visible in logs", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {
      // captured below
    });
    stubFetch(() => Promise.reject(new Error("ECONNREFUSED")));

    await hygraphFetchSafe(QUERY);

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain("ECONNREFUSED");
  });

  it("throws instead of falling back when HYGRAPH_STRICT is set", async () => {
    vi.stubEnv("HYGRAPH_STRICT", "1");
    stubFetch(() => Promise.reject(new Error("ECONNREFUSED")));

    await expect(hygraphFetchSafe(QUERY)).rejects.toThrow("ECONNREFUSED");
  });

  it("throws in strict mode when the endpoint is not configured", async () => {
    vi.stubEnv("HYGRAPH_CONTENT_API_URL", "");
    vi.stubEnv("HYGRAPH_STRICT", "1");

    await expect(hygraphFetchSafe(QUERY)).rejects.toThrow(
      "HYGRAPH_CONTENT_API_URL"
    );
  });
});
