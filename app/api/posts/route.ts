import { NextRequest, NextResponse } from "next/server";
import { addPost, deletePost, readPosts, type BubbleFont, type BubbleStyle, type Post } from "@/lib/posts";
import { ADMIN_ERROR, isAdmin } from "@/lib/admin-auth";

const BUBBLES: BubbleStyle[] = ["speech", "shout", "think", "whisper", "narration"];
const FONTS: BubbleFont[] = ["antique", "mincho", "sakebi", "tegaki", "shojo", "fude", "pop"];

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const workId = req.nextUrl.searchParams.get("workId");
  let posts = await readPosts();
  if (workId) posts = posts.filter((p) => p.workId === workId);
  posts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json(ADMIN_ERROR, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { type, user, workId, freeTitle, volume, page, panel, text, bubble, font } = body;
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
    bubble: BUBBLES.includes(bubble) ? bubble : "speech",
    font: FONTS.includes(font) ? font : "antique",
    createdAt: new Date().toISOString(),
  };
  try {
    await addPost(post);
  } catch {
    return NextResponse.json({ error: "保存に失敗しました。時間をおいて再試行してください。" }, { status: 503 });
  }
  return NextResponse.json(post, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json(ADMIN_ERROR, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "idを指定してください" }, { status: 400 });
  const ok = await deletePost(id).catch(() => false);
  if (!ok) return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
