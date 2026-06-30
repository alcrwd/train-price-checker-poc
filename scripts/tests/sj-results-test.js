const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto("https://www.sj.se/");

  // Cookies
  await page
    .getByRole("button", { name: /Endast nödvändiga cookies/i })
    .click();

  // Öppna sökformulär
  await page.getByTestId("searchTripButton").click();

  // Från
  await page.getByRole("combobox", { name: /Från/i }).fill("malmö");

  await page
    .getByRole("option")
    .filter({ hasText: "Malmö Central" })
    .first()
    .click();

  // Till
  await page.getByRole("combobox", { name: /Till/i }).fill("nykö");

  await page
    .getByRole("option")
    .filter({ hasText: "Nyköping Central" })
    .first()
    .click();

  // Datum
  await page
    .getByRole("textbox", { name: /Datum för utresa/i })
    .fill("2026-06-21");

  // Klicka sök
  await page.getByRole("button", { name: /Sök resa/i }).click();

  // Vänta tills resultaten laddats
  await page.waitForTimeout(15000);

  // Screenshot
  await page.screenshot({
    path: "sj-results.png",
    fullPage: true,
  });

  // Hämta all text på sidan
  const bodyText = await page.locator("body").innerText();

  console.log("=================================");
  console.log("RESULTAT FRÅN SJ");
  console.log("=================================");
  console.log(bodyText);

  await browser.close();
})();