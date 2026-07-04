import { NextRequest, NextResponse } from "next/server";
import { normalizeMeta } from "@/lib/affiliate";
import { readMeta, writeMeta } from "@/lib/meta-server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await readMeta());
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });
  const meta = normalizeMeta(body);
  try {
    await writeMeta(meta);
  } catch {
    return NextResponse.json(
      { error: "この環境ではファイル保存ができません。ローカルで編集して git push してください。" },
      { status: 503 }
    );
  }
  return NextResponse.json(meta);
}
