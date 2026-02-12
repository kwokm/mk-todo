import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockRedis } = vi.hoisted(() => ({
  mockRedis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    hgetall: vi.fn(),
    hset: vi.fn(),
    zrange: vi.fn(),
    pipeline: vi.fn(),
  },
}));

vi.mock("@/lib/redis", () => ({ redis: mockRedis }));
vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual("@/lib/utils");
  return { ...actual, generateId: vi.fn(() => "test-todo-id") };
});

function createPipeline() {
  const pipe = {
    hset: vi.fn(),
    hgetall: vi.fn(),
    zadd: vi.fn(),
    zrem: vi.fn(),
    del: vi.fn(),
    exec: vi.fn().mockResolvedValue([]),
  };
  pipe.hset.mockReturnValue(pipe);
  pipe.hgetall.mockReturnValue(pipe);
  pipe.zadd.mockReturnValue(pipe);
  pipe.zrem.mockReturnValue(pipe);
  pipe.del.mockReturnValue(pipe);
  return pipe;
}

function resetMocks() {
  vi.clearAllMocks();
  mockRedis.zrange.mockResolvedValue([]);
  mockRedis.pipeline.mockImplementation(() => createPipeline());
}

import {
  GET as getDayTodos,
  POST as postDayTodo,
} from "@/app/api/todos/day/[date]/route";
import {
  GET as getListTodos,
  POST as postListTodo,
} from "@/app/api/todos/list/[tabId]/[listId]/route";
import {
  PATCH as patchTodo,
  DELETE as deleteTodo,
} from "@/app/api/todos/[id]/route";
import { POST as moveTodo } from "@/app/api/todos/move/route";
import { POST as reorderTodo } from "@/app/api/todos/reorder/route";

describe("GET /api/todos/day/:date", () => {
  beforeEach(() => resetMocks());

  it("returns empty todos for a day with none", async () => {
    mockRedis.zrange.mockResolvedValue([]);
    const res = await getDayTodos(new Request("http://localhost"), {
      params: Promise.resolve({ date: "2025-01-15" }),
    });
    const data = await res.json();
    expect(data.date).toBe("2025-01-15");
    expect(data.todos).toEqual([]);
  });

  it("rejects invalid date format", async () => {
    const res = await getDayTodos(new Request("http://localhost"), {
      params: Promise.resolve({ date: "bad-date" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns todos for a day", async () => {
    mockRedis.zrange.mockResolvedValue(["id1"]);
    const mockPipe = {
      hgetall: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([
        {
          id: "id1",
          text: "Test",
          completed: false,
          createdAt: "2025-01-01",
          updatedAt: "2025-01-01",
        },
      ]),
    };
    mockRedis.pipeline.mockReturnValue(mockPipe);

    const res = await getDayTodos(new Request("http://localhost"), {
      params: Promise.resolve({ date: "2025-01-15" }),
    });
    const data = await res.json();
    expect(data.todos).toHaveLength(1);
    expect(data.todos[0].id).toBe("id1");
  });
});

describe("POST /api/todos/day/:date", () => {
  beforeEach(() => resetMocks());

  it("creates a todo on a valid day", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Buy groceries" }),
    });
    const res = await postDayTodo(req, {
      params: Promise.resolve({ date: "2025-01-15" }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.text).toBe("Buy groceries");
    expect(data.completed).toBe(false);
  });

  it("rejects invalid date", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Test" }),
    });
    const res = await postDayTodo(req, {
      params: Promise.resolve({ date: "nope" }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects empty text", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "" }),
    });
    const res = await postDayTodo(req, {
      params: Promise.resolve({ date: "2025-01-15" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/todos/list/:tabId/:listId", () => {
  beforeEach(() => resetMocks());

  it("returns empty todos for a new list", async () => {
    mockRedis.zrange.mockResolvedValue([]);
    const res = await getListTodos(new Request("http://localhost"), {
      params: Promise.resolve({ tabId: "tab1", listId: "list1" }),
    });
    const data = await res.json();
    expect(data.todos).toEqual([]);
  });

  it("rejects invalid IDs", async () => {
    const res = await getListTodos(new Request("http://localhost"), {
      params: Promise.resolve({ tabId: "has space", listId: "ok" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/todos/list/:tabId/:listId", () => {
  beforeEach(() => resetMocks());

  it("creates a todo in a list", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Do laundry" }),
    });
    const res = await postListTodo(req, {
      params: Promise.resolve({ tabId: "tab1", listId: "list1" }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.text).toBe("Do laundry");
  });
});

describe("PATCH /api/todos/:id", () => {
  beforeEach(() => resetMocks());

  it("updates todo text", async () => {
    mockRedis.hgetall.mockResolvedValue({
      id: "t1",
      text: "Old",
      completed: "false",
      createdAt: "x",
      updatedAt: "x",
    });
    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "New text" }),
    });
    const res = await patchTodo(req, {
      params: Promise.resolve({ id: "t1" }),
    });
    const data = await res.json();
    expect(data.text).toBe("New text");
  });

  it("toggles completed status", async () => {
    mockRedis.hgetall.mockResolvedValue({
      id: "t1",
      text: "Test",
      completed: "false",
      createdAt: "x",
      updatedAt: "x",
    });
    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    const res = await patchTodo(req, {
      params: Promise.resolve({ id: "t1" }),
    });
    const data = await res.json();
    expect(data.completed).toBe(true);
  });

  it("returns 404 for unknown todo", async () => {
    mockRedis.hgetall.mockResolvedValue(null);
    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "nope" }),
    });
    const res = await patchTodo(req, {
      params: Promise.resolve({ id: "missing" }),
    });
    expect(res.status).toBe(404);
  });

  it("rejects request with no fields", async () => {
    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await patchTodo(req, {
      params: Promise.resolve({ id: "t1" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/todos/:id", () => {
  beforeEach(() => resetMocks());

  it("deletes a todo with valid source", async () => {
    const req = new Request("http://localhost", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "day:2025-01-15" }),
    });
    const res = await deleteTodo(req, {
      params: Promise.resolve({ id: "t1" }),
    });
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("rejects invalid source", async () => {
    const req = new Request("http://localhost", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "bad:source" }),
    });
    const res = await deleteTodo(req, {
      params: Promise.resolve({ id: "t1" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/todos/move", () => {
  beforeEach(() => resetMocks());

  it("moves a todo between sources", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        todoId: "t1",
        fromSource: "day:2025-01-15",
        toSource: "list:tab1:list1",
      }),
    });
    const res = await moveTodo(req);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("rejects invalid todoId", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        todoId: "has space",
        fromSource: "day:2025-01-15",
        toSource: "list:tab1:list1",
      }),
    });
    const res = await moveTodo(req);
    expect(res.status).toBe(400);
  });

  it("rejects invalid fromSource", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        todoId: "t1",
        fromSource: "bad",
        toSource: "list:tab1:list1",
      }),
    });
    const res = await moveTodo(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/todos/reorder", () => {
  beforeEach(() => resetMocks());

  it("reorders todos in a source", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "day:2025-01-15",
        todoIds: ["t2", "t1", "t3"],
      }),
    });
    const res = await reorderTodo(req);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("rejects invalid source", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "bad", todoIds: ["t1"] }),
    });
    const res = await reorderTodo(req);
    expect(res.status).toBe(400);
  });

  it("rejects empty todoIds", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "day:2025-01-15", todoIds: [] }),
    });
    const res = await reorderTodo(req);
    expect(res.status).toBe(400);
  });
});
