// 画面上で重なるピンを「束」にまとめる。
// ピンはステージ内のワールド座標に置かれているので、束の位置もワールド座標で返す。
// （地図・時代設定マップの両方で使う共通処理。数十件なので全ペア判定で十分軽い）

export type Placed<T> = { item: T; wx: number; wy: number };

export type Bundle<T> = {
  /** 束の代表位置（ワールド座標・メンバーの平均） */
  wx: number;
  wy: number;
  members: Placed<T>[];
};

/**
 * @param items ワールド座標つきの要素
 * @param k     いまの絶対スケール（ワールド1 → 画面kpx）
 * @param pinW  ピンの画面上の幅(px)
 * @param pinH  ピンの画面上の高さ(px)
 * @param anchorBottom ピンの基準が下端か（書影ピンは下端が地点）
 */
export function bundleByScreen<T>(
  items: Placed<T>[],
  k: number,
  pinW: number,
  pinH: number,
  anchorBottom = true
): Bundle<T>[] {
  if (!k) return items.map((p) => ({ wx: p.wx, wy: p.wy, members: [p] }));
  // 判定は画面px。横は幅・縦は高さでつぶれ具合を見る（楕円距離）
  const rx = (pinW * 0.92) / k;
  const ry = ((anchorBottom ? pinH * 0.78 : pinH * 0.92) || 1) / k;
  const out: Bundle<T>[] = [];
  for (const p of items) {
    const hit = out.find((b) => {
      const dx = (p.wx - b.wx) / rx;
      const dy = (p.wy - b.wy) / ry;
      return dx * dx + dy * dy < 1;
    });
    if (hit) {
      const n = hit.members.length;
      hit.wx = (hit.wx * n + p.wx) / (n + 1);
      hit.wy = (hit.wy * n + p.wy) / (n + 1);
      hit.members.push(p);
    } else {
      out.push({ wx: p.wx, wy: p.wy, members: [p] });
    }
  }
  return out;
}
