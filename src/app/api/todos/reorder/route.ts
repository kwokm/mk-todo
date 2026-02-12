import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { isValidId, isValidSourceKey } from "@/lib/validation";

export async function POST(req: Request) {
  const { key, todoIds } = (await req.json()) as {
    key: string;
    todoIds: string[];
  };

  if (!isValidSourceKey(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }
  if (!Array.isArray(todoIds) || todoIds.length === 0 || !todoIds.every(isValidId)) {
    return NextResponse.json({ error: "Invalid todoIds" }, { status: 400 });
  }

  const pipeline = redis.pipeline();
  for (let i = 0; i < todoIds.length; i++) {
    pipeline.zadd(key, { score: i, member: todoIds[i] });
  }
  await pipeline.exec();

  return NextResponse.json({ success: true });
}
