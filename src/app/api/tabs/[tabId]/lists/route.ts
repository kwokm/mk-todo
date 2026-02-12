import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { generateId } from "@/lib/utils";
import { isValidName } from "@/lib/validation";
import type { TodoList } from "@/lib/types";

const DEFAULT_UNDERLYING_LISTS: TodoList[] = [
  { id: "chores", tabId: "underlying", name: "CHORES & LIFE", sortOrder: 0 },
  {
    id: "benefits",
    tabId: "underlying",
    name: "BENEFITS & ONBOARDING",
    sortOrder: 1,
  },
  {
    id: "oneshot",
    tabId: "underlying",
    name: "UNDERLYING - ONE-SHOT",
    sortOrder: 2,
  },
  {
    id: "longpersonal",
    tabId: "underlying",
    name: "UNDERLYING - LONGTERM PERSONAL",
    sortOrder: 3,
  },
  {
    id: "longwork",
    tabId: "underlying",
    name: "UNDERLYING - LONGTERM WORK",
    sortOrder: 4,
  },
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tabId: string }> }
) {
  const { tabId } = await params;
  const key = `tab:${tabId}:lists`;

  let lists = await redis.get<TodoList[]>(key);

  if (!lists || lists.length === 0) {
    if (tabId === "underlying") {
      await redis.set(key, DEFAULT_UNDERLYING_LISTS);
      lists = DEFAULT_UNDERLYING_LISTS;
    } else {
      lists = [];
    }
  }

  return NextResponse.json(lists);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tabId: string }> }
) {
  const { tabId } = await params;
  const { name } = (await req.json()) as { name: string };

  if (!isValidName(name)) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const key = `tab:${tabId}:lists`;

  const lists = (await redis.get<TodoList[]>(key)) ?? [];

  const maxOrder = lists.reduce((max, l) => Math.max(max, l.sortOrder), -1);
  const list: TodoList = {
    id: generateId(),
    tabId,
    name,
    sortOrder: maxOrder + 1,
  };

  lists.push(list);
  await redis.set(key, lists);

  return NextResponse.json(list, { status: 201 });
}
