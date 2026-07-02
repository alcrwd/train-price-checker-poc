const fs = require("fs");
const path = require("path");

const { createDataset } = require("../src/services/datasetService");
const {
  findMatchingJourneyByFirstLeg,
} = require("../src/services/trainMatcher");

const STOCKHOLM_TO_NYKOPING_TRANSFER_PRICE = 98;
const SWEDEN_TIME_ZONE = "Europe/Stockholm";
const NUMBER_OF_DAYS = 7;

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function timeToMinutes(time) {
  if (!time) return null;

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getSwedenDateTimeParts() {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: SWEDEN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

function shouldIncludeJourneyForCurrentSwedishTime(journey, travelDate) {
  const swedenNow = getSwedenDateTimeParts();

  if (travelDate !== swedenNow.date) {
    return true;
  }

  const departureMinutes = timeToMinutes(journey.departureTime);

  if (departureMinutes === null) {
    return false;
  }

  return departureMinutes >= swedenNow.minutes;
}

function getFirstLegLabel(journey) {
  const firstLeg = journey?.legs?.[0];

  if (!firstLeg) {
    return "N/A";
  }

  return `${firstLeg.operator || "Unknown"} ${
    firstLeg.trainNumber || ""
  }`.trim();
}

function formatPrice(value) {
  return typeof value === "number" ? String(value) : "N/A";
}

function formatDifference(standardPrice, stockholmTotalPrice) {
  if (
    typeof standardPrice !== "number" ||
    typeof stockholmTotalPrice !== "number"
  ) {
    return "N/A";
  }

  const difference = stockholmTotalPrice - standardPrice;

  return difference > 0 ? `+${difference}` : String(difference);
}

function normalizeUiStatus(journey) {
  if (typeof journey?.price === "number") {
    return "PRICED";
  }

  if (journey?.departureStatus === "SOLD_OUT") {
    return "SOLD_OUT";
  }

  return "NO_OFFERS";
}

function mapLegForUi(leg) {
  return {
    operatorName: leg.operator || null,
    trainNumber: leg.trainNumber || null,
  };
}

function mapJourneyForUi(journey) {
  const firstLeg = journey.legs?.[0] || {};

  return {
    id: journey.id,
    departureTime: journey.departureTime,
    arrivalTime: journey.arrivalTime,
    arrivalDate: journey.arrivalDate,
    durationMinutes: journey.durationMinutes,
    numberOfChanges: journey.numberOfChanges,
    totalTransferMinutes: journey.totalTransferMinutes,
    price: typeof journey.price === "number" ? journey.price : null,
    currency: "SEK",
    departureStatus: normalizeUiStatus(journey),
    trainNumber: firstLeg.trainNumber || null,
    operatorName: firstLeg.operator || null,
    brand: firstLeg.operator || null,
    legs: (journey.legs || []).map(mapLegForUi),
  };
}

function getStockholmStrategyLegs({ standardJourney, stockholmJourney }) {
  const sjLegs = stockholmJourney?.legs?.length
    ? [stockholmJourney.legs[0]]
    : [];

  const transferLegs = (standardJourney.legs || []).slice(1);

  return [...sjLegs, ...transferLegs].map(mapLegForUi);
}

function getCheapest({ directPrice, stockholmTotalPrice }) {
  const hasDirectPrice = typeof directPrice === "number";
  const hasStockholmPrice = typeof stockholmTotalPrice === "number";

  if (!hasDirectPrice && !hasStockholmPrice) {
    return "none";
  }

  if (hasDirectPrice && !hasStockholmPrice) {
    return "direct";
  }

  if (!hasDirectPrice && hasStockholmPrice) {
    return "stockholm";
  }

  return directPrice <= stockholmTotalPrice ? "direct" : "stockholm";
}

function getPriceDifference({ directPrice, stockholmTotalPrice }) {
  if (
    typeof directPrice !== "number" ||
    typeof stockholmTotalPrice !== "number"
  ) {
    return null;
  }

  return stockholmTotalPrice - directPrice;
}

function createComparisonRowsForDate({
  travelDate,
  standardDataset,
  stockholmDataset,
}) {
  return standardDataset.journeys
    .filter((journey) =>
      shouldIncludeJourneyForCurrentSwedishTime(journey, travelDate)
    )
    .map((standardJourney) => {
      const stockholmJourney = findMatchingJourneyByFirstLeg(
        standardJourney,
        stockholmDataset.journeys
      );

      const stockholmTotalPrice =
        typeof stockholmJourney?.price === "number"
          ? stockholmJourney.price + STOCKHOLM_TO_NYKOPING_TRANSFER_PRICE
          : null;

      return {
        date: travelDate,
        departureTime: standardJourney.departureTime || "N/A",
        arrivalTime: standardJourney.arrivalTime || "N/A",
        train: getFirstLegLabel(standardJourney),
        standardPrice: standardJourney.price,
        stockholmPrice: stockholmJourney?.price ?? null,
        transferPrice: stockholmJourney
          ? STOCKHOLM_TO_NYKOPING_TRANSFER_PRICE
          : null,
        stockholmTotalPrice,
        difference: formatDifference(
          standardJourney.price,
          stockholmTotalPrice
        ),
        status: stockholmJourney ? "match" : "no-stockholm-match",
      };
    });
}

function createLovableEntriesForDate({
  travelDate,
  standardDataset,
  stockholmDataset,
}) {
  return standardDataset.journeys
    .filter((journey) =>
      shouldIncludeJourneyForCurrentSwedishTime(journey, travelDate)
    )
    .map((standardJourney) => {
      const stockholmJourney = findMatchingJourneyByFirstLeg(
        standardJourney,
        stockholmDataset.journeys
      );

      const stockholmTotalPrice =
        typeof stockholmJourney?.price === "number"
          ? stockholmJourney.price + STOCKHOLM_TO_NYKOPING_TRANSFER_PRICE
          : null;

      const directPrice =
        typeof standardJourney.price === "number" ? standardJourney.price : null;

      const direct = mapJourneyForUi(standardJourney);

      const stockholm = stockholmJourney
        ? {
            toStockholm: mapJourneyForUi(stockholmJourney),
            stockholmPrice:
              typeof stockholmJourney.price === "number"
                ? stockholmJourney.price
                : null,
            malartagTransferSek:
              typeof stockholmJourney.price === "number"
                ? STOCKHOLM_TO_NYKOPING_TRANSFER_PRICE
                : null,
            totalPrice: stockholmTotalPrice,
            departureStatus: normalizeUiStatus(stockholmJourney),
            legs: getStockholmStrategyLegs({
              standardJourney,
              stockholmJourney,
            }),
          }
        : null;

      return {
        id: standardJourney.id,
        direct,
        stockholm,
        cheapest: getCheapest({
          directPrice,
          stockholmTotalPrice,
        }),
        priceDifference: getPriceDifference({
          directPrice,
          stockholmTotalPrice,
        }),
      };
    });
}

function formatRow(row) {
  return [
    row.date,
    row.departureTime,
    row.arrivalTime,
    row.train,
    formatPrice(row.standardPrice),
    formatPrice(row.stockholmPrice),
    formatPrice(row.transferPrice),
    formatPrice(row.stockholmTotalPrice),
    row.difference,
    row.status,
  ].join(" | ");
}

async function createComparisonForDate(travelDate) {
  const standardDataset = await createDataset({
    origin: "Malmö Central",
    destination: "Nyköping Central",
    travelDate,
  });

  const stockholmDataset = await createDataset({
    origin: "Malmö Central",
    destination: "Stockholm Central",
    travelDate,
  });

  return {
    rows: createComparisonRowsForDate({
      travelDate,
      standardDataset,
      stockholmDataset,
    }),
    entries: createLovableEntriesForDate({
      travelDate,
      standardDataset,
      stockholmDataset,
    }),
  };
}

function writeTextReport(rows) {
  const outputPath = path.join(
    __dirname,
    "..",
    "data",
    "comparison-report.txt"
  );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const lines = [
    "Date | Departure | Arrival | Train | Standard | Stockholm ticket | Fixed transfer | Stockholm total | Difference | Status",
    "---- | --------- | ------- | ----- | -------- | ---------------- | -------------- | --------------- | ---------- | ------",
    ...rows.map(formatRow),
  ];

  const result = lines.join("\n");

  fs.writeFileSync(outputPath, result, "utf8");

  console.log(result);
  console.log("");
  console.log(`Report written to: ${outputPath}`);
}

function writeComparisonJson({ entries, startDate }) {
  const outputPath = path.join(
    __dirname,
    "..",
    "data",
    "comparison-result.json"
  );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const result = {
    generatedAt: new Date().toISOString(),
    search: {
      origin: "Malmö Central",
      destination: "Nyköping Central",
      via: "Stockholm Central",
      travelDate: startDate,
      malartagTransferSek: STOCKHOLM_TO_NYKOPING_TRANSFER_PRICE,
    },
    entries,
  };

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf8");

  console.log(`JSON written to: ${outputPath}`);
}

async function main() {
  const startDate = getSwedenDateTimeParts().date;

  const allRows = [];
  const allEntries = [];

  for (let i = 0; i < NUMBER_OF_DAYS; i++) {
    const travelDate = addDays(startDate, i);
    const comparison = await createComparisonForDate(travelDate);

    allRows.push(...comparison.rows);
    allEntries.push(...comparison.entries);
  }

  writeTextReport(allRows);
  writeComparisonJson({
    entries: allEntries,
    startDate,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
