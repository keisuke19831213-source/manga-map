// manga-map/ 配下のBlobを全消去してクリーンな状態に戻す(テスト用)。
// 次回アクセス時に data/*.json のシードから自動で再初期化される。
import { del, list } from "@vercel/blob";

const { blobs } = await list({ prefix: "manga-map/" });
if (blobs.length === 0) {
  console.log("already empty");
} else {
  await del(blobs.map((b) => b.url));
  console.log("deleted", blobs.length, "blobs");
}
