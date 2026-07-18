// OG画像(ImageResponse)用の日本語フォント読み込み。
// Google Fontsのcss2に text= を渡すと使用グリフだけのサブセットが返るので、
// それを取得してsatoriに渡す(CJK全部を埋め込むと重すぎるため)。
// 古いUAを名乗るとwoff2ではなくTTFのURLが返る(satoriはwoff2非対応)。

export async function loadJPFont(text: string, weight: 700 | 900 = 900): Promise<ArrayBuffer> {
  const css = await (
    await fetch(
      `https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@${weight}&text=${encodeURIComponent(text)}`,
      { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1" } }
    )
  ).text();
  const url = css.match(/url\((https:[^)]+)\)/)?.[1];
  if (!url) throw new Error("font url not found");
  return await (await fetch(url)).arrayBuffer();
}

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_PAPER = "#f6f1e4";
export const OG_INK = "#171310";
