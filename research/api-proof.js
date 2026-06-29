const { chromium } = require("playwright");
const fs = require("fs");

const API_BASE_URL =
  "https://prod-api.adp.sj.se/public/sales/booking/v3";

async function main() {
  const browser = await chromium.launch({
    headless: process.env.CI === "true",
  });

  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 1200,
    },
  });

  await page.goto("https://www.sj.se", {
    waitUntil: "domcontentloaded",
  });

  const searchBody = {
    origin: "740000003",
    destination: "740000050",
    departureDate: "2026-07-15",
    passengers: [
      {
        passengerCategory: {
          type: "ADULT",
        },
      },
    ],
  };

  const searchResponse = await page.evaluate(
    async ({ apiBaseUrl, body }) => {
      const response = await fetch(`${apiBaseUrl}/search`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });

      return {
        status: response.status,
        body: await response.json(),
      };
    },
    {
      apiBaseUrl: API_BASE_URL,
      body: searchBody,
    }
  );

  const output = {
    step: "search",
    request: searchBody,
    responseStatus: searchResponse.status,
    departureSearchId: searchResponse.body.departureSearchId,
    passengerListId: searchResponse.body.passengerListId,
    passengerListExpires: searchResponse.body.passengerListExpires,
    fullResponse: searchResponse.body,
  };

  fs.writeFileSync("api-proof-result.json", JSON.stringify(output, null, 2));

  console.log("================================");
  console.log("API Proof – Step 1");
  console.log("================================");
  console.log(`Status: ${searchResponse.status}`);
  console.log(`departureSearchId: ${output.departureSearchId}`);
  console.log(`passengerListId: ${output.passengerListId}`);
  console.log(`passengerListExpires: ${output.passengerListExpires}`);
  console.log("Saved api-proof-result.json");

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
