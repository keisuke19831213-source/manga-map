// タッチ操作込みのSafari(WebKit)クラッシュ検査
import { webkit, devices } from "playwright";
const browser = await webkit.launch();
// ズーム地図はPC専用になったため、デスクトップ幅+タッチ有効で検査
const ctx = await browser.newContext({ viewport: { width: 1100, height: 800 }, hasTouch: true });
const targets = [
  { path: "/", sel: ".gm-wrap" },
  { path: "/atlas", sel: ".atlas-wrap" },
  { path: "/eras", sel: ".atlas-wrap" },
];
for (const t of targets) {
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto("https://manga-map.jp" + t.path, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(2500);
  const box = await page.locator(t.sel).first().boundingBox();
  if (box) {
    const cx = box.x + box.width / 2;
    const cy = box.y + Math.min(box.height / 2, 300);
    // タップ数回 + ドラッグ(タッチ)
    await page.touchscreen.tap(cx, cy);
    await page.waitForTimeout(300);
    await page.touchscreen.tap(cx + 40, cy - 20);
    await page.waitForTimeout(300);
    // ズームボタン連打(先に)
    const plus = page.locator("button.chip", { hasText: "＋" }).first();
    if (await plus.count()) { for (let i = 0; i < 3; i++) { try { await plus.tap({ timeout: 3000 }); } catch {} await page.waitForTimeout(200); } }
    // ピンをタップ(ボトムシートが開く)
    const pin = page.locator(".map-pin").first();
    if (await pin.count()) { const pb = await pin.boundingBox(); if (pb) await page.touchscreen.tap(pb.x + pb.width / 2, pb.y + pb.height / 2); }
    await page.waitForTimeout(800);
  }
  const body = (await page.textContent("body")) || "";
  const crashed = body.includes("表示に失敗") || body.includes("Application error");
  console.log(t.path, "=>", crashed ? "CRASH" : "OK", errs.length ? "| pageerror: " + errs.join(" / ").slice(0, 200) : "");
  await page.close();
}
await browser.close();
