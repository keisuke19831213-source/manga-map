import { webkit, devices } from "playwright";
const browser = await webkit.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"] });
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
for (const [path, name] of [["/", "genre"], ["/atlas", "atlas"], ["/eras", "eras"]]) {
  await page.goto("https://manga-map.jp" + path, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(2800);
  await page.screenshot({ path: `/tmp/mobile-${name}.png` });
  // ネイティブスクロールできるか(縦スクロールUIの証)
  const scrolled = await page.evaluate(async () => {
    const y0 = window.scrollY;
    window.scrollTo(0, 600);
    await new Promise((r) => setTimeout(r, 300));
    return window.scrollY > y0;
  });
  console.log(path, "=> scrollable:", scrolled, errs.length ? "| ERR: " + errs.join("/") : "");
  window_scroll_reset: await page.evaluate(() => window.scrollTo(0, 0));
}
await browser.close();
