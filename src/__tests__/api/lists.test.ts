import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockRedis } = vi.hoisted(() => {
  const mockPipelineInstance = {
    del: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue([]),
  };

  return {
    mockRedis: {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      zrange: vi.fn().mockResolvedValue([]),
      pipeline: vi.fn(() => ({ ...mockPipelineInstance })),
    },
  };
});

vi.mock("@/lib/redis", () => ({ redis: mockRedis }));
vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual("@/lib/utils");
  return { ...actual, generateId: vi.fn(() => "test-list-id") };
});

import { GET, POST } from "@/app/api/tabs/[tabId]/lists/route";
import { PATCH, DELETE } from "@/app/api/tabs/[tabId]/lists/[listId]/route";

describe("GET /api/tabs/:tabId/lists", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns default lists for 'underlying' tab when empty", async () => {
    mockRedis.get.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ tabId: "underlying" }),
    });
    const data = await res.json();
    expect(data).toHaveLength(5);
    expect(data[0].name).toBe("CHORES & LIFE");
  });

  it("returns empty array for other tabs when empty", async () => {
    mockRedis.get.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ tabId: "other" }),
    });
    const data = await res.json();
    expect(data).toEqual([]);
  });

  it("returns existing lists", async () => {
    const lists = [{ id: "l1", tabId: "t1", name: "List", sortOrder: 0 }];
    mockRedis.get.mockResolvedValue(lists);
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ tabId: "t1" }),
    });
    const data = await res.json();
    expect(data).toEqual(lists);
  });
});

describe("POST /api/tabs/:tabId/lists", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a list", async () => {
    mockRedis.get.mockResolvedValue([]);
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Groceries" }),
    });
    const res = await POST(req, {
      params: Promise.resolve({ tabId: "tab1" }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("Groceries");
    expect(data.tabId).toBe("tab1");
  });

  it("rejects invalid name", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });
    const res = await POST(req, {
      params: Promise.resolve({ tabId: "tab1" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/tabs/:tabId/lists/:listId", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates a list name", async () => {
    const lists = [{ id: "l1", tabId: "t1", name: "Old", sortOrder: 0 }];
    mockRedis.get.mockResolvedValue(lists);
    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated" }),
    });
    const res = await PATCH(req, {
      params: Promise.resolve({ tabId: "t1", listId: "l1" }),
    });
    const data = await res.json();
    expect(data.name).toBe("Updated");
  });

  it("returns 404 for unknown list", async () => {
    mockRedis.get.mockResolvedValue([]);
    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "X" }),
    });
    const res = await PATCH(req, {
      params: Promise.resolve({ tabId: "t1", listId: "missing" }),
    });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/tabs/:tabId/lists/:listId", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes a list and its todos", async () => {
    mockRedis.get.mockResolvedValue([
      { id: "l1", tabId: "t1", name: "X", sortOrder: 0 },
    ]);
    mockRedis.zrange.mockResolvedValue(["todo1", "todo2"]);

    const res = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ tabId: "t1", listId: "l1" }),
    });
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockRedis.set).toHaveBeenCalled();
  });
});
