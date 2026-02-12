import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { generateId } from "@/lib/utils";
import type { Todo } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tabId: string; listId: string }> }
) {
  const { tabId, listId } = await params;
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

  const maxScore = await redis.zrange<string[]>(key, -1, -1, { withScores: true });
  const score = maxScore.length >= 2 ? Number(maxScore[1]) + 1 : 0;

  const pipeline = redis.pipeline();
  pipeline.hset(`todo:${id}`, todo as unknown as Record<string, string>);
  pipeline.zadd(key, { score, member: id });
  await pipeline.exec();

  return NextResponse.json(todo, { status: 201 });
}
