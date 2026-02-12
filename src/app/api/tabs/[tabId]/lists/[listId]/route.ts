import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import type { TodoList } from "@/lib/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tabId: string; listId: string }> }
) {
  const { tabId, listId } = await params;
  const { name } = (await req.json()) as { name: string };
  const key = `tab:${tabId}:lists`;

  const lists = (await redis.get<TodoList[]>(key)) ?? [];
  const index = lists.findIndex((l) => l.id === listId);
  if (index === -1) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  lists[index].name = name;
  await redis.set(key, lists);

  return NextResponse.json(lists[index]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tabId: string; listId: string }> }
) {
  const { tabId, listId } = await params;
  const key = `tab:${tabId}:lists`;

  const lists = (await redis.get<TodoList[]>(key)) ?? [];
  const filtered = lists.filter((l) => l.id !== listId);
  await redis.set(key, filtered);

  const listKey = `list:${tabId}:${listId}`;
  const todoIds = await redis.zrange<string[]>(listKey, 0, -1);

  const pipeline = redis.pipeline();
  for (const todoId of todoIds) {
    pipeline.del(`todo:${todoId}`);
  }
  pipeline.del(listKey);
  await pipeline.exec();

  return NextResponse.json({ success: true });
}
