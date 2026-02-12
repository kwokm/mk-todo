import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { isValidId, isValidName } from "@/lib/validation";
import type { Tab, TodoList } from "@/lib/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tabId: string }> }
) {
  const { tabId } = await params;
  const { name } = (await req.json()) as { name: string };

  if (!isValidName(name)) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

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

  if (!isValidId(tabId)) {
    return NextResponse.json({ error: "Invalid tabId" }, { status: 400 });
  }

  const tabs = (await redis.get<Tab[]>("tabs")) ?? [];
  const filtered = tabs.filter((t) => t.id !== tabId);
  await redis.set("tabs", filtered);

  const lists = (await redis.get<TodoList[]>(`tab:${tabId}:lists`)) ?? [];

  if (lists.length > 0) {
    const readPipeline = redis.pipeline();
    for (const list of lists) {
      readPipeline.zrange(`list:${tabId}:${list.id}`, 0, -1);
    }
    const allTodoIds = await readPipeline.exec();

    const deletePipeline = redis.pipeline();
    for (let i = 0; i < lists.length; i++) {
      const todoIds = (allTodoIds[i] as string[]) ?? [];
      for (const todoId of todoIds) deletePipeline.del(`todo:${todoId}`);
      deletePipeline.del(`list:${tabId}:${lists[i].id}`);
    }
    deletePipeline.del(`tab:${tabId}:lists`);
    await deletePipeline.exec();
  } else {
    await redis.del(`tab:${tabId}:lists`);
  }

  return NextResponse.json({ success: true });
}
