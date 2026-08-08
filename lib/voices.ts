// 「よそで生まれた声」= X・note・YouTubeなどで生まれた感想や考察を、目利きで選んで並べる蔵。
//
// 方針(設計時に確定):
// ・自動収集はしない。管理人が選んだものだけを登録する = 目利きそのものが価値
// ・本文は保存しない。各社の公式埋め込み/リンクカードで現地へ送る(転載しない)
// ・熱量の格付け(★やレート)はしない。作品間の優劣に見えるため。出すのは「感情の配合」だけ

export type VoiceSource = "x" | "note" | "youtube" | "web";

// 平常時(しずかな夜)にたどるための切り口。祭りの日以外の362日を支える導線
export type VoiceTag = "kousatsu" | "sakuga" | "omoide" | "eizo";

export interface Voice {
  id: string;
  source: VoiceSource;
  url: string; // 現地へのリンク(埋め込みの元)
  title?: string; // note/YouTube等のタイトル
  excerpt?: string; // 引用の範囲を超えない短い紹介(管理人が要約)
  author?: string; // 書き手・チャンネル名
  workId?: string; // 図鑑の作品に紐づける
  emotion?: string; // EmotionId — 感情の配合バーの材料
  tag?: VoiceTag;
  note?: string; // 管理人の一言(付箋)。キュレーションの核
  featured?: boolean; // 今夜の一本
  createdAt: string;
}

export const VOICE_TAGS: { id: VoiceTag; label: string; en: string }[] = [
  { id: "kousatsu", label: "考察", en: "Analysis" },
  { id: "sakuga", label: "作画の話", en: "On the art" },
  { id: "omoide", label: "思い出", en: "Memories" },
  { id: "eizo", label: "映像", en: "Video" },
];

export const VOICE_TAG_IDS = VOICE_TAGS.map((t) => t.id);

// URLから配信元を推定する(登録フォームの入力を1つ減らすため)
export function sourceFromUrl(url: string): VoiceSource {
  const u = url.toLowerCase();
  if (/(^|\/\/|\.)(twitter\.com|x\.com)\//.test(u)) return "x";
  if (/(^|\/\/|\.)note\.com\//.test(u)) return "note";
  if (/(youtube\.com|youtu\.be)\//.test(u)) return "youtube";
  return "web";
}

// YouTubeの動画IDを取り出す(埋め込みプレイヤー用)
export function youtubeId(url: string): string | null {
  const m =
    url.match(/[?&]v=([A-Za-z0-9_-]{6,})/) ||
    url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/) ||
    url.match(/youtube\.com\/(?:embed|shorts)\/([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

export function hostLabel(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}
