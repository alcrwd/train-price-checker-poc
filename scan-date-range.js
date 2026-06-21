const { chromium } = require("playwright");
const fs = require("fs");
const { findMatchingTrips } = require("./compare-matching-trips");

function buildSjUrl(fromStation, toStation, date) {
  return `https://www.sj.se/sok-resa/valj-resa/${encodeURIComponent(
    fromStation
  )}/${encodeURIComponent(toStation)}/${date}`;
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getDateRange(startDate, endDate) {
  const dates = [];
  let current = startDate;

  while (current <= endDate) {
    dates.push(current);
    current = addDays(current, 1);
  }

  return dates;
}

async function handleCookies(page) {
  try {
    await page.waitForSelector('text="Endast nödvändiga cookies"', {
      timeout: 5000,
    });

    await page.locator('text="Endast nödvändiga cookies"').click();
    await page.waitForTimeout(1000);
  } catch {
    // No visible cookie dialog.
  }
}

async function waitForTripPrices(page) {
  await page.waitForSelector("text=Avgår", { timeout: 15000 });

  let previousScrollY = -1;
  let samePositionCount = 0;

  for (let i = 0; i < 30; i++) {
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(500);

    const scrollY = await page.evaluate(() => window.scrollY);

    if (scrollY === previousScrollY) {
      samePositionCount += 1;
    } else {
      samePositionCount = 0;
    }

    previousScrollY = scrollY;

    if (samePositionCount >= 2) {
      break;
    }
  }

  await page.waitForFunction(() => {
    const text = document.body.innerText;

    return (
      !text.includes("Hämtar pris") &&
      !text.includes("Hämtar reseklasser")
    );
  }, { timeout: 20000 });

  await page.waitForTimeout(500);
}

function parseTrips(text) {
  const trips = [];

  const regex =
    /Avgår (\d{2}:\d{2}), ankommer (\d{2}:\d{2}),.*?(?:pris från ([\d\s]+) svenska kronor|Slutsåld).*?Restid (\d+) timmar och (\d+) minuter, (\d+) byte.*?\n([\s\S]*?)(?=Avgår \d{2}:\d{2}|$)/g;

  let match;

  while ((match = regex.exec(text)) !== null) {
    const block = match[7];

    const operatorMatch = block.match(
      /(SJ Snabbtåg, X 2000 \+ Mälartåg|Snälltåget \+ Mälartåg|SJ Nattåg \+ Mälartåg|SJ Snabbtåg, X 2000|SJ Nattåg|Snälltåget|Mälartåg)/
    );

    const trainNumberMatch = block.match(/tåg\s+(\d+)/i);

    const classes = [...block.matchAll(/(Sittplats|Liggplats|Sovplats|2 klass Lugn|2 klass|1 klass)/g)].map(
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
      trainNumber: trainNumberMatch ? trainNumberMatch[1] : null,
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
  await waitForTripPrices(page);

  const pageUrl = page.url();
  const text = await page.locator("body").innerText();

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

function toCsvValue(value) {
  if (value === null || value === undefined) return "";

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function writeCsv(rows, path) {
  const headers = [
    "date",
    "bestTrueSaving",
    "bestTrueSavingDeparture",
    "trainNumber",
    "directPrice",
    "stockholmPrice",
    "norrkopingToNykopingPrice",
    "alternativePrice",
    "nykopingCheapestPrice",
    "nykopingCheapestDeparture",
    "stockholmCheapestPrice",
    "stockholmCheapestDeparture",
    "cheapestDifference",
    "matchingTripsCount",
  ];

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => toCsvValue(row[header])).join(",")
    ),
  ];

  fs.writeFileSync(path, lines.join("\n"));
}

async function main() {
  const startDate = process.argv[2] || "2026-07-15";
  const endDate = process.argv[3] || startDate;

  const dates = getDateRange(startDate, endDate);

  console.log(`Skannar ${dates.length} datum: ${startDate} → ${endDate}`);

  const browser = await chromium.launch({
    headless: process.env.CI === "true",
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
  const allResults = [];

  for (const date of dates) {
    console.log("=================================");
    console.log(`Datum: ${date}`);
    console.log("=================================");

    const nykopingResult = await searchTrips(page, {
      fromStation,
      toStation: "Nyköping Central",
      date,
    });

    const stockholmResult = await searchTrips(page, {
      fromStation,
      toStation: "Stockholm Central",
      date,
    });

    const nykopingCheapest = cheapestAvailable(nykopingResult.trips);
    const stockholmCheapest = cheapestAvailable(stockholmResult.trips);

    const matchingTrips = findMatchingTrips(
      nykopingResult.trips,
      stockholmResult.trips
    );

    const bestTrueSaving =
      matchingTrips
        .filter((trip) => trip.trueSavings > 0)
        .sort((a, b) => b.trueSavings - a.trueSavings)[0] || null;

    const summary = {
      date,
      bestTrueSaving: bestTrueSaving ? bestTrueSaving.trueSavings : null,
      bestTrueSavingDeparture: bestTrueSaving
        ? bestTrueSaving.departureA
        : null,
      trainNumber: bestTrueSaving ? bestTrueSaving.trainNumberA : null,
      directPrice: bestTrueSaving ? bestTrueSaving.directPrice : null,
      stockholmPrice: bestTrueSaving ? bestTrueSaving.stockholmPrice : null,
      norrkopingToNykopingPrice: bestTrueSaving
        ? bestTrueSaving.norrkopingToNykopingPrice
        : null,
      alternativePrice: bestTrueSaving
        ? bestTrueSaving.alternativePrice
        : null,
      nykopingCheapestPrice: nykopingCheapest ? nykopingCheapest.price : null,
      nykopingCheapestDeparture: nykopingCheapest
        ? nykopingCheapest.departure
        : null,
      stockholmCheapestPrice: stockholmCheapest
        ? stockholmCheapest.price
        : null,
      stockholmCheapestDeparture: stockholmCheapest
        ? stockholmCheapest.departure
        : null,
      cheapestDifference:
        nykopingCheapest && stockholmCheapest
          ? stockholmCheapest.price - nykopingCheapest.price
          : null,
      matchingTripsCount: matchingTrips.length,
    };

    allResults.push({
      date,
      summary,
      nykopingResult,
      stockholmResult,
      nykopingCheapest,
      stockholmCheapest,
      matchingTrips,
      bestTrueSaving,
    });

    console.log(summary);
  }

  const sortedByBestTrueSaving = [...allResults].sort((a, b) => {
    const savingA = a.summary.bestTrueSaving ?? -Infinity;
    const savingB = b.summary.bestTrueSaving ?? -Infinity;
    return savingB - savingA;
  });

  const output = {
    startDate,
    endDate,
    generatedAt: new Date().toISOString(),
    fromStation,
    directDestination: "Nyköping Central",
    alternativeDestination: "Stockholm Central",
    assumedNorrkopingToNykopingPrice: 98,
    results: allResults,
    topSavings: sortedByBestTrueSaving
      .filter((result) => result.summary.bestTrueSaving !== null)
      .slice(0, 20)
      .map((result) => result.summary),
  };

  fs.writeFileSync("date-range-result.json", JSON.stringify(output, null, 2));

  writeCsv(
    allResults.map((result) => result.summary),
    "date-range-summary.csv"
  );

  console.log("=================================");
  console.log("TOPP VERKLIGA BESPARINGAR");
  console.log("=================================");
  console.log(JSON.stringify(output.topSavings, null, 2));

  console.log("Resultat sparat till date-range-result.json");
  console.log("CSV sparad till date-range-summary.csv");

  await context.storageState({
    path: "sj-storage-state.json",
  });

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
