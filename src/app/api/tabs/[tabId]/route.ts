import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import type { Tab, TodoList } from "@/lib/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tabId: string }> }
) {
  const { tabId } = await params;
  const { name } = (await req.json()) as { name: string };

  const tabs = (await redis.get<Tab[]>("tabs")) ?? [];
  const index = tabs.findIndex((t) => t.id === tabId);
  if (index === -1) {
    return NextResponse.json({ error: "Tab not found" }, { status: 404 });
  }

  tabs[index].name = name;
  await redis.set("tabs", tabs);

  return NextResponse.json(tabs[index]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tabId: string }> }
) {
  const { tabId } = await params;

  const tabs = (await redis.get<Tab[]>("tabs")) ?? [];
  const filtered = tabs.filter((t) => t.id !== tabId);
  await redis.set("tabs", filtered);

  const lists = (await redis.get<TodoList[]>(`tab:${tabId}:lists`)) ?? [];
  const pipeline = redis.pipeline();

  for (const list of lists) {
    const listKey = `list:${tabId}:${list.id}`;
    const todoIds = await redis.zrange<string[]>(listKey, 0, -1);
    for (const todoId of todoIds) {
      pipeline.del(`todo:${todoId}`);
    }
    pipeline.del(listKey);
  }

  pipeline.del(`tab:${tabId}:lists`);
  await pipeline.exec();

  return NextResponse.json({ success: true });
}
