import { NextRequest, NextResponse } from "next/server";
import { normalizeMeta, type WorkMeta, type VolumeMeta } from "@/lib/affiliate";
import { patchMeta, readMeta, writeMeta } from "@/lib/meta-server";
import { ADMIN_ERROR, isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await readMeta());
}

// 全置換(管理UI)。全作品を per-item で書き戻す。
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

// 部分更新(fill系スクリプト用)。変更した作品だけを送ると、既存フィールドを保ったまま
// per-item でマージ保存する。他作品を巻き込む更新ロストが起きない安全な更新経路。
// body: { works: { <id>: { asin?, coverUrl?, amazonUrl?, volumes? } }, affiliateTag? }
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json(ADMIN_ERROR, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const rawWorks = (body as { works?: unknown }).works;
  const partial: Record<string, WorkMeta> = {};
  if (rawWorks && typeof rawWorks === "object") {
    for (const [id, v] of Object.entries(rawWorks as Record<string, unknown>)) {
      if (!id || !v || typeof v !== "object") continue;
      const w = v as Record<string, unknown>;
      const entry: WorkMeta = {};
      if (typeof w.asin === "string" && w.asin.trim()) entry.asin = w.asin.trim();
      if (typeof w.amazonUrl === "string" && w.amazonUrl.trim()) entry.amazonUrl = w.amazonUrl.trim();
      if (typeof w.coverUrl === "string" && w.coverUrl.trim()) entry.coverUrl = w.coverUrl.trim();
      if (Array.isArray(w.volumes)) {
        const vols: VolumeMeta[] = [];
        for (const item of w.volumes) {
          if (!item || typeof item !== "object") continue;
          const o = item as Record<string, unknown>;
          const vn = typeof o.v === "number" ? o.v : NaN;
          if (!Number.isFinite(vn) || typeof o.asin !== "string" || !o.asin.trim()) continue;
          vols.push({ v: vn, asin: o.asin.trim() });
        }
        if (vols.length > 0) entry.volumes = vols.sort((a, b) => a.v - b.v);
      }
      if (Object.keys(entry).length > 0) partial[id] = entry;
    }
  }

  const tag = typeof (body as { affiliateTag?: unknown }).affiliateTag === "string" ? ((body as { affiliateTag: string }).affiliateTag) : undefined;
  if (Object.keys(partial).length === 0 && tag === undefined) {
    return NextResponse.json({ error: "更新対象がありません" }, { status: 400 });
  }
  try {
    const updated = await patchMeta(partial, tag);
    return NextResponse.json({ ok: true, updated });
  } catch {
    return NextResponse.json({ error: "保存に失敗しました。時間をおいて再試行してください。" }, { status: 503 });
  }
}
