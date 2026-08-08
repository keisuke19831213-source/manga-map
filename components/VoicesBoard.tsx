"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import VoiceCard from "@/components/VoiceCard";
import VoiceAdminForm from "@/components/VoiceAdminForm";
import { EMOTIONS } from "@/lib/emotions";
import { useAdminKey } from "@/lib/useAdminKey";
import { VOICE_TAGS, type Voice, type VoiceTag } from "@/lib/voices";

// 感情の配合バー。熱量の格付け(★・レート)は出さない — 作品間の優劣に見えるため。
// 出すのは「その作品がどんな感情を起こしてきたか」の性格だけ。
function EmotionMix({ ids }: { ids: string[] }) {
  const mix = useMemo(() => {
    const total = ids.length;
    if (!total) return [];
    return EMOTIONS.map((e) => ({ e, n: ids.filter((id) => id === e.id).length }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n)
      .map((x) => ({ ...x, pct: Math.round((x.n / total) * 100) }));
  }, [ids]);

  if (mix.length === 0) return null;

  return (
    <div className="emotion-mix">
      <div className="emotion-mix-label">感情の配合</div>
      <div className="emotion-mix-bar">
        {mix.map(({ e, n, pct }) => (
          // 幅は丸めた%でなく比率(flex)で持つ — 合計が99%や101%になっても隙間や溢れが出ない
          <span key={e.id} style={{ flexGrow: n, background: e.color }} title={`${e.label} ${pct}%`} />
        ))}
      </div>
      <div className="emotion-mix-legend">
        {mix.map(({ e, n, pct }) => (
          <span key={e.id} style={{ color: e.color }}>
            {e.label} {pct}%
          </span>
        ))}
      </div>
    </div>
  );
}

interface Props {
  workId?: string; // 作品ページに置くときはその作品に絞る
  extraEmotions?: string[]; // コマ語り側の感情も配合に混ぜる
  anniversary?: number; // 節目の周年(◯周年)。渡すと祭りモードで開く
  compact?: boolean; // 作品ページ内に置くとき(見出しを小さく)
}

export default function VoicesBoard({ workId, extraEmotions = [], anniversary, compact = false }: Props) {
  const [adminKey] = useAdminKey();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [tag, setTag] = useState<VoiceTag | "all">("all");
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/voices${workId ? `?workId=${encodeURIComponent(workId)}` : ""}`, { cache: "no-store" });
    if (res.ok) setVoices(await res.json());
    setLoaded(true);
  }, [workId]);

  useEffect(() => {
    load();
  }, [load]);

  const shown = tag === "all" ? voices : voices.filter((v) => v.tag === tag);
  const featured = shown.find((v) => v.featured);
  const rest = featured ? shown.filter((v) => v.id !== featured.id) : shown;
  const mixIds = [...voices.map((v) => v.emotion).filter((x): x is string => !!x), ...extraEmotions];
  const usedTags = new Set(voices.map((v) => v.tag).filter(Boolean));

  return (
    <section className={`voices ${anniversary ? "festival" : "quiet"}`}>
      {anniversary ? (
        <div className="voices-banner">
          <span className="voices-banner-main">連載開始 {anniversary}周年 ── 祭り開催中</span>
        </div>
      ) : (
        <div className="voices-mode">しずかな夜 ── 祭りは節目の年にひらきます</div>
      )}

      {!compact && <div className="page-en">FAN VOICES</div>}
      <h2 className={compact ? "section-title" : "voices-h1"}>よそで生まれた声</h2>
      <p className="voices-lead">
        X・note・YouTubeで見つけた熱い声を、管理人が選んで並べています。本文は載せず、ぜんぶ現地へつながります。
      </p>

      <EmotionMix ids={mixIds} />

      {usedTags.size > 0 && (
        <div className="voice-tags">
          <button type="button" className={`voice-tag ${tag === "all" ? "on" : ""}`} onClick={() => setTag("all")}>
            すべて
          </button>
          {VOICE_TAGS.filter((t) => usedTags.has(t.id)).map((t) => (
            <button key={t.id} type="button" className={`voice-tag ${tag === t.id ? "on" : ""}`} onClick={() => setTag(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {featured && (
        <div className="voice-featured-wrap">
          <div className="voice-featured-label">今夜の一本</div>
          <VoiceCard voice={featured} featured />
        </div>
      )}

      {rest.length > 0 && (
        <div className="voice-grid">
          {rest.map((v) => (
            <VoiceCard key={v.id} voice={v} />
          ))}
        </div>
      )}

      {loaded && shown.length === 0 && (
        <p className="voices-empty">
          まだ声を集めていません。熱い感想・考察を見つけたら、ここに並びます。
        </p>
      )}

      {adminKey && <VoiceAdminForm defaultWorkId={workId} onAdded={(v) => setVoices((prev) => [v, ...prev])} />}
    </section>
  );
}
