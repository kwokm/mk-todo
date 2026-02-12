import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  const { source, todoIds } = (await req.json()) as {
    source: string;
    todoIds: string[];
  };

  if (
    !source ||
    (!source.startsWith("day:") && !source.startsWith("list:"))
  ) {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  if (!Array.isArray(todoIds) || todoIds.length === 0) {
    return NextResponse.json({ error: "Invalid todoIds" }, { status: 400 });
  }

  const pipeline = redis.pipeline();
  for (let i = 0; i < todoIds.length; i++) {
    pipeline.zadd(source, { score: i, member: todoIds[i] });
  }
  await pipeline.exec();

  return NextResponse.json({ success: true });
}
