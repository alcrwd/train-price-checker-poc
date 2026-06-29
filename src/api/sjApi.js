const { chromium } = require("playwright");

function buildSjUrl(fromStation, toStation, date) {
  return `https://www.sj.se/sok-resa/valj-resa/${encodeURIComponent(
    fromStation
  )}/${encodeURIComponent(toStation)}/${date}`;
}

async function waitForOffersToStabilize(page, offersByDepartureId) {
  const timeoutMs = 30000;
  const intervalMs = 1000;
  const requiredStableChecks = 3;

  const start = Date.now();

  let previousCount = -1;
  let stableChecks = 0;

  while (Date.now() - start < timeoutMs) {
    const currentCount = Object.keys(offersByDepartureId).length;

    console.log(`Offers captured: ${currentCount}`);

    if (currentCount === previousCount) {
      stableChecks += 1;
    } else {
      stableChecks = 0;
      previousCount = currentCount;
    }

    if (stableChecks >= requiredStableChecks) {
      console.log("Offer count stabilized.");
      return;
    }

    await page.waitForTimeout(intervalMs);
  }

  console.log("Timed out waiting for offers.");
}

async function fetchDeparturesWithOffers({ fromStation, toStation, date }) {
  const browser = await chromium.launch({
    headless: process.env.CI === "true",
  });

  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 1200,
    },
  });

  const departuresSearchResponses = [];
  const offersByDepartureId = {};

  page.on("response", async (response) => {
    const responseUrl = response.url();
    const contentType = response.headers()["content-type"] || "";

    if (!contentType.includes("application/json")) return;

    try {
      const json = await response.json();

      if (responseUrl.includes("/departures/search/")) {
        departuresSearchResponses.push(json);
      }

      if (
        responseUrl.includes("/departures/") &&
        responseUrl.includes("/offers")
      ) {
        const departureId = json.departureId;

        if (departureId) {
          offersByDepartureId[departureId] = json;
        }
      }
    } catch (error) {
      console.error("Could not parse SJ JSON response:", error);
    }
  });

  const url = buildSjUrl(fromStation, toStation, date);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  await waitForOffersToStabilize(page, offersByDepartureId);

  await browser.close();

  const departures = [];

  for (const json of departuresSearchResponses) {
    for (const travel of json.travels || []) {
      for (const departure of travel.departures || []) {
        departures.push(departure);
      }
    }
  }

  return {
    departures,
    offersByDepartureId,
  };
}

async function fetchDepartures({ fromStation, toStation, date }) {
  const { departures } = await fetchDeparturesWithOffers({
    fromStation,
    toStation,
    date,
  });

  return departures;
}

module.exports = {
  fetchDepartures,
  fetchDeparturesWithOffers,
};
