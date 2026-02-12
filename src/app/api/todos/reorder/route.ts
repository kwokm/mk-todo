import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  const { key, todoIds } = (await req.json()) as {
    key: string;
    todoIds: string[];
  };

  const pipeline = redis.pipeline();
  for (let i = 0; i < todoIds.length; i++) {
    pipeline.zadd(key, { score: i, member: todoIds[i] });
  }
  await pipeline.exec();

  return NextResponse.json({ success: true });
}
