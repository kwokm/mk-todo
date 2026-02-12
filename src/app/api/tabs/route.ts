import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { generateId } from "@/lib/utils";
import { isValidName } from "@/lib/validation";
import type { Tab } from "@/lib/types";

const DEFAULT_TABS: Tab[] = [
  { id: "underlying", name: "UNDERLYING", sortOrder: 0 },
  { id: "thoughts", name: "THOUGHTS", sortOrder: 1 },
  { id: "planning", name: "PLANNING", sortOrder: 2 },
];

export async function GET() {
  let tabs = await redis.get<Tab[]>("tabs");

  if (!tabs || tabs.length === 0) {
    await redis.set("tabs", DEFAULT_TABS);
    tabs = DEFAULT_TABS;
  }

  return NextResponse.json(tabs);
}

export async function POST(req: Request) {
  const { name } = (await req.json()) as { name: string };

  if (!isValidName(name)) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const tabs = (await redis.get<Tab[]>("tabs")) ?? [];

  const maxOrder = tabs.reduce((max, t) => Math.max(max, t.sortOrder), -1);
  const tab: Tab = {
    id: generateId(),
    name,
    sortOrder: maxOrder + 1,
  };

  tabs.push(tab);
  await redis.set("tabs", tabs);

  return NextResponse.json(tab, { status: 201 });
}
