import { NextRequest, NextResponse } from "next/server";
import { addPost, readPosts, type Post } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const workId = req.nextUrl.searchParams.get("workId");
  let posts = await readPosts();
  if (workId) posts = posts.filter((p) => p.workId === workId);
  posts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { type, user, workId, freeTitle, volume, page, panel, text } = body;
  if (type !== "recommend" && type !== "comment") {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "本文を入力してください" }, { status: 400 });
  }
  if (type === "comment" && !workId) {
    return NextResponse.json({ error: "コメントには作品の指定が必要です" }, { status: 400 });
  }
  if (type === "recommend" && !workId && !freeTitle) {
    return NextResponse.json({ error: "作品名を入力してください" }, { status: 400 });
  }

  const post: Post = {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    user: (typeof user === "string" && user.trim()) || "名無しの読者",
    workId: typeof workId === "string" && workId ? workId : undefined,
    freeTitle: typeof freeTitle === "string" && freeTitle.trim() ? freeTitle.trim() : undefined,
    volume: typeof volume === "string" && volume.trim() ? volume.trim() : undefined,
    page: typeof page === "string" && page.trim() ? page.trim() : undefined,
    panel: typeof panel === "string" && panel.trim() ? panel.trim() : undefined,
    text: text.trim().slice(0, 2000),
    createdAt: new Date().toISOString(),
  };
  await addPost(post);
  return NextResponse.json(post, { status: 201 });
}
