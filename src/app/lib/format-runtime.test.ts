import { formatRuntime } from "./format-runtime";

describe("formatRuntime", () => {
  it("returns null for null or undefined", () => {
    expect(formatRuntime(null)).toBeNull();
    expect(formatRuntime(undefined)).toBeNull();
  });

  it("returns null for zero or negative values", () => {
    expect(formatRuntime(0)).toBeNull();
    expect(formatRuntime(-10)).toBeNull();
  });

  it("formats minutes only when under an hour", () => {
    expect(formatRuntime(45)).toBe("45m");
  });

  it("formats hours only when minutes are exact", () => {
    expect(formatRuntime(120)).toBe("2h");
  });

  it("formats hours and minutes together", () => {
    expect(formatRuntime(148)).toBe("2h 28m");
  });

  it("handles single-digit minutes", () => {
    expect(formatRuntime(61)).toBe("1h 1m");
  });
});
