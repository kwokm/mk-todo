import { isValidDateKey, isValidId, isValidSourceKey, isValidText, isValidName } from "@/lib/validation";

describe("isValidDateKey", () => {
  it("accepts YYYY-MM-DD format", () => {
    expect(isValidDateKey("2025-01-15")).toBe(true);
    expect(isValidDateKey("2024-12-31")).toBe(true);
  });

  it("rejects invalid date formats", () => {
    expect(isValidDateKey("01-15-2025")).toBe(false);
    expect(isValidDateKey("2025/01/15")).toBe(false);
    expect(isValidDateKey("2025-1-5")).toBe(false);
    expect(isValidDateKey("")).toBe(false);
    expect(isValidDateKey("not-a-date")).toBe(false);
  });
});

describe("isValidId", () => {
  it("accepts alphanumeric IDs with hyphens and underscores", () => {
    expect(isValidId("abc123")).toBe(true);
    expect(isValidId("my-tab_1")).toBe(true);
    expect(isValidId("A")).toBe(true);
  });

  it("rejects empty strings", () => {
    expect(isValidId("")).toBe(false);
  });

  it("rejects strings over 50 characters", () => {
    expect(isValidId("a".repeat(51))).toBe(false);
    expect(isValidId("a".repeat(50))).toBe(true);
  });

  it("rejects special characters", () => {
    expect(isValidId("has space")).toBe(false);
    expect(isValidId("has.dot")).toBe(false);
    expect(isValidId("has@symbol")).toBe(false);
  });
});

describe("isValidSourceKey", () => {
  it("accepts day: sources with valid date", () => {
    expect(isValidSourceKey("day:2025-01-15")).toBe(true);
  });

  it("rejects day: sources with invalid date", () => {
    expect(isValidSourceKey("day:bad-date")).toBe(false);
  });

  it("accepts list: sources with valid tabId:listId", () => {
    expect(isValidSourceKey("list:tab1:list1")).toBe(true);
  });

  it("rejects list: sources with wrong format", () => {
    expect(isValidSourceKey("list:onlyone")).toBe(false);
    expect(isValidSourceKey("list:a:b:c")).toBe(false);
  });

  it("rejects unknown prefixes", () => {
    expect(isValidSourceKey("unknown:foo")).toBe(false);
    expect(isValidSourceKey("")).toBe(false);
  });
});

describe("isValidText", () => {
  it("accepts non-empty strings up to 500 chars", () => {
    expect(isValidText("Buy groceries")).toBe(true);
    expect(isValidText("a")).toBe(true);
    expect(isValidText("x".repeat(500))).toBe(true);
  });

  it("rejects empty or whitespace-only strings", () => {
    expect(isValidText("")).toBe(false);
    expect(isValidText("   ")).toBe(false);
  });

  it("rejects strings over 500 chars", () => {
    expect(isValidText("x".repeat(501))).toBe(false);
  });

  it("rejects non-string types", () => {
    expect(isValidText(123)).toBe(false);
    expect(isValidText(null)).toBe(false);
    expect(isValidText(undefined)).toBe(false);
  });
});

describe("isValidName", () => {
  it("accepts valid names up to 100 chars", () => {
    expect(isValidName("My Tab")).toBe(true);
    expect(isValidName("a".repeat(100))).toBe(true);
  });

  it("rejects empty or whitespace-only", () => {
    expect(isValidName("")).toBe(false);
    expect(isValidName("  ")).toBe(false);
  });

  it("rejects strings over 100 chars", () => {
    expect(isValidName("a".repeat(101))).toBe(false);
  });

  it("rejects non-string types", () => {
    expect(isValidName(42)).toBe(false);
    expect(isValidName(null)).toBe(false);
  });
});
