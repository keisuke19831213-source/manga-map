"use client";

import { useEffect } from "react";
import { emotionOf } from "@/lib/emotions";
import { hostLabel, youtubeId, type Voice } from "@/lib/voices";

// Xの公式ウィジェットは1度だけ読み込み、以降は widgets.load() で再描画する
declare global {
  interface Window {
    twttr?: { widgets?: { load: (el?: HTMLElement) => void } };
  }
}

function useTwitterWidgets(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const SRC = "https://platform.twitter.com/widgets.js";
    if (window.twttr?.widgets) {
      window.twttr.widgets.load();
      return;
    }
    if (document.querySelector(`script[src="${SRC}"]`)) return;
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    document.body.appendChild(s);
  }, [enabled]);
}

const SOURCE_LABEL: Record<Voice["source"], string> = {
  x: "X",
  note: "note",
  youtube: "YouTube",
  web: "Web",
};

export default function VoiceCard({ voice, featured = false }: { voice: Voice; featured?: boolean }) {
  useTwitterWidgets(voice.source === "x");
  const emo = emotionOf(voice.emotion);
  const vid = voice.source === "youtube" ? youtubeId(voice.url) : null;

  return (
    <article className={`voice-card ${featured ? "featured" : ""}`}>
      <div className="voice-head">
        <span className={`voice-src s-${voice.source}`}>{SOURCE_LABEL[voice.source]}</span>
        {voice.author && <span className="voice-author">{voice.author}</span>}
        {emo && (
          <span className="emotion-chip" style={{ borderColor: emo.color, color: emo.color }}>
            {emo.emoji} {emo.label}
          </span>
        )}
      </div>

      {voice.source === "x" ? (
        // 公式埋め込み。スクリプトが読めない環境では blockquote がそのままリンクとして残る
        <blockquote className="twitter-tweet" data-lang="ja" data-dnt="true">
          <a href={voice.url}>{voice.url}</a>
        </blockquote>
      ) : vid ? (
        <div className="voice-video">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${vid}`}
            title={voice.title || "YouTube"}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}

      {voice.title && <h3 className="voice-title">{voice.title}</h3>}
      {voice.excerpt && <p className="voice-excerpt">{voice.excerpt}</p>}

      <a className="voice-link" href={voice.url} target="_blank" rel="noopener noreferrer">
        {voice.source === "x" ? "元のポストを見る" : voice.source === "youtube" ? "YouTubeで見る" : `${hostLabel(voice.url)} で読む`} ↗
      </a>

      {voice.note && <p className="voice-note f-shojo">{voice.note}</p>}
    </article>
  );
}
