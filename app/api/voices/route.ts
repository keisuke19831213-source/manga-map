import { NextRequest, NextResponse } from "next/server";
import { ADMIN_ERROR, isAdmin } from "@/lib/admin-auth";
import { EMOTION_IDS } from "@/lib/emotions";
import { VOICE_TAG_IDS, sourceFromUrl, type Voice, type VoiceTag } from "@/lib/voices";
import { addVoice, deleteVoice, readVoices } from "@/lib/voices-server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const workId = req.nextUrl.searchParams.get("workId");
  let voices = await readVoices();
  if (workId) voices = voices.filter((v) => v.workId === workId);
  voices.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json(voices);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json(ADMIN_ERROR, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { url, title, excerpt, author, workId, emotion, tag, note, featured } = body;
  if (typeof url !== "string" || !/^https?:\/\//.test(url.trim())) {
    return NextResponse.json({ error: "URLを入力してください" }, { status: 400 });
  }

  const voice: Voice = {
    id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    source: sourceFromUrl(url.trim()),
    url: url.trim(),
    title: typeof title === "string" && title.trim() ? title.trim().slice(0, 120) : undefined,
    excerpt: typeof excerpt === "string" && excerpt.trim() ? excerpt.trim().slice(0, 200) : undefined,
    author: typeof author === "string" && author.trim() ? author.trim().slice(0, 60) : undefined,
    workId: typeof workId === "string" && workId ? workId : undefined,
    emotion: typeof emotion === "string" && EMOTION_IDS.includes(emotion as (typeof EMOTION_IDS)[number]) ? emotion : undefined,
    tag: typeof tag === "string" && VOICE_TAG_IDS.includes(tag as VoiceTag) ? (tag as VoiceTag) : undefined,
    note: typeof note === "string" && note.trim() ? note.trim().slice(0, 120) : undefined,
    featured: featured === true ? true : undefined,
    createdAt: new Date().toISOString(),
  };

  try {
    await addVoice(voice);
  } catch {
    return NextResponse.json({ error: "保存に失敗しました。時間をおいて再試行してください。" }, { status: 503 });
  }
  return NextResponse.json(voice, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json(ADMIN_ERROR, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "idを指定してください" }, { status: 400 });
  const ok = await deleteVoice(id).catch(() => false);
  if (!ok) return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
