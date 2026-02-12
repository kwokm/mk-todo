import { cn, generateId, formatDateKey, getDayLabel, getDateLabel, addDays, isToday } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "flex")).toBe("base flex");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("generateId", () => {
  it("returns a 12-character string", () => {
    const id = generateId();
    expect(id).toHaveLength(12);
  });

  it("returns unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("formatDateKey", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(formatDateKey(new Date(2025, 0, 5))).toBe("2025-01-05");
    expect(formatDateKey(new Date(2024, 11, 31))).toBe("2024-12-31");
  });

  it("pads single-digit months and days", () => {
    expect(formatDateKey(new Date(2025, 2, 3))).toBe("2025-03-03");
  });
});

describe("getDayLabel", () => {
  it("returns uppercase weekday name", () => {
    // Jan 6 2025 is a Monday
    expect(getDayLabel(new Date(2025, 0, 6))).toBe("MONDAY");
  });
});

describe("getDateLabel", () => {
  it("returns uppercase formatted date", () => {
    const label = getDateLabel(new Date(2025, 0, 15));
    expect(label).toContain("JAN");
    expect(label).toContain("15");
    expect(label).toContain("2025");
  });
});

describe("addDays", () => {
  it("adds positive days", () => {
    const base = new Date(2025, 0, 1);
    const result = addDays(base, 5);
    expect(formatDateKey(result)).toBe("2025-01-06");
  });

  it("subtracts negative days", () => {
    const base = new Date(2025, 0, 10);
    const result = addDays(base, -3);
    expect(formatDateKey(result)).toBe("2025-01-07");
  });

  it("does not mutate the original date", () => {
    const base = new Date(2025, 0, 1);
    addDays(base, 5);
    expect(formatDateKey(base)).toBe("2025-01-01");
  });
});

describe("isToday", () => {
  it("returns true for today's date", () => {
    expect(isToday(new Date())).toBe(true);
  });

  it("returns false for yesterday", () => {
    const yesterday = addDays(new Date(), -1);
    expect(isToday(yesterday)).toBe(false);
  });
});
