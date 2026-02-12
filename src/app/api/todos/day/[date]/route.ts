import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { generateId } from "@/lib/utils";
import { isValidDateKey, isValidText } from "@/lib/validation";
import type { Todo } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  if (!isValidDateKey(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const key = `day:${date}`;

  const ids = await redis.zrange<string[]>(key, 0, -1);
  if (!ids.length) {
    return NextResponse.json({ date, todos: [] });
  }

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.hgetall(`todo:${id}`);
  }
  const results = await pipeline.exec();
  const todos = (results as unknown as (Todo | null)[]).filter(Boolean) as Todo[];

  return NextResponse.json({ date, todos });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const { text } = (await req.json()) as { text: string };

  if (!isValidDateKey(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }
  if (!isValidText(text)) {
    return NextResponse.json({ error: "Invalid text" }, { status: 400 });
  }

  const key = `day:${date}`;

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
