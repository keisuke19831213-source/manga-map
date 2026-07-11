import { webkit, devices } from "playwright";
const browser = await webkit.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"] });
const pages = ["/", "/atlas", "/eras", "/works", "/community", "/works/kimetsu", "/history"];
for (const path of pages) {
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  try {
    await page.goto("https://manga-map.vercel.app" + path, { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(3500);
    const body = (await page.textContent("body")) || "";
    const crashed = body.includes("Application error");
    console.log(path, "=>", crashed ? "CRASH" : "OK", errs.length ? "| pageerror: " + errs.join(" / ").slice(0, 200) : "");
  } catch (e) {
    console.log(path, "=> NAV FAIL", e.message.slice(0, 100));
  }
  await page.close();
}
await browser.close();
