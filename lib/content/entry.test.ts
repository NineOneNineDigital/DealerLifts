import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { selectEntry } from "@/lib/content/entry";

interface Page {
  seoTitle: string;
}

beforeEach(() => {
  vi.stubEnv("HYGRAPH_STRICT", "");
  vi.spyOn(console, "warn").mockImplementation(() => {
    // silence expected fallback warnings
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("selectEntry", () => {
  it("returns null without warning or throwing when data is null", () => {
    const warn = vi.spyOn(console, "warn");

    expect(selectEntry<Page>(null, "homePages")).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });

  it("returns null without warning or throwing when data is null even under strict", () => {
    vi.stubEnv("HYGRAPH_STRICT", "1");
    const warn = vi.spyOn(console, "warn");

    expect(selectEntry<Page>(null, "homePages")).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });

  it("returns null and warns once, naming the plural, when the array is empty", () => {
    const warn = vi.spyOn(console, "warn");

    const result = selectEntry<Page>({ homePages: [] }, "homePages");

    expect(result).toBeNull();
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toBe(
      "[hygraph] homePages returned no entry — rendering defaults"
    );
  });

  it("throws under HYGRAPH_STRICT when the array is empty", () => {
    vi.stubEnv("HYGRAPH_STRICT", "1");

    expect(() => selectEntry<Page>({ homePages: [] }, "homePages")).toThrow(
      "[hygraph] homePages returned no entry — rendering defaults"
    );
  });

  it("returns the entry without warning when the array has one item", () => {
    const warn = vi.spyOn(console, "warn");
    const page: Page = { seoTitle: "Hi" };

    const result = selectEntry<Page>({ homePages: [page] }, "homePages");

    expect(result).toBe(page);
    expect(warn).not.toHaveBeenCalled();
  });
});
