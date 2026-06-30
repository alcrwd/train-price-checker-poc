const { chromium } = require("playwright");

function buildSjUrl(fromStation, toStation, date) {
  return `https://www.sj.se/sok-resa/valj-resa/${encodeURIComponent(
    fromStation
  )}/${encodeURIComponent(toStation)}/${date}`;
}

(async () => {
  const date = process.argv[2] || "2026-07-15";

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 1200,
    },
  });

  const url = buildSjUrl("Malmö Central", "Nyköping Central", date);

  console.log(`Öppnar: ${url}`);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForTimeout(10000);

  await page.screenshot({
    path: "desktop-sj-debug.png",
    fullPage: true,
  });

  const text = await page.locator("body").innerText();
  await require("fs").promises.writeFile("desktop-sj-debug.txt", text);

  console.log("Screenshot sparad till desktop-sj-debug.png");
  console.log("Text sparad till desktop-sj-debug.txt");

  await browser.close();
})();
