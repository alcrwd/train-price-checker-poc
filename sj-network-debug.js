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

  const allRelevantResponses = [];
  const departuresWithChanges = [];

  page.on("response", async (response) => {
    const responseUrl = response.url();
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
        text.includes("serviceName") ||
        text.includes("legs")
      ) {
        allRelevantResponses.push({
          url: responseUrl,
          status: response.status(),
          size: text.length,
          sample: text.slice(0, 3000),
        });
      }

      if (responseUrl.includes("/departures/search/")) {
        const travels = json.travels || [];

        for (const travel of travels) {
          for (const departure of travel.departures || []) {
            if ((departure.numberOfChanges || 0) > 0) {
              departuresWithChanges.push({
                departureId: departure.departureId,
                departureDateTime: departure.departureDateTime,
                arrivalDateTime: departure.arrivalDateTime,
                duration: departure.duration,
                numberOfChanges: departure.numberOfChanges,
                producer: departure.producer,
                numberOfOperators: departure.numberOfOperators,
                legs: (departure.legs || []).map((leg) => ({
                  origin: leg.origin,
                  destination: leg.destination,
                  departureDateTime: leg.departureDateTime,
                  arrivalDateTime: leg.arrivalDateTime,
                  duration: leg.duration,
                  changeTime: leg.changeTime,
                  serviceName: leg.serviceName,
                  publicServiceName: leg.publicServiceName,
                  secondaryServiceName: leg.secondaryServiceName,
                  serviceType: leg.serviceType,
                  transportMethod: leg.transportMethod,
                  transportMethodDescription: leg.transportMethodDescription,
                  vehicle: leg.vehicle,
                  nightTrain: leg.nightTrain,
                  serviceBrandName: leg.serviceBrandName,
                  serviceBrandNameDescription: leg.serviceBrandNameDescription,
                  producer: leg.producer,
                })),
              });
            }
          }
        }
      }
    } catch {
      // Ignore JSON parse failures.
    }
  });

  const url = buildSjUrl("Malmö Central", "Nyköping Central", date);

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
    JSON.stringify(allRelevantResponses, null, 2)
  );

  fs.writeFileSync(
    "sj-network-departures-with-changes.json",
    JSON.stringify(departuresWithChanges, null, 2)
  );

  console.log(`Antal relevanta JSON-svar: ${allRelevantResponses.length}`);
  console.log(`Antal resor med byte: ${departuresWithChanges.length}`);

  console.log("Sparat till sj-network-debug.json");
  console.log("Sparat till sj-network-departures-with-changes.json");
  console.log("Screenshot sparad till sj-network-debug.png");

  if (departuresWithChanges.length > 0) {
    console.log("=================================");
    console.log("FÖRSTA RESAN MED BYTE");
    console.log("=================================");
    console.log(JSON.stringify(departuresWithChanges[0], null, 2));
  }

  await browser.close();
})();
