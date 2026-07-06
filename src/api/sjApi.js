const { chromium } = require("playwright");
const { createClient } = require("../lib/sj/client");

const STATION_IDS = {
  "Malmö Central": "740000003",
  "Stockholm Central": "740000001",
  "Södertälje Syd": "740000055",
  "Norrköping Central": "740000007",
  "Nyköping Central": "740000050",
};

let browserPromise = null;
let queue = Promise.resolve();

function getStationId(stationName) {
  const stationId = STATION_IDS[stationName];

  if (!stationId) {
    throw new Error(`Unknown station: ${stationName}`);
  }

  return stationId;
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
  }

  return browserPromise;
}

function runQueued(task) {
  const result = queue.then(task, task);

  queue = result.catch(() => {});

  return result;
}

async function fetchDeparturesWithOffersUnqueued({ fromStation, toStation, date }) {
  const browser = await getBrowser();

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
      origin: getStationId(fromStation),
      destination: getStationId(toStation),
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
    await page.close().catch(() => {});
  }
}

async function fetchDeparturesWithOffers({ fromStation, toStation, date }) {
  return runQueued(() =>
    fetchDeparturesWithOffersUnqueued({
      fromStation,
      toStation,
      date,
    })
  );
}

async function fetchDepartures({ fromStation, toStation, date }) {
  const { departures } = await fetchDeparturesWithOffers({
    fromStation,
    toStation,
    date,
  });

  return departures;
}

process.on("SIGTERM", async () => {
  if (!browserPromise) return;

  const browser = await browserPromise.catch(() => null);
  await browser?.close().catch(() => {});
});

process.on("SIGINT", async () => {
  if (!browserPromise) return;

  const browser = await browserPromise.catch(() => null);
  await browser?.close().catch(() => {});
  process.exit(0);
});

module.exports = {
  fetchDepartures,
  fetchDeparturesWithOffers,
};
