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

  const offerRequests = [];
  const departuresSearchResponses = [];

  page.on("response", async (response) => {
    const responseUrl = response.url();
    const contentType = response.headers()["content-type"] || "";

    if (!contentType.includes("application/json")) return;

    try {
      if (responseUrl.includes("/departures/search/")) {
        const json = await response.json();

        departuresSearchResponses.push({
          url: responseUrl,
          status: response.status(),
          travelCount: json.travels?.length || 0,
          departureCount: (json.travels || []).reduce(
            (sum, travel) => sum + (travel.departures?.length || 0),
            0
          ),
        });
      }

      if (
        responseUrl.includes("/departures/") &&
        responseUrl.includes("/offers")
      ) {
        const request = response.request();

        let json = null;

        try {
          json = await response.json();
        } catch {
          // Ignore.
        }

        const item = {
          url: responseUrl,
          status: response.status(),
          method: request.method(),
          requestHeaders: request.headers(),
          postData: request.postData(),
          responseDepartureId: json?.departureId || null,
          responseSample: json ? JSON.stringify(json).slice(0, 3000) : null,
        };

        offerRequests.push(item);

        console.log("================================");
        console.log("OFFERS REQUEST");
        console.log("URL:");
        console.log(item.url);
        console.log("METHOD:");
        console.log(item.method);
        console.log("POST DATA:");
        console.log(item.postData);
        console.log("RESPONSE DEPARTURE ID:");
        console.log(item.responseDepartureId);
        console.log("================================");
      }
    } catch (error) {
      console.error("Could not inspect JSON response:", error);
    }
  });

  const url = buildSjUrl("Malmö Central", "Nyköping Central", date);

  console.log(`Öppnar: ${url}`);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForTimeout(25000);

  await page.screenshot({
    path: "sj-network-debug.png",
    fullPage: true,
  });

  const output = {
    date,
    departuresSearchResponses,
    offerRequests,
  };

  fs.writeFileSync(
    "sj-network-offers-debug.json",
    JSON.stringify(output, null, 2)
  );

  console.log("================================");
  console.log("SUMMARY");
  console.log("================================");
  console.log(`departures/search responses: ${departuresSearchResponses.length}`);
  console.log(`offers requests: ${offerRequests.length}`);
  console.log("Sparat till sj-network-offers-debug.json");
  console.log("Screenshot sparad till sj-network-debug.png");

  await browser.close();
})();
