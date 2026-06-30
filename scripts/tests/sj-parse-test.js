const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto("https://www.sj.se/");

  await page
    .getByRole("button", { name: /Endast nödvändiga cookies/i })
    .click();

  await page.getByTestId("searchTripButton").click();

  await page.getByRole("combobox", { name: /Från/i }).fill("malmö");

  await page
    .getByRole("option")
    .filter({ hasText: "Malmö Central" })
    .first()
    .click();

  await page.getByRole("combobox", { name: /Till/i }).fill("nykö");

  await page
    .getByRole("option")
    .filter({ hasText: "Nyköping Central" })
    .first()
    .click();

  await page
    .getByRole("textbox", { name: /Datum för utresa/i })
    .fill("2026-06-21");

  await page.getByRole("button", { name: /Sök resa/i }).click();

  await page.waitForTimeout(15000);

  await page.screenshot({
    path: "sj-results-debug.png",
    fullPage: true,
  });

  const html = await page.content();
  fs.writeFileSync("sj-results.html", html);

  const text = await page.locator("body").innerText();

  const trips = [];

  const regex =
    /Avgår (\d{2}:\d{2}), ankommer (\d{2}:\d{2}),.*?(?:pris från ([\d\s]+) svenska kronor|Slutsåld).*?Restid (\d+) timmar och (\d+) minuter, (\d+) byte.*?\n([\s\S]*?)(?=Avgår \d{2}:\d{2}|19 juni|21 juni|$)/g;

  let match;

  while ((match = regex.exec(text)) !== null) {
    const block = match[7];

    const operatorMatch = block.match(
      /(SJ Snabbtåg, X 2000 \+ Mälartåg|Snälltåget \+ Mälartåg|SJ Snabbtåg, X 2000|Snälltåget|Mälartåg)/
    );

    const classes = [...block.matchAll(/(2 klass Lugn|2 klass|1 klass)/g)].map(
      (m) => m[1]
    );

    trips.push({
      departure: match[1],
      arrival: match[2],
      price: match[3] ? parseInt(match[3].replace(/\s/g, ""), 10) : null,
      soldOut: !match[3],
      durationHours: parseInt(match[4], 10),
      durationMinutes: parseInt(match[5], 10),
      changes: parseInt(match[6], 10),
      operator: operatorMatch ? operatorMatch[1] : null,
      classes: [...new Set(classes)],
    });
  }

  console.log("HTML sparad till sj-results.html");
  console.log("Screenshot sparad till sj-results-debug.png");
  console.log(JSON.stringify(trips, null, 2));

  await browser.close();
})();