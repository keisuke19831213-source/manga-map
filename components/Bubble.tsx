"use client";

import Link from "next/link";
import type { BubbleFont, BubbleStyle } from "@/lib/posts";

export const BUBBLE_OPTIONS: { id: BubbleStyle; label: string }[] = [
  { id: "speech", label: "💬 セリフ" },
  { id: "shout", label: "💥 叫び" },
  { id: "think", label: "☁️ 心の声" },
  { id: "whisper", label: "…ぼそっ(点線)" },
  { id: "narration", label: "▭ ナレーション" },
];

// マンガの組版慣習に対応した書体セット
export const FONT_OPTIONS: { id: BubbleFont; label: string; css: string }[] = [
  { id: "antique", label: "セリフ(アンチック体)", css: "f-antique" },
  { id: "mincho", label: "モノローグ(明朝体)", css: "f-mincho" },
  { id: "sakebi", label: "叫び(極太ゴシック)", css: "f-sakebi" },
  { id: "tegaki", label: "手描きツッコミ", css: "f-tegaki" },
  { id: "shojo", label: "少女マンガ風", css: "f-shojo" },
  { id: "fude", label: "筆文字(時代劇・ホラー)", css: "f-fude" },
  { id: "pop", label: "ギャグ(ポップ体)", css: "f-pop" },
];

export function fontClass(font?: string): string {
  if (font === "dot") return "f-pop"; // 旧データ互換
  return FONT_OPTIONS.find((f) => f.id === font)?.css ?? "f-antique";
}

interface BubbleProps {
  text: string;
  bubble?: string;
  font?: string;
  user: string;
  meta?: React.ReactNode; // タグ・日付・作品リンクなど
}

export default function Bubble({ text, bubble = "speech", font = "antique", user, meta }: BubbleProps) {
  const fc = fontClass(font);
  const body =
    bubble === "shout" ? (
      <div className="bubble-shout-outer">
        <div className={`bubble ${fc}`}>{text}</div>
      </div>
    ) : (
      <div className={`bubble bubble-${bubble} ${fc}`}>{text}</div>
    );

  return (
    <div className="bubble-wrap">
      <div className="bubble-meta">
        <span className="name">{user}</span>
        {meta}
      </div>
      {body}
    </div>
  );
}

export function PostMeta({
  type,
  loc,
  date,
  workTitle,
  workId,
  freeTitle,
}: {
  type: "recommend" | "comment";
  loc?: string;
  date: string;
  workTitle?: string;
  workId?: string;
  freeTitle?: string;
}) {
  return (
    <>
      <span className={`type-tag ${type === "comment" ? "type-comment-tag" : ""}`}>
        {type === "recommend" ? "おすすめ" : "コマ語り"}
      </span>
      {workTitle && workId && (
        <Link className="worklink" href={`/works/${workId}`}>
          『{workTitle}』
        </Link>
      )}
      {freeTitle && <span className="worklink">『{freeTitle}』</span>}
      {loc && <span className="loc">📍 {loc}</span>}
      <span>{date}</span>
    </>
  );
}
