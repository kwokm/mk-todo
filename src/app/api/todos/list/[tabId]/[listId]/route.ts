import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { generateId } from "@/lib/utils";
import { isValidId, isValidText } from "@/lib/validation";
import type { Todo } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tabId: string; listId: string }> }
) {
  const { tabId, listId } = await params;

  if (!isValidId(tabId) || !isValidId(listId)) {
    return NextResponse.json({ error: "Invalid tabId or listId" }, { status: 400 });
  }

  const key = `list:${tabId}:${listId}`;

  const ids = await redis.zrange<string[]>(key, 0, -1);
  if (!ids.length) {
    return NextResponse.json({ tabId, listId, todos: [] });
  }

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.hgetall(`todo:${id}`);
  }
  const results = await pipeline.exec();
  const todos = (results as unknown as (Todo | null)[]).filter(Boolean) as Todo[];

  return NextResponse.json({ tabId, listId, todos });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tabId: string; listId: string }> }
) {
  const { tabId, listId } = await params;
  const { text } = (await req.json()) as { text: string };

  if (!isValidId(tabId) || !isValidId(listId)) {
    return NextResponse.json({ error: "Invalid tabId or listId" }, { status: 400 });
  }
  if (!isValidText(text)) {
    return NextResponse.json({ error: "Invalid text" }, { status: 400 });
  }

  const key = `list:${tabId}:${listId}`;

  const id = generateId();
  const now = new Date().toISOString();

  const todo: Todo = {
    id,
    text,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  const pipeline = redis.pipeline();
  pipeline.hset(`todo:${id}`, todo as unknown as Record<string, string>);
  pipeline.zadd(key, { score: Date.now(), member: id });
  await pipeline.exec();

  return NextResponse.json(todo, { status: 201 });
}
