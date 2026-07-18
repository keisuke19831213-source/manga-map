/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // 旧 vercel.app 本番URLを独自ドメインへ恒久転送(重複コンテンツ回避)。
      // プレビュー用の枝URL(manga-map-<hash>.vercel.app)は本番ホスト完全一致なので影響しない。
      {
        source: "/:path*",
        has: [{ type: "host", value: "manga-map.vercel.app" }],
        destination: "https://manga-map.jp/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
