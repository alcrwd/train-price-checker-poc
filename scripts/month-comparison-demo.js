const fs = require("fs");
const path = require("path");

const { createDataset } = require("../src/services/datasetService");
const {
  findMatchingJourneyByFirstLeg,
} = require("../src/services/trainMatcher");

const FIXED_TRANSFER_PRICE = 98;

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
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

function createComparisonRowsForDate({
  travelDate,
  standardDataset,
  stockholmDataset,
}) {
  return standardDataset.journeys.map((standardJourney) => {
    const stockholmJourney = findMatchingJourneyByFirstLeg(
      standardJourney,
      stockholmDataset.journeys
    );

    const stockholmTotalPrice =
      typeof stockholmJourney?.price === "number"
        ? stockholmJourney.price + FIXED_TRANSFER_PRICE
        : null;

    return {
      date: travelDate,
      departureTime: standardJourney.departureTime || "N/A",
      arrivalTime: standardJourney.arrivalTime || "N/A",
      train: getFirstLegLabel(standardJourney),
      standardPrice: standardJourney.price,
      stockholmPrice: stockholmJourney?.price ?? null,
      transferPrice: stockholmJourney ? FIXED_TRANSFER_PRICE : null,
      stockholmTotalPrice,
      difference: formatDifference(
        standardJourney.price,
        stockholmTotalPrice
      ),
      status: stockholmJourney ? "match" : "no-stockholm-match",
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

async function createRowsForDate(travelDate) {
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

  return createComparisonRowsForDate({
    travelDate,
    standardDataset,
    stockholmDataset,
  });
}

async function main() {
  const startDate = new Date().toISOString().slice(0, 10);
  const numberOfDays = 7;

  const outputPath = path.join(
    __dirname,
    "..",
    "data",
    "month-comparison-result.txt"
  );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const lines = [
    "Date | Departure | Arrival | Train | Standard | Stockholm ticket | Fixed transfer | Stockholm total | Difference | Status",
    "---- | --------- | ------- | ----- | -------- | ---------------- | -------------- | --------------- | ---------- | ------",
  ];

  for (let i = 0; i < numberOfDays; i++) {
    const travelDate = addDays(startDate, i);
    const rows = await createRowsForDate(travelDate);

    for (const row of rows) {
      lines.push(formatRow(row));
    }
  }

  const result = lines.join("\n");

  fs.writeFileSync(outputPath, result, "utf8");

  console.log(result);
  console.log("");
  console.log(`Result written to: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
