import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { isValidId, isValidSourceKey } from "@/lib/validation";

export async function POST(req: Request) {
  const { todoId, fromSource, toSource } = (await req.json()) as {
    todoId: string;
    fromSource: string;
    toSource: string;
  };

  if (!isValidId(todoId)) {
    return NextResponse.json({ error: "Invalid todoId" }, { status: 400 });
  }
  if (!isValidSourceKey(fromSource)) {
    return NextResponse.json({ error: "Invalid fromSource" }, { status: 400 });
  }
  if (!isValidSourceKey(toSource)) {
    return NextResponse.json({ error: "Invalid toSource" }, { status: 400 });
  }

  const pipeline = redis.pipeline();
  pipeline.zrem(fromSource, todoId);
  pipeline.zadd(toSource, { score: Date.now(), member: todoId });
  await pipeline.exec();

  return NextResponse.json({ success: true });
}
