import { describe, expect, it } from "vitest";
import { list, num, optStr, str } from "@/lib/content/merge";

describe("str", () => {
  it("returns the CMS value when present", () => {
    expect(str("From the CMS", "default")).toBe("From the CMS");
  });

  it("trims surrounding whitespace from the CMS value", () => {
    expect(str("  Padded  ", "default")).toBe("Padded");
  });

  it("falls back when the value is null", () => {
    expect(str(null, "default")).toBe("default");
  });

  it("falls back when the value is undefined", () => {
    expect(str(undefined, "default")).toBe("default");
  });

  it("falls back when an editor cleared the field to an empty string", () => {
    expect(str("", "default")).toBe("default");
  });

  it("falls back when the field contains only whitespace", () => {
    expect(str("   \n\t ", "default")).toBe("default");
  });

  it("preserves a value that is legitimately the string 0", () => {
    expect(str("0", "default")).toBe("0");
  });
});

describe("num", () => {
  it("returns the CMS value when present", () => {
    expect(num(42, 7)).toBe(42);
  });

  it("preserves a legitimate zero rather than falling back", () => {
    expect(num(0, 7)).toBe(0);
  });

  it("falls back when the value is null", () => {
    expect(num(null, 7)).toBe(7);
  });

  it("falls back when the value is undefined", () => {
    expect(num(undefined, 7)).toBe(7);
  });
});

describe("optStr", () => {
  it("falls back when the value is null", () => {
    expect(optStr(null, "default")).toBe("default");
  });

  it("falls back when the value is undefined", () => {
    expect(optStr(undefined, "default")).toBe("default");
  });

  it("treats an empty string as a deliberate clear, not a fallback", () => {
    expect(optStr("", "default")).toBe("");
  });

  it("trims a whitespace-only value down to an empty string", () => {
    expect(optStr("   ", "default")).toBe("");
  });

  it("returns the trimmed CMS value when present", () => {
    expect(optStr("  From the CMS  ", "default")).toBe("From the CMS");
  });
});

describe("list", () => {
  it("returns the CMS list when it has items", () => {
    expect(list(["a", "b"], ["fallback"])).toEqual(["a", "b"]);
  });

  it("falls back to the whole default list when the CMS list is empty", () => {
    expect(list([], ["fallback"])).toEqual(["fallback"]);
  });

  it("falls back when the CMS list is null", () => {
    expect(list(null, ["fallback"])).toEqual(["fallback"]);
  });

  it("falls back when the CMS list is undefined", () => {
    expect(list(undefined, ["fallback"])).toEqual(["fallback"]);
  });

  it("never interleaves CMS items with default items", () => {
    expect(list(["only"], ["a", "b", "c"])).toEqual(["only"]);
  });

  it("returns a copy so callers cannot mutate the CMS response", () => {
    const cms = ["a"];
    const result = list(cms, ["fallback"]);
    result.push("b");
    expect(cms).toEqual(["a"]);
  });

  it("returns a copy of the fallback so callers cannot mutate the default", () => {
    const fallback = ["default"];
    const result = list(null, fallback);
    result.push("mutated");
    expect(fallback).toEqual(["default"]);
  });
});
