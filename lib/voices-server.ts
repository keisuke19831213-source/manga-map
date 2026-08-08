// 「よそで生まれた声」の保存層(サーバー専用)。
// 型と純粋ロジックは lib/voices.ts 側に置く — クライアントから storage(fs) を引き込まないため
// (affiliate.ts / meta-server.ts と同じ分け方)。
import { delItem, listItems, putItem } from "@/lib/storage";
import type { Voice } from "@/lib/voices";

export async function readVoices(): Promise<Voice[]> {
  return listItems<Voice>("voices", "voices.json");
}

export async function addVoice(voice: Voice): Promise<void> {
  await putItem<Voice>("voices", "voices.json", voice);
}

export async function deleteVoice(id: string): Promise<boolean> {
  return delItem<Voice>("voices", "voices.json", id);
}
