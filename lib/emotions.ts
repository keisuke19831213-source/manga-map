// 感情タグの定義(投稿の「感情の軸」)。
// 粗い分類で十分 — データが貯まるほど「どの作品のどのコマが、どの感情を起こすか」の
// 地図が育つ。将来の「感情から作品を逆引き(泣きたい夜に開くマップ)」や
// 動的ペルソナLabの素材になる。ここを一次情報の唯一の定義とする。

export type EmotionId = "cry" | "hot" | "shiver" | "laugh" | "heal" | "chill";

export interface Emotion {
  id: EmotionId;
  label: string; // 短い動詞(泣いた)
  emoji: string;
  color: string; // チップ・将来の感情マップの色
  catch: string; // 逆引きページの見出し(泣きたい夜に、開く。)
  night: string; // どんな時に効くか(処方箋の効能書き)
}

export const EMOTIONS: Emotion[] = [
  { id: "cry", label: "泣いた", emoji: "😭", color: "#3b82f6", catch: "泣きたい夜に、開く。", night: "思いきり泣いてしまいたい夜のための処方" },
  { id: "hot", label: "胸が熱い", emoji: "🔥", color: "#e6532a", catch: "胸を熱くしたい日に。", night: "くすぶる心に火を入れたい日のための処方" },
  { id: "shiver", label: "震えた", emoji: "⚡", color: "#7c3aed", catch: "鳥肌の立つ一撃を。", night: "表現の凄みに打たれたい夜のための処方" },
  { id: "laugh", label: "笑った", emoji: "😆", color: "#f59e0b", catch: "今日はもう、笑うしかない。", night: "何も考えず笑い飛ばしたい日のための処方" },
  { id: "heal", label: "救われた", emoji: "🌿", color: "#16a34a", catch: "疲れた心に、効く。", night: "そっと肯定されたい夜のための処方" },
  { id: "chill", label: "ゾッとした", emoji: "😱", color: "#475569", catch: "背筋が凍る夜へ。", night: "怖いと知りつつページをめくりたい夜の処方" },
];

export const EMOTION_IDS = EMOTIONS.map((e) => e.id);

export function emotionOf(id?: string): Emotion | null {
  if (!id) return null;
  return EMOTIONS.find((e) => e.id === id) ?? null;
}
