// 書影とAmazonアフィリエイトリンクのメタデータ(クライアント/サーバー共用の純粋ロジック)

export interface WorkMeta {
  asin?: string; // AmazonのASIN(10桁)。これだけでリンクと書影が自動生成される
  amazonUrl?: string; // 手動でリンクを指定したい場合(ASINより優先)
  coverUrl?: string; // 手動で書影URLを指定したい場合(ASINより優先)
}

export interface SiteMeta {
  affiliateTag: string; // AmazonアソシエイトのトラッキングID (例: xxxx-22)
  works: Record<string, WorkMeta>;
}

export const EMPTY_META: SiteMeta = { affiliateTag: "", works: {} };

export function amazonLink(meta: SiteMeta, workId: string): string | null {
  const m = meta.works[workId];
  if (!m) return null;
  if (m.amazonUrl) return m.amazonUrl;
  if (m.asin) {
    const tag = meta.affiliateTag.trim();
    return `https://www.amazon.co.jp/dp/${m.asin}${tag ? `?tag=${encodeURIComponent(tag)}` : ""}`;
  }
  return null;
}

// 一覧・地図ピン用の軽量サムネイル(約160px, 大判の1/6サイズ)。モバイルのメモリ対策
export function coverThumb(meta: SiteMeta, workId: string): string | null {
  const src = coverSrc(meta, workId);
  return src ? src.replace("._SCLZZZZZZZ_.", "._SL160_.") : null;
}

export function coverSrc(meta: SiteMeta, workId: string): string | null {
  const m = meta.works[workId];
  if (!m) return null;
  if (m.coverUrl) return m.coverUrl;
  if (m.asin) {
    // ASINから書影を取得するAmazonの画像エンドポイント
    return `https://images-na.ssl-images-amazon.com/images/P/${m.asin}.09._SCLZZZZZZZ_.jpg`;
  }
  return null;
}

export function normalizeMeta(raw: unknown): SiteMeta {
  if (!raw || typeof raw !== "object") return { ...EMPTY_META, works: {} };
  const obj = raw as Record<string, unknown>;
  const works: Record<string, WorkMeta> = {};
  if (obj.works && typeof obj.works === "object") {
    for (const [k, v] of Object.entries(obj.works as Record<string, unknown>)) {
      if (!v || typeof v !== "object") continue;
      const w = v as Record<string, unknown>;
      const entry: WorkMeta = {};
      if (typeof w.asin === "string" && w.asin.trim()) entry.asin = w.asin.trim();
      if (typeof w.amazonUrl === "string" && w.amazonUrl.trim()) entry.amazonUrl = w.amazonUrl.trim();
      if (typeof w.coverUrl === "string" && w.coverUrl.trim()) entry.coverUrl = w.coverUrl.trim();
      if (Object.keys(entry).length > 0) works[k] = entry;
    }
  }
  return {
    affiliateTag: typeof obj.affiliateTag === "string" ? obj.affiliateTag.trim() : "",
    works,
  };
}
