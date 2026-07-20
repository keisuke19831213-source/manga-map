import { NextRequest, NextResponse } from "next/server";
import { GENRES, WORKS } from "@/lib/data";
import { addUserWork, deleteUserWork, getAllWorks, type UserWork } from "@/lib/user-works";
import { deleteWorkMeta, patchMeta } from "@/lib/meta-server";
import { ADMIN_ERROR, isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const GENRE_IDS = new Set(GENRES.map((g) => g.id));

export async function GET() {
  return NextResponse.json(await getAllWorks());
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json(ADMIN_ERROR, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { title, author, year, magazine, desc, genres, asin } = body as Record<string, unknown>;

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "作品名を入力してください" }, { status: 400 });
  }
  if (!author || typeof author !== "string" || !author.trim()) {
    return NextResponse.json({ error: "作者名を入力してください" }, { status: 400 });
  }
  const y = Number(year);
  if (!Number.isInteger(y) || y < 1900 || y > 2100) {
    return NextResponse.json({ error: "発表年は1900〜2100の数字で入力してください" }, { status: 400 });
  }
  if (!desc || typeof desc !== "string" || !desc.trim()) {
    return NextResponse.json({ error: "紹介文を入力してください" }, { status: 400 });
  }
  const genreList = Array.isArray(genres) ? genres.filter((g): g is string => typeof g === "string" && GENRE_IDS.has(g)) : [];
  if (genreList.length === 0) {
    return NextResponse.json({ error: "ジャンルを1つ以上選択してください" }, { status: 400 });
  }

  const titleTrim = title.trim();
  const all = await getAllWorks();
  if (all.some((w) => w.title === titleTrim)) {
    return NextResponse.json({ error: "同じタイトルの作品がすでに登録されています" }, { status: 409 });
  }

  const work: UserWork = {
    id: `uw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: titleTrim,
    author: author.trim(),
    year: y,
    magazine: typeof magazine === "string" && magazine.trim() ? magazine.trim() : undefined,
    genres: genreList,
    desc: desc.trim().slice(0, 500),
    submittedBy: "admin", // 会員機能導入後はログインユーザーIDに
    createdAt: new Date().toISOString(),
  };

  try {
    await addUserWork(work);
    // ASINが指定されていれば書影・アフィリエイト設定にも登録(per-itemで安全に)
    if (typeof asin === "string" && asin.trim()) {
      await patchMeta({ [work.id]: { asin: asin.trim() } });
    }
  } catch {
    return NextResponse.json({ error: "保存に失敗しました。時間をおいて再試行してください。" }, { status: 503 });
  }
  return NextResponse.json(work, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json(ADMIN_ERROR, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !id.startsWith("uw-")) {
    return NextResponse.json({ error: "登録作品(uw-)のみ削除できます" }, { status: 400 });
  }
  if (WORKS.some((w) => w.id === id)) {
    return NextResponse.json({ error: "基本カタログの作品は削除できません" }, { status: 400 });
  }
  try {
    const removed = await deleteUserWork(id);
    if (!removed) {
      return NextResponse.json({ error: "作品が見つかりません" }, { status: 404 });
    }
    await deleteWorkMeta(id);
  } catch {
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
