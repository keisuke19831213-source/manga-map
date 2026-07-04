import { NextRequest, NextResponse } from "next/server";
import { normalizeMeta } from "@/lib/affiliate";
import { readMeta, writeMeta } from "@/lib/meta-server";
import { ADMIN_ERROR, isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await readMeta());
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json(ADMIN_ERROR, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });
  const meta = normalizeMeta(body);
  try {
    await writeMeta(meta);
  } catch {
    return NextResponse.json({ error: "保存に失敗しました。時間をおいて再試行してください。" }, { status: 503 });
  }
  return NextResponse.json(meta);
}
