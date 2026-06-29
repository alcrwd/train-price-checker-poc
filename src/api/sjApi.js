const { chromium } = require("playwright");
const { createClient } = require("../lib/sj/client");

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

  try {
    const client = await createClient(page, {
      fromStation,
      toStation,
      date,
    });

    const result = await client.searchJourney({
      origin: "740000003",
      destination: "740000050",
      departureDate: date,
    });

    const offersByDepartureId = {};

    for (const [departureId, offerResult] of Object.entries(result.offers)) {
      offersByDepartureId[departureId] = offerResult.offer;
    }

    return {
      departures: result.departures,
      offersByDepartureId,
    };
  } finally {
    await browser.close();
  }
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
