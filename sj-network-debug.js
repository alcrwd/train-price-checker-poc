const { chromium } = require("playwright");
const fs = require("fs");

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

  const responses = [];

  page.on("response", async (response) => {
    const url = response.url();
    const contentType = response.headers()["content-type"] || "";

    if (!contentType.includes("application/json")) return;

    try {
      const json = await response.json();

      const text = JSON.stringify(json);

      if (
        text.includes("Norrköping") ||
        text.includes("Nyköping") ||
        text.includes("Malmö") ||
        text.includes("Stockholm") ||
        text.includes("train") ||
        text.includes("journey") ||
        text.includes("trip")
      ) {
        responses.push({
          url,
          status: response.status(),
          size: text.length,
          sample: text.slice(0, 3000),
        });
      }
    } catch {
      // Ignore JSON parse failures.
    }
  });

  const url = buildSjUrl("Malmö Central", "Stockholm Central", date);

  console.log(`Öppnar: ${url}`);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForTimeout(15000);

  await page.screenshot({
    path: "sj-network-debug.png",
    fullPage: true,
  });

  fs.writeFileSync(
    "sj-network-debug.json",
    JSON.stringify(responses, null, 2)
  );

  console.log(`Antal relevanta JSON-svar: ${responses.length}`);
  console.log("Sparat till sj-network-debug.json");
  console.log("Screenshot sparad till sj-network-debug.png");

  await browser.close();
})();
