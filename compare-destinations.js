const { chromium } = require("playwright");
const { findMatchingTrips } = require("./compare-matching-trips");

function buildSjUrl(fromStation, toStation, date) {
  const fromUrl = encodeURIComponent(fromStation);
  const toUrl = encodeURIComponent(toStation);

  return `https://www.sj.se/sok-resa/valj-resa/${fromUrl}/${toUrl}/${date}`;
}

async function handleCookies(page) {
  try {
    await page.waitForSelector('text="Endast nödvändiga cookies"', {
      timeout: 5000,
    });

    await page.locator('text="Endast nödvändiga cookies"').click();

    console.log("Cookies accepterade");
    await page.waitForTimeout(1000);
  } catch {
    console.log("Ingen cookiedialog hittades");
  }
}

function parseTrips(text) {
  const trips = [];

  const regex =
    /Avgår (\d{2}:\d{2}), ankommer (\d{2}:\d{2}),.*?(?:pris från ([\d\s]+) svenska kronor|Slutsåld).*?Restid (\d+) timmar och (\d+) minuter, (\d+) byte.*?\n([\s\S]*?)(?=Avgår \d{2}:\d{2}|$)/g;

  let match;

  while ((match = regex.exec(text)) !== null) {
    const block = match[7];

    const operatorMatch = block.match(
      /(SJ Snabbtåg, X 2000 \+ Mälartåg|Snälltåget \+ Mälartåg|SJ Snabbtåg, X 2000|Snälltåget|Mälartåg)/
    );

    const classes = [...block.matchAll(/(2 klass Lugn|2 klass|1 klass)/g)].map(
      (m) => m[1]
    );

    trips.push({
      departure: match[1],
      arrival: match[2],
      price: match[3] ? parseInt(match[3].replace(/\s/g, ""), 10) : null,
      soldOut: !match[3],
      durationHours: parseInt(match[4], 10),
      durationMinutes: parseInt(match[5], 10),
      changes: parseInt(match[6], 10),
      operator: operatorMatch ? operatorMatch[1] : null,
      classes: [...new Set(classes)],
    });
  }

  return trips;
}

async function searchTrips(page, { fromStation, toStation, date }) {
  const url = buildSjUrl(fromStation, toStation, date);

  console.log(`Öppnar: ${url}`);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  await handleCookies(page);

  await page.waitForTimeout(15000);

  const pageUrl = page.url();
  const text = await page.locator("body").innerText();

  console.log(`Aktuell URL efter laddning: ${pageUrl}`);

  return {
    fromStation,
    toStation,
    date,
    url: pageUrl,
    trips: parseTrips(text),
  };
}

function cheapestAvailable(trips) {
  return (
    trips
      .filter((trip) => trip.price !== null && !trip.soldOut)
      .sort((a, b) => a.price - b.price)[0] || null
  );
}

(async () => {
  const travelDate = process.argv[2] || "2026-07-15";

  console.log(`Resedatum: ${travelDate}`);

  const browser = await chromium.launch({
    headless: false,
  });

  let context;

  try {
    context = await browser.newContext({
      storageState: "sj-storage-state.json",
    });
  } catch {
    context = await browser.newContext();
  }

  const page = await context.newPage();

  const fromStation = "Malmö Central";

  const nykopingResult = await searchTrips(page, {
    fromStation,
    toStation: "Nyköping Central",
    date: travelDate,
  });

  const stockholmResult = await searchTrips(page, {
    fromStation,
    toStation: "Stockholm Central",
    date: travelDate,
  });

  const nykopingCheapest = cheapestAvailable(nykopingResult.trips);
  const stockholmCheapest = cheapestAvailable(stockholmResult.trips);

  const matchingTrips = findMatchingTrips(
    nykopingResult.trips,
    stockholmResult.trips
  );

  console.log("=================================");
  console.log("Malmö → Nyköping");
  console.log("=================================");
  console.log(JSON.stringify(nykopingResult, null, 2));

  console.log("=================================");
  console.log("Malmö → Stockholm");
  console.log("=================================");
  console.log(JSON.stringify(stockholmResult, null, 2));

  console.log("=================================");
  console.log("JÄMFÖRELSE BILLIGASTE");
  console.log("=================================");
  console.log({
    date: travelDate,
    nykopingCheapest,
    stockholmCheapest,
    difference:
      nykopingCheapest && stockholmCheapest
        ? stockholmCheapest.price - nykopingCheapest.price
        : null,
  });

  console.log("=================================");
  console.log("MATCHANDE RESOR");
  console.log("=================================");
  console.log(JSON.stringify(matchingTrips, null, 2));

  await context.storageState({
    path: "sj-storage-state.json",
  });

  await browser.close();
})();