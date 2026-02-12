import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockRedis } = vi.hoisted(() => {
  const mockPipelineInstance = {
    zrange: vi.fn().mockReturnThis(),
    del: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue([]),
  };

  return {
    mockRedis: {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      pipeline: vi.fn(() => ({ ...mockPipelineInstance })),
    },
  };
});

vi.mock("@/lib/redis", () => ({ redis: mockRedis }));
vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual("@/lib/utils");
  return { ...actual, generateId: vi.fn(() => "test-id-123") };
});

import { GET, POST } from "@/app/api/tabs/route";
import { PATCH, DELETE } from "@/app/api/tabs/[tabId]/route";

function makeRequest(body?: object) {
  return new Request("http://localhost:3000/api/tabs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("GET /api/tabs", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns existing tabs", async () => {
    const tabs = [{ id: "1", name: "TAB", sortOrder: 0 }];
    mockRedis.get.mockResolvedValue(tabs);
    const res = await GET();
    const data = await res.json();
    expect(data).toEqual(tabs);
  });

  it("seeds default tabs when none exist", async () => {
    mockRedis.get.mockResolvedValue(null);
    const res = await GET();
    const data = await res.json();
    expect(data).toHaveLength(3);
    expect(mockRedis.set).toHaveBeenCalled();
  });
});

describe("POST /api/tabs", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a tab with valid name", async () => {
    mockRedis.get.mockResolvedValue([]);
    const res = await POST(makeRequest({ name: "NEW TAB" }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("NEW TAB");
    expect(data.id).toBe("test-id-123");
  });

  it("rejects empty name", async () => {
    const res = await POST(makeRequest({ name: "" }));
    expect(res.status).toBe(400);
  });

  it("rejects name over 100 chars", async () => {
    const res = await POST(makeRequest({ name: "a".repeat(101) }));
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/tabs/:tabId", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates a tab name", async () => {
    const tabs = [{ id: "tab1", name: "OLD", sortOrder: 0 }];
    mockRedis.get.mockResolvedValue(tabs);
    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "UPDATED" }),
    });
    const res = await PATCH(req, {
      params: Promise.resolve({ tabId: "tab1" }),
    });
    const data = await res.json();
    expect(data.name).toBe("UPDATED");
  });

  it("returns 404 for unknown tab", async () => {
    mockRedis.get.mockResolvedValue([]);
    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "X" }),
    });
    const res = await PATCH(req, {
      params: Promise.resolve({ tabId: "missing" }),
    });
    expect(res.status).toBe(404);
  });

  it("rejects invalid name", async () => {
    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });
    const res = await PATCH(req, {
      params: Promise.resolve({ tabId: "tab1" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/tabs/:tabId", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes a tab and cleans up lists", async () => {
    mockRedis.get
      .mockResolvedValueOnce([{ id: "tab1", name: "X", sortOrder: 0 }]) // tabs
      .mockResolvedValueOnce([
        { id: "list1", tabId: "tab1", name: "L", sortOrder: 0 },
      ]); // lists

    // DELETE uses two pipeline() calls: one for reading todo IDs, one for deleting
    const readPipeline = {
      zrange: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([["todo1", "todo2"]]),
    };
    const deletePipeline = {
      del: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([]),
    };
    mockRedis.pipeline
      .mockReturnValueOnce(readPipeline)
      .mockReturnValueOnce(deletePipeline);

    const res = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ tabId: "tab1" }),
    });
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockRedis.set).toHaveBeenCalled();
  });

  it("deletes a tab with no lists and cleans up key", async () => {
    mockRedis.get
      .mockResolvedValueOnce([{ id: "tab1", name: "X", sortOrder: 0 }])
      .mockResolvedValueOnce([]); // no lists

    const res = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ tabId: "tab1" }),
    });
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockRedis.del).toHaveBeenCalledWith("tab:tab1:lists");
  });

  it("rejects invalid tabId", async () => {
    const res = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ tabId: "has space" }),
    });
    expect(res.status).toBe(400);
  });
});
