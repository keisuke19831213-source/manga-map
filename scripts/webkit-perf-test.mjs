// パン/ズームの実操作 + 見た目検証(スクショ) + 簡易フレーム計測
import { webkit, devices } from "playwright";
const browser = await webkit.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"] });
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));

for (const path of ["/", "/eras", "/atlas"]) {
  await page.goto("https://manga-map.jp" + path, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(2500);
  const sel = path === "/" ? ".gm-wrap" : ".atlas-wrap";
  const box = await page.locator(sel).first().boundingBox();
  // ポインタイベントでドラッグをシミュレートし、フレームレートを概測
  const fps = await page.evaluate(async ({ selector }) => {
    const el = document.querySelector(selector);
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + Math.min(rect.height / 2, 260);
    const fire = (type, x, y) =>
      el.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 7, pointerType: "touch", clientX: x, clientY: y, isPrimary: true }));
    let frames = 0;
    let done = false;
    const count = () => { frames++; if (!done) requestAnimationFrame(count); };
    requestAnimationFrame(count);
    const t0 = performance.now();
    fire("pointerdown", cx, cy);
    for (let i = 0; i < 60; i++) {
      fire("pointermove", cx + i * 3, cy + i * 1.5);
      await new Promise((r) => setTimeout(r, 8));
    }
    fire("pointerup", cx + 180, cy + 90);
    const t1 = performance.now();
    done = true;
    return Math.round((frames / (t1 - t0)) * 1000);
  }, { selector: sel });
  await page.screenshot({ path: `/tmp/perf-${path.replace(/\//g, "_") || "home"}.png` });
  console.log(path, "=> ドラッグ中fps(概算):", fps, errs.length ? "| pageerror: " + errs.join("/") : "");
}
await browser.close();
