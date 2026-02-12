import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import type { TodoList } from "@/lib/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tabId: string }> }
) {
  const { tabId } = await params;
  const { listIds } = (await req.json()) as { listIds: string[] };

  if (!Array.isArray(listIds) || listIds.length === 0) {
    return NextResponse.json(
      { error: "listIds must be a non-empty array" },
      { status: 400 }
    );
  }

  const key = `tab:${tabId}:lists`;
  const lists = (await redis.get<TodoList[]>(key)) ?? [];

  const listMap = new Map(lists.map((l) => [l.id, l]));

  const reordered: TodoList[] = listIds
    .map((id, index) => {
      const list = listMap.get(id);
      if (!list) return null;
      return { ...list, sortOrder: index };
    })
    .filter((l): l is TodoList => l !== null);

  await redis.set(key, reordered);

  return NextResponse.json({ success: true });
}
