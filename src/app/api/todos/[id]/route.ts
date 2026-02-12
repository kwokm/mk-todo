import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import type { Todo } from "@/lib/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await req.json()) as { text?: string; completed?: boolean };

  const existing = await redis.hgetall<Record<string, string>>(`todo:${id}`);
  if (!existing) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  const updates: Record<string, string | boolean> = {
    updatedAt: new Date().toISOString(),
  };
  if (body.text !== undefined) updates.text = body.text;
  if (body.completed !== undefined) updates.completed = body.completed;

  await redis.hset(`todo:${id}`, updates);

  const updated = await redis.hgetall<Record<string, string>>(`todo:${id}`) as unknown as Todo;
  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { source } = (await req.json()) as { source: string };

  const pipeline = redis.pipeline();
  pipeline.zrem(source, id);
  pipeline.del(`todo:${id}`);
  await pipeline.exec();

  return NextResponse.json({ success: true });
}
