const { chromium } = require("playwright");
const fs = require("fs");

const API_BASE_URL =
  "https://prod-api.adp.sj.se/public/sales/booking/v3";

function buildSjUrl(fromStation, toStation, date) {
  return `https://www.sj.se/sok-resa/valj-resa/${encodeURIComponent(
    fromStation
  )}/${encodeURIComponent(toStation)}/${date}`;
}

function pickApiHeaders(headers) {
  return {
    "content-type": "application/json",
    "accept-language": headers["accept-language"] || "sv-SE",
    "ocp-apim-subscription-key": headers["ocp-apim-subscription-key"],
    "x-client-name": headers["x-client-name"],
    "x-client-version": headers["x-client-version"],
    "ocp-apim-trace": headers["ocp-apim-trace"] || "true",
  };
}

async function captureSearchHeaders(page, { fromStation, toStation, date }) {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timed out waiting for POST /search request"));
    }, 30000);

    page.on("request", (request) => {
      const url = request.url();

      if (
        request.method() === "POST" &&
        url.includes("/public/sales/booking/v3/search")
      ) {
        clearTimeout(timeout);
        resolve(request.headers());
      }
    });

    await page.goto(buildSjUrl(fromStation, toStation, date), {
      waitUntil: "domcontentloaded",
    });
  });
}

async function main() {
  const fromStation = "Malmö Central";
  const toStation = "Nyköping Central";
  const date = "2026-07-15";

  const browser = await chromium.launch({
    headless: process.env.CI === "true",
  });

  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 1200,
    },
  });

  const capturedHeaders = await captureSearchHeaders(page, {
    fromStation,
    toStation,
    date,
  });

  const apiHeaders = pickApiHeaders(capturedHeaders);

  const searchBody = {
    origin: "740000003",
    destination: "740000050",
    departureDate: date,
    passengers: [
      {
        passengerCategory: {
          type: "ADULT",
        },
      },
    ],
  };

  const searchResponse = await page.evaluate(
    async ({ apiBaseUrl, headers, body }) => {
      const response = await fetch(`${apiBaseUrl}/search`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      return {
        status: response.status,
        body: await response.json(),
      };
    },
    {
      apiBaseUrl: API_BASE_URL,
      headers: apiHeaders,
      body: searchBody,
    }
  );

  const output = {
    step: "captured-headers-search",
    request: searchBody,
    capturedApiHeaders: apiHeaders,
    responseStatus: searchResponse.status,
    departureSearchId: searchResponse.body.departureSearchId || null,
    passengerListId: searchResponse.body.passengerListId || null,
    passengerListExpires: searchResponse.body.passengerListExpires || null,
    fullResponse: searchResponse.body,
  };

  fs.writeFileSync("api-proof-result.json", JSON.stringify(output, null, 2));

  console.log("================================");
  console.log("API Proof – Captured Headers Search");
  console.log("================================");
  console.log(`Status: ${searchResponse.status}`);
  console.log(`departureSearchId: ${output.departureSearchId}`);
  console.log(`passengerListId: ${output.passengerListId}`);
  console.log("Saved api-proof-result.json");

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
