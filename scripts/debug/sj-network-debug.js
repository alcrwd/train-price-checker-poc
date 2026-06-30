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

  const departuresSearchResponses = [];
  const offerRequests = [];

  page.on("response", async (response) => {
    const responseUrl = response.url();
    const contentType = response.headers()["content-type"] || "";

    if (!contentType.includes("application/json")) {
      return;
    }

    try {
      if (responseUrl.includes("/departures/search/")) {
        const json = await response.json();

        departuresSearchResponses.push({
          url: responseUrl,
          status: response.status(),
          travels: json.travels?.length || 0,
          departures: (json.travels || []).reduce(
            (sum, travel) => sum + (travel.departures?.length || 0),
            0
          ),
        });

        console.log("================================");
        console.log("DEPARTURES SEARCH");
        console.log(responseUrl);
        console.log(
          `Travels: ${json.travels?.length || 0}, Departures: ${
            departuresSearchResponses[
              departuresSearchResponses.length - 1
            ].departures
          }`
        );
      }

      if (
        responseUrl.includes("/departures/") &&
        responseUrl.includes("/offers")
      ) {
        const request = response.request();

        let json = null;

        try {
          json = await response.json();
        } catch (_) {}

        offerRequests.push({
          url: responseUrl,
          method: request.method(),
          headers: request.headers(),
          postData: request.postData(),
          status: response.status(),
          departureId: json?.departureId || null,
        });

        console.log("================================");
        console.log("OFFERS REQUEST");
        console.log("URL:");
        console.log(responseUrl);
        console.log("METHOD:");
        console.log(request.method());
        console.log("POST DATA:");
        console.log(request.postData());
        console.log("DEPARTURE ID:");
        console.log(json?.departureId);
      }
    } catch (error) {
      console.error(error);
    }
  });

  const url = buildSjUrl(
    "Malmö Central",
    "Nyköping Central",
    date
  );

  console.log(`Opening ${url}`);

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
  console.log(`departures/search responses: ${departuresSearchResponses.length}`);
  console.log(`offers requests: ${offerRequests.length}`);
  console.log("Saved sj-network-offers-debug.json");
  console.log("Saved sj-network-debug.png");

  await browser.close();
})();
