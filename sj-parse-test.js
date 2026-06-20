const { chromium } = require("playwright");

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

  const text = await page.locator("body").innerText();

  const trips = [];

  const regex =
    /Avgår (\d{2}:\d{2}), ankommer (\d{2}:\d{2}),.*?(?:pris från ([\d\s]+) svenska kronor|Slutsåld).*?Restid (\d+) timmar och (\d+) minuter, (\d+) byte/gs;

  let match;

  while ((match = regex.exec(text)) !== null) {
    trips.push({
      departure: match[1],
      arrival: match[2],
      price: match[3]
        ? parseInt(match[3].replace(/\s/g, ""), 10)
        : null,
      durationHours: parseInt(match[4], 10),
      durationMinutes: parseInt(match[5], 10),
      changes: parseInt(match[6], 10),
    });
  }

  console.log(JSON.stringify(trips, null, 2));

  await browser.close();
})();